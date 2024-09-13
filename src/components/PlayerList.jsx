import React from "react";
import PlayerBox from "./PlayerBox";

export default function PlayerList({ players }) {
  return (
    <div className="lobby-players sm:w-1/2 w-full">
      {players.map((player, index) => (
        <PlayerBox key={index} player={player} />
      ))}
    </div>
  );
}
