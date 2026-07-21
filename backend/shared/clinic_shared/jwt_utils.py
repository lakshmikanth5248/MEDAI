"""JWT issuance (used only by auth-service) and trusted-header auth (used by every
other service).

Design (see plan §5): the gateway is the ONLY place that verifies the JWT
signature. It then forwards X-User-Id / X-User-Role / X-User-Uid / X-User-Name
headers downstream, stripping any client-supplied versions first. Downstream
services never see a raw JWT and never re-verify a signature - they just trust
those headers, because they are only reachable through the gateway.
"""
import time
from functools import wraps

import jwt
from flask import g, jsonify, request

DEFAULT_EXPIRES_IN = 24 * 60 * 60  # 24h


def encode_token(payload, secret, expires_in=DEFAULT_EXPIRES_IN):
    now = int(time.time())
    full_payload = {**payload, "iat": now, "exp": now + expires_in}
    return jwt.encode(full_payload, secret, algorithm="HS256")


def decode_token(token, secret):
    """Raises jwt.PyJWTError on invalid/expired token."""
    return jwt.decode(token, secret, algorithms=["HS256"])


def current_user():
    """Read the trusted identity injected by the gateway. None if absent."""
    return getattr(g, "current_user", None)


def _load_user_from_headers():
    user_id = request.headers.get("X-User-Id")
    role = request.headers.get("X-User-Role")
    if not user_id or not role:
        return None
    return {
        "id": int(user_id),
        "role": role,
        "uid": request.headers.get("X-User-Uid"),
        "name": request.headers.get("X-User-Name"),
    }


def require_auth(fn):
    """Downstream-service decorator: 401s unless the gateway-injected identity
    headers are present. Does NOT verify a signature (that already happened at
    the gateway) - see module docstring.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _load_user_from_headers()
        if user is None:
            return jsonify({"error": "unauthorized", "message": "Missing authenticated identity"}), 401
        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper


def require_role(*roles):
    """Stack under @require_auth. 403s if the caller's role isn't in `roles`."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = current_user()
            if user is None or user["role"] not in roles:
                return jsonify({"error": "forbidden", "message": "Insufficient role"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
