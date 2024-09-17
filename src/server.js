const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const { Server } = require("socket.io")
const server = require("http").createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

server.listen(3001, () => {
  console.log("Server is running!");
});
