import React from "react";
import logo from "../images/aux-wars-logo.svg";
import spotifyIcon from "../images/spotify-icon.svg";
import settingsIcon from "../images/settings-btn.svg";
import PlayerList from "../components/PlayerList";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SettingsModal from "../components/SettingsModal";

export default function PlayerLobby({ socket }) {
  const { gameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const allPlayersReady =
    players.every((player) => player.isLinked) && players.length > 1;

  const handleLeaveGame = () => {
    socket.emit("leave-game", { code: gameCode });
    navigate("/");
  };

  const handleUpdatePlayers = (data) => {
    console.log(data);
    setPlayers(data);
  };

  socket.on("update-players", handleUpdatePlayers);

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
          <button
            className="leave-btn rounded-full py-2 px-4"
            onClick={handleLeaveGame}
          >
            <p className="text-xs md:text-sm">Leave Lobby</p>
          </button>
        </div>
        <div className="lobby-body ">
          <div className="lobby-info flex flex-col sm:items-start container mx-auto px-5 py-4 text-white gap-10">
            <p className="text-xl">Nickname: </p>
            <div className="flex flex-col gap-5 w-full">
              <input
                type="text"
                className="w-full rounded-md"
                placeholder="Enter Name Here"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  socket.emit("update-player-name", {
                    gameCode,
                    name: e.target.value,
                  });
                }}
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
              <button className="spotify-btn rounded-full py-2 px-8">
                <img src={spotifyIcon} alt="" className="min-w-8" />
                <p className="text-sm md:text-base">Link with spotify</p>
              </button>
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
          {allPlayersReady && (
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
