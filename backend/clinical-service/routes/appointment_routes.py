from datetime import date as date_cls

from clinic_shared import APIError, current_user, require_auth
from flask import Blueprint, jsonify, request

from db import session
from models import Appointment, Doctor
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

    clients.notify(
        f"New appointment booked for {body['date']} {body['time']}",
        recipient_role="doctor", target_user_id=doctor.user_id, from_role="patient",
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
        clients.notify(
            f"Appointment #{appointment.appointment_code} was cancelled",
            recipient_role="doctor", target_user_id=doctor.user_id if doctor else None,
            from_role=current_user()["role"],
        )

    return jsonify({"appointment": appointment.to_dict()})
