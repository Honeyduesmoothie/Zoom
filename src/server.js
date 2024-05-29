import { log } from "console";
import express from "express"
import http from "http"
import {Server} from "socket.io"
import { instrument } from "@socket.io/admin-ui";
// import WebSocket from "ws";

const app = express();

const PORT = 4000

app.set('view engine', 'pug')
app.set('views', './src/views')
app.use(express.static(__dirname + "/public"))
app.get("/", (req,res) => {
    res.render("home")
})

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
  })
  instrument(wsServer, {
    auth: false,
    mode: "development",
  });

function publicRooms(){
    const {sockets: {adapter:{sids, rooms},},} = wsServer;
    // They are Map objects.
    // server.sockets = server.of("/")
    const publicRooms = [];
    rooms.forEach((_,key)=>{
        if (sids.get(key) === undefined) {
            publicRooms.push(key)
        }
    })
    return publicRooms;
}

function userCount(room) {
    const {sockets: {adapter:{rooms},},} = wsServer;
    const users = rooms.get(room)?.size
    return users
}

wsServer.on("connection", (socket)=>{
    wsServer.sockets.emit("change-room", publicRooms())
    socket["nickname"] = "Anon";
    console.log("A user connected")
    socket.on("enter_room", (roomName, done) => {
        console.log(socket.id);
        console.log(socket.rooms);
        socket.join(roomName);
        console.log(socket.rooms);
        // User has a private room with the server by default => a room named after socket's id
        wsServer.sockets.emit("change-room", publicRooms())
        done();
        wsServer.to(roomName).emit("notification", `${socket.nickname} joined the room!`)
        wsServer.to(roomName).emit("user_count", userCount(roomName))
        // The funcion is not run on the back-end, it's run on the frontend.
    })
    socket.on("disconnecting", (reason)=>{
        console.log(reason)
        console.log(socket.rooms)
        socket.rooms.forEach((room) => {
            wsServer.to(room).emit("notification", `${socket.nickname} left the room!`)
            wsServer.to(room).emit("user_count", userCount(room)-1)
        })
    })
    socket.on("message", (msg, roomName, done)=>{
        done();
        socket.to(roomName).emit("message", `${socket.nickname}: ${msg}`)
    })

    socket.on("nickname", (name, done)=>{
        socket["nickname"] = name;
        done();
    })

    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room-change", publicRooms())
       
    })
})



httpServer.listen(3000, ()=>{
    console.log("Listening on http://localhost:3000")
})






// const wss = new WebSocket.Server({server})

// socket => the connection between the server and the browser

// let sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket)
//     socket["nickname"] = "Anon"
//     console.log("Connected to Browser")
//     socket.on("message", (message)=>{
//         const msg = JSON.parse(message);
//         switch (msg.type) {
//             case "nickname":
//                 socket["nickname"] = msg.payload;
//                 break;
//             case "message":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${msg.payload.toString()}`))
//         }
//     })
// })

// server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))    