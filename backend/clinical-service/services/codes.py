from clinic_shared import next_code


def next_doctor_code(session):
    return next_code(session, "clinical.doctor_id_seq", "DOC-", pad=0)


def next_patient_code(session):
    return next_code(session, "clinical.patient_id_seq", "PAT-", pad=0)


def next_appointment_code(session):
    return next_code(session, "clinical.appointment_id_seq", "APT-", pad=0)
