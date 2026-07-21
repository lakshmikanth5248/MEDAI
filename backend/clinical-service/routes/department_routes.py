from clinic_shared import APIError, require_auth, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import Department

bp = Blueprint("departments", __name__)


@bp.get("/departments")
@require_auth
def list_departments():
    departments = session.query(Department).order_by(Department.name).all()
    return jsonify({"departments": [d.to_dict() for d in departments]})


@bp.post("/departments")
@require_auth
@require_role("admin")
def create_department():
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        raise APIError("name is required", 400, "validation_error")

    dept = Department(
        name=body["name"], icon=body.get("icon"), color=body.get("color"),
        description=body.get("description"), status=body.get("status", "active"),
    )
    session.add(dept)
    session.commit()
    return jsonify({"department": dept.to_dict()}), 201


@bp.get("/departments/<int:dept_id>")
@require_auth
def get_department(dept_id):
    dept = session.query(Department).get(dept_id)
    if not dept:
        raise APIError("Department not found", 404, "not_found")
    return jsonify({"department": dept.to_dict()})


@bp.put("/departments/<int:dept_id>")
@require_auth
@require_role("admin")
def update_department(dept_id):
    dept = session.query(Department).get(dept_id)
    if not dept:
        raise APIError("Department not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    for field, attr in (("name", "name"), ("icon", "icon"), ("color", "color"),
                         ("description", "description"), ("status", "status")):
        if field in body:
            setattr(dept, attr, body[field])
    session.commit()
    return jsonify({"department": dept.to_dict()})


@bp.delete("/departments/<int:dept_id>")
@require_auth
@require_role("admin")
def delete_department(dept_id):
    dept = session.query(Department).get(dept_id)
    if not dept:
        raise APIError("Department not found", 404, "not_found")
    session.delete(dept)
    session.commit()
    return jsonify({"message": "Department deleted"})
