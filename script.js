const socket = io();

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const createBtn = document.getElementById("create_room_btn");
const joinBtn = document.getElementById("join_room_btn");
const roomInput = document.getElementById("room_code_input");
const myCodeDisplay = document.getElementById("my_code");

let currentRoom = null;
let username = prompt("Enter your name:") || "Anonymous";

// --- Create Room ---
createBtn.onclick = () => {
    socket.emit("create_room", { username });
};

// --- Join Room ---
joinBtn.onclick = () => {
    const code = roomInput.value.trim().toUpperCase();
    if (code) {
        currentRoom = code;
        socket.emit("join_room", { code, username });
    }
};

// --- Send Message ---
sendBtn.onclick = () => {
    if (!currentRoom) return alert("Join or create a room first!");
    const text = input.value.trim();
    if (text) {
        socket.emit("message", { room: currentRoom, username, text });
        input.value = "";
    }
};

// --- Handle Incoming Messages ---
socket.on("message", msg => {
    if (typeof msg === "object" && msg.action) {
        if (msg.action === "room_created") {
            currentRoom = msg.code;
            myCodeDisplay.textContent = "Your join code: " + currentRoom;
        } else if (msg.action === "joined_room") {
            myCodeDisplay.textContent = "Joined room: " + msg.code;
        } else if (msg.action === "error") {
            alert(msg.msg);
        }
    } else if (typeof msg === "object" && msg.username && msg.text) {
        const p = document.createElement("p");
        p.textContent = `${msg.username}: ${msg.text}`;
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
    } else if (typeof msg === "string") {
        // System messages
        const p = document.createElement("p");
        p.textContent = msg;
        p.style.fontStyle = "italic";
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
    }
});
