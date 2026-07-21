import os

from dotenv import load_dotenv

load_dotenv()

REQUIRED = ["DATABASE_URL", "INTERNAL_SERVICE_SECRET"]
missing = [k for k in REQUIRED if not os.environ.get(k)]
if missing:
    raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

DATABASE_URL = os.environ["DATABASE_URL"]
INTERNAL_SERVICE_SECRET = os.environ["INTERNAL_SERVICE_SECRET"]
PORT = int(os.environ.get("CLINICAL_SERVICE_PORT", 5002))

PRESCRIPTION_SERVICE_URL = os.environ.get("PRESCRIPTION_SERVICE_URL", "http://127.0.0.1:5003")
NOTIFICATION_SERVICE_URL = os.environ.get("NOTIFICATION_SERVICE_URL", "http://127.0.0.1:5006")
CORE_SERVICE_URL = os.environ.get("CORE_SERVICE_URL", "http://127.0.0.1:5007")
CLINIC_NAME = os.environ.get("CLINIC_NAME", "City Care Clinic")
