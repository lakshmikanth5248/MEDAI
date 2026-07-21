from clinic_shared import APIError, require_auth, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import EmailLog
from services.email_service import (
    send_appointment_confirmation_email,
    send_appointment_cancellation_email,
    send_dispense_confirmation_email,
    send_prescription_email,
    send_welcome_email,
)

bp = Blueprint("email", __name__)


@bp.get("/email-logs")
@require_auth
def list_email_logs():
    query = session.query(EmailLog)
    status = request.args.get("status")
    if status:
        query = query.filter(EmailLog.status == status)
    patient_id = request.args.get("patientId", type=int)
    if patient_id:
        query = query.filter(EmailLog.patient_id == patient_id)
    logs = query.order_by(EmailLog.sent_at.desc()).all()
    return jsonify({"emailLogs": [l.to_dict() for l in logs]})


@bp.post("/email-logs/send")
@require_auth
def send_custom_email():
    body = request.get_json(silent=True) or {}
    if not body.get("email") or not body.get("subject") or not body.get("message"):
        raise APIError("email, subject and message are required", 400, "validation_error")

    from services.email_service import _send_email
    result = _send_email(
        recipient_email=body["email"],
        subject=body["subject"],
        html_body=body["message"],
        recipient_name=body.get("recipient", "Patient"),
        email_type=body.get("type", "manual"),
        patient_id=body.get("patientId"),
    )
    if result["status"] == "failed":
        raise APIError(f"Email delivery failed: {result.get('error', 'Unknown error')}", 502, "email_failed")

    log = session.query(EmailLog).order_by(EmailLog.id.desc()).first()
    return jsonify({"emailLog": log.to_dict() if log else None}), 201


@bp.get("/email-logs/stats")
@require_auth
@require_role("admin")
def email_stats():
    total = session.query(EmailLog).count()
    sent = session.query(EmailLog).filter(EmailLog.status == "sent").count()
    failed = session.query(EmailLog).filter(EmailLog.status == "failed").count()
    pending = session.query(EmailLog).filter(EmailLog.status == "pending").count()
    return jsonify({"total": total, "sent": sent, "failed": failed, "pending": pending})


@bp.post("/email-logs/retry-failed")
@require_auth
@require_role("admin")
def retry_failed_emails():
    failed = session.query(EmailLog).filter(EmailLog.status == "failed").all()
    retried = 0
    for log in failed:
        from services.email_service import _send_email
        result = _send_email(
            recipient_email=log.email,
            subject=log.subject,
            html_body=log.message or "",
            recipient_name=log.recipient,
            email_type=log.type or "retry",
            patient_id=log.patient_id,
        )
        if result["status"] == "sent":
            retried += 1
    return jsonify({"message": f"Retried {retried} of {len(failed)} failed emails"})
