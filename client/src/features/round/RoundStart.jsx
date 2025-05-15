import React from "react";
import SearchBar from "../../components/SearchBar";
import nextIcon from "../../assets/next-icon.svg";

/**
 * RoundStart component displays the current prompt and provides a button to start song selection.
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentPrompt - The current game prompt to display
 * @param {Function} props.onStartSelection - Callback function when user clicks to start song selection
 * @returns {JSX.Element} Rendered component
 */
export default function RoundStart({ currentPrompt, onStartSelection }) {
  return (
    <div className="flex flex-col items-center gap-10">
      <h1 className="text-7xl font-bold text-center text-white">The prompt is:</h1>

      <SearchBar
        value={currentPrompt || ""}
        onChange={() => {}}
        readOnly
      />

      <button
        onClick={onStartSelection}
        className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white font-semibold cursor-pointer"
      >
        <span>Select Song</span>
        <img src={nextIcon} alt="Arrow Right" className="w-5 h-5 pt-0.5" />
      </button>
    </div>
  );
} 