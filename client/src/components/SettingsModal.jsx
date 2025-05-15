import React, { useEffect, useState } from "react";
import { useGame } from "../services/GameContext";
import { useSocket } from "../services/SocketProvider";
import PromptTag from "./PromptTag";

/**
 * SettingsModal component for configuring game settings.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showModal - Controls modal visibility
 * @param {Function} props.onClose - Callback for closing the modal
 * @param {string} props.gameCode - Current game code
 * @returns {JSX.Element|null} Rendered component or null if not visible
 */
export default function SettingsModal({ showModal, onClose, gameCode }) {
  const { state, dispatch } = useGame();
  const socket = useSocket();
  const [rounds, setRounds] = useState(state.numberOfRounds);
  const [roundLength, setRoundLength] = useState(state.roundLength);
  const [selectedPrompts, setSelectedPrompts] = useState(state.selectedPrompts);

  // Sync local state if game context changes externally
  useEffect(() => {
    setRounds(state.numberOfRounds);
    setRoundLength(state.roundLength);
    setSelectedPrompts(state.selectedPrompts);
  }, [state.numberOfRounds, state.roundLength, state.selectedPrompts]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (showModal) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showModal, onClose]);

  if (!showModal) return null;

  // Available round length options in seconds
  const lengthOptions = [15, 30, 60, 120];

  /**
   * Toggles a prompt in the selected prompts list
   * @param {string} prompt - Prompt to toggle
   */
  const togglePrompt = (prompt) => {
    if (selectedPrompts.includes(prompt)) {
      setSelectedPrompts(selectedPrompts.filter((p) => p !== prompt));
    } else {
      setSelectedPrompts([...selectedPrompts, prompt]);
    }
  };

  /**
   * Applies the current settings to the game
   */
  const applySettings = () => {
    // Update local game context
    dispatch({ type: "SET_ROUNDS", payload: rounds });
    dispatch({ type: "SET_ROUND_LENGTH", payload: roundLength });
    dispatch({ type: "SET_SELECTED_PROMPTS", payload: selectedPrompts });
    
    // Emit updated settings to the server so all clients get synchronized
    socket.emit("update-game-settings", {
      gameCode,
      numberOfRounds: rounds,
      roundLength,
      selectedPrompts
    });
    onClose();
  };

  return (
    <div className="settings-modal z-10 fixed inset-0 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto p-5 rounded-md max-h-full overflow-y-auto">
        <div className="round-settings">
          {/* Number of rounds input */}
          <p className="text-md font-semibold text-white">Number of Rounds:</p>
          <div className="flex flex-col gap-5 w-full">
            <input
              type="text"
              className="w-full rounded-md bg-gray-800 text-white p-2"
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value) || 0)}
            />
            
            {/* Round length selection */}
            <p className="text-md font-semibold text-white">Round Length:</p>
            <div className="round-lengths grid grid-cols-2 gap-5 text-center font-normal text-xl">
              {lengthOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setRoundLength(opt)}
                  className={
                    roundLength === opt
                      ? "selected-round-container p-2 rounded-md"
                      : "round-container p-2 rounded-md"
                  }
                >
                  <p>{opt >= 60 ? `${opt / 60} min` : `${opt} sec`}</p>
                </button>
              ))}
            </div>
            
            {/* Prompt selection */}
            <p className="text-md font-semibold text-white">Select Prompts:</p>
            <div className="flex gap-3 mt-2 flex-wrap">
              {state.availablePrompts.map((prompt) => (
                <PromptTag
                  key={prompt}
                  label={prompt}
                  selected={selectedPrompts.includes(prompt)}
                  onClick={() => togglePrompt(prompt)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={applySettings}
            className="w-full py-2 green-btn rounded-md text-white font-semibold"
          >
            Apply Settings
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-md text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
