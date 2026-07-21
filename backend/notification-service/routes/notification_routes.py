from functools import wraps

from clinic_shared import APIError, current_user, require_auth
from flask import Blueprint, jsonify, request
from sqlalchemy import and_, or_

import config
from db import session
from models import Notification, NotificationRead

bp = Blueprint("notifications", __name__)


def require_internal_or_admin(fn):
    """POST /notifications is called both by other services (internal
    secret, e.g. clinical-service notifying a doctor about a new booking)
    and by an admin broadcasting a message through the gateway (user JWT).
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        internal_secret = request.headers.get("X-Internal-Secret")
        if internal_secret and internal_secret == config.INTERNAL_SERVICE_SECRET:
            return fn(*args, **kwargs)
        return require_auth(_require_admin(fn))(*args, **kwargs)

    return wrapper


def _require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user or user["role"] != "admin":
            return jsonify({"error": "forbidden", "message": "Insufficient role"}), 403
        return fn(*args, **kwargs)

    return wrapper


@bp.post("/notifications")
@require_internal_or_admin
def create_notification():
    body = request.get_json(silent=True) or {}
    message = body.get("message")
    if not message:
        raise APIError("message is required", 400, "validation_error")

    notification = Notification(
        message=message, type=body.get("type", "info"),
        recipient_role=body.get("recipientRole", "all"),
        target_user_id=body.get("targetUserId"), from_role=body.get("fromRole"),
    )
    session.add(notification)
    session.commit()
    return jsonify({"notification": notification.to_dict()}), 201


@bp.get("/notifications")
@require_auth
def list_notifications():
    user = current_user()
    query = session.query(Notification)

    if user["role"] != "admin":
        query = query.filter(
            or_(
                Notification.recipient_role == "all",
                Notification.target_user_id == user["id"],
                and_(Notification.recipient_role == user["role"], Notification.target_user_id.is_(None)),
            )
        )

    notifications = query.order_by(Notification.created_at.desc()).all()

    read_ids = {
        nid for (nid,) in session.query(NotificationRead.notification_id)
        .filter(NotificationRead.user_id == user["id"])
        .all()
    }

    return jsonify({
        "notifications": [n.to_dict(read=n.id in read_ids) for n in notifications],
    })


@bp.post("/notifications/<int:notification_id>/read")
@require_auth
def mark_read(notification_id):
    user = current_user()
    notification = session.query(Notification).get(notification_id)
    if not notification:
        raise APIError("Notification not found", 404, "not_found")

    existing = session.query(NotificationRead).get((notification_id, user["id"]))
    if not existing:
        session.add(NotificationRead(notification_id=notification_id, user_id=user["id"]))
        session.commit()
    return jsonify({"message": "Marked as read"})


@bp.post("/notifications/read-all")
@require_auth
def mark_all_read():
    user = current_user()
    query = session.query(Notification.id)
    if user["role"] != "admin":
        query = query.filter(
            or_(
                Notification.recipient_role == "all",
                Notification.target_user_id == user["id"],
                and_(Notification.recipient_role == user["role"], Notification.target_user_id.is_(None)),
            )
        )
    all_ids = {nid for (nid,) in query.all()}

    already_read = {
        nid for (nid,) in session.query(NotificationRead.notification_id)
        .filter(NotificationRead.user_id == user["id"])
        .all()
    }

    for nid in all_ids - already_read:
        session.add(NotificationRead(notification_id=nid, user_id=user["id"]))
    session.commit()
    return jsonify({"message": "All notifications marked as read"})
