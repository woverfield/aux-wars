import React from "react";
import PlayerBox from "./PlayerBox";

export default function PlayerList({ players }) {
  return (
    <div className="lobby-players w-full max-h-72 overflow-y-auto px-2">
      {players.map((player, index) => (
        <PlayerBox key={index} player={player} />
      ))}
    </div>
  );
}
