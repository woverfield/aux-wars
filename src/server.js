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

const validGameCodes = ["ABC123", "DEF456", "GHI789"]; 

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
  console.log(`a user connected! ${socket.id}`);

  socket.on("host-game", (callback) => {
    const gameCode = generateGameCode();
    validGameCodes.push(gameCode);
    console.log(`New game hosted by ${socket.id} with code: ${gameCode}`);
    callback(gameCode);
  });

  socket.on("check-game-code", (data, callback) => {
    const isValid = validateGameCode(data.code);
    callback(isValid);
  });

  socket.on("join-game", (data) => {
    console.log(`${socket.id} joined the game with code: ${data.code}`);
  });

  socket.on("leave-game", () => {
    console.log(`${socket.id} left the game`);
  });
});

server.listen(3001, () => {
  console.log("Server is running!");
});
