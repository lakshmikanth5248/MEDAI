from clinic_shared import require_auth
from flask import Blueprint, jsonify

from services.aggregator import dashboard_summary

bp = Blueprint("dashboard", __name__)


@bp.get("/dashboard/summary")
@require_auth
def summary():
    return jsonify({"summary": dashboard_summary()})
