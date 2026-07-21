from datetime import date as date_cls

from clinic_shared import APIError, current_user, require_auth
from flask import Blueprint, jsonify, request

from db import session
from models import Appointment, Doctor, Patient
from services import clients
from services.appointment_service import apply_status_transition, check_slot_conflict
from services.codes import next_appointment_code

bp = Blueprint("appointments", __name__)


@bp.get("/appointments")
@require_auth
def list_appointments():
    query = session.query(Appointment)
    doctor_id = request.args.get("doctorId", type=int)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    patient_id = request.args.get("patientId", type=int)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    status = request.args.get("status")
    if status:
        query = query.filter(Appointment.status == status)
    appt_date = request.args.get("date")
    if appt_date:
        query = query.filter(Appointment.appt_date == appt_date)

    appointments = query.order_by(Appointment.appt_date, Appointment.appt_time).all()
    return jsonify({"appointments": [a.to_dict() for a in appointments]})


@bp.get("/appointments/today")
@require_auth
def today_appointments():
    doctor_id = request.args.get("doctorId", type=int)
    query = session.query(Appointment).filter(Appointment.appt_date == date_cls.today())
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    appointments = query.order_by(Appointment.appt_time).all()
    return jsonify({"appointments": [a.to_dict() for a in appointments]})


@bp.post("/appointments")
@require_auth
def create_appointment():
    body = request.get_json(silent=True) or {}
    required = ("patientId", "doctorId", "date", "time")
    if any(not body.get(f) for f in required):
        raise APIError("patientId, doctorId, date and time are required", 400, "validation_error")

    doctor = session.query(Doctor).get(body["doctorId"])
    if not doctor:
        raise APIError("Doctor not found", 404, "not_found")

    check_slot_conflict(session, body["doctorId"], body["date"], body["time"])

    appointment = Appointment(
        appointment_code=next_appointment_code(session),
        patient_id=body["patientId"], doctor_id=body["doctorId"],
        department_id=doctor.department_id,
        appt_date=body["date"], appt_time=body["time"],
        type=body.get("type"), reason=body.get("reason"),
        status=body.get("status", "scheduled"),
    )
    session.add(appointment)
    session.commit()

    patient = session.query(Patient).get(body["patientId"])
    patient_name = patient.name if patient else "Patient"
    patient_phone = patient.phone if patient else None
    patient_email = patient.email if patient else None

    clients.notify(
        f"New appointment booked for {body['date']} {body['time']}",
        recipient_role="doctor", target_user_id=doctor.user_id, from_role="patient",
    )

    if patient_phone:
        clients.send_sms_notification(
            patient_phone,
            f"Dear {patient_name}, your appointment at {config.CLINIC_NAME} is confirmed. Doctor: {doctor.name}, Date: {body['date']}, Time: {body['time']}.",
            patient_name, "appointment_confirmation", body["patientId"],
        )
    if patient_email:
        clinic_name = config.CLINIC_NAME
        html = f"""
        <h2>Appointment Confirmed</h2>
        <p>Dear {patient_name},</p>
        <p>Your appointment has been confirmed at <strong>{clinic_name}</strong>.</p>
        <p><strong>Doctor:</strong> Dr. {doctor.name}<br>
        <strong>Date:</strong> {body['date']}<br>
        <strong>Time:</strong> {body['time']}</p>
        """
        clients.send_email_notification(
            patient_email, f"Appointment Confirmed - {config.CLINIC_NAME}",
            html, patient_name, "appointment_confirmation", body["patientId"],
        )

    return jsonify({"appointment": appointment.to_dict()}), 201


@bp.get("/appointments/<int:appointment_id>")
@require_auth
def get_appointment(appointment_id):
    appointment = session.query(Appointment).get(appointment_id)
    if not appointment:
        raise APIError("Appointment not found", 404, "not_found")
    return jsonify({"appointment": appointment.to_dict()})


@bp.patch("/appointments/<int:appointment_id>/status")
@require_auth
def update_appointment_status(appointment_id):
    appointment = session.query(Appointment).get(appointment_id)
    if not appointment:
        raise APIError("Appointment not found", 404, "not_found")

    body = request.get_json(silent=True) or {}
    new_status = body.get("status")
    if not new_status:
        raise APIError("status is required", 400, "validation_error")

    apply_status_transition(appointment, new_status, new_date=body.get("date"), new_time=body.get("time"))
    session.commit()

    if new_status == "cancelled":
        doctor = session.query(Doctor).get(appointment.doctor_id)
        patient = session.query(Patient).get(appointment.patient_id)
        clients.notify(
            f"Appointment #{appointment.appointment_code} was cancelled",
            recipient_role="doctor", target_user_id=doctor.user_id if doctor else None,
            from_role=current_user()["role"],
        )
        if patient:
            if patient.phone:
                clinic_name = config.CLINIC_NAME
                clients.send_sms_notification(
                    patient.phone,
                    f"Dear {patient.name}, your appointment on {appointment.appt_date} at {appointment.appt_time} at {clinic_name} has been cancelled.",
                    patient.name, "appointment_cancellation", appointment.patient_id,
                )
            if patient.email:
                clinic_name = config.CLINIC_NAME
                html = f"""
                <h2>Appointment Cancelled</h2>
                <p>Dear {patient.name},</p>
                <p>Your appointment at <strong>{clinic_name}</strong> on <strong>{appointment.appt_date}</strong> at <strong>{appointment.appt_time}</strong> has been cancelled.</p>
                """
                clients.send_email_notification(
                    patient.email,
                    f"Appointment Cancelled - {clinic_name}",
                    html, patient.name, "appointment_cancellation", appointment.patient_id,
                )

    return jsonify({"appointment": appointment.to_dict()})
