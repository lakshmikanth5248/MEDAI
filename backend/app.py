from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/service1', methods=['GET'])
def service1():
    # Logic for microservice 1
    return jsonify({"message": "This is service 1"})

@app.route('/service2', methods=['POST'])
def service2():
    data = request.json
    # Logic for microservice 2
    return jsonify({"message": "This is service 2", "data": data})

@app.route('/service3', methods=['GET'])
def service3():
    # Logic for microservice 3
    return jsonify({"message": "This is service 3"})

if __name__ == '__main__':
    app.run(debug=True)