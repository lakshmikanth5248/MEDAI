"""Standard error envelope shared by every service.

All error responses look like: {"error": "<short_code>", "message": "<human text>"}
"""
from flask import jsonify


class APIError(Exception):
    def __init__(self, message, status_code=400, error="bad_request", details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error = error
        self.details = details

    def to_response(self):
        body = {"error": self.error, "message": self.message}
        if self.details is not None:
            body["details"] = self.details
        return body, self.status_code


def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(exc):
        body, status = exc.to_response()
        return jsonify(body), status

    @app.errorhandler(404)
    def handle_404(exc):
        return jsonify({"error": "not_found", "message": "Resource not found"}), 404

    @app.errorhandler(405)
    def handle_405(exc):
        return jsonify({"error": "method_not_allowed", "message": str(exc)}), 405

    @app.errorhandler(500)
    def handle_500(exc):
        app.logger.exception("Unhandled server error")
        return jsonify({"error": "internal_error", "message": "Something went wrong"}), 500
