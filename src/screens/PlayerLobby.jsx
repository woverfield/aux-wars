import React from "react";
import AlbumsDisplay from "../components/AlbumsDisplay";
import logo from "../images/aux-wars-logo.svg";
import spotifyIcon from "../images/spotify-icon.svg";
import settingsIcon from "../images/settings-btn.svg";
import PlayerList from "../components/PlayerList";
import { useState } from "react";
import SettingsModal from "../components/SettingsModal";

export default function PlayerLobby() {
  const [players, setPlayers] = useState([
    { name: "Kenny Morales", isLinked: true },
    { name: "Wilson Overfield", isLinked: true },
    { name: "Lance Labumsher", isLinked: false },
    { name: "Bob Smith", isLinked: true },
    { name: "Bob Smith", isLinked: true },
    { name: "Bob Smith", isLinked: true },
    { name: "Bob Smith", isLinked: true },
  ]);

  const [showModal, setShowModal] = useState(false);

  const allPlayersReady = players.every((player) => player.isLinked);

  return (
    <>
      <div
        className={`relative h-svh overflow-hidden ${
          showModal ? "blur-md" : ""
        }`}
      >
        <AlbumsDisplay />
        <div className="player-lobby h-svh flex flex-col relative z-20 font-semibold">
          <div className="lobby-header flex justify-between items-center mt-10 container mx-auto p-5">
            <div className="lobby-header-left flex items-center gap-2">
              <img src={logo} alt="" className="min-w-10" />
              <p className="text-2xl text-white">Lobby</p>
            </div>
            <button className="leave-btn rounded-full py-2 px-4">
              <p className="text-xs md:text-sm">Leave Lobby</p>
            </button>
          </div>
          <div className="lobby-body">
            <div className="lobby-info flex flex-col sm:items-start container mx-auto px-5 py-4 text-white gap-10">
              <p className="text-xl">Nickname: </p>
              <div className="flex flex-col gap-5 sm:w-1/2 w-full">
                <input type="text" className="w-full rounded-md" />
                <div className="lobby-code-count flex gap-5">
                  <div className="lobby-container rounded-md lobby-code flex flex-col gap-2">
                    <p className="text-xs font-normal">Code</p>
                    <p className="text-2xl ">342324</p>
                  </div>
                  <div className="lobby-container rounded-md lobby-count flex flex-col gap-2">
                    <p className="text-xs font-normal">Players</p>
                    <p className="text-2xl">4/8</p>
                  </div>
                </div>
                <button className="spotify-btn rounded-full py-2 px-8">
                  <img src={spotifyIcon} alt="" className="min-w-8" />
                  <p className="text-sm md:text-base">Link with spotify</p>
                </button>
              </div>
              <div className="flex sm:w-1/2 w-full items-center justify-between">
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
      </div>
      <SettingsModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
