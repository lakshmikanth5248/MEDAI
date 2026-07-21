import requests
from clinic_shared import APIError, require_auth, require_internal_secret, require_role
from flask import Blueprint, jsonify, request
from sqlalchemy import func

import config
from db import session
from models import MedicalStore, MedicineInventory

bp = Blueprint("inventory", __name__)

LOW_STOCK_DEFAULT_THRESHOLD = 10


@bp.get("/stores/<int:store_id>/inventory")
@require_auth
def list_store_inventory(store_id):
    items = (
        session.query(MedicineInventory)
        .filter(MedicineInventory.store_id == store_id)
        .order_by(MedicineInventory.name)
        .all()
    )
    return jsonify({"inventory": [i.to_dict() for i in items]})


@bp.post("/stores/<int:store_id>/inventory")
@require_auth
@require_role("admin", "medical_store")
def add_inventory_item(store_id):
    store = session.query(MedicalStore).get(store_id)
    if not store:
        raise APIError("Medical store not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    if not body.get("name") or body.get("price") is None:
        raise APIError("name and price are required", 400, "validation_error")

    item = MedicineInventory(
        store_id=store_id, name=body["name"], category=body.get("category"),
        stock=body.get("stock", 0), price=body["price"],
        expiry_date=body.get("expiryDate"), manufacturer=body.get("manufacturer"),
    )
    session.add(item)
    session.commit()
    return jsonify({"item": item.to_dict()}), 201


@bp.get("/inventory/<int:item_id>")
@require_auth
def get_inventory_item(item_id):
    item = session.query(MedicineInventory).get(item_id)
    if not item:
        raise APIError("Inventory item not found", 404, "not_found")
    return jsonify({"item": item.to_dict()})


@bp.put("/inventory/<int:item_id>")
@require_auth
@require_role("admin", "medical_store")
def update_inventory_item(item_id):
    item = session.query(MedicineInventory).get(item_id)
    if not item:
        raise APIError("Inventory item not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    field_map = {
        "name": "name", "category": "category", "stock": "stock", "price": "price",
        "expiryDate": "expiry_date", "manufacturer": "manufacturer",
    }
    for field, attr in field_map.items():
        if field in body:
            setattr(item, attr, body[field])
    session.commit()
    return jsonify({"item": item.to_dict()})


@bp.delete("/inventory/<int:item_id>")
@require_auth
@require_role("admin", "medical_store")
def delete_inventory_item(item_id):
    item = session.query(MedicineInventory).get(item_id)
    if not item:
        raise APIError("Inventory item not found", 404, "not_found")
    session.delete(item)
    session.commit()
    return jsonify({"message": "Inventory item deleted"})


@bp.get("/inventory/low-stock")
@require_auth
def low_stock():
    threshold = request.args.get("threshold", default=LOW_STOCK_DEFAULT_THRESHOLD, type=int)
    query = session.query(MedicineInventory).filter(MedicineInventory.stock < threshold)
    store_id = request.args.get("storeId", type=int)
    if store_id:
        query = query.filter(MedicineInventory.store_id == store_id)
    items = query.order_by(MedicineInventory.stock).all()
    return jsonify({"inventory": [i.to_dict() for i in items], "threshold": threshold})


@bp.get("/stores/<int:store_id>/dispensed")
@require_auth
def dispensed_for_store(store_id):
    """Proxies to prescription-service, which is the source of truth for
    dispensed prescriptions - this endpoint just scopes the query to a store
    so the medical-store frontend has one call to make.
    """
    try:
        resp = requests.get(
            f"{config.PRESCRIPTION_SERVICE_URL}/prescriptions",
            params={"storeId": store_id, "status": "dispensed"},
            headers={"X-Internal-Secret": config.INTERNAL_SERVICE_SECRET},
            timeout=5,
        )
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.exceptions.RequestException as exc:
        raise APIError(f"prescription-service is unreachable: {exc}", 502, "upstream_unavailable")


@bp.post("/internal/inventory/decrement")
@require_internal_secret
def internal_decrement_inventory():
    """Called by prescription-service during a dispense transaction (plan §4).
    Validates stock for EVERY item first, then decrements all of them in one
    DB transaction - all-or-nothing, so a partial dispense never happens.
    Returns each item's unit price so the caller can compute total_cost.
    """
    body = request.get_json(silent=True) or {}
    store_id = body.get("storeId")
    items = body.get("items") or []
    if not store_id or not items:
        raise APIError("storeId and items are required", 400, "validation_error")

    resolved = []
    shortages = []
    for entry in items:
        name = entry.get("name")
        quantity = entry.get("quantity")
        inventory_item = (
            session.query(MedicineInventory)
            .filter(
                MedicineInventory.store_id == store_id,
                func.lower(MedicineInventory.name) == (name or "").strip().lower(),
            )
            .first()
        )
        if not inventory_item:
            shortages.append({"name": name, "reason": "not_found_in_store_inventory"})
            continue
        if inventory_item.stock < quantity:
            shortages.append({
                "name": name, "reason": "insufficient_stock",
                "available": inventory_item.stock, "requested": quantity,
            })
            continue
        resolved.append((inventory_item, quantity))

    if shortages:
        raise APIError("One or more items could not be dispensed", 409, "insufficient_stock", details=shortages)

    results = []
    for inventory_item, quantity in resolved:
        inventory_item.stock -= quantity
        results.append({
            "name": inventory_item.name, "inventoryItemId": inventory_item.id,
            "quantity": quantity, "unitPrice": float(inventory_item.price),
        })
    session.commit()

    return jsonify({"decremented": results})
