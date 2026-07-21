import requests

import config

TIMEOUT = 5


def _internal_headers():
    return {"X-Internal-Secret": config.INTERNAL_SERVICE_SECRET, "Content-Type": "application/json"}


def get_prescriptions_for_patient(patient_id):
    try:
        resp = requests.get(
            f"{config.PRESCRIPTION_SERVICE_URL}/prescriptions",
            params={"patientId": patient_id},
            headers=_internal_headers(),
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get("prescriptions", [])
    except requests.exceptions.RequestException:
        # Timeline should degrade gracefully rather than fail entirely if
        # prescription-service is temporarily unavailable.
        return []


def notify(message, recipient_role, target_user_id=None, from_role=None, notif_type="info"):
    try:
        requests.post(
            f"{config.NOTIFICATION_SERVICE_URL}/notifications",
            json={
                "message": message, "type": notif_type, "recipientRole": recipient_role,
                "targetUserId": target_user_id, "fromRole": from_role,
            },
            headers=_internal_headers(),
            timeout=TIMEOUT,
        )
    except requests.exceptions.RequestException:
        pass  # notifications are best-effort, never block the primary action
