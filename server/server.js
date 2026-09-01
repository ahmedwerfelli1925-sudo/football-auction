const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;


// الصفحة الرئيسية للسيرفر
app.get("/", (req, res) => {
    res.send("⚽ Football Auction Server is Online!");
});


// عندما يدخل لاعب
io.on("connection", (socket) => {

    console.log("Player connected:", socket.id);


    // إنشاء غرفة
    socket.on("createRoom", (playerData) => {

    const roomCode =
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();

    socket.join(roomCode);

    socket.data.playerName = playerData.name;
    socket.data.roomCode = roomCode;

    socket.emit("roomCreated", {
        roomCode: roomCode,
        playerName: playerData.name
    });

    console.log(
        "Room created:",
        roomCode,
        "by",
        playerData.name
    );
});


    // دخول غرفة
 socket.on("joinRoom", (data) => {

    const roomCode = data.roomCode.toUpperCase();
    const playerName = data.name;

    const room =
        io.sockets.adapter.rooms.get(roomCode);

    if (!room) {

        socket.emit("joinError", {
            message: "الغرفة غير موجودة!"
        });

        return;
    }

    if (room.size >= 2) {

        socket.emit("joinError", {
            message: "الغرفة ممتلئة!"
        });

        return;
    }

    socket.join(roomCode);

    socket.data.roomCode = roomCode;
    socket.data.playerName = playerName;

    const players = [];

    for (const socketId of room) {

        const playerSocket =
            io.sockets.sockets.get(socketId);

        if (playerSocket) {

            players.push({
                name: playerSocket.data.playerName || "لاعب"
            });

        }

    }

    // إخبار اللاعب الثاني أنه دخل
    socket.emit("roomJoined", {
        roomCode: roomCode,
        players: players
    });

    // إخبار صاحب الغرفة أن اللاعب الثاني دخل
    socket.to(roomCode).emit("playerJoined", {
        players: players
    });

    console.log(
        "Player joined room:",
        roomCode,
        playerName
    );

});


    // خروج اللاعب
    socket.on("disconnect", () => {

        console.log(
            "Player disconnected:",
            socket.id
        );

    });

});


server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
