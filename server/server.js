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
    socket.on("createRoom", () => {

        const roomCode =
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase();


        socket.join(roomCode);


        socket.emit("roomCreated", {
            roomCode: roomCode
        });


        console.log(
            "Room created:",
            roomCode
        );

    });


    // دخول غرفة
    socket.on("joinRoom", (roomCode) => {

        const room =
            io.sockets.adapter.rooms.get(roomCode);


        if (!room) {

            socket.emit("joinError", {
                message: "الغرفة غير موجودة"
            });

            return;

        }


        if (room.size >= 2) {

            socket.emit("joinError", {
                message: "الغرفة ممتلئة"
            });

            return;

        }


        socket.join(roomCode);


        socket.emit("roomJoined", {
            roomCode: roomCode
        });


        socket.to(roomCode).emit(
            "playerJoined"
        );


        console.log(
            "Player joined room:",
            roomCode
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
