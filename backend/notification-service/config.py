import os

from dotenv import load_dotenv

load_dotenv()

REQUIRED = ["DATABASE_URL", "INTERNAL_SERVICE_SECRET"]
missing = [k for k in REQUIRED if not os.environ.get(k)]
if missing:
    raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

DATABASE_URL = os.environ["DATABASE_URL"]
INTERNAL_SERVICE_SECRET = os.environ["INTERNAL_SERVICE_SECRET"]
PORT = int(os.environ.get("NOTIFICATION_SERVICE_PORT", 5006))

CLINICAL_SERVICE_URL = os.environ.get("CLINICAL_SERVICE_URL", "http://127.0.0.1:5002")

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "")

MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "")
MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "")
MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@clinic.com")

CLINIC_NAME = os.environ.get("CLINIC_NAME", "City Care Clinic")
CLINIC_PHONE = os.environ.get("CLINIC_PHONE", "")
CLINIC_ADDRESS = os.environ.get("CLINIC_ADDRESS", "")
