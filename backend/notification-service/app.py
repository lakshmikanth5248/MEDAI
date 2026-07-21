from clinic_shared import register_error_handlers
from flask import Flask, jsonify

import config
import db
from routes.notification_routes import bp as notification_bp
from routes.sms_routes import bp as sms_bp

app = Flask(__name__)
register_error_handlers(app)
db.init_app(app)

app.register_blueprint(notification_bp)
app.register_blueprint(sms_bp)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "notification-service"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=config.PORT)
