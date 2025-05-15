import React from "react";
import SearchBar from "../../components/SearchBar";

/**
 * PromptModal component displays the current game prompt in a modal overlay.
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentPrompt - The current game prompt to display
 * @param {Function} props.onClose - Callback function to close the modal
 * @returns {JSX.Element} Rendered component
 */
export default function PromptModal({ currentPrompt, onClose }) {
  return (
    <div className="prompt-modal fixed inset-0 flex items-center justify-center bg-black">
      <div className="prompt-modal-content p-6 rounded-md text-center flex flex-col items-center gap-6">
        <h1 className="text-7xl font-bold">The prompt is:</h1>

        <SearchBar
          value={currentPrompt || "Loading..."}
          onChange={() => {}}
          readOnly
        />

        <button
          onClick={onClose}
          className="green-btn py-2 px-4 rounded-md text-black font-semibold cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
} 