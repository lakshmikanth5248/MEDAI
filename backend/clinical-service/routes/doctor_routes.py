from clinic_shared import APIError, require_auth, require_internal_secret, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import Appointment, Doctor, Patient
from services.codes import next_doctor_code
from services.validators import normalize_gender

bp = Blueprint("doctors", __name__)
VALID_ENTITY_STATUSES = ("active", "inactive")


@bp.get("/doctors")
@require_auth
def list_doctors():
    query = session.query(Doctor)
    department_id = request.args.get("departmentId", type=int)
    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    status = request.args.get("status")
    if status:
        query = query.filter(Doctor.status == status)
    user_id = request.args.get("userId", type=int)
    if user_id:
        query = query.filter(Doctor.user_id == user_id)
    doctors = query.order_by(Doctor.name).all()
    return jsonify({"doctors": [d.to_dict() for d in doctors]})


@bp.post("/doctors")
@require_auth
@require_role("admin")
def create_doctor():
    body = request.get_json(silent=True) or {}
    if not body.get("name") or not body.get("departmentId"):
        raise APIError("name and departmentId are required", 400, "validation_error")

    status = body.get("status", "active")
    if status not in VALID_ENTITY_STATUSES:
        raise APIError(f"status must be one of {', '.join(VALID_ENTITY_STATUSES)}", 400, "validation_error")

    doctor = Doctor(
        doctor_code=next_doctor_code(session),
        department_id=body["departmentId"], name=body["name"],
        specialization=body.get("specialization"), qualification=body.get("qualification"),
        experience_years=body.get("experience"), fee=body.get("fee", 0),
        phone=body.get("phone"), address=body.get("address"),
        city=body.get("city"), state=body.get("state"), pin_code=body.get("pinCode"),
        dob=body.get("dob"), room_no=body.get("roomNo"),
        license_no=body.get("licenseNo"), email=body.get("email"),
        gender=normalize_gender(body.get("gender")), age=body.get("age"),
        availability_days=body.get("availabilityDays"),
        availability_hours=body.get("availabilityHours"),
        image_url=body.get("image"),
        status=status,
    )
    session.add(doctor)
    session.commit()
    return jsonify({"doctor": doctor.to_dict()}), 201


@bp.get("/doctors/<int:doctor_id>")
@require_auth
def get_doctor(doctor_id):
    doctor = session.query(Doctor).get(doctor_id)
    if not doctor:
        raise APIError("Doctor not found", 404, "not_found")
    return jsonify({"doctor": doctor.to_dict()})


@bp.put("/doctors/<int:doctor_id>")
@require_auth
@require_role("admin", "doctor")
def update_doctor(doctor_id):
    doctor = session.query(Doctor).get(doctor_id)
    if not doctor:
        raise APIError("Doctor not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    field_map = {
        "name": "name", "specialization": "specialization", "qualification": "qualification",
        "experience": "experience_years", "fee": "fee", "phone": "phone", "address": "address",
        "city": "city", "state": "state", "pinCode": "pin_code",
        "dob": "dob", "roomNo": "room_no",
        "email": "email", "licenseNo": "license_no", "gender": "gender", "age": "age",
        "status": "status", "departmentId": "department_id", "image": "image_url",
        "availabilityDays": "availability_days", "availabilityHours": "availability_hours",
        "rating": "rating",
    }
    for field, attr in field_map.items():
        if field not in body:
            continue
        value = body[field]
        if field == "gender":
            value = normalize_gender(value)
        elif field == "status" and value not in VALID_ENTITY_STATUSES:
            raise APIError(f"status must be one of {', '.join(VALID_ENTITY_STATUSES)}", 400, "validation_error")
        setattr(doctor, attr, value)
    session.commit()
    return jsonify({"doctor": doctor.to_dict()})


@bp.delete("/doctors/<int:doctor_id>")
@require_auth
@require_role("admin")
def delete_doctor(doctor_id):
    doctor = session.query(Doctor).get(doctor_id)
    if not doctor:
        raise APIError("Doctor not found", 404, "not_found")
    session.delete(doctor)
    session.commit()
    return jsonify({"message": "Doctor deleted"})


@bp.get("/doctors/<int:doctor_id>/patients")
@require_auth
def doctor_patients(doctor_id):
    """A doctor's patient list is derived from distinct appointments, not a
    stored join table (see plan §"business logic to preserve").
    """
    patient_ids = (
        session.query(Appointment.patient_id)
        .filter(Appointment.doctor_id == doctor_id)
        .distinct()
        .all()
    )
    ids = [pid for (pid,) in patient_ids]
    patients = session.query(Patient).filter(Patient.id.in_(ids)).all() if ids else []
    return jsonify({"patients": [p.to_dict() for p in patients]})


@bp.post("/internal/doctors")
@require_internal_secret
def internal_create_doctor():
    """Called by auth-service right after it creates a doctor's login, to
    materialize the matching clinical profile row.
    """
    body = request.get_json(silent=True) or {}
    if not body.get("departmentId"):
        raise APIError("departmentId is required", 400, "validation_error")

    doctor = Doctor(
        doctor_code=next_doctor_code(session),
        user_id=body.get("userId"), department_id=body["departmentId"], name=body.get("name"),
        specialization=body.get("specialization"), qualification=body.get("qualification"),
        experience_years=body.get("experience_years"), fee=body.get("fee") or 0,
        phone=body.get("phone"), address=body.get("address"),
        city=body.get("city"), state=body.get("state"), pin_code=body.get("pinCode"),
        dob=body.get("dob"), room_no=body.get("roomNo"),
        license_no=body.get("licenseNo"), email=body.get("email"),
        gender=normalize_gender(body.get("gender")), age=body.get("age"),
        availability_days=body.get("availabilityDays"),
        availability_hours=body.get("availabilityHours"),
        image_url=body.get("image"),
    )
    session.add(doctor)
    session.commit()
    return jsonify({"doctor": doctor.to_dict()}), 201


@bp.get("/internal/doctors/<int:doctor_id>")
@require_internal_secret
def internal_get_doctor(doctor_id):
    """Service-to-service doctor lookup (e.g. prescription-service resolving
    a doctor's user_id to target a dispense notification) - distinct from the
    public GET /doctors/<id>, which requires an end-user's auth headers.
    """
    doctor = session.query(Doctor).get(doctor_id)
    if not doctor:
        raise APIError("Doctor not found", 404, "not_found")
    return jsonify({"doctor": doctor.to_dict()})
