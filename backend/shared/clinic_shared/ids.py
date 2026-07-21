"""Human-readable ID helpers backed by real Postgres SEQUENCEs (never random,
never scan-and-increment in app code - see plan §"business logic to preserve").

Most entity codes (DOC-100001, PAT-100001, RX-100001, ...) are assigned by a
column DEFAULT expression in the DDL itself, so no helper is needed for those.
This module exists for the one case that can't be a column default: the
per-role login `uid` (DOC-0001 / REC-0001 / PAT-0001 / STORE-0001 / USER-0001),
whose sequence depends on which role is being inserted.
"""
from sqlalchemy import text


def next_sequence_value(session, schema_qualified_sequence_name):
    result = session.execute(text(f"SELECT nextval('{schema_qualified_sequence_name}')"))
    return result.scalar()


def next_code(session, schema_qualified_sequence_name, prefix, pad=4):
    value = next_sequence_value(session, schema_qualified_sequence_name)
    return f"{prefix}{str(value).zfill(pad)}"


ROLE_UID_SEQUENCE = {
    "doctor": ("clinic_auth.doctor_uid_seq", "DOC"),
    "reception": ("clinic_auth.reception_uid_seq", "REC"),
    "patient": ("clinic_auth.patient_uid_seq", "PAT"),
    "medical_store": ("clinic_auth.store_uid_seq", "MED"),
    "admin": ("clinic_auth.admin_uid_seq", "ADM"),
}


def next_uid_for_role(session, role):
    sequence_name, prefix = ROLE_UID_SEQUENCE[role]
    return next_code(session, sequence_name, prefix, pad=4)
