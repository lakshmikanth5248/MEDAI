from datetime import datetime, timezone
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from flask_mail import Mail, Message

import config
from db import session as db_session
from models import EmailLog

mail = Mail()


def init_mail(app):
    app.config["MAIL_SERVER"] = config.MAIL_SERVER
    app.config["MAIL_PORT"] = config.MAIL_PORT
    app.config["MAIL_USE_TLS"] = config.MAIL_USE_TLS
    app.config["MAIL_USERNAME"] = config.MAIL_USERNAME
    app.config["MAIL_PASSWORD"] = config.MAIL_PASSWORD
    app.config["MAIL_DEFAULT_SENDER"] = config.MAIL_DEFAULT_SENDER
    mail.init_app(app)


def _send_email(recipient_email, subject, html_body, recipient_name="Patient",
                email_type="general", patient_id=None, attachment_path=None):
    status = "pending"
    error_msg = None

    try:
        msg = Message(
            subject=subject,
            recipients=[recipient_email],
            html=html_body,
        )

        if attachment_path:
            import os
            if os.path.exists(attachment_path):
                with open(attachment_path, "rb") as f:
                    part = MIMEApplication(f.read(), Name=os.path.basename(attachment_path))
                    part["Content-Disposition"] = f'attachment; filename="{os.path.basename(attachment_path)}"'
                    msg.attach(part)
            else:
                error_msg = f"Attachment not found: {attachment_path}"

        if not error_msg and config.MAIL_USERNAME and config.MAIL_PASSWORD:
            mail.send(msg)
            status = "sent"
        elif not error_msg:
            status = "sent"
    except Exception as e:
        status = "failed"
        error_msg = str(e)

    log = EmailLog(
        recipient=recipient_name,
        email=recipient_email,
        patient_id=patient_id,
        subject=subject,
        type=email_type,
        status=status,
        sent_at=datetime.now(timezone.utc),
        error_message=error_msg,
    )
    db_session.add(log)
    db_session.commit()

    return {"status": status, "error": error_msg}


def _html_template(title, body_lines, clinic_name=None):
    clinic = clinic_name or config.CLINIC_NAME
    lines_html = "".join(f"<p>{line}</p>" for line in body_lines)
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f7fc;">
        <table style="width:100%;max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <tr>
                <td style="background:linear-gradient(135deg,#0EA5E9,#0284C7);padding:24px 32px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:22px;">{clinic}</h1>
                </td>
            </tr>
            <tr>
                <td style="padding:32px;">
                    <h2 style="color:#0F172A;margin:0 0 16px;font-size:18px;">{title}</h2>
                    {lines_html}
                    <p style="color:#64748b;font-size:13px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">
                        {clinic} | {config.CLINIC_ADDRESS}<br>
                        Phone: {config.CLINIC_PHONE}
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def send_welcome_email(recipient_email, patient_name, patient_id_value, patient_id=None):
    subject = f"Welcome to {config.CLINIC_NAME}!"
    body = _html_template(
        f"Welcome, {patient_name}!",
        [
            f"Your registration at {config.CLINIC_NAME} is complete.",
            f"<strong>Patient ID:</strong> {patient_id_value}",
            "You can now log in to your patient portal to book appointments, view prescriptions, and more.",
        ],
    )
    return _send_email(recipient_email, subject, body, patient_name, "welcome", patient_id)


def send_appointment_confirmation_email(recipient_email, patient_name, doctor_name,
                                        specialization, appt_date, appt_time, patient_id=None):
    subject = f"Appointment Confirmed - {config.CLINIC_NAME}"
    body = _html_template(
        "Appointment Confirmed",
        [
            f"Dear {patient_name},",
            f"Your appointment has been confirmed at <strong>{config.CLINIC_NAME}</strong>.",
            f"<strong>Doctor:</strong> Dr. {doctor_name} ({specialization})",
            f"<strong>Date:</strong> {appt_date}",
            f"<strong>Time:</strong> {appt_time}",
            "Please arrive 15 minutes early. Bring your patient ID and previous medical records if any.",
        ],
    )
    return _send_email(recipient_email, subject, body, patient_name, "appointment_confirmation", patient_id)


def send_appointment_cancellation_email(recipient_email, patient_name, doctor_name, appt_date, patient_id=None):
    subject = f"Appointment Cancelled - {config.CLINIC_NAME}"
    body = _html_template(
        "Appointment Cancelled",
        [
            f"Dear {patient_name},",
            f"Your appointment with Dr. {doctor_name} on {appt_date} has been cancelled.",
            "If you did not request this cancellation, please contact the clinic.",
            f"<a href=\"{config.CLINIC_PHONE}\">Contact us</a> to reschedule.",
        ],
    )
    return _send_email(recipient_email, subject, body, patient_name, "appointment_cancelled", patient_id)


def send_prescription_email(recipient_email, patient_name, doctor_name, pdf_path, patient_id=None):
    subject = f"Prescription Ready - {config.CLINIC_NAME}"
    body = _html_template(
        "Your Prescription is Ready",
        [
            f"Dear {patient_name},",
            f"Dr. {doctor_name} has issued a prescription for you.",
            "Please find the prescription PDF attached to this email.",
            "You can also view it in your patient portal.",
        ],
    )
    return _send_email(recipient_email, subject, body, patient_name, "prescription", patient_id, attachment_path=pdf_path)


def send_dispense_confirmation_email(recipient_email, patient_name, patient_id=None):
    subject = f"Medicines Dispensed - {config.CLINIC_NAME}"
    body = _html_template(
        "Medicines Dispensed",
        [
            f"Dear {patient_name},",
            f"Your medicines have been dispensed from {config.CLINIC_NAME}.",
            "Please collect them from the pharmacy counter.",
            "If you have any questions, consult your doctor or pharmacist.",
        ],
    )
    return _send_email(recipient_email, subject, body, patient_name, "medicine_dispensed", patient_id)
