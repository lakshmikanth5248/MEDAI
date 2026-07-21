import os

from dotenv import load_dotenv

load_dotenv()  # no-op if no local .env file - start-all.ps1 already injects env vars

REQUIRED = ["DATABASE_URL", "JWT_SECRET", "INTERNAL_SERVICE_SECRET"]
missing = [k for k in REQUIRED if not os.environ.get(k)]
if missing:
    raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
INTERNAL_SERVICE_SECRET = os.environ["INTERNAL_SERVICE_SECRET"]
PORT = int(os.environ.get("AUTH_SERVICE_PORT", 5001))

CLINICAL_SERVICE_URL = os.environ.get("CLINICAL_SERVICE_URL", "http://127.0.0.1:5002")
PHARMACY_SERVICE_URL = os.environ.get("PHARMACY_SERVICE_URL", "http://127.0.0.1:5004")
NOTIFICATION_SERVICE_URL = os.environ.get("NOTIFICATION_SERVICE_URL", "http://127.0.0.1:5006")
CLINIC_NAME = os.environ.get("CLINIC_NAME", "City Care Clinic")


def staff_default_password(role):
    """Single standardized default-password scheme for admin-created staff
    accounts (the mock had two competing schemes - this replaces both).
    The account is created with must_change_password=True so this is only
    ever used once, at first login.
    """
    return f"{role}@1234"
