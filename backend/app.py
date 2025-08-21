from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__, static_folder=".", static_url_path="")
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@socketio.on('chat_message')
def handle_chat_message(data):
    # data is a dict: {"username": "Jack", "message": "Hello!"}
    print(f"{data['username']}: {data['message']}")
    emit('chat_message', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
