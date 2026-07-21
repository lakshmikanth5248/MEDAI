"""Protects /internal/* routes that are only meant to be called by other
services (never by an end user through the gateway), using a shared secret
distinct from user JWTs.
"""
import hmac
import os
from functools import wraps

from flask import jsonify, request


def require_internal_secret(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        expected = os.environ.get("INTERNAL_SERVICE_SECRET", "")
        provided = request.headers.get("X-Internal-Secret", "")
        if not expected or not hmac.compare_digest(expected, provided):
            return jsonify({"error": "forbidden", "message": "Invalid internal service secret"}), 403
        return fn(*args, **kwargs)

    return wrapper
