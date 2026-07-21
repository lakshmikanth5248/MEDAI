from clinic_shared import APIError, require_auth
from flask import Blueprint, jsonify, request

from db import session
from models import Consultation

bp = Blueprint("consultations", __name__)


@bp.get("/consultations")
@require_auth
def list_consultations():
    query = session.query(Consultation)
    doctor_id = request.args.get("doctorId", type=int)
    if doctor_id:
        query = query.filter(Consultation.doctor_id == doctor_id)
    patient_id = request.args.get("patientId", type=int)
    if patient_id:
        query = query.filter(Consultation.patient_id == patient_id)
    appointment_id = request.args.get("appointmentId", type=int)
    if appointment_id:
        query = query.filter(Consultation.appointment_id == appointment_id)

    consultations = query.order_by(Consultation.created_at.desc()).all()
    return jsonify({"consultations": [c.to_dict() for c in consultations]})


@bp.post("/consultations")
@require_auth
def create_consultation():
    """Persists the vitals/symptoms/diagnosis/tests/notes captured during a
    consultation - this data was previously captured in the UI but never
    saved anywhere (see plan: "biggest gap" in the mock).
    """
    body = request.get_json(silent=True) or {}
    required = ("appointmentId", "doctorId", "patientId")
    if any(not body.get(f) for f in required):
        raise APIError("appointmentId, doctorId and patientId are required", 400, "validation_error")

    consultation = Consultation(
        appointment_id=body["appointmentId"], doctor_id=body["doctorId"], patient_id=body["patientId"],
        vitals=body.get("vitals"), symptoms=body.get("symptoms"), diagnosis=body.get("diagnosis"),
        tests=body.get("tests") or [], notes=body.get("notes"),
    )
    session.add(consultation)
    session.commit()
    return jsonify({"consultation": consultation.to_dict()}), 201


@bp.get("/consultations/<int:consultation_id>")
@require_auth
def get_consultation(consultation_id):
    consultation = session.query(Consultation).get(consultation_id)
    if not consultation:
        raise APIError("Consultation not found", 404, "not_found")
    return jsonify({"consultation": consultation.to_dict()})
