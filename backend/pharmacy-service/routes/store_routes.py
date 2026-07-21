from clinic_shared import APIError, next_code, require_auth, require_internal_secret, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import MedicalStore

bp = Blueprint("stores", __name__)


def _next_store_code():
    return next_code(session, "pharmacy.store_id_seq", "STORE-", pad=0)


@bp.get("/stores")
@require_auth
def list_stores():
    query = session.query(MedicalStore)
    user_id = request.args.get("userId", type=int)
    if user_id:
        query = query.filter(MedicalStore.user_id == user_id)
    stores = query.order_by(MedicalStore.name).all()
    return jsonify({"stores": [s.to_dict() for s in stores]})


@bp.post("/stores")
@require_auth
@require_role("admin")
def create_store():
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    store = MedicalStore(
        store_code=_next_store_code(), name=body["name"], address=body.get("address"),
        phone=body.get("phone"), email=body.get("email"),
    )
    session.add(store)
    session.commit()
    return jsonify({"store": store.to_dict()}), 201


@bp.get("/stores/<int:store_id>")
@require_auth
def get_store(store_id):
    store = session.query(MedicalStore).get(store_id)
    if not store:
        raise APIError("Medical store not found", 404, "not_found")
    return jsonify({"store": store.to_dict()})


@bp.put("/stores/<int:store_id>")
@require_auth
@require_role("admin", "medical_store")
def update_store(store_id):
    store = session.query(MedicalStore).get(store_id)
    if not store:
        raise APIError("Medical store not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    for field in ("name", "address", "phone", "email", "status"):
        if field in body:
            setattr(store, field, body[field])
    session.commit()
    return jsonify({"store": store.to_dict()})


@bp.delete("/stores/<int:store_id>")
@require_auth
@require_role("admin")
def delete_store(store_id):
    store = session.query(MedicalStore).get(store_id)
    if not store:
        raise APIError("Medical store not found", 404, "not_found")
    session.delete(store)
    session.commit()
    return jsonify({"message": "Medical store deleted"})


@bp.post("/internal/stores")
@require_internal_secret
def internal_create_store():
    """Called by auth-service right after it creates a medical_store login."""
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    store = MedicalStore(
        store_code=_next_store_code(), user_id=body.get("userId"), name=body["name"],
        address=body.get("address"), phone=body.get("phone"), email=body.get("email"),
    )
    session.add(store)
    session.commit()
    return jsonify({"store": store.to_dict()}), 201
