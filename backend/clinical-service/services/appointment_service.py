from clinic_shared import APIError
from models import Appointment

# Statuses that "hold" a slot - a cancelled/rescheduled/completed appointment
# no longer blocks the same doctor+date+time from being booked again.
BLOCKING_STATUSES = ("scheduled", "confirmed", "arrived")

VALID_TRANSITIONS = {
    "scheduled": {"confirmed", "arrived", "cancelled", "rescheduled"},
    "confirmed": {"arrived", "completed", "cancelled", "rescheduled"},
    "arrived": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
    "rescheduled": {"confirmed", "arrived", "cancelled"},
}


def check_slot_conflict(session, doctor_id, appt_date, appt_time, exclude_appointment_id=None):
    query = session.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appt_date == appt_date,
        Appointment.appt_time == appt_time,
        Appointment.status.in_(BLOCKING_STATUSES),
    )
    if exclude_appointment_id:
        query = query.filter(Appointment.id != exclude_appointment_id)
    if query.first():
        raise APIError(
            "This doctor already has an appointment at that date and time",
            409, "slot_conflict",
        )


def apply_status_transition(appointment, new_status, new_date=None, new_time=None):
    allowed = VALID_TRANSITIONS.get(appointment.status, set())
    if new_status not in allowed:
        raise APIError(
            f"Cannot transition appointment from '{appointment.status}' to '{new_status}'",
            409, "invalid_transition",
        )

    if new_status == "rescheduled":
        if not new_date or not new_time:
            raise APIError("date and time are required to reschedule", 400, "validation_error")
        appointment.previous_date = appointment.appt_date
        appointment.previous_time = appointment.appt_time
        appointment.appt_date = new_date
        appointment.appt_time = new_time

    appointment.status = new_status
    return appointment
