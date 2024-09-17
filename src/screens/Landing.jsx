import React, { useState } from "react";
import logo from "../images/landing-logo.svg";
import HomeBtn from "../components/HomeBtn";
import DevBtn from "../components/DevBtn";
import { useNavigate } from "react-router-dom";

export default function Landing({ socket }) {
  const [gameCode, setGameCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setGameCode(event.target.value);
  };

  const handleJoinGame = () => {
    socket.emit("check-game-code", { code: gameCode }, (isValid) => {
      console.log(gameCode);
      if (isValid) {
        socket.emit("join-game", { code: gameCode });
        navigate(`/lobby/${gameCode}`);
      } else {
        setErrorMessage("Invalid game code.");
      }
    });
  };

  const handleHostGame = () => {
    socket.emit("host-game", (generatedGameCode) => {
      console.log("New game hosted with code: ", generatedGameCode);
      navigate(`/lobby/${generatedGameCode}`);
    });
  };

  return (
    <div>
      <div className="landing h-svh flex flex-col justify-around relative z-20">
        <div className="landing-top flex flex-col items-center my-10">
          <img className="landing-logo p-12" src={logo} alt="" />
          <div className="landing-join flex flex-col items-center gap-8">
            <input
              className="join-code text-center text-2xl py-3 text-white"
              type="text"
              placeholder="Enter Code"
              value={gameCode}
              onChange={handleInputChange}
            />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button className="w-full text-center" onClick={handleJoinGame}>
              <HomeBtn style="join-btn" text="Join game" />
            </button>
          </div>
        </div>
        <div className="landing-bottom flex flex-col items-center gap-1 pt-20">
          <button onClick={handleHostGame}>
            <HomeBtn style="host-btn" text="Host game" />
          </button>
          <div className="dev-links flex gap-5 m-5">
            <DevBtn dev="wilson" />
            <DevBtn dev="kenny" />
          </div>
        </div>
      </div>
    </div>
  );
}
