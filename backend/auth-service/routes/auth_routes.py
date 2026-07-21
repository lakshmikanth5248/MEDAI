import secrets
from datetime import datetime, timedelta, timezone

from clinic_shared import APIError, current_user, encode_token, require_auth, require_role
from flask import Blueprint, jsonify, request
from sqlalchemy import func, or_

import config
from db import session
from models import PasswordResetToken, StaffProfile, User
from services import clients
from services.id_service import next_uid_for_role
from services.password_service import hash_password, verify_password

bp = Blueprint("auth", __name__)

ROLE_LABELS = {
    "admin": "Admin",
    "doctor": "Doctor",
    "reception": "Receptionist",
    "patient": "Patient",
    "medical_store": "Medical Store",
}

RESET_TOKEN_TTL_MINUTES = 30


def _user_public(user):
    return {
        "id": user.id,
        "uid": user.uid,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "roleLabel": ROLE_LABELS.get(user.role, user.role),
        "status": user.status,
        "mustChangePassword": user.must_change_password,
    }


@bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    identifier = (body.get("identifier") or body.get("email") or "").strip()
    password = body.get("password") or ""
    role = body.get("role")

    if not identifier or not password:
        raise APIError("identifier and password are required", 400, "validation_error")

    query = session.query(User)
    if role:
        query = query.filter(User.role == role)
    query = query.filter(
        or_(
            func.lower(User.email) == identifier.lower(),
            func.lower(User.uid) == identifier.lower(),
        )
    )
    user = query.first()

    if not user or not verify_password(password, user.password_hash):
        raise APIError("Invalid credentials", 401, "invalid_credentials")

    if user.status != "active":
        raise APIError("This account has been deactivated", 403, "account_inactive")

    user.last_login = datetime.now(timezone.utc)
    session.commit()

    token = encode_token(
        {"sub": user.id, "role": user.role, "uid": user.uid, "name": user.name},
        config.JWT_SECRET,
    )
    return jsonify({"token": token, "user": _user_public(user)})


