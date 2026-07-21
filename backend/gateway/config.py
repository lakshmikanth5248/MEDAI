import os

from dotenv import load_dotenv

load_dotenv()

REQUIRED = ["JWT_SECRET", "INTERNAL_SERVICE_SECRET"]
missing = [k for k in REQUIRED if not os.environ.get(k)]
if missing:
    raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

JWT_SECRET = os.environ["JWT_SECRET"]
INTERNAL_SERVICE_SECRET = os.environ["INTERNAL_SERVICE_SECRET"]
PORT = int(os.environ.get("GATEWAY_PORT", 5000))
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

# Maps the /api/<prefix>/... path segment to the upstream service base URL.
UPSTREAMS = {
    "auth": os.environ.get("AUTH_SERVICE_URL", "http://127.0.0.1:5001"),
    "clinical": os.environ.get("CLINICAL_SERVICE_URL", "http://127.0.0.1:5002"),
    "prescriptions": os.environ.get("PRESCRIPTION_SERVICE_URL", "http://127.0.0.1:5003"),
    "pharmacy": os.environ.get("PHARMACY_SERVICE_URL", "http://127.0.0.1:5004"),
    "billing": os.environ.get("BILLING_SERVICE_URL", "http://127.0.0.1:5005"),
    "notifications": os.environ.get("NOTIFICATION_SERVICE_URL", "http://127.0.0.1:5006"),
    "core": os.environ.get("CORE_SERVICE_URL", "http://127.0.0.1:5007"),
}

# Routes that don't require a JWT (login/register/password-reset are how you GET a JWT).
PUBLIC_PATHS = {
    ("auth", "login"),
    ("auth", "register"),
    ("auth", "forgot-password"),
    ("auth", "reset-password"),
}
