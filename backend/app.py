from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, join_room, send
import os
import random
import string

app = Flask(__name__, static_folder="../", static_url_path="")
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "SUPER_SECRET_KEY")
socketio = SocketIO(app, cors_allowed_origins="*")

rooms = {}

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@socketio.on("create_room")
def handle_create_room():
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    rooms[code] = []
    send({"action":"room_created", "code": code}, room=request.sid)

@socketio.on("join_room")
def handle_join(data):
    code = data.get("code")
    if code in rooms:
        join_room(code)
        send({"action":"joined_room", "code": code}, room=request.sid)
    else:
        send({"action":"error", "msg":"Room not found"}, room=request.sid)

@socketio.on("message")
def handle_message(data):
    room = data.get("room")
    text = data.get("text")
    if room in rooms:
        send(text, room=room)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
