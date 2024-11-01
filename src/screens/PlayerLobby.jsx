import React, { useState, useEffect } from "react";
import logo from "../images/aux-wars-logo.svg";
import spotifyIcon from "../images/spotify-icon.svg";
import settingsIcon from "../images/settings-btn.svg";
import PlayerList from "../components/PlayerList";
import { useNavigate, useParams } from "react-router-dom";
import SettingsModal from "../components/SettingsModal";
import { motion } from "framer-motion";

export default function PlayerLobby({ socket }) {
  const { gameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [animateInput, setAnimateInput] = useState(false);
  const navigate = useNavigate();

  const allPlayersReady = players.every((player) => player.isReady);

  const handleLeaveGame = () => {
    socket.emit("leave-game", { code: gameCode });
    navigate("/");
  };

  socket.on("connection", () => {
    console.log(`User ${socket.id} connected`);
    socket.emit("join-game", { code: gameCode, name: name, isHost: false }, (response) => {
      if (response.success) {
        navigate(`/lobby/${gameCode}`);
      } else {
        console.error("Invalid game code");
      }
    });
  });

  socket.on("update-players", (data) => {
    setPlayers(data);
  });

  useEffect(() => {
    socket.emit("update-player-name", { gameCode, name, isReady });
  }, [name, isReady, gameCode, socket]);

  useEffect(() => {
    const currentPlayer = players.find((player) => player.id === socket.id);
    if (currentPlayer) {
      setIsHost(currentPlayer.isHost);
    }
  }, [players, socket.id]);

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: 3,
      ease: "easeInOut",
    },
  };

  const handleReady = () => {
    if (name.length > 0) {
      setIsReady(!isReady);
    } else {
      setAnimateInput(true);
      setTimeout(() => {
        setAnimateInput(false);
      }, 3000);
    }
  };

  return (
    <>
      <div
        className={`player-lobby h-svh flex flex-col relative z-10 ${
          showModal ? "blur-sm" : ""
        }`}
      >
        <div className="lobby-header flex justify-between items-center mt-10 container mx-auto p-5">
          <div className="lobby-header-left flex items-center gap-2">
            <img src={logo} alt="" className="min-w-10" />
            <p className="text-2xl text-white">Lobby</p>
          </div>
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className=""
          >
            <button
              className="leave-btn rounded-full py-2 px-4"
              onClick={handleLeaveGame}
            >
              <p className="text-xs md:text-sm">Leave Lobby</p>
            </button>
          </motion.div>
        </div>
        <div className="lobby-body ">
          <div className="lobby-info flex flex-col sm:items-start container mx-auto px-5 py-4 text-white gap-10">
            <p className="text-xl">Nickname: </p>
            <div className="flex flex-col gap-5 w-full">
              <motion.input
                type="text"
                className="w-full rounded-md"
                placeholder={"Enter your nickname"}
                value={name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setName(newName);
                  socket.emit("update-player-name", {
                    gameCode,
                    name: newName,
                  });
                }}
                animate={animateInput ? pulseAnimation : {}}
              />
              <div className="lobby-code-count flex gap-5">
                <div className="lobby-container rounded-md lobby-code flex flex-col gap-2">
                  <p className="text-xs font-normal">Code</p>
                  <p className="text-2xl ">{gameCode}</p>
                </div>
                <div className="lobby-container rounded-md lobby-count flex flex-col gap-2">
                  <p className="text-xs font-normal">Players</p>
                  <p className="text-2xl">{players.length}/8</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className=""
                >
                  <button
                    className={
                      isReady
                        ? "join-btn rounded-full py-2 px-8"
                        : "spotify-btn rounded-full py-2 px-8"
                    }
                    onClick={handleReady}
                  >
                    <p className="text-sm md:text-base">
                      {isReady ? "Ready" : "Not Ready"}
                    </p>
                  </button>
                </motion.div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className=""
                >
                  <button className="spotify-btn rounded-full py-2 px-8">
                    <img src={spotifyIcon} alt="" className="min-w-8" />
                    <p className="text-sm md:text-base">
                      Powered By SpotifyAPI
                    </p>
                  </button>
                </motion.div>
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <p className="text-center text-2xl">Players</p>
              <button>
                <img
                  src={settingsIcon}
                  alt=""
                  className="min-w-6"
                  onClick={() => setShowModal(true)}
                />
              </button>
            </div>
            <PlayerList players={players} />
          </div>
          {isHost && allPlayersReady && (
            <button className="start-btn fixed bottom-0 w-full text-black py-3 text-center">
              Start Game
            </button>
          )}
        </div>
      </div>
      <SettingsModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
