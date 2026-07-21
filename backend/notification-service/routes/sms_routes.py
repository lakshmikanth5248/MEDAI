from clinic_shared import APIError, require_auth, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import SmsLog

bp = Blueprint("sms", __name__)


@bp.get("/sms-logs")
@require_auth
@require_role("admin")
def list_sms_logs():
    query = session.query(SmsLog)
    status = request.args.get("status")
    if status:
        query = query.filter(SmsLog.status == status)
    logs = query.order_by(SmsLog.sms_date.desc()).all()
    return jsonify({"smsLogs": [l.to_dict() for l in logs]})


@bp.post("/sms-logs")
@require_auth
@require_role("admin")
def send_sms():
    """No real SMS delivery in this build (see plan §8, out of scope) - this
    just logs the attempt as 'sent' so the admin UI has something to show.
    """
    body = request.get_json(silent=True) or {}
    if not body.get("recipient") or not body.get("phone"):
        raise APIError("recipient and phone are required", 400, "validation_error")

    log = SmsLog(
        recipient=body["recipient"], phone=body["phone"], patient_id=body.get("patientId"),
        type=body.get("type"), status="sent", message=body.get("message"),
    )
    session.add(log)
    session.commit()
    return jsonify({"smsLog": log.to_dict()}), 201
