import os
import random
import string
from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room

# --- Flask setup ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # root dir
app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "SUPER_SECRET_KEY")

# --- Socket.IO setup ---
socketio = SocketIO(app, cors_allowed_origins="*")
active_rooms = {}  # { room_code: [usernames...] }

# --- Routes ---
@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/<path:path>")
def static_files(path):
    """Serve JS, CSS, and other static files from project root."""
    return send_from_directory(BASE_DIR, path)

# --- Socket.IO Events ---
@socketio.on("create_room")
def create_room(data):
    username = data.get("username", "Anonymous")
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    active_rooms[code] = [username]
    join_room(code)
    emit("message", {"action": "room_created", "code": code}, room=request.sid)
    emit("update_users", active_rooms[code], room=code)

@socketio.on("join_room")
def join_chat(data):
    code = data.get("code")
    username = data.get("username", "Anonymous")

    if code in active_rooms:
        active_rooms[code].append(username)
        join_room(code)
        emit("message", {"action": "joined_room", "code": code}, room=request.sid)
        emit("update_users", active_rooms[code], room=code)
    else:
        emit("message", {"action": "error", "msg": "Room not found"}, room=request.sid)

@socketio.on("message")
def handle_message(msg):
    room = msg.get("room")
    text = msg.get("text")
    username = msg.get("username", "Anonymous")
    if room in active_rooms:
        emit("message", f"{username}: {text}", room=room)

# --- Run server ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)
