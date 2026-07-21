from clinic_shared import APIError, require_auth, require_role
from flask import Blueprint, jsonify, request

from services.aggregator import build_report

bp = Blueprint("reports", __name__)

VALID_CATEGORIES = ("patient", "doctor", "appointment", "financial", "prescription")


@bp.get("/reports")
@require_auth
@require_role("admin")
def get_report():
    category = request.args.get("category")
    if category not in VALID_CATEGORIES:
        raise APIError(f"category must be one of {', '.join(VALID_CATEGORIES)}", 400, "validation_error")

    params = {}
    if request.args.get("from"):
        params["from"] = request.args.get("from")
    if request.args.get("to"):
        params["to"] = request.args.get("to")

    data = build_report(category, params)
    if data is None:
        raise APIError("The upstream service for this report is unavailable", 502, "upstream_unavailable")

    return jsonify({"category": category, "data": data})
