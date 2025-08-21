import eventlet
eventlet.monkey_patch()  # MUST be first

import os
import random
import string
from flask import Flask, render_template
from flask_socketio import SocketIO, send, join_room

# --- Flask app ---
app = Flask(__name__, template_folder=".", static_folder=".")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "SUPER_SECRET_KEY")

# --- Socket.IO setup ---
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")
active_rooms = {}  # room_code: list of usernames

@app.route("/")
def index():
    return render_template("index.html")  # index.html is in root

# --- Socket.IO events ---
@socketio.on("create_room")
def create_room(data):
    username = data.get("username", "Guest")
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    active_rooms[code] = [username]
    join_room(code)
    send({"action": "room_created", "code": code, "users": active_rooms[code]}, room=code)

@socketio.on("join_room")
def join_chat(data):
    code = data.get("code")
    username = data.get("username", "Guest")
    if code in active_rooms:
        join_room(code)
        active_rooms[code].append(username)
        send({"action": "joined_room", "code": code, "users": active_rooms[code]}, room=code)
    else:
        send({"action": "error", "msg": "Room not found."})

@socketio.on("message")
def handle_message(msg):
    room = msg.get("room")
    text = msg.get("text")
    username = msg.get("username", "Guest")
    if room in active_rooms:
        send(f"{username}: {text}", room=room)

# --- Run server ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)
