import React from "react";

export default function PlayerBox({ player }) {
  return (
    <div className="lobby-player rounded-md">
      <p className={player.isHost ? "font-bold" : ""}>{player.name}</p>
      <p className={player.isReady ? "ready" : "not-ready"}>
        {player.isReady ? "Ready" : "Not Ready"}
      </p>
    </div>
  );
}
