import requests
from clinic_shared import APIError

import config

TIMEOUT = 10


def _internal_headers():
    return {"X-Internal-Secret": config.INTERNAL_SERVICE_SECRET, "Content-Type": "application/json"}


def decrement_inventory(store_id, items):
    """Calls pharmacy-service's atomic all-or-nothing decrement. Raises
    APIError(409, "insufficient_stock", details=[...]) if any item can't be
    fulfilled - nothing is written on either side in that case.
    """
    try:
        resp = requests.post(
            f"{config.PHARMACY_SERVICE_URL}/internal/inventory/decrement",
            json={"storeId": store_id, "items": items},
            headers=_internal_headers(),
            timeout=TIMEOUT,
        )
    except requests.exceptions.RequestException as exc:
        raise APIError(f"pharmacy-service is unreachable: {exc}", 502, "upstream_unavailable")

    if resp.status_code == 409:
        body = resp.json()
        raise APIError(body.get("message", "Insufficient stock"), 409, "insufficient_stock", details=body.get("details"))
    resp.raise_for_status()
    return resp.json()["decremented"]


def notify_doctor_of_dispense(doctor_user_id, rx_code):
    """Best-effort - a failure here must never roll back or block the
    dispense itself (see plan §4 on the accepted reliability gap).
    """
    if not doctor_user_id:
        return
    try:
        requests.post(
            f"{config.NOTIFICATION_SERVICE_URL}/notifications",
            json={
                "message": f"Prescription {rx_code} has been dispensed",
                "type": "success", "recipientRole": "doctor",
                "targetUserId": doctor_user_id, "fromRole": "medical_store",
            },
            headers=_internal_headers(),
            timeout=TIMEOUT,
        )
    except requests.exceptions.RequestException:
        pass


def get_doctor(doctor_id):
    try:
        resp = requests.get(
            f"{config.CLINICAL_SERVICE_URL}/internal/doctors/{doctor_id}",
            headers=_internal_headers(),
            timeout=TIMEOUT,
        )
        if resp.status_code != 200:
            return None
        return resp.json().get("doctor")
    except requests.exceptions.RequestException:
        return None
