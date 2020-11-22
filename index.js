import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { Game } from "./game/game.js";
import { User } from "./game/user.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

const game = new Game();

app.use(express.static("public"));

io.on("connection", socket => {
    socket.user = new User();
    socket.user.name = socket.id;

    console.log(socket.id);
    socket.on("hello", (message) => {
        console.log(message);
    });

    socket.on("create-room", (callback) => {
        const room = game.createRoom();
        room.join(socket.user);
        socket.join(room.roomId);
        callback(room.roomId);
        console.log(socket.id + " created " + room);
    });

    socket.on("join-room", (roomId) => {
        const room = game.findRoomById(roomId);

        if (room == null) {
            return;
        }
        room.join(socket.user);
        socket.join(room.roomId);
        console.log(socket.id + " joined " + room);
    });
});

server.listen(3000);