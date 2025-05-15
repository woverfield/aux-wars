// Test suite for song selection functionality in multiplayer game
import { io as Client } from "socket.io-client"
import { server, gameRooms } from "../server.js"
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals'

describe('Song Selection Tests', () => {
  // Setup test server and multiple client sockets for multiplayer testing
  let httpSrv, port, clientSocket1, clientSocket2, gameCode

  // Start server and set up two connected clients with one hosting a game
  beforeAll((done) => {
    httpSrv = server.listen(0, () => {
      port = httpSrv.address().port
      clientSocket1 = new Client(`http://localhost:${port}`)
      clientSocket2 = new Client(`http://localhost:${port}`)
      
      // First client hosts the game
      clientSocket1.on("connect", () => {
        clientSocket1.emit("host-game", ({ success, gameCode: code }) => {
          gameCode = code
          // Second client joins the game
          clientSocket2.emit("join-game", { gameCode: code, name: "Player2" }, () => {
            done()
          })
        })
      })
    })
  })

  // Clean up server and clients after tests
  afterAll((done) => {
    clientSocket1.on("disconnect", () => {
      clientSocket2.on("disconnect", () => {
        httpSrv.close(done)
      })
      clientSocket2.close()
    })
    clientSocket1.close()
  })

  // Test player ID in song selection
  it("should include correct player ID in song selection", (done) => {
    const trackId = "test-track-1"
    
    clientSocket2.on("song-selected", (data) => {
      expect(data.playerId).toBe(clientSocket2.id)
      clientSocket2.off("song-selected")
      done()
    })

    clientSocket2.emit("song-selected", { gameCode, trackId })
  })

  // Test track ID in song selection
  it("should include correct track ID in song selection", (done) => {
    const trackId = "test-track-1"
    
    clientSocket2.on("song-selected", (data) => {
      expect(data.trackId).toBe(trackId)
      clientSocket2.off("song-selected")
      done()
    })

    clientSocket2.emit("song-selected", { gameCode, trackId })
  })

  // Test first player's song selection
  it("should track first player's selected song", (done) => {
    const trackId1 = "test-track-1"
    const trackId2 = "test-track-2"
    let phaseChangeReceived = false
    
    clientSocket1.on("game-phase-updated", ({ phase }) => {
      if (phase === "voting" && !phaseChangeReceived) {
        phaseChangeReceived = true
        const room = gameRooms.get(gameCode)
        expect(room.selectedSongs.get(clientSocket1.id)).toBe(trackId1)
        clientSocket1.off("game-phase-updated")
        done()
      }
    })

    clientSocket1.emit("song-selected", { gameCode, trackId: trackId1 })
    clientSocket2.emit("song-selected", { gameCode, trackId: trackId2 })
  })

  // Test second player's song selection
  it("should track second player's selected song", (done) => {
    const trackId1 = "test-track-1"
    const trackId2 = "test-track-2"
    let phaseChangeReceived = false
    
    clientSocket1.on("game-phase-updated", ({ phase }) => {
      if (phase === "voting" && !phaseChangeReceived) {
        phaseChangeReceived = true
        const room = gameRooms.get(gameCode)
        expect(room.selectedSongs.get(clientSocket2.id)).toBe(trackId2)
        clientSocket1.off("game-phase-updated")
        done()
      }
    })

    clientSocket1.emit("song-selected", { gameCode, trackId: trackId1 })
    clientSocket2.emit("song-selected", { gameCode, trackId: trackId2 })
  })

  // Test phase transition after song selection
  it("should transition to voting phase after all players select songs", (done) => {
    const trackId1 = "test-track-1"
    const trackId2 = "test-track-2"
    let phaseChangeReceived = false
    
    clientSocket1.on("game-phase-updated", ({ phase }) => {
      if (phase === "voting" && !phaseChangeReceived) {
        phaseChangeReceived = true
        const room = gameRooms.get(gameCode)
        expect(room.phase).toBe("voting")
        clientSocket1.off("game-phase-updated")
        done()
      }
    })

    clientSocket1.emit("song-selected", { gameCode, trackId: trackId1 })
    clientSocket2.emit("song-selected", { gameCode, trackId: trackId2 })
  })

  // Test unauthorized song selection
  it("should not allow song selection from non-players", (done) => {
    const trackId = "test-track-1"
    const nonPlayerSocket = new Client(`http://localhost:${port}`)
    
    nonPlayerSocket.on("connect", () => {
      nonPlayerSocket.emit("song-selected", { gameCode, trackId })
      
      const room = gameRooms.get(gameCode)
      expect(room.selectedSongs?.get(nonPlayerSocket.id)).toBeUndefined()
      
      nonPlayerSocket.close()
      done()
    })
  })
}) 