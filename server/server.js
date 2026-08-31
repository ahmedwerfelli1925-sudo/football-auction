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

app.get("/", (req, res) => {
    res.send("⚽ Football Auction Server is Online!");
});

io.on("connection", (socket) => {

    console.log("Player connected:", socket.id);

    socket.emit("connected", {
        message: "Welcome to Football Auction!"
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
    });

});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
