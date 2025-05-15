/**
 * Server setup and configuration
 * Sets up Express server with Socket.IO for real-time game communication
 */
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

export const app = express();
app.use(cors());

export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

/**
 * Game state management
 * In-memory storage for game rooms and default settings
 */
export const gameRooms = new Map();

const defaultSettings = {
  numberOfRounds: 3,
  roundLength: 30, // in seconds
  selectedPrompts: [
    "This song makes me feel like the main character.",
    "The soundtrack to a late-night drive.",
    "This song makes me wanna text my ex (or block them).",
    "A song that defines high school memories.",
    "The perfect song to play while getting ready to go out.",
    "This song could start a mosh pit.",
    "A song that instantly boosts your confidence.",
    "This song would play in the background of my villain arc.",
    "A song that could make me cry on the right day.",
    "The ultimate cookout anthem.",
    "A song that just feels like summertime.",
    "This song is pure nostalgia.",
    "A song that makes you feel unstoppable.",
    "If life had a montage, this song would play in mine.",
    "A song that instantly hypes up the whole room."
  ],
};

/**
 * Utility Functions
 */

/**
 * Generates a random 6-character game code using alphanumeric characters
 * @returns {string} The generated game code
 */
const generateGameCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

/**
 * Checks if a game has enough players to continue
 * @param {string} gameCode - The game code to check
 * @param {Object} room - The game room object
 * @returns {boolean} Whether the game is viable
 */
function checkGameViability(gameCode, room) {
  const MIN_PLAYERS = 3;
  
  if (room.players.length < MIN_PLAYERS && room.phase !== "lobby") {
    console.log(`Game ${gameCode} has only ${room.players.length} players, returning to lobby`);
    
    room.phase = "lobby";
    room.selectedSongs = new Map();
    room.songRatings = {};
    room.currentRatingIndex = 0;
    
    io.to(gameCode).emit("game-error", { message: "Not enough players to continue the game" });
    io.to(gameCode).emit("game-phase-updated", { phase: "lobby", currentRound: room.currentRound });
    
    return false;
  }
  
  return true;
}

/**
 * Game Round Management Functions
 */

/**
 * Starts a new rating round for a specific song
 * @param {string} gameCode - The game code
 * @param {Object} room - The game room object
 */
function startRatingRound(gameCode, room) {
  try {
    const songToRate = room.songsToRate[room.currentRatingIndex];
    room.playerVotes = new Map();
    
    console.log(`Starting rating round ${room.currentRatingIndex + 1}/${room.songsToRate.length} for song: ${songToRate.name}`);
    
    if (room.phase !== "rating") {
      room.phase = "rating";
      io.to(gameCode).emit("game-phase-updated", { phase: "rating", currentRound: room.currentRound });
    }
    
    setTimeout(() => {
      io.to(gameCode).emit("start-rating", {
        ratingIndex: room.currentRatingIndex,
        totalSongs: room.songsToRate.length,
        songToRate: songToRate
      });
    }, 500);
  } catch (error) {
    console.error("Error starting rating round:", error);
    io.to(gameCode).emit("game-error", { message: "Failed to start rating round" });
  }
}

/**
 * Calculates the results of a round based on song ratings
 * @param {string} gameCode - The game code
 * @param {Object} room - The game room object
 */
function calculateRoundResults(gameCode, room) {
  console.log("Calculating round results");
  
  try {
    room.phase = "results";
    io.to(gameCode).emit("game-phase-updated", { phase: "results", currentRound: room.currentRound });
    
    const songScores = {};
    
    for (const [songId, ratings] of Object.entries(room.songRatings)) {
      const validRatings = ratings.filter(r => r.rating > 0);
      const totalRecords = validRatings.reduce((sum, r) => sum + r.rating, 0);
      
      const songDetails = room.songsToRate.find(s => s.songId === songId);
      
      if (songDetails) {
        songScores[songId] = {
          ...songDetails,
          totalRecords: totalRecords,
          ratings: validRatings
        };
      }
    }
    
    const sortedSongs = Object.values(songScores).sort(
      (a, b) => b.totalRecords - a.totalRecords
    );
    
    if (sortedSongs.length > 0) {
      sortedSongs[0].isWinner = true;
    }
    
    room.roundResults = {
      songs: sortedSongs,
      winnerSongId: sortedSongs.length > 0 ? sortedSongs[0].songId : null
    };
    
    setTimeout(() => {
      io.to(gameCode).emit("round-results", {
        results: room.roundResults
      });
    }, 500);
  } catch (error) {
    console.error("Error calculating round results:", error);
    io.to(gameCode).emit("game-error", { message: "Failed to calculate round results" });
  }
}

