import React, { useState } from "react";
import SearchBar from "../../components/SearchBar";
import SongList from "../../components/SongList";

/**
 * SongSelection component provides a search interface for selecting songs
 * and displays search results in a list.
 * 
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback for search term changes
 * @param {Array} props.searchResults - List of search results
 * @param {Function} props.onSelectSong - Callback when a song is selected
 * @param {Function} props.onShowPrompt - Callback to show the prompt modal
 * @param {boolean} props.showPromptModal - Whether the prompt modal is visible
 * @returns {JSX.Element} Rendered component
 */
export default function SongSelection({ 
  searchTerm, 
  onSearchChange, 
  searchResults, 
  onSelectSong, 
  onShowPrompt,
  showPromptModal 
}) {
  const [selectedTrack, setSelectedTrack] = useState(null);

  /**
   * Handles selecting a track from the search results
   * @param {Object} track - The selected track object
   */
  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
  };

  /**
   * Handles confirming the selected track and submitting it
   * @param {Object} track - The track to submit
   */
  const handleConfirmTrack = (track) => {
    onSelectSong(track);
  };

  return (
    <div
      className={`song-selection-view flex flex-col h-screen w-full ${
        showPromptModal ? "blur-sm" : ""
      }`}
    >
      <div className="flex justify-center mt-32 mb-4 px-4">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="What do you want to play?"
        />
      </div>

      <div className="overflow-y-auto">
        <SongList 
          tracks={searchResults} 
          selectedTrack={selectedTrack}
          onSelectTrack={handleSelectTrack}
          onConfirmTrack={handleConfirmTrack} 
        />
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={onShowPrompt}
          className="green-btn w-full py-3 rounded-md text-black font-semibold cursor-pointer"
        >
          View Prompt
        </button>
      </div>
    </div>
  );
} 