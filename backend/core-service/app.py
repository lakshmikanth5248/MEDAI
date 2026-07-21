from clinic_shared import register_error_handlers
from flask import Flask, jsonify

import config
import db
from routes.activity_routes import bp as activity_bp
from routes.clinic_routes import bp as clinic_bp
from routes.dashboard_routes import bp as dashboard_bp
from routes.reports_routes import bp as reports_bp

app = Flask(__name__)
register_error_handlers(app)
db.init_app(app)

app.register_blueprint(clinic_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(activity_bp)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "core-service"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=config.PORT)
