import os
import random
import string
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit

# --- Flask app ---
app = Flask(__name__, template_folder=".", static_folder=".")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "SUPER_SECRET_KEY")

# --- Socket.IO setup ---
socketio = SocketIO(app, cors_allowed_origins="*")

# Active rooms: {code: [usernames]}
active_rooms = {}
# Track which user is tied to which socket id
user_sessions = {}  # {sid: {"username": str, "room": str}}

@app.route("/")
def index():
    return render_template("index.html")

# --- Socket.IO events ---
@socketio.on("create_room")
def create_room(data):
    username = data.get("username", "Anonymous")
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    active_rooms[code] = [username]
    user_sessions[request.sid] = {"username": username, "room": code}

    join_room(code)
    send({"action": "room_created", "code": code}, room=request.sid)
    emit("members", active_rooms[code], room=code)

@socketio.on("join_room")
def join_chat(data):
    code = data.get("code")
    username = data.get("username", "Anonymous")

    if code in active_rooms:
        active_rooms[code].append(username)
        user_sessions[request.sid] = {"username": username, "room": code}

        join_room(code)
        send({"action": "joined_room", "code": code}, room=request.sid)
        emit("members", active_rooms[code], room=code)
    else:
        send({"action": "error", "msg": "Room not found"}, room=request.sid)

@socketio.on("message")
def handle_message(msg):
    room = msg.get("room")
    username = msg.get("username", "Anonymous")
    text = msg.get("text")
    if room in active_rooms and text:
        emit("message", f"{username}: {text}", room=room)

@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    if sid in user_sessions:
        info = user_sessions[sid]
        username = info["username"]
        room = info["room"]

        if room in active_rooms and username in active_rooms[room]:
            active_rooms[room].remove(username)

            # If room is empty, delete it
            if not active_rooms[room]:
                del active_rooms[room]
            else:
                emit("members", active_rooms[room], room=room)

        del user_sessions[sid]

# --- Run server ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)
