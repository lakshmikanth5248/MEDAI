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
from services.password_service import hash_password, verify_password, validate_password

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

    if not identifier or not password:
        raise APIError("Email and password are required", 400, "validation_error")

    user = session.query(User).filter(
        or_(
            func.lower(User.email) == identifier.lower(),
            func.lower(User.uid) == identifier.lower(),
        )
    ).first()

    if not user or not verify_password(password, user.password_hash):
        raise APIError("Invalid credentials", 401, "invalid_credentials")

    if user.status == "blocked":
        raise APIError(
            "Your account has been blocked. Please contact the administrator.",
            403, "account_blocked",
        )
    if user.status == "inactive":
        raise APIError("Your account is inactive.", 403, "account_inactive")
    if user.status == "deleted":
        raise APIError("Invalid credentials", 401, "invalid_credentials")

    user.last_login = datetime.now(timezone.utc)
    session.commit()

    token = encode_token(
        {"sub": user.id, "role": user.role, "uid": user.uid, "name": user.name},
        config.JWT_SECRET,
    )
    return jsonify({"token": token, "user": _user_public(user)})


@bp.post("/register")
def register():
    """Patient-only self-service registration. Only Patient role is allowed.
    Creates BOTH the auth user AND the clinical-service patient profile row.
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
    role = body.get("role")

    allowed_role = "patient"
    if role and role != allowed_role:
        raise APIError(
            "Only Patient registration is allowed via public registration.",
            403, "invalid_role",
        )

    if not name or not email:
        raise APIError("Name and email are required", 400, "validation_error")
    pwd_errors = validate_password(password)
    if pwd_errors:
        raise APIError("; ".join(pwd_errors), 400, "validation_error")

    if session.query(User).filter(func.lower(User.email) == email).first():
        raise APIError("An account with this email already exists", 409, "account_exists")

    uid = next_uid_for_role(session, allowed_role)
    user = User(email=email, password_hash=hash_password(password), role=allowed_role, uid=uid, name=name, status="active")
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

    if phone:
        clients.send_welcome_sms(phone, name, user.id)
    if email:
        clients.send_welcome_email(email, name, user.id)

    return jsonify({"message": "Registration successful", "user": _user_public(user)}), 201


@bp.post("/staff")
@require_auth
@require_role("admin")
def create_staff():
    """Admin-only: create a doctor/reception/medical_store login with full
    profile fields and a default password (must_change_password=True).
    Admin cannot create another Admin account.
    """
    body = request.get_json(silent=True) or {}
    role = body.get("role")
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()

    if role not in ("doctor", "reception", "medical_store"):
        raise APIError("role must be one of doctor, reception, medical_store", 400, "validation_error")
    if not name or not email:
        raise APIError("name and email are required", 400, "validation_error")
    if session.query(User).filter(func.lower(User.email) == email).first():
        raise APIError("An account with this email already exists", 409, "account_exists")

    password = body.get("password") or config.staff_default_password(role)
    if body.get("password"):
        pwd_errors = validate_password(password)
        if pwd_errors:
            raise APIError("; ".join(pwd_errors), 400, "validation_error")
    uid = next_uid_for_role(session, role)
    user = User(
        email=email, password_hash=hash_password(password), role=role,
        uid=uid, name=name,
        must_change_password=not bool(body.get("password")),
    )
    session.add(user)
    session.commit()

    try:
        if role == "doctor":
            clients.create_doctor_profile(
                user.id, name, email, body.get("departmentId"),
                specialization=body.get("specialization"),
                qualification=body.get("qualification"),
                experience_years=body.get("experience"),
                fee=body.get("consultationFee"),
                phone=body.get("phone"), address=body.get("address"),
                city=body.get("city"), state=body.get("state"),
                pinCode=body.get("pinCode"),
                dob=body.get("dob"), roomNo=body.get("roomNo"),
                licenseNo=body.get("licenseNo"),
                gender=body.get("gender"),
                availabilityDays=body.get("availabilityDays"),
                availabilityHours=body.get("availabilityHours"),
                image=body.get("image"),
            )
            staff_profile = StaffProfile(
                user_id=user.id, role=role, phone=body.get("phone"),
                shift=None, floor=None,
            )
            session.add(staff_profile)
            session.commit()
        elif role == "medical_store":
            clients.create_store_profile(
                user.id, body.get("storeName") or name, email,
                managerName=body.get("managerName"),
                phone=body.get("phone"), address=body.get("address"),
                city=body.get("city"), state=body.get("state"),
                pinCode=body.get("pinCode"),
                floorNo=body.get("floorNo"), storeNo=body.get("storeNo"),
                licenseNo=body.get("licenseNo"), gstNo=body.get("gstNo"),
            )
            staff_profile = StaffProfile(
                user_id=user.id, role=role, phone=body.get("phone"),
                shift=None, floor=None,
            )
            session.add(staff_profile)
            session.commit()
        else:  # reception
            clients.create_reception_profile(
                user.id, name, email,
                departmentId=body.get("departmentId"),
                phone=body.get("phone"),
                gender=body.get("gender"), dob=body.get("dob"),
                image=body.get("image"),
                employeeNo=body.get("employeeNo"),
                shift=body.get("shift"),
                joiningDate=body.get("joiningDate"),
                deskNo=body.get("deskNo"),
                address=body.get("address"), city=body.get("city"),
                state=body.get("state"), pinCode=body.get("pinCode"),
            )
            session.add(StaffProfile(
                user_id=user.id, role=role, phone=body.get("phone"),
                shift=body.get("shift"), floor=None,
            ))
            session.commit()
    except Exception as exc:
        session.delete(user)
        session.commit()
        raise APIError("Staff creation failed while creating the profile record.", 502, "profile_creation_failed") from exc

    return jsonify({
        "user": _user_public(user),
        "defaultPassword": password,
        "note": "Share these credentials with the new user.",
    }), 201


@bp.post("/change-password")
@require_auth
def change_password():
    body = request.get_json(silent=True) or {}
    current_password = body.get("currentPassword") or ""
    new_password = body.get("newPassword") or ""

    pwd_errors = validate_password(new_password)
    if pwd_errors:
        raise APIError("; ".join(pwd_errors), 400, "validation_error")

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

    pwd_errors = validate_password(new_password)
    if pwd_errors:
        raise APIError("; ".join(pwd_errors), 400, "validation_error")

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
