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

const gameRooms = new Map();
const validGameCodes = [];

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

  socket.emit("connection");

  socket.on("host-game", (callback) => {
    const gameCode = generateGameCode();
    validGameCodes.push(gameCode);

    socket.rooms.add(gameCode);
    gameRooms.set(gameCode, []);

    socket.join(gameCode);
    gameRooms.get(gameCode).push({ id: socket.id, name: "" });

    io.to(gameCode).emit("update-players", gameRooms.get(gameCode));
    console.log(`New game hosted by ${socket.id} with code: ${gameCode}`);
    callback(gameCode);
  });

  socket.on("join-game", (data, callback) => {
    const { code, name } = data;
    if (!gameRooms.has(code)) {
      return callback({ success: false });
    }

    const players = gameRooms.get(code);
    if (players.some((player) => player.id === socket.id)) {
      return callback({ success: false });
    }
    players.push({ id: socket.id, name });
    gameRooms.set(code, players);

    socket.join(code);
    io.to(code).emit("update-players", players);
    callback({ success: true });
  });

  socket.on("update-player-name", (data) => {
    const { gameCode, name, isReady } = data;
    if (gameRooms.has(gameCode)) {
      const players = gameRooms.get(gameCode);
      const updatedPlayers = players.map((player) =>
        player.id === socket.id ? { ...player, name, isReady } : player
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
      console.log(`${socket.id} left the game`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    validGameCodes.forEach((code) => {
      if (gameRooms.has(code)) {
        const players = gameRooms.get(code);
        const updatedPlayers = players.filter(
          (player) => player.id !== socket.id
        );

        if (updatedPlayers.length !== players.length) {
          gameRooms.set(code, updatedPlayers);
          socket.to(code).emit("update-players", updatedPlayers);
          console.log(`${socket.id} removed from game ${code}`);
        }
      }
    });
  });
});

server.listen(3001, () => {
  console.log("Server is running!");
});
