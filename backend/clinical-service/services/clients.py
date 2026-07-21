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
        pass


def send_sms_notification(phone, message, recipient_name, sms_type, patient_id=None):
    try:
        requests.post(
            f"{config.NOTIFICATION_SERVICE_URL}/sms-logs",
            json={
                "phone": phone, "message": message, "recipient": recipient_name,
                "type": sms_type, "patientId": patient_id,
            },
            headers=_internal_headers(),
            timeout=TIMEOUT,
        )
    except requests.exceptions.RequestException:
        pass


def send_email_notification(email, subject, message, recipient_name, email_type, patient_id=None):
    try:
        requests.post(
            f"{config.NOTIFICATION_SERVICE_URL}/email-logs/send",
            json={
                "email": email, "subject": subject, "message": message,
                "recipient": recipient_name, "type": email_type, "patientId": patient_id,
            },
            headers=_internal_headers(),
            timeout=TIMEOUT,
        )
    except requests.exceptions.RequestException:
        pass
