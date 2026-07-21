from clinic_shared import APIError, require_auth, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import SmsLog
from services.sms_service import send_sms as send_sms_service

bp = Blueprint("sms", __name__)


@bp.get("/sms-logs")
@require_auth
def list_sms_logs():
    query = session.query(SmsLog)
    status = request.args.get("status")
    if status:
        query = query.filter(SmsLog.status == status)
    patient_id = request.args.get("patientId", type=int)
    if patient_id:
        query = query.filter(SmsLog.patient_id == patient_id)
    logs = query.order_by(SmsLog.sms_date.desc()).all()
    return jsonify({"smsLogs": [l.to_dict() for l in logs]})


@bp.post("/sms-logs")
@require_auth
def send_sms():
    body = request.get_json(silent=True) or {}
    if not body.get("recipient") or not body.get("phone"):
        raise APIError("recipient and phone are required", 400, "validation_error")

    result = send_sms_service(
        phone_number=body["phone"],
        message=body.get("message", ""),
        recipient_name=body["recipient"],
        sms_type=body.get("type", "manual"),
        patient_id=body.get("patientId"),
    )
    if result["status"] == "failed":
        raise APIError(f"SMS delivery failed: {result.get('error', 'Unknown error')}", 502, "sms_failed")

    log = session.query(SmsLog).order_by(SmsLog.id.desc()).first()
    return jsonify({"smsLog": log.to_dict() if log else None}), 201


@bp.get("/sms-logs/stats")
@require_auth
@require_role("admin")
def sms_stats():
    total = session.query(SmsLog).count()
    sent = session.query(SmsLog).filter(SmsLog.status == "sent").count()
    failed = session.query(SmsLog).filter(SmsLog.status == "failed").count()
    pending = session.query(SmsLog).filter(SmsLog.status == "pending").count()
    return jsonify({"total": total, "sent": sent, "failed": failed, "pending": pending})
