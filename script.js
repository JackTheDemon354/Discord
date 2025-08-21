const socket = io();

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const createBtn = document.getElementById("create_room_btn");
const joinBtn = document.getElementById("join_room_btn");
const roomInput = document.getElementById("room_code_input");
const myCodeDisplay = document.getElementById("my_code");
const userList = document.getElementById("user_list");

let currentRoom = null;
let username = prompt("Enter your username") || "Guest";

// --- Room creation ---
createBtn.onclick = () => {
    socket.emit("create_room", { username });
};

// --- Join room ---
joinBtn.onclick = () => {
    const code = roomInput.value.trim().toUpperCase();
    if(code){
        currentRoom = code;
        socket.emit("join_room", { code, username });
    }
};

// --- Send message function ---
function sendMessage() {
    if(!currentRoom) return alert("Join or create a room first!");
    const text = input.value.trim();
    if(text){
        socket.emit("message", { room: currentRoom, text, username });
        input.value = "";
    }
}

// --- Send button click ---
sendBtn.onclick = sendMessage;

// --- Press Enter to send ---
input.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        sendMessage();
    }
});

// --- Handle incoming messages ---
socket.on("message", msg => {
    if(typeof msg === "object" && msg.action){
        if(msg.action === "room_created"){
            currentRoom = msg.code;
            myCodeDisplay.textContent = "Your join code: " + currentRoom;
            updateUserList(msg.users || []);
        } else if(msg.action === "joined_room"){
            currentRoom = msg.code;
            myCodeDisplay.textContent = "Joined room: " + msg.code;
            updateUserList(msg.users || []);
        } else if(msg.action === "update_users"){
            updateUserList(msg.users || []);
        } else if(msg.action === "error"){
            alert(msg.msg);
        }
    } else if(typeof msg === "string"){
        const p = document.createElement("p");
        p.textContent = msg;
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight;
    }
});

// --- Update sidebar user list ---
function updateUserList(users) {
    userList.innerHTML = "";
    users.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        userList.appendChild(li);
    });
}
