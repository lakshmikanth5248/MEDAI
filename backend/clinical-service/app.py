from clinic_shared import register_error_handlers
from flask import Flask, jsonify

import config
import db
from routes.appointment_routes import bp as appointment_bp
from routes.consultation_routes import bp as consultation_bp
from routes.department_routes import bp as department_bp
from routes.doctor_routes import bp as doctor_bp
from routes.patient_routes import bp as patient_bp

app = Flask(__name__)
register_error_handlers(app)
db.init_app(app)

app.register_blueprint(department_bp)
app.register_blueprint(doctor_bp)
app.register_blueprint(patient_bp)
app.register_blueprint(appointment_bp)
app.register_blueprint(consultation_bp)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "clinical-service"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=config.PORT)
