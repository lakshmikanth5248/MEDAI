from clinic_shared import APIError, require_auth, require_internal_secret, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import BLOOD_GROUP_FROM_DISPLAY, Appointment, Consultation, Patient
from services import clients
from services.codes import next_patient_code
from services.validators import normalize_gender

bp = Blueprint("patients", __name__)


def _blood_group_value(display_value):
    if not display_value:
        return None
    return BLOOD_GROUP_FROM_DISPLAY.get(display_value, display_value)


@bp.get("/patients")
@require_auth
def list_patients():
    query = session.query(Patient)
    q = request.args.get("q")
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Patient.name.ilike(like)) | (Patient.phone.ilike(like)) | (Patient.patient_code.ilike(like))
        )
    user_id = request.args.get("userId", type=int)
    if user_id:
        query = query.filter(Patient.user_id == user_id)
    patients = query.order_by(Patient.name).all()
    return jsonify({"patients": [p.to_dict() for p in patients]})


@bp.post("/patients")
@require_auth
@require_role("admin", "reception")
def create_patient():
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    patient = Patient(
        patient_code=next_patient_code(session),
        name=body["name"], email=body.get("email"), phone=body.get("phone"),
        gender=normalize_gender(body.get("gender")), dob=body.get("dob"),
        blood_group=_blood_group_value(body.get("bloodGroup")), address=body.get("address"),
    )
    session.add(patient)
    session.commit()
    return jsonify({"patient": patient.to_dict()}), 201


@bp.get("/patients/<int:patient_id>")
@require_auth
def get_patient(patient_id):
    patient = session.query(Patient).get(patient_id)
    if not patient:
        raise APIError("Patient not found", 404, "not_found")
    return jsonify({"patient": patient.to_dict()})


@bp.put("/patients/<int:patient_id>")
@require_auth
def update_patient(patient_id):
    patient = session.query(Patient).get(patient_id)
    if not patient:
        raise APIError("Patient not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    if "name" in body:
        patient.name = body["name"]
    if "email" in body:
        patient.email = body["email"]
    if "phone" in body:
        patient.phone = body["phone"]
    if "gender" in body:
        patient.gender = normalize_gender(body["gender"])
    if "dob" in body:
        patient.dob = body["dob"]
    if "bloodGroup" in body:
        patient.blood_group = _blood_group_value(body["bloodGroup"])
    if "address" in body:
        patient.address = body["address"]
    session.commit()
    return jsonify({"patient": patient.to_dict()})


@bp.get("/patients/<int:patient_id>/timeline")
@require_auth
def patient_timeline(patient_id):
    patient = session.query(Patient).get(patient_id)
    if not patient:
        raise APIError("Patient not found", 404, "not_found")

    appointments = session.query(Appointment).filter(Appointment.patient_id == patient_id).all()
    consultations = session.query(Consultation).filter(Consultation.patient_id == patient_id).all()
    prescriptions = clients.get_prescriptions_for_patient(patient.id)

    return jsonify({
        "patient": patient.to_dict(),
        "appointments": [a.to_dict() for a in appointments],
        "consultations": [c.to_dict() for c in consultations],
        "prescriptions": prescriptions,
    })


@bp.post("/internal/patients")
@require_internal_secret
def internal_create_patient():
    """Called by auth-service right after it creates a patient's login
    (self-registration or reception registration), to materialize the
    matching clinical profile row - closes the mock's biggest gap where
    registration never persisted anything.
    """
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    patient = Patient(
        patient_code=next_patient_code(session),
        user_id=body.get("userId"), name=body["name"], email=body.get("email"),
        phone=body.get("phone"), gender=normalize_gender(body.get("gender")), dob=body.get("dob"),
        blood_group=_blood_group_value(body.get("bloodGroup")), address=body.get("address"),
    )
    session.add(patient)
    session.commit()
    return jsonify({"patient": patient.to_dict()}), 201
