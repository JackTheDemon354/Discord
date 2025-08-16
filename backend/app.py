import os
import random
import string
from flask import Flask, render_template
from flask_socketio import SocketIO, send, join_room

# --- Flask app ---
app = Flask(__name__, template_folder=".", static_folder=".")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "SUPER_SECRET_KEY")

# --- Socket.IO setup ---
socketio = SocketIO(app, cors_allowed_origins="*")
active_rooms = {}

@app.route("/")
def index():
    return render_template("chat.html")  # chat.html is in root

# --- Socket.IO events ---
@socketio.on("create_room")
def create_room():
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    active_rooms[code] = []
    send({"action": "room_created", "code": code})

@socketio.on("join_room")
def join_chat(data):
    code = data.get("code")
    if code in active_rooms:
        join_room(code)
        send({"action": "joined_room", "code": code}, room=code)

@socketio.on("message")
def handle_message(msg):
    room = msg.get("room")
    text = msg.get("text")
    if room in active_rooms:
        send(text, room=room)

# --- Run server ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)
