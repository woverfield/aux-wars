const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const { Server } = require("socket.io");
const server = require("http").createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const validGameCodes = [];
const gameRooms = {};

const validateGameCode = (code) => {
  return validGameCodes.includes(code);
};

const generateGameCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

io.on("connection", (socket) => {
  console.log(`A user connected! ${socket.id}`);

  socket.on("host-game", (callback) => {
    const gameCode = generateGameCode();
    validGameCodes.push(gameCode);
    socket.rooms.add(gameCode);
    gameRooms[gameCode] = [];
    console.log(`New game hosted by ${socket.id} with code: ${gameCode}`);
    callback(gameCode);
    console.log(socket.rooms);
  });

  socket.on("check-game-code", (data, callback) => {
    const isValid = validateGameCode(data.code);
    callback(isValid);
  });

  socket.on("join-game", (data) => {
    gameRooms[data.code].push({ id: socket.id });
    console.log(`${socket.id} joined the game with code: ${data.code}`);
    io.to(data.code).emit("update-players", gameRooms[data.code])
    socket.join(data.code);
    console.log(socket.rooms);
  });

  socket.on("leave-game", (data) => {
    socket.leave(data.code);
    console.log(`${socket.id} left the game`);
  });
});

server.listen(3001, () => {
  console.log("Server is running!");
});
