const socket = io();

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const createBtn = document.getElementById("create_room_btn");
const joinBtn = document.getElementById("join_room_btn");
const roomInput = document.getElementById("room_code_input");
const myCodeDisplay = document.getElementById("my_code");

let currentRoom = null;

createBtn.onclick = () => {
    socket.emit("create_room");
};

joinBtn.onclick = () => {
    const code = roomInput.value.trim().toUpperCase();
    if(code){
        currentRoom = code;
        socket.emit("join_room", {code});
    }
};

sendBtn.onclick = () => {
    if(!currentRoom) return alert("Join or create a room first!");
    const text = input.value.trim();
    if(text){
        socket.emit("message", {room: currentRoom, text});
        input.value = "";
    }
};

socket.on("message", msg => {
    if(typeof msg === "object" && msg.action){
        if(msg.action === "room_created"){
            currentRoom = msg.code;
            myCodeDisplay.textContent = "Your join code: " + currentRoom;
        } else if(msg.action === "joined_room"){
            myCodeDisplay.textContent = "Joined room: " + msg.code;
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
