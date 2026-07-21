from functools import wraps

from clinic_shared import APIError, current_user, next_code, require_auth, require_role
from flask import Blueprint, jsonify, request

import config
from db import session
from models import Prescription, PrescriptionItem
from services.dispense_service import dispense

bp = Blueprint("prescriptions", __name__)
VALID_DURATION_TYPES = ("days", "weeks", "months")


def require_internal_or_user(fn):
    """GET /prescriptions is read by end users (through the gateway) AND by
    other services (clinical-service building a patient timeline, pharmacy-
    service listing dispensed history) via the internal secret.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        internal_secret = request.headers.get("X-Internal-Secret")
        if internal_secret and internal_secret == config.INTERNAL_SERVICE_SECRET:
            return fn(*args, **kwargs)
        return require_auth(fn)(*args, **kwargs)

    return wrapper


def _next_rx_code():
    return next_code(session, "prescription.rx_id_seq", "RX-", pad=0)


@bp.get("/prescriptions")
@require_internal_or_user
def list_prescriptions():
    query = session.query(Prescription)
    patient_id = request.args.get("patientId", type=int)
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    doctor_id = request.args.get("doctorId", type=int)
    if doctor_id:
        query = query.filter(Prescription.doctor_id == doctor_id)
    store_id = request.args.get("storeId", type=int)
    if store_id:
        query = query.filter(Prescription.store_id == store_id)
    status = request.args.get("status")
    if status:
        query = query.filter(Prescription.status == status)

    prescriptions = query.order_by(Prescription.created_at.desc()).all()
    return jsonify({"prescriptions": [p.to_dict() for p in prescriptions]})


@bp.post("/prescriptions")
@require_auth
@require_role("doctor")
def create_prescription():
    body = request.get_json(silent=True) or {}
    required = ("patientId", "doctorId")
    if any(not body.get(f) for f in required):
        raise APIError("patientId and doctorId are required", 400, "validation_error")
    medicines = body.get("medicines") or []
    if not medicines:
        raise APIError("At least one medicine is required", 400, "validation_error")
    for m in medicines:
        duration_type = m.get("durationType")
        if duration_type is not None:
            duration_type = duration_type.strip().lower()
            if duration_type not in VALID_DURATION_TYPES:
                raise APIError(
                    f"durationType must be one of {', '.join(VALID_DURATION_TYPES)}", 400, "validation_error",
                )
            m["durationType"] = duration_type

    prescription = Prescription(
        rx_code=_next_rx_code(),
        appointment_id=body.get("appointmentId"), consultation_id=body.get("consultationId"),
        patient_id=body["patientId"], doctor_id=body["doctorId"], notes=body.get("notes"),
        status="pending",
    )
    prescription.items = [
        PrescriptionItem(
            name=m["name"], dosage=m.get("dosage"), frequency=m.get("frequency"),
            duration=m.get("duration"), duration_type=m.get("durationType"),
            quantity=m.get("quantity", 1), instructions=m.get("instructions"),
        )
        for m in medicines
    ]
    session.add(prescription)
    session.commit()
    return jsonify({"prescription": prescription.to_dict()}), 201


@bp.get("/prescriptions/<int:prescription_id>")
@require_internal_or_user
def get_prescription(prescription_id):
    prescription = session.query(Prescription).get(prescription_id)
    if not prescription:
        raise APIError("Prescription not found", 404, "not_found")
    return jsonify({"prescription": prescription.to_dict()})


@bp.post("/prescriptions/<int:prescription_id>/dispense")
@require_auth
@require_role("medical_store")
def dispense_prescription(prescription_id):
    prescription = session.query(Prescription).get(prescription_id)
    if not prescription:
        raise APIError("Prescription not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    store_id = body.get("storeId")
    if not store_id:
        raise APIError("storeId is required", 400, "validation_error")

    dispense(session, prescription, store_id)
    return jsonify({"prescription": prescription.to_dict()})
