import requests
from flask import Blueprint, Response, jsonify, request

import config
from auth_middleware import AuthError, identity_headers, verify_bearer_token

bp = Blueprint("proxy", __name__)

TIMEOUT = 15
# Headers that must never be forwarded as-is: hop-by-hop headers, and any
# X-User-*/X-Internal-Secret header a client might try to spoof.
STRIPPED_REQUEST_HEADERS = {
    "host", "content-length", "connection", "authorization",
    "x-user-id", "x-user-role", "x-user-uid", "x-user-name", "x-internal-secret",
}
STRIPPED_RESPONSE_HEADERS = {"content-encoding", "content-length", "transfer-encoding", "connection"}


@bp.route("/api/<service>/<path:subpath>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def proxy(service, subpath):
    if service not in config.UPSTREAMS:
        return jsonify({"error": "not_found", "message": f"Unknown service '{service}'"}), 404

    # /internal/* endpoints are for direct service-to-service calls only -
    # never reachable through the public gateway, even with a valid JWT.
    if subpath.startswith("internal") or subpath.startswith("internal/"):
        return jsonify({"error": "forbidden", "message": "Internal endpoints are not accessible via the gateway"}), 403

    first_segment = subpath.split("/", 1)[0]
    is_public = (service, first_segment) in config.PUBLIC_PATHS

    forward_headers = {k: v for k, v in request.headers.items() if k.lower() not in STRIPPED_REQUEST_HEADERS}

    if not is_public:
        try:
            payload = verify_bearer_token(request.headers.get("Authorization"))
        except AuthError as exc:
            return jsonify({"error": "unauthorized", "message": exc.message}), exc.status_code
        forward_headers.update(identity_headers(payload))

    upstream_url = f"{config.UPSTREAMS[service]}/{subpath}"

    try:
        upstream_response = requests.request(
            method=request.method,
            url=upstream_url,
            headers=forward_headers,
            params=request.args,
            data=request.get_data(),
            timeout=TIMEOUT,
        )
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": "upstream_unavailable", "message": f"{service} service is unreachable: {exc}"}), 502

    response_headers = [
        (k, v) for k, v in upstream_response.raw.headers.items()
        if k.lower() not in STRIPPED_RESPONSE_HEADERS
    ]
    return Response(upstream_response.content, status=upstream_response.status_code, headers=response_headers)