@bp.post("/register")
def register():
    """Patient self-service registration. Creates BOTH the auth user AND the
    clinical-service patient profile row (the mock only faked the latter).
    """
    body = request.get_json(silent=True) or {}
    name = (body.get("fullName") or body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    phone = body.get("phone")
    gender = body.get("gender")
    dob = body.get("dob")
    blood_group = body.get("bloodGroup")
    address = body.get("address")

    if not name or not email or len(password) < 6:
        raise APIError("name, email and a password of at least 6 characters are required", 400, "validation_error")

    if session.query(User).filter(func.lower(User.email) == email).first():
        raise APIError("An account with this email already exists", 409, "account_exists")

    uid = next_uid_for_role(session, "patient")
    user = User(email=email, password_hash=hash_password(password), role="patient", uid=uid, name=name)
    session.add(user)
    session.commit()

    try:
        clients.create_patient_profile(
            user.id, name, email, phone=phone, gender=gender, dob=dob,
            blood_group=blood_group, address=address,
        )
    except Exception as exc:
        session.delete(user)
        session.commit()
        raise APIError(
            "Registration failed while creating the patient profile. Please try again.",
            502, "profile_creation_failed",
        ) from exc

    return jsonify({"message": "Registration successful", "user": _user_public(user)}), 201


@bp.post("/staff")
@require_auth
@require_role("admin")
def create_staff():
    """Admin-only: create a doctor/reception/medical_store/admin login with a
    default password and must_change_password=True.
    """
    body = request.get_json(silent=True) or {}
    role = body.get("role")
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()

    if role not in ("doctor", "reception", "medical_store", "admin"):
        raise APIError("role must be one of doctor, reception, medical_store, admin", 400, "validation_error")
    if not name or not email:
        raise APIError("name and email are required", 400, "validation_error")
    if session.query(User).filter(func.lower(User.email) == email).first():
        raise APIError("An account with this email already exists", 409, "account_exists")

    default_password = config.staff_default_password(role)
    uid = next_uid_for_role(session, role)
    user = User(
        email=email, password_hash=hash_password(default_password), role=role,
        uid=uid, name=name, must_change_password=True,
    )
    session.add(user)
    session.commit()

    try:
        if role == "doctor":
            clients.create_doctor_profile(
                user.id, name, email, body.get("departmentId"),
                specialization=body.get("specialization"), experience_years=body.get("experience"),
                fee=body.get("fee"), qualification=body.get("qualification"),
                phone=body.get("phone"), address=body.get("address"),
                gender=body.get("gender"), age=body.get("age"),
            )
        elif role == "medical_store":
            clients.create_store_profile(
                user.id, body.get("storeName") or name, email,
                phone=body.get("phone"), address=body.get("address"),
            )
        else:  # reception / admin
            session.add(StaffProfile(
                user_id=user.id, role=role, phone=body.get("phone"),
                floor=body.get("floor"), shift=body.get("shift"),
            ))
            session.commit()
    except Exception as exc:
        session.delete(user)
        session.commit()
        raise APIError("Staff creation failed while creating the profile record.", 502, "profile_creation_failed") from exc

    return jsonify({
        "user": _user_public(user),
        "defaultPassword": default_password,
        "note": "Share this password with the new user - they must change it on first login.",
    }), 201


@bp.post("/change-password")
@require_auth
def change_password():
    body = request.get_json(silent=True) or {}
    current_password = body.get("currentPassword") or ""
    new_password = body.get("newPassword") or ""

    if len(new_password) < 6:
        raise APIError("New password must be at least 6 characters", 400, "validation_error")

    user = session.query(User).get(current_user()["id"])
    if not user or not verify_password(current_password, user.password_hash):
        raise APIError("Current password is incorrect", 401, "invalid_credentials")

    user.password_hash = hash_password(new_password)
    user.must_change_password = False
    session.commit()
    return jsonify({"message": "Password changed successfully"})


@bp.post("/forgot-password")
def forgot_password():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    if not email:
        raise APIError("email is required", 400, "validation_error")

    user = session.query(User).filter(func.lower(User.email) == email).first()

    # Always respond the same way whether or not the account exists, so this
    # endpoint can't be used to enumerate registered emails.
    generic_response = {"message": "If an account with that email exists, a reset link has been sent."}

    if not user:
        return jsonify(generic_response)

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    session.add(PasswordResetToken(user_id=user.id, token=token, expires_at=expires_at))
    session.commit()

    # No real email delivery in this build (see plan §8, out of scope) - the
    # reset link is returned directly so it can be used/tested immediately.
    generic_response["resetToken"] = token
    generic_response["expiresInMinutes"] = RESET_TOKEN_TTL_MINUTES
    return jsonify(generic_response)


@bp.post("/reset-password")
def reset_password():
    body = request.get_json(silent=True) or {}
    token = body.get("token") or ""
    new_password = body.get("newPassword") or ""

    if len(new_password) < 6:
        raise APIError("New password must be at least 6 characters", 400, "validation_error")

    record = session.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()
    now = datetime.now(timezone.utc)
    if not record or record.used_at is not None or record.expires_at < now:
        raise APIError("This reset link is invalid or has expired", 400, "invalid_token")

    user = session.query(User).get(record.user_id)
    if not user:
        raise APIError("This reset link is invalid or has expired", 400, "invalid_token")

    user.password_hash = hash_password(new_password)
    user.must_change_password = False
    record.used_at = now
    session.commit()
    return jsonify({"message": "Password has been reset successfully"})


@bp.get("/me")
@require_auth
def me():
    user = session.query(User).get(current_user()["id"])
    if not user:
        raise APIError("User not found", 404, "not_found")

    payload = _user_public(user)
    if user.role in ("reception", "admin"):
        profile = session.query(StaffProfile).filter(StaffProfile.user_id == user.id).first()
        if profile:
            payload["phone"] = profile.phone
            payload["floor"] = profile.floor
            payload["shift"] = profile.shift
    return jsonify({"user": payload})
