"""Outbound REST calls to other services' /internal/* endpoints, made when a
new auth user is created and needs a matching domain profile row (closes the
mock's gap where registration never persisted a real patient/doctor/store row).
"""
import requests

import config

TIMEOUT = 5


def _internal_headers():
    return {"X-Internal-Secret": config.INTERNAL_SERVICE_SECRET, "Content-Type": "application/json"}


def create_patient_profile(user_id, name, email, phone=None, gender=None, dob=None,
                            blood_group=None, address=None):
    resp = requests.post(
        f"{config.CLINICAL_SERVICE_URL}/internal/patients",
        json={
            "userId": user_id, "name": name, "email": email, "phone": phone,
            "gender": gender, "dob": dob, "bloodGroup": blood_group, "address": address,
        },
        headers=_internal_headers(),
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()


def create_doctor_profile(user_id, name, email, department_id, **fields):
    resp = requests.post(
        f"{config.CLINICAL_SERVICE_URL}/internal/doctors",
        json={"userId": user_id, "name": name, "email": email, "departmentId": department_id, **fields},
        headers=_internal_headers(),
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()


def create_store_profile(user_id, name, email, **fields):
    resp = requests.post(
        f"{config.PHARMACY_SERVICE_URL}/internal/stores",
        json={"userId": user_id, "name": name, "email": email, **fields},
        headers=_internal_headers(),
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()


def create_reception_profile(user_id, name, email, **fields):
    resp = requests.post(
        f"{config.CLINICAL_SERVICE_URL}/internal/receptionists",
        json={"userId": user_id, "name": name, "email": email, **fields},
        headers=_internal_headers(),
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()


def send_welcome_sms(phone, name, patient_id):
    try:
        requests.post(
            f"{config.NOTIFICATION_SERVICE_URL}/sms-logs",
            json={
                "phone": phone, "recipient": name, "patientId": patient_id,
                "message": f"Dear {name}, welcome to {config.CLINIC_NAME}! Your account has been created successfully.",
                "type": "welcome",
            },
            headers=_internal_headers(),
            timeout=5,
        )
    except requests.exceptions.RequestException:
        pass


def send_welcome_email(email, name, patient_id):
    try:
        clinic_name = config.CLINIC_NAME
        html = f"<h2>Welcome to {clinic_name}</h2><p>Dear {name},</p><p>Your account has been created successfully. You can now book appointments online.</p>"
        requests.post(
            f"{config.NOTIFICATION_SERVICE_URL}/email-logs/send",
            json={
                "email": email, "subject": f"Welcome to {clinic_name}",
                "message": html, "recipient": name, "type": "welcome",
                "patientId": patient_id,
            },
            headers=_internal_headers(),
            timeout=5,
        )
    except requests.exceptions.RequestException:
        pass
