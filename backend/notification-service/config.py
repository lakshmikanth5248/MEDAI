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
