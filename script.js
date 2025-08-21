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
const userColors = {}; // Assign a color to each user

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
        displayMessage(msg);
    }
});

// --- Display message in WhatsApp style ---
function displayMessage(msgText){
    const [msgUser, ...msgParts] = msgText.split(":");
    const message = msgParts.join(":").trim();

    // Assign a color to the user if not already
    if(!userColors[msgUser]){
        userColors[msgUser] = msgUser === username ? "#DCF8C6" : "#FFFFFF"; // WhatsApp green or white
    }

    const p = document.createElement("div");
    p.classList.add("message");
    p.style.backgroundColor = userColors[msgUser];
    p.style.alignSelf = msgUser === username ? "flex-end" : "flex-start";

    // Username (for others, not for self)
    if(msgUser !== username){
        const nameDiv = document.createElement("div");
        nameDiv.classList.add("msg-username");
        nameDiv.textContent = msgUser;
        p.appendChild(nameDiv);
    }

    // Message text
    const textDiv = document.createElement("div");
    textDiv.classList.add("msg-text");
    textDiv.textContent = message;
    p.appendChild(textDiv);

    // Timestamp
    const ts = document.createElement("div");
    ts.classList.add("timestamp");
    const now = new Date();
    ts.textContent = now.getHours().toString().padStart(2,"0") + ":" +
                     now.getMinutes().toString().padStart(2,"0");
    p.appendChild(ts);

    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
}

// --- Update sidebar users ---
function updateUsers(users){
    usersList.innerHTML = "";
    users.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        usersList.appendChild(li);
    });
}
