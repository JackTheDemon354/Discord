from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, leave_room, send
import os
import random
import string

# Flask app
app = Flask(__name__, template_folder="../")  # templates in root
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "SUPER_SECRET_KEY")
socketio = SocketIO(app, cors_allowed_origins="*")

# Store rooms and users (simple in-memory)
rooms = {}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("create_room")
def handle_create_room():
    # Generate a random 6-char uppercase code
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    rooms[code] = []
    send({"action":"room_created", "code": code}, broadcast=False)

@socketio.on("join_room")
def handle_join(data):
    code = data.get("code")
    if code in rooms:
        join_room(code)
        rooms[code].append(request.sid)
        send({"action":"joined_room", "code": code}, room=request.sid)
    else:
        send({"action":"error", "msg":"Room
