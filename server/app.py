from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# TODO: Import routes and socket handlers

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
