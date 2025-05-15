import React from "react";
import PlayerBox from "./PlayerBox";

/**
 * PlayerList component displays a scrollable list of players in the game lobby.
 * 
 * @param {Object} props - Component props
 * @param {Array<Object>} props.players - Array of player objects to display
 * @returns {JSX.Element} Rendered component
 */
export default function PlayerList({ players }) {
  return (
    <div className="lobby-players w-full max-h-72 overflow-y-auto px-2">
      {players.map((player, index) => (
        <PlayerBox key={index} player={player} />
      ))}
    </div>
  );
}
