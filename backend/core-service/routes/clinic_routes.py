from clinic_shared import APIError, require_auth, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import Clinic, ClinicSetting

bp = Blueprint("clinics", __name__)


@bp.get("/clinics")
@require_auth
def list_clinics():
    clinics = session.query(Clinic).order_by(Clinic.name).all()
    return jsonify({"clinics": [c.to_dict() for c in clinics]})


@bp.post("/clinics")
@require_auth
@require_role("admin")
def create_clinic():
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    clinic = Clinic(
        name=body["name"], address=body.get("address"), phone=body.get("phone"),
        email=body.get("email"), working_hours=body.get("workingHours"),
        status=body.get("status", "active"),
    )
    session.add(clinic)
    session.commit()
    return jsonify({"clinic": clinic.to_dict()}), 201


@bp.get("/clinics/<int:clinic_id>")
@require_auth
def get_clinic(clinic_id):
    clinic = session.query(Clinic).get(clinic_id)
    if not clinic:
        raise APIError("Clinic not found", 404, "not_found")
    return jsonify({"clinic": clinic.to_dict()})


@bp.put("/clinics/<int:clinic_id>")
@require_auth
@require_role("admin")
def update_clinic(clinic_id):
    clinic = session.query(Clinic).get(clinic_id)
    if not clinic:
        raise APIError("Clinic not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    field_map = {
        "name": "name", "address": "address", "phone": "phone", "email": "email",
        "workingHours": "working_hours", "status": "status",
    }
    for field, attr in field_map.items():
        if field in body:
            setattr(clinic, attr, body[field])
    session.commit()
    return jsonify({"clinic": clinic.to_dict()})


@bp.delete("/clinics/<int:clinic_id>")
@require_auth
@require_role("admin")
def delete_clinic(clinic_id):
    clinic = session.query(Clinic).get(clinic_id)
    if not clinic:
        raise APIError("Clinic not found", 404, "not_found")
    session.delete(clinic)
    session.commit()
    return jsonify({"message": "Clinic deleted"})


@bp.get("/settings")
@require_auth
@require_role("admin")
def get_settings():
    settings = session.query(ClinicSetting).all()
    return jsonify({"settings": {s.setting_key: s.setting_value for s in settings}})


@bp.put("/settings")
@require_auth
@require_role("admin")
def update_settings():
    body = request.get_json(silent=True) or {}
    if not isinstance(body, dict):
        raise APIError("Body must be a JSON object of setting key/value pairs", 400, "validation_error")

    for key, value in body.items():
        setting = session.query(ClinicSetting).filter(ClinicSetting.setting_key == key).first()
        if setting:
            setting.setting_value = value
        else:
            session.add(ClinicSetting(setting_key=key, setting_value=value))
    session.commit()

    settings = session.query(ClinicSetting).all()
    return jsonify({"settings": {s.setting_key: s.setting_value for s in settings}})
