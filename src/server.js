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
const gameRooms = new Map();

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
    gameRooms.set(gameCode, []);

    socket.join(gameCode);
    gameRooms.get(gameCode).push({ id: socket.id });

    console.log(gameRooms);
    io.to(gameCode).emit("update-players", gameRooms.get(gameCode));
    console.log(`New game hosted by ${socket.id} with code: ${gameCode}`);
    callback(gameCode);
  });

  socket.on("check-game-code", (data, callback) => {
    const isValid = validateGameCode(data.code);
    callback(isValid);
  });

  socket.on("join-game", (data) => {
    if (gameRooms.has(data.code)) {
      gameRooms.get(data.code).push({ id: socket.id });
      console.log(`${socket.id} joined the game with code: ${data.code}`);
      socket.join(data.code);
      io.to(data.code).emit("update-players", gameRooms.get(data.code));
      console.log(gameRooms);
    } else {
      console.log(`Game with code ${data.code} does not exist.`);
    }
  });

  socket.on("update-player-name", (data) => {
    const { gameCode, name } = data;
    if (gameRooms.has(gameCode)) {
      const players = gameRooms.get(gameCode);
      const updatedPlayers = players.map((player) =>
        player.id === socket.id ? { ...player, name } : player
      );
      gameRooms.set(gameCode, updatedPlayers);

      io.to(gameCode).emit("update-players", updatedPlayers);
    }
  });

  socket.on("leave-game", (data) => {
    socket.leave(data.code);
    if (gameRooms.has(data.code)) {
      const players = gameRooms.get(data.code);
      const updatedPlayers = players.filter(
        (player) => player.id !== socket.id
      );
      gameRooms.set(data.code, updatedPlayers);

      socket.to(data.code).emit("update-players", updatedPlayers);
      console.log(gameRooms);
      console.log(`${socket.id} left the game`);
    }
  });
});

server.listen(3001, () => {
  console.log("Server is running!");
});
