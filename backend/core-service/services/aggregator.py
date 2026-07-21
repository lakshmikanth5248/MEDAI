"""Fan-out REST calls to other services to build dashboard/report payloads.
core-service is the one deliberately "chatty" aggregator by design (plan §4).

Outbound calls carry the SAME trusted X-User-* headers this request arrived
with (injected by the gateway, or - since core-service is itself only
reachable through the gateway in this local-dev setup - safely re-forwarded
here), so downstream services see a normal authenticated request rather than
needing a separate internal-secret path for ordinary reads.
"""
import requests
from clinic_shared import current_user

import config

TIMEOUT = 5


def _forwarded_headers():
    user = current_user()
    if not user:
        return {}
    return {
        "X-User-Id": str(user["id"]),
        "X-User-Role": user["role"],
        "X-User-Uid": user.get("uid") or "",
        "X-User-Name": user.get("name") or "",
    }


def _get(base_url, path, params=None):
    try:
        resp = requests.get(f"{base_url}{path}", params=params, headers=_forwarded_headers(), timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException:
        return None


def dashboard_summary():
    patients = _get(config.CLINICAL_SERVICE_URL, "/patients") or {"patients": []}
    doctors = _get(config.CLINICAL_SERVICE_URL, "/doctors") or {"doctors": []}
    today_appts = _get(config.CLINICAL_SERVICE_URL, "/appointments/today") or {"appointments": []}
    bills = _get(config.BILLING_SERVICE_URL, "/bills") or {"bills": []}
    pending_rx = _get(config.PRESCRIPTION_SERVICE_URL, "/prescriptions", {"status": "pending"}) or {"prescriptions": []}
    low_stock = _get(config.PHARMACY_SERVICE_URL, "/inventory/low-stock") or {"inventory": []}

    revenue = sum(b.get("grandTotal", 0) for b in bills.get("bills", []) if b.get("status") == "paid")

    return {
        "totalPatients": len(patients.get("patients", [])),
        "totalDoctors": len(doctors.get("doctors", [])),
        "todayAppointments": len(today_appts.get("appointments", [])),
        "revenue": revenue,
        "pendingPrescriptions": len(pending_rx.get("prescriptions", [])),
        "lowStockItems": len(low_stock.get("inventory", [])),
    }


REPORT_BUILDERS = {
    "patient": lambda params: _get(config.CLINICAL_SERVICE_URL, "/patients"),
    "doctor": lambda params: _get(config.CLINICAL_SERVICE_URL, "/doctors"),
    "appointment": lambda params: _get(config.CLINICAL_SERVICE_URL, "/appointments", params),
    "financial": lambda params: _get(config.BILLING_SERVICE_URL, "/bills"),
    "prescription": lambda params: _get(config.PRESCRIPTION_SERVICE_URL, "/prescriptions"),
}


def build_report(category, params):
    builder = REPORT_BUILDERS.get(category)
    if not builder:
        return None
    return builder(params)
