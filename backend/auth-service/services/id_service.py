from clinic_shared import next_uid_for_role as _next_uid_for_role


def next_uid_for_role(session, role):
    """DOC-0001 / REC-0001 / PAT-0001 / STORE-0001 / USER-0001 - backed by a
    real Postgres sequence per role prefix (auth.<role>_uid_seq), never a
    scan-and-increment over existing rows.
    """
    return _next_uid_for_role(session, role)
