const socket = io();

let currentRoom = null;

document.getElementById("create").onclick = () => {
  socket.emit("create_room", {});
};

document.getElementById("join").onclick = () => {
  const code = document.getElementById("joinCode").value.trim();
  socket.emit("join_room", { code });
};

document.getElementById("send").onclick = () => {
  const msg = document.getElementById("messageInput").value.trim();
  if (msg && currentRoom) {
    socket.emit("send_message", { code: currentRoom, message: msg });
    document.getElementById("messageInput").value = "";
  }
};

// --- SOCKET LISTENERS ---
socket.on("room_created", (data) => {
  currentRoom = data.code;
  document.getElementById("roomCode").innerText = "Room Code: " + data.code;
});

socket.on("room_joined", (data) => {
  currentRoom = data.code;
  document.getElementById("roomCode").innerText = "Joined Room: " + data.code;
});

socket.on("receive_message", (data) => {
  const chatBox = document.getElementById("chatBox");
  const p = document.createElement("p");
  p.innerText = data.message;
  chatBox.appendChild(p);
});
