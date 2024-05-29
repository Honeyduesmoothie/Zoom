const socket = io();
const enterRoom = document.getElementById("enterRoom");
const enterRoomform = enterRoom.querySelector("form");
const room = document.getElementById("room");
const messageList = document.getElementById("messageList")
const leave = document.getElementById("leave")
const nickname = document.getElementById("nickname")
const nicknameform = nickname.querySelector("form")
const roomList = document.getElementById("roomList");
const userCount = document.getElementById("userCount")

room.hidden = true;
enterRoom.hidden = true;
let roomName;

function showRoom(){
    room.hidden = false;
    enterRoom.hidden = true;
    const h3 = room.querySelector("h3");
    h3.textContent = `You are in the room: ${roomName}`;
    const form = room.querySelector("form");
    form.addEventListener("submit", (e)=>{
        e.preventDefault();
        const input = form.querySelector("input")
        const msg = input.value;
        socket.emit("message", msg, roomName, ()=>{displayMessage(`You: ${msg}`)})
        input.value = "";
    })
}

nicknameform.addEventListener("submit", (e)=>{
    e.preventDefault();
    const input = nicknameform.querySelector("input")
    const h3 = nickname.querySelector("h3");
    socket.emit("nickname", input.value, ()=>{
        h3.textContent = `Your nickname: ${input.value}`
        input.value = "";
        enterRoom.hidden = false;
    })
})

enterRoomform.addEventListener("submit", (e)=>{
    e.preventDefault();
    const input = enterRoomform.querySelector("input");
    roomName = input.value;
    socket.emit("enter_room", input.value, showRoom)
    input.value = "";
   
})

function displayMessage(data){
    const li = document.createElement("li");
    console.log(data)
    li.textContent = data;
    messageList.appendChild(li);
}

socket.on("notification", (data)=>{
    displayMessage(data);
})

socket.on("message", data=> displayMessage(data))

leave.addEventListener("click", ()=>{
    socket.disconnect();
    room.hidden = true;
    enterRoom.hidden = false;
    const h3 = room.querySelector("h3");
    h3.textContent = "";
})

socket.on("change-room", (rooms)=>{
    console.log(rooms)
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.textContent = room;
        roomList.appendChild(li);
        li.addEventListener("click", ()=>{
            socket.emit("enter_room", room, showRoom)
        })
    });
})

socket.on("user_count", (count)=>{
    userCount.textContent = `Users in current room: ${count}`
})