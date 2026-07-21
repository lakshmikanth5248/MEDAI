from clinic_shared import APIError, current_user, require_auth, require_role
from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from db import session
from models import StaffProfile, User
from services.password_service import hash_password, validate_password
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
    if status not in ("active", "inactive", "blocked"):
        raise APIError("status must be 'active', 'inactive', or 'blocked'", 400, "validation_error")

    user = session.query(User).get(user_id)
    if not user:
        raise APIError("User not found", 404, "not_found")

    user.status = status
    session.commit()
    return jsonify({"user": _user_public(user)})


@bp.patch("/users/<int:user_id>")
@require_auth
def update_user(user_id):
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
    if "phone" in body and caller["role"] == "admin":
        profile = session.query(StaffProfile).filter(StaffProfile.user_id == user_id).first()
        if profile:
            profile.phone = body["phone"]

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
    user = session.query(User).get(user_id)
    if not user:
        raise APIError("User not found", 404, "not_found")

    session.delete(user)
    session.commit()
    return jsonify({"message": "User deleted successfully"})


@bp.post("/users/<int:user_id>/reset-password")
@require_auth
@require_role("admin")
def reset_user_password(user_id):
    body = request.get_json(silent=True) or {}
    new_password = body.get("newPassword") or ""

    user = session.query(User).get(user_id)
    if not user:
        raise APIError("User not found", 404, "not_found")

    if new_password:
        pwd_errors = validate_password(new_password)
        if pwd_errors:
            raise APIError("; ".join(pwd_errors), 400, "validation_error")
        user.password_hash = hash_password(new_password)
    else:
        from config import staff_default_password
        default_password = staff_default_password(user.role)
        user.password_hash = hash_password(default_password)

    user.must_change_password = True
    session.commit()
    return jsonify({"message": "Password reset successfully"})


@bp.get("/users/stats")
@require_auth
@require_role("admin")
def user_stats():
    from sqlalchemy import func
    total = session.query(func.count(User.id)).scalar()
    active = session.query(func.count(User.id)).filter(User.status == "active").scalar()
    inactive = session.query(func.count(User.id)).filter(User.status == "inactive").scalar()
    blocked = session.query(func.count(User.id)).filter(User.status == "blocked").scalar()
    role_counts = session.query(User.role, func.count(User.id)).group_by(User.role).all()

    return jsonify({
        "total": total,
        "active": active,
        "inactive": inactive,
        "blocked": blocked,
        "byRole": {role: count for role, count in role_counts},
    })
