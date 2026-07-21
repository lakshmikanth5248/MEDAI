from clinic_shared import APIError, current_user, require_auth, require_role
from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from db import session
from models import StaffProfile, User
from .auth_routes import _user_public

bp = Blueprint("users", __name__)


@bp.get("/users")
@require_auth
@require_role("admin")
def list_users():
    query = session.query(User)

    role = request.args.get("role")
    if role:
        query = query.filter(User.role == role)

    status = request.args.get("status")
    if status:
        query = query.filter(User.status == status)

    q = request.args.get("q")
    if q:
        like = f"%{q}%"
        query = query.filter(or_(User.name.ilike(like), User.email.ilike(like), User.uid.ilike(like)))

    users = query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [_user_public(u) for u in users]})


@bp.patch("/users/<int:user_id>/status")
@require_auth
@require_role("admin")
def update_user_status(user_id):
    body = request.get_json(silent=True) or {}
    status = body.get("status")
    if status not in ("active", "inactive"):
        raise APIError("status must be 'active' or 'inactive'", 400, "validation_error")

    user = session.query(User).get(user_id)
    if not user:
        raise APIError("User not found", 404, "not_found")

    user.status = status
    session.commit()
    return jsonify({"user": _user_public(user)})


@bp.patch("/users/<int:user_id>")
@require_auth
def update_user(user_id):
    """Edit of the auth identity (name/email), plus the linked staff_profiles
    row (phone/floor/shift) for reception/admin accounts - doctor/patient/
    medical_store domain profiles are edited on their own service
    (PUT /clinical/doctors/:id etc), not here.

    Admins can edit any user; everyone else can only edit their own record
    (this is how reception/admin accounts self-service their own profile,
    since they have no dedicated domain service like doctors/patients do).
    """
    caller = current_user()
    if caller["role"] != "admin" and caller["id"] != user_id:
        raise APIError("You can only edit your own profile", 403, "forbidden")

    user = session.query(User).get(user_id)
    if not user:
        raise APIError("User not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    if "name" in body:
        user.name = body["name"]
    if "email" in body:
        user.email = body["email"].strip().lower()

    profile = session.query(StaffProfile).filter(StaffProfile.user_id == user_id).first()
    if profile:
        for field in ("phone", "floor", "shift"):
            if field in body:
                setattr(profile, field, body[field])

    session.commit()
    return jsonify({"user": _user_public(user)})


@bp.delete("/users/<int:user_id>")
@require_auth
@require_role("admin")
def delete_user(user_id):
    """Deletes the login only. The linked doctor/patient/medical_store
    profile row (if any) survives with user_id set to NULL (ON DELETE
    SET NULL) - this revokes access without destroying clinical data.
    """
    user = session.query(User).get(user_id)
    if not user:
        raise APIError("User not found", 404, "not_found")

    session.delete(user)
    session.commit()
    return jsonify({"message": "User deleted"})
