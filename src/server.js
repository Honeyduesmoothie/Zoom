import { log } from "console";
import express from "express"
import http from "http"
import WebSocket from "ws";

const app = express();

const PORT = 4000

app.set('view engine', 'pug')
app.set('views', './src/views')
app.use(express.static(__dirname + "/public"))
app.get("/", (req,res) => {
    res.render("home")
})

const server = http.createServer(app);
const wss = new WebSocket.Server({server})

// socket => the connection between the server and the browser

let sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket)
    socket["nickname"] = "Anon"
    console.log("Connected to Browser")
    socket.on("message", (message)=>{
        const msg = JSON.parse(message);
        switch (msg.type) {
            case "nickname":
                socket["nickname"] = msg.payload;
                break;
            case "message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${msg.payload.toString()}`))
        }
    })
})

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))    