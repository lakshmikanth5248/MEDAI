from clinic_shared import register_error_handlers
from flask import Flask, jsonify

import config
import db
from routes.prescription_routes import bp as prescription_bp

app = Flask(__name__)
register_error_handlers(app)
db.init_app(app)

app.register_blueprint(prescription_bp)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "prescription-service"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=config.PORT)
