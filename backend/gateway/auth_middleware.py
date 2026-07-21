"""The ONLY place a JWT signature is verified (see plan §5). Downstream
services trust the X-User-* headers this module produces instead of
re-verifying anything themselves.
"""
import jwt

import config


class AuthError(Exception):
    def __init__(self, message, status_code=401):
        self.message = message
        self.status_code = status_code


def verify_bearer_token(authorization_header):
    if not authorization_header or not authorization_header.startswith("Bearer "):
        raise AuthError("Missing or malformed Authorization header")

    token = authorization_header[len("Bearer "):]
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise AuthError("Token has expired")
    except jwt.PyJWTError:
        raise AuthError("Invalid token")

    return payload


def identity_headers(payload):
    """Trusted headers forwarded to upstream services. Callers must ensure
    any client-supplied X-User-* headers were stripped before this is added.
    """
    return {
        "X-User-Id": str(payload["sub"]),
        "X-User-Role": payload["role"],
        "X-User-Uid": payload.get("uid") or "",
        "X-User-Name": payload.get("name") or "",
    }
