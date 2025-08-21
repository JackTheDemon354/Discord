const socket = io();

const chat = document.getElementById("chat");
const usersList = document.getElementById("users");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const createBtn = document.getElementById("create_room_btn");
const joinBtn = document.getElementById("join_room_btn");
const roomInput = document.getElementById("room_code_input");
const myCodeDisplay = document.getElementById("my_code");
const usernameInput = document.getElementById("username");

let currentRoom = null;
let username = "";

// --- Enter key sends message ---
input.addEventListener("keydown", (e) => {
    if(e.key === "Enter") sendMessage();
});

// --- Buttons ---
createBtn.onclick = () => {
    username = usernameInput.value.trim() || "Guest";
    socket.emit("create_room", { username });
};

joinBtn.onclick = () => {
    username = usernameInput.value.trim() || "Guest";
    const code = roomInput.value.trim().toUpperCase();
    if(code){
        currentRoom = code;
        socket.emit("join_room", { code, username });
    }
};

sendBtn.onclick = sendMessage;

function sendMessage(){
    if(!currentRoom) return alert("Join or create a room first!");
    const text = input.value.trim();
    if(text){
        socket.emit("message", { room: currentRoom, text, username });
        input.value = "";
    }
}

// --- Socket.IO events ---
socket.on("message", msg => {
    if(typeof msg === "object" && msg.action){
        if(msg.action === "room_created"){
            currentRoom = msg.code;
            myCodeDisplay.textContent = "Your join code: " + currentRoom;
            updateUsers(msg.users);
        } else if(msg.action === "joined_room"){
            currentRoom = msg.code;
            myCodeDisplay.textContent = "Joined room: " + msg.code;
            updateUsers(msg.users);
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

// --- Update sidebar users ---
function updateUsers(users){
    usersList.innerHTML = "";
    users.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        usersList.appendChild(li);
    });
}
