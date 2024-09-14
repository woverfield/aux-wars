import React from "react";

export default function PlayerBox({ player }) {
  return (
    <div className="lobby-player rounded-md">
      <p>{player.name}</p>
      <p className={player.isLinked ? "linked" : "not-linked"}>{player.isLinked ? "Linked" : "Not Linked"}</p>
    </div>
  );
}