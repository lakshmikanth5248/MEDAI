from clinic_shared import register_error_handlers
from flask import Flask, jsonify

import config
import db
from routes.auth_routes import bp as auth_bp
from routes.user_routes import bp as user_bp

app = Flask(__name__)
register_error_handlers(app)
db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "auth-service"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=config.PORT)
