from clinic_shared import APIError, next_code, require_auth, require_internal_secret, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import Receptionist
from services.validators import normalize_gender

bp = Blueprint("receptionists", __name__)
VALID_ENTITY_STATUSES = ("active", "inactive")


def _next_reception_code():
    return next_code(session, "clinical.receptionist_id_seq", "REC", pad=0)


@bp.get("/receptionists")
@require_auth
def list_receptionists():
    query = session.query(Receptionist)
    user_id = request.args.get("userId", type=int)
    if user_id:
        query = query.filter(Receptionist.user_id == user_id)
    status = request.args.get("status")
    if status:
        query = query.filter(Receptionist.status == status)
    receptionists = query.order_by(Receptionist.name).all()
    return jsonify({"receptionists": [r.to_dict() for r in receptionists]})


@bp.post("/receptionists")
@require_auth
@require_role("admin")
def create_receptionist():
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    status = body.get("status", "active")
    if status not in VALID_ENTITY_STATUSES:
        raise APIError(f"status must be one of {', '.join(VALID_ENTITY_STATUSES)}", 400, "validation_error")

    receptionist = Receptionist(
        reception_code=_next_reception_code(),
        department_id=body.get("departmentId"), name=body["name"],
        email=body.get("email"), phone=body.get("phone"),
        gender=normalize_gender(body.get("gender")),
        dob=body.get("dob"), image_url=body.get("image"),
        employee_no=body.get("employeeNo"), shift=body.get("shift"),
        joining_date=body.get("joiningDate"), desk_no=body.get("deskNo"),
        address=body.get("address"), city=body.get("city"),
        state=body.get("state"), pin_code=body.get("pinCode"),
        status=status,
    )
    session.add(receptionist)
    session.commit()
    return jsonify({"receptionist": receptionist.to_dict()}), 201


@bp.get("/receptionists/<int:receptionist_id>")
@require_auth
def get_receptionist(receptionist_id):
    receptionist = session.query(Receptionist).get(receptionist_id)
    if not receptionist:
        raise APIError("Receptionist not found", 404, "not_found")
    return jsonify({"receptionist": receptionist.to_dict()})


@bp.put("/receptionists/<int:receptionist_id>")
@require_auth
@require_role("admin", "reception")
def update_receptionist(receptionist_id):
    receptionist = session.query(Receptionist).get(receptionist_id)
    if not receptionist:
        raise APIError("Receptionist not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    field_map = {
        "name": "name", "email": "email", "phone": "phone",
        "gender": "gender", "dob": "dob", "image": "image_url",
        "employeeNo": "employee_no", "shift": "shift",
        "joiningDate": "joining_date", "deskNo": "desk_no",
        "address": "address", "city": "city", "state": "state",
        "pinCode": "pin_code", "departmentId": "department_id",
        "status": "status",
    }
    for field, attr in field_map.items():
        if field not in body:
            continue
        value = body[field]
        if field == "gender":
            value = normalize_gender(value)
        elif field == "status" and value not in VALID_ENTITY_STATUSES:
            raise APIError(f"status must be one of {', '.join(VALID_ENTITY_STATUSES)}", 400, "validation_error")
        setattr(receptionist, attr, value)
    session.commit()
    return jsonify({"receptionist": receptionist.to_dict()})


@bp.delete("/receptionists/<int:receptionist_id>")
@require_auth
@require_role("admin")
def delete_receptionist(receptionist_id):
    receptionist = session.query(Receptionist).get(receptionist_id)
    if not receptionist:
        raise APIError("Receptionist not found", 404, "not_found")
    session.delete(receptionist)
    session.commit()
    return jsonify({"message": "Receptionist deleted"})


@bp.post("/internal/receptionists")
@require_internal_secret
def internal_create_receptionist():
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    receptionist = Receptionist(
        reception_code=_next_reception_code(),
        user_id=body.get("userId"), department_id=body.get("departmentId"),
        name=body["name"], email=body.get("email"), phone=body.get("phone"),
        gender=normalize_gender(body.get("gender")),
        dob=body.get("dob"), image_url=body.get("image"),
        employee_no=body.get("employeeNo"), shift=body.get("shift"),
        joining_date=body.get("joiningDate"), desk_no=body.get("deskNo"),
        address=body.get("address"), city=body.get("city"),
        state=body.get("state"), pin_code=body.get("pinCode"),
    )
    session.add(receptionist)
    session.commit()
    return jsonify({"receptionist": receptionist.to_dict()}), 201