/**
 * Socket.IO Event Handlers
 */
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Game Creation and Joining
  socket.on("host-game", (callback) => {
    const gameCode = generateGameCode();
    const room = {
      players: [{ id: socket.id, name: "", isHost: true }],
      settings: defaultSettings,
      phase: "lobby",
      currentPrompt: null,
      originalHostId: socket.id
    };
    
    gameRooms.set(gameCode, room);
    socket.join(gameCode);
    
    callback({ success: true, gameCode });
  });

  socket.on("join-game", (data, callback) => {
    const { gameCode, name } = data;
    if (!gameRooms.has(gameCode)) {
      callback({ success: false, message: "Game code not found" });
      return;
    }
    
    const room = gameRooms.get(gameCode);
    
    // Handle existing player
    const existingPlayerIndices = [];
    room.players.forEach((player, index) => {
      if (player.id === socket.id) {
        existingPlayerIndices.push(index);
      }
    });
    
    if (existingPlayerIndices.length > 0) {
      existingPlayerIndices.slice(1).reverse().forEach(index => {
        room.players.splice(index, 1);
      });
      
      const existingPlayer = room.players.find(player => player.id === socket.id);
      if (existingPlayer) {
        existingPlayer.name = name;
        io.to(gameCode).emit("update-players", room.players);
        callback({ success: true });
        return;
      }
    }

    // Determine host status
    let isHost = false;
    if (socket.id === room.originalHostId) {
      isHost = true;
    } else if (!room.players.some(p => p.isHost)) {
      isHost = true;
      room.originalHostId = socket.id;
    }

    // Add new player
    room.players.push({ id: socket.id, name, isHost });
    socket.join(gameCode);
    
    io.to(gameCode).emit("update-players", room.players);
    io.to(gameCode).emit("game-phase-updated", { phase: room.phase, currentRound: room.currentRound });
    
    if (room.currentPrompt) {
      io.to(gameCode).emit("prompt-updated", { prompt: room.currentPrompt });
    }
    
    callback({ success: true });
  });

  // Player Management
  socket.on("update-player-name", (data) => {
    const { gameCode, name, isReady } = data;
    if (!gameRooms.has(gameCode)) return;
    const room = gameRooms.get(gameCode);
    room.players = room.players.map((p) =>
      p.id === socket.id ? { ...p, name, isReady } : p
    );
    io.to(gameCode).emit("update-players", room.players);
  });

  socket.on("leave-game", (data) => {
    const { gameCode } = data;
    socket.leave(gameCode);
    if (gameRooms.has(gameCode)) {
      const room = gameRooms.get(gameCode);
      const wasHost = room.players.find(player => player.id === socket.id && player.isHost);
      
      room.players = room.players.filter(player => player.id !== socket.id);
      
      if (wasHost && room.players.length > 0) {
        room.players[0].isHost = true;
        room.originalHostId = room.players[0].id;
      }
      
      io.to(gameCode).emit("update-players", room.players);
      checkGameViability(gameCode, room);
    }
  });

  // Game Settings
  socket.on("update-game-settings", (data) => {
    const { gameCode, numberOfRounds, roundLength, selectedPrompts } = data;
    if (!gameRooms.has(gameCode)) return;
    const room = gameRooms.get(gameCode);
    room.settings = { numberOfRounds, roundLength, selectedPrompts };
    io.to(gameCode).emit("game-settings-updated", room.settings);
  });

  // Game Flow
  socket.on("start-game", (data) => {
    const { gameCode } = data;
    const room = gameRooms.get(gameCode);
    if (room) {
      try {
        const prompts = room.settings.selectedPrompts;
        const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        room.currentPrompt = chosenPrompt;
        room.phase = "songSelection";
        room.currentRound = 1;
        
        io.to(gameCode).emit("game-phase-updated", { phase: room.phase, currentRound: room.currentRound });
        io.to(gameCode).emit("prompt-updated", { prompt: chosenPrompt });
        io.to(gameCode).emit("game-started", { prompt: chosenPrompt });
      } catch (error) {
        console.error("Error starting game:", error);
        io.to(gameCode).emit("game-error", { message: "Failed to start game" });
      }
    }
  });

  // Song Selection and Rating
  socket.on("song-selected", (data) => {
    const { gameCode, trackId, trackDetails } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (!room.selectedSongs) {
      room.selectedSongs = new Map();
    }

    room.selectedSongs.set(socket.id, {
      songId: trackId,
      trackId,
      player: {
        id: socket.id,
        name: player.name
      },
      ...trackDetails
    });
    
    const submittedCount = room.selectedSongs.size;
    const totalPlayers = room.players.length;
    
    io.to(gameCode).emit("song-selected", { 
      playerId: socket.id,
      playerName: player.name
    });
    
    io.to(gameCode).emit("song-submission-update", {
      submitted: submittedCount,
      total: totalPlayers
    });

    const allPlayersSelected = room.players.every(player => 
      room.selectedSongs.has(player.id)
    );

    if (allPlayersSelected) {
      const submittedSongs = Array.from(room.selectedSongs.values());
      
      room.phase = "rating";
      room.currentRatingIndex = 0;
      room.songRatings = {};
      room.songsToRate = submittedSongs;
      room.playerVotes = new Map();
      
      startRatingRound(gameCode, room);
    }
  });

  socket.on("submit-rating", (data) => {
    const { gameCode, songId, rating } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    if (room.phase !== "rating") return;
    
    room.playerVotes.set(socket.id, { songId, rating });
    
    if (!room.songRatings[songId]) {
      room.songRatings[songId] = [];
    }
    
    if (rating > 0) {
      room.songRatings[songId].push({
        voterId: socket.id,
        rating
      });
    }
    
    const submittedVotes = room.playerVotes.size;
    const totalPlayers = room.players.length;
    
    io.to(gameCode).emit("rating-update", {
      submitted: submittedVotes,
      total: totalPlayers,
      songId
    });
    
    const allPlayersVoted = room.players.every(player => 
      room.playerVotes.has(player.id) || player.id === room.songsToRate[room.currentRatingIndex].player.id
    );
    
    if (allPlayersVoted) {
      room.currentRatingIndex++;
      
      if (room.currentRatingIndex >= room.songsToRate.length) {
        calculateRoundResults(gameCode, room);
      } else {
        startRatingRound(gameCode, room);
      }
    }
  });

  // Round Management
  socket.on("next-round", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    
    try {
      const isLastRound = room.currentRound >= room.settings.numberOfRounds;
      
      if (isLastRound) {
        room.phase = "gameOver";
        io.to(gameCode).emit("game-phase-updated", { phase: "gameOver", currentRound: room.currentRound });
      } else {
        room.currentRound = (room.currentRound || 0) + 1;
        room.selectedSongs = new Map();
        room.songRatings = {};
        room.currentRatingIndex = 0;
        room.phase = "songSelection";
        
        io.to(gameCode).emit("game-phase-updated", { phase: "songSelection", currentRound: room.currentRound });
        
        const prompts = room.settings.selectedPrompts;
        const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        room.currentPrompt = chosenPrompt;
        
        io.to(gameCode).emit("prompt-updated", { prompt: chosenPrompt });
      }
    } catch (error) {
      console.error("Error starting new round:", error);
      io.to(gameCode).emit("game-error", { message: "Failed to start new round" });
    }
  });

  // Game State Requests
  socket.on("request-prompt", (data) => {
    const { gameCode } = data;
    const room = gameRooms.get(gameCode);
    if (room && room.currentPrompt) {
      socket.emit("prompt-updated", { prompt: room.currentPrompt });
    }
  });

  socket.on("get-submission-status", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    const submittedCount = room.selectedSongs ? room.selectedSongs.size : 0;
    const totalPlayers = room.players.length;
    
    socket.emit("song-submission-update", {
      submitted: submittedCount,
      total: totalPlayers
    });
    
    if (room.selectedSongs && room.selectedSongs.has(socket.id)) {
      socket.emit("song-selected", { 
        playerId: socket.id
      });
    }
  });

  socket.on("request-round-results", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    
    if (room.phase === "results" && room.roundResults) {
      socket.emit("round-results", {
        results: room.roundResults
      });
    }
  });

  // Game Reset
  socket.on("return-to-lobby", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    
    try {
      room.phase = "lobby";
      room.selectedSongs = new Map();
      room.songRatings = {};
      room.currentRatingIndex = 0;
      room.roundResults = {};
      room.currentRound = 1;
      
      io.to(gameCode).emit("game-phase-updated", { phase: "lobby", currentRound: room.currentRound });
    } catch (error) {
      console.error("Error returning to lobby:", error);
      io.to(gameCode).emit("game-error", { message: "Failed to return to lobby" });
    }
  });

  // Disconnection Handling
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    gameRooms.forEach((room, gameCode) => {
      const playerIndex = room.players.findIndex(player => player.id === socket.id);
      
      if (playerIndex !== -1) {
        const wasHost = room.players[playerIndex].isHost;
        room.players.splice(playerIndex, 1);
        
        if (wasHost && room.players.length > 0) {
          room.players[0].isHost = true;
          room.originalHostId = room.players[0].id;
        }
        
        io.to(gameCode).emit("update-players", room.players);
        checkGameViability(gameCode, room);
      }
    });
  });
});
