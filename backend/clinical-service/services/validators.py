from clinic_shared import APIError

VALID_GENDERS = ("male", "female", "other")


def normalize_gender(value):
    """Lowercase + validate against the clinical.gender enum, so a form
    sending 'Male'/'MALE' doesn't crash into a raw 500 from Postgres - see
    the same class of bug found in billing-service's paymentMethod handling.
    Returns None if value is None/empty (field is optional everywhere it's used).
    """
    if not value:
        return None
    normalized = value.strip().lower()
    if normalized not in VALID_GENDERS:
        raise APIError(f"gender must be one of {', '.join(VALID_GENDERS)}", 400, "validation_error")
    return normalized
