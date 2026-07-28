from clinic_shared import register_error_handlers
from flask import Flask, jsonify
from flask_cors import CORS

import config
from proxy import bp as proxy_bp

app = Flask(__name__)
register_error_handlers(app)
CORS(app, origins=[config.FRONTEND_ORIGIN], supports_credentials=True)

app.register_blueprint(proxy_bp)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "gateway", "upstreams": list(config.UPSTREAMS.keys())})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT)
