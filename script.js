const socket = io();

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const createBtn = document.getElementById("create_room_btn");
const joinBtn = document.getElementById("join_room_btn");
const roomInput = document.getElementById("room_code_input");
const myCodeDisplay = document.getElementById("my_code");
const membersList = document.getElementById("members");

let currentRoom = null;
let username = prompt("Enter your username:") || "Anonymous";

createBtn.onclick = () => {
    socket.emit("create_room", { username });
};

joinBtn.onclick = () => {
    const code = roomInput.value.trim().toUpperCase();
    if (code) {
        currentRoom = code;
        socket.emit("join_room", { code, username });
    }
};

sendBtn.onclick = () => {
    if (!currentRoom) return alert("Join or create a room first!");
    const text = input.value.trim();
    if (text) {
        socket.emit("message", { room: currentRoom, username, text });
        input.value = "";
    }
};

// Handle messages
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
    } else if (typeof msg === "string") {
        const p = document.createElement("p");
        p.textContent = msg;
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
    }
});

// Handle member list updates
socket.on("members", members => {
    membersList.innerHTML = "";
    members.forEach(m => {
        const li = document.createElement("li");
        li.textContent = m;
        membersList.appendChild(li);
    });
});
