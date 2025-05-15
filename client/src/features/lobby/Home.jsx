import React, { useState } from "react";
import AnimatedLogo from "../../components/AnimatedLogo";
import HomeBtn from "../../components/HomeBtn";
import HowToPlayModal from "../../components/HowToPlayModal";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../services/SocketProvider";

/**
 * Home component serves as the landing page for the game.
 * Provides options to host a new game or join an existing one.
 * 
 * @returns {JSX.Element} Rendered component
 */
export default function Home() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [isHosting, setIsHosting] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  /**
   * Handles hosting a new game.
   * Emits host-game event and navigates to lobby on success.
   * Disables hosting button while request is in progress.
   */
  const handleHostGame = () => {
    if (!socket || isHosting) return;
    
    setIsHosting(true);
    socket.emit("host-game", (response) => {
      if (response.success) {
        navigate(`/lobby/${response.gameCode}`);
      } else {
        setIsHosting(false);
      }
    });
  };

  /**
   * Handles joining an existing game.
   * Validates game code and emits join-game event.
   * Shows error message if join fails.
   */
  const handleJoinGame = () => {
    if (!socket || !joinCode.trim()) {
      alert("Please enter a valid game code.");
      return;
    }
    
    socket.emit("join-game", { gameCode: joinCode.trim(), name: "Guest" }, (response) => {
      if (response.success) {
        navigate(`/lobby/${joinCode.trim()}`);
      } else {
        alert(response.message || "Failed to join game.");
      }
    });
  };

  return (
    <div className="home h-svh flex flex-col items-center relative z-20">
      {/* Top section with logo and join code input */}
      <div className="home-top flex flex-col items-center my-10">
        <AnimatedLogo />
        <div className="home-join flex flex-col items-center gap-8 w-full max-w-xs">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter Code"
            className="join-code text-center text-2xl py-3 text-white"
          />
        </div>
      </div>

      {/* Bottom section with action buttons */}
      <div className="home-btns flex flex-col items-center gap-6 mb-10 w-full h-full max-w-xs justify-between">
        <HomeBtn 
          onClick={handleJoinGame} 
          className="spotify-btn" 
          text="Join game" 
        />
        <HomeBtn 
          onClick={handleHostGame} 
          className="guest-btn" 
          text={isHosting ? "Hosting..." : "Host game"} 
          disabled={isHosting}
        />
      </div>

      {/* How to Play button */}
      <div className="text-center pb-6 text-white">
        <button 
          onClick={() => setShowHowToPlay(true)}
          className="text-sm md:text-base hover:underline transition-colors"
        >
          How to play
        </button>
      </div>

      <HowToPlayModal 
        showModal={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
}
