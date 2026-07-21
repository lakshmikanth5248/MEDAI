from clinic_shared import APIError, require_auth, require_internal_secret, require_role
from flask import Blueprint, jsonify, request

from db import session
from models import ActivityLog

bp = Blueprint("activity", __name__)


@bp.get("/activity-log")
@require_auth
@require_role("admin")
def list_activity():
    limit = request.args.get("limit", default=50, type=int)
    entries = session.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return jsonify({"activity": [e.to_dict() for e in entries]})


@bp.post("/internal/activity-log")
@require_internal_secret
def internal_append_activity():
    body = request.get_json(silent=True) or {}
    if not body.get("actorName"):
        raise APIError("actorName is required", 400, "validation_error")

    entry = ActivityLog(
        actor_user_id=body.get("actorUserId"), actor_name=body["actorName"],
        action_type=body.get("actionType", "other"), target_description=body.get("targetDescription"),
        entity_type=body.get("entityType"), entity_id=body.get("entityId"),
    )
    session.add(entry)
    session.commit()
    return jsonify({"activity": entry.to_dict()}), 201
