from clinic_shared import APIError, next_code, require_auth, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import Bill, BillItem
from services.totals_service import compute_totals

bp = Blueprint("billing", __name__)

VALID_DISCOUNT_TYPES = ("fixed", "percent")
VALID_PAYMENT_METHODS = ("cash", "card", "upi", "insurance")
VALID_BILL_STATUSES = ("paid", "pending", "unpaid")


def _next_bill_code():
    return next_code(session, "billing.bill_id_seq", "BILL-", pad=0)


@bp.get("/bills")
@require_auth
def list_bills():
    query = session.query(Bill)
    patient_id = request.args.get("patientId", type=int)
    if patient_id:
        query = query.filter(Bill.patient_id == patient_id)
    status = request.args.get("status")
    if status:
        query = query.filter(Bill.status == status)

    bills = query.order_by(Bill.created_at.desc()).all()
    return jsonify({"bills": [b.to_dict(include_items=False) for b in bills]})


@bp.post("/bills")
@require_auth
@require_role("admin", "reception")
def create_bill():
    body = request.get_json(silent=True) or {}
    patient_id = body.get("patientId")
    items = body.get("items") or []
    if not patient_id or not items:
        raise APIError("patientId and at least one item are required", 400, "validation_error")

    for item in items:
        if not item.get("description") or item.get("rate") is None:
            raise APIError("each item needs a description and rate", 400, "validation_error")
        item.setdefault("quantity", 1)

    discount_type = body.get("discountType", "fixed")
    if discount_type not in VALID_DISCOUNT_TYPES:
        raise APIError(f"discountType must be one of {', '.join(VALID_DISCOUNT_TYPES)}", 400, "validation_error")

    payment_method = body.get("paymentMethod")
    if payment_method is not None:
        payment_method = payment_method.lower()
        if payment_method not in VALID_PAYMENT_METHODS:
            raise APIError(f"paymentMethod must be one of {', '.join(VALID_PAYMENT_METHODS)}", 400, "validation_error")

    status = body.get("status", "pending")
    if status not in VALID_BILL_STATUSES:
        raise APIError(f"status must be one of {', '.join(VALID_BILL_STATUSES)}", 400, "validation_error")

    totals = compute_totals(items, body.get("discount", 0), discount_type, body.get("tax", 5))

    bill = Bill(
        bill_code=_next_bill_code(), patient_id=patient_id,
        status=status,
        discount=body.get("discount", 0), discount_type=discount_type,
        tax_percent=body.get("tax", 5), payment_method=payment_method,
        notes=body.get("notes"),
        subtotal=totals["subtotal"], discount_amt=totals["discountAmt"],
        tax_amt=totals["taxAmt"], grand_total=totals["grandTotal"],
    )
    bill.items = [
        BillItem(
            description=i["description"], quantity=i["quantity"], rate=i["rate"],
            amount=round(i["quantity"] * i["rate"], 2),
        )
        for i in items
    ]
    session.add(bill)
    session.commit()
    return jsonify({"bill": bill.to_dict()}), 201


@bp.get("/bills/<int:bill_id>")
@require_auth
def get_bill(bill_id):
    bill = session.query(Bill).get(bill_id)
    if not bill:
        raise APIError("Bill not found", 404, "not_found")
    return jsonify({"bill": bill.to_dict()})


@bp.patch("/bills/<int:bill_id>/status")
@require_auth
@require_role("admin", "reception")
def update_bill_status(bill_id):
    bill = session.query(Bill).get(bill_id)
    if not bill:
        raise APIError("Bill not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    status = body.get("status")
    if status not in VALID_BILL_STATUSES:
        raise APIError(f"status must be one of {', '.join(VALID_BILL_STATUSES)}", 400, "validation_error")

    bill.status = status
    session.commit()
    return jsonify({"bill": bill.to_dict()})
