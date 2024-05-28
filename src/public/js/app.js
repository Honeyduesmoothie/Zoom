const socket  = new WebSocket(`ws://${window.location.host}`)
const messageList = document.querySelector("ul")
const messageForm = document.querySelector("#messageForm")
const nickForm = document.querySelector("#nickForm")

socket.addEventListener("open", ()=>{
    console.log("Connected to Server")
})

socket.addEventListener("message", (event)=>{
    const li = document.createElement("li");
    li.textContent = event.data;
    messageList.appendChild(li);
})

function makeMessage(type, payload) {
    const msg = {type, payload}
    return JSON.stringify(msg)
}

nickForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const input = nickForm.querySelector("input")
    socket.send(makeMessage("nickname", input.value));
    // input.value = "";
})

messageForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const input = messageForm.querySelector("input")
    socket.send(makeMessage("message", input.value));
    input.value = "";
})


