from datetime import datetime, timezone

from twilio.rest import Client as TwilioClient
from twilio.base.exceptions import TwilioRestException

import config
from db import session as db_session
from models import SmsLog


def send_sms(phone_number, message, recipient_name="Patient", sms_type="general", patient_id=None):
    status = "pending"
    error_msg = None

    if config.TWILIO_ACCOUNT_SID and config.TWILIO_AUTH_TOKEN:
        try:
            client = TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
            twilio_response = client.messages.create(
                body=message,
                from_=config.TWILIO_PHONE_NUMBER,
                to=phone_number,
            )
            status = "sent"
        except TwilioRestException as e:
            status = "failed"
            error_msg = str(e)
    else:
        status = "sent"

    log = SmsLog(
        recipient=recipient_name,
        phone=phone_number,
        patient_id=patient_id,
        type=sms_type,
        status=status,
        sms_date=datetime.now(timezone.utc),
        message=message,
    )
    db_session.add(log)
    db_session.commit()

    return {"status": status, "error": error_msg}


def send_appointment_confirmation(phone, patient_name, doctor_name, appt_date, appt_time, patient_id=None):
    clinic = config.CLINIC_NAME
    message = (
        f"Dear {patient_name}, your appointment at {clinic} has been confirmed. "
        f"Doctor: {doctor_name}, Date: {appt_date}, Time: {appt_time}. "
        f"Please arrive 15 minutes early. Thank you."
    )
    return send_sms(phone, message, patient_name, "appointment_confirmation", patient_id)


def send_appointment_cancellation(phone, patient_name, doctor_name, appt_date, patient_id=None):
    clinic = config.CLINIC_NAME
    message = (
        f"Dear {patient_name}, your appointment with Dr. {doctor_name} at {clinic} "
        f"on {appt_date} has been cancelled. Please book a new appointment at your convenience."
    )
    return send_sms(phone, message, patient_name, "appointment_cancelled", patient_id)


def send_prescription_ready(phone, patient_name, patient_id=None):
    clinic = config.CLINIC_NAME
    message = (
        f"Dear {patient_name}, your prescription from {clinic} is ready. "
        f"You can view and download it from your patient portal."
    )
    return send_sms(phone, message, patient_name, "prescription_ready", patient_id)


def send_dispense_confirmation(phone, patient_name, patient_id=None):
    clinic = config.CLINIC_NAME
    message = (
        f"Dear {patient_name}, your medicines have been dispensed from {clinic}. "
        f"Please collect them from the pharmacy."
    )
    return send_sms(phone, message, patient_name, "medicine_dispensed", patient_id)


def send_welcome_sms(phone, patient_name, patient_id_value, patient_id=None):
    clinic = config.CLINIC_NAME
    message = (
        f"Welcome to {clinic}, {patient_name}! Your patient ID is {patient_id_value}. "
        f"You can now book appointments online. For assistance, call {config.CLINIC_PHONE}."
    )
    return send_sms(phone, message, patient_name, "welcome", patient_id)
