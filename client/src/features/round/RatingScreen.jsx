import React, { useState } from 'react';
import record from '../../assets/record.svg';
import SearchBar from '../../components/SearchBar';
import SpotifyPlayer from 'react-spotify-web-playback';

/**
 * RatingScreen component provides an interface for rating songs during the game.
 * Includes song playback, album art display, and a 5-star rating system.
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentPrompt - The current game prompt
 * @param {Object} props.songToRate - The song object to be rated
 * @param {Function} props.onSubmitRating - Callback when rating is submitted
 * @param {number} props.currentIndex - Current song index in the rating sequence
 * @param {number} props.totalSongs - Total number of songs to rate
 * @returns {JSX.Element} Rendered component
 */
const RatingScreen = ({ 
  currentPrompt,
  songToRate, 
  onSubmitRating, 
  currentIndex, 
  totalSongs 
}) => {
  const [selectedRating, setSelectedRating] = useState(-1);
  // Get the Spotify token from localStorage
  const spotifyToken = localStorage.getItem('spotify_access_token');

  /**
   * Handles clicking a rating record
   * @param {number} index - The index of the selected rating (0-4)
   */
  const handleRatingClick = (index) => {
    setSelectedRating(index);
  };

  /**
   * Handles submitting the rating
   * Validates that a rating has been selected before submitting
   */
  const handleSubmit = () => {
    if (selectedRating >= 0) {
      // Add 1 to the index to get rating from 1-5 instead of 0-4
      onSubmitRating(songToRate.songId, selectedRating + 1);
    } else {
      alert("Please select a rating before submitting");
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen box-border px-2 pt-4 pb-24 sm:pt-8 sm:pb-32 bg-transparent">
      {/* Prompt at the top */}
      <div className="w-full mb-2 sm:mb-4 overflow-x-auto">
        <SearchBar value={currentPrompt || ''} readOnly onChange={() => {}} />
      </div>
      
      {/* Main content vertically centered */}
      <div className="flex flex-col items-center flex-grow justify-center w-full max-w-md mx-auto">
        {/* Song counter */}
        <div className="mb-2 sm:mb-4 text-white text-center">
          <p>Rating Song {currentIndex + 1} of {totalSongs}</p>
        </div>
        {/* Album cover image */}
        {songToRate.albumCover && (
          <img
            src={songToRate.albumCover}
            alt={songToRate.name}
            className="w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] rounded-lg shadow-md object-cover mb-2 sm:mb-4"
            style={{ maxWidth: '80vw', maxHeight: '22vh' }}
          />
        )}

        {/* Spotify Web Playback Player */}
        {spotifyToken && songToRate.uri && (
          <div className="mb-2 sm:mb-4 w-full max-w-xs flex justify-center">
            <SpotifyPlayer
              token={spotifyToken}
              uris={[songToRate.uri]}
              autoPlay={false}
              showSaveIcon={false}
              hideAttribution={true}
              hideCoverArt={true}
              styles={{
                bgColor: 'transparent',
                color: '#fff',
                trackArtistColor: '#ccc',
                trackNameColor: '#fff',
                loaderColor: '#fff',
                sliderColor: '#1db954',
                activeColor: '#fff',
                height: 56,
                sliderHeight: 2,
                sliderTrackBorderRadius: 2,
              }}
              layout="compact"
              initialVolume={0.7}
            />
          </div>
        )}

        {/* Track name and artist name */}
        <div className="flex flex-col justify-center items-center mb-6">
          <p className="text-2xl sm:text-3xl font-semibold text-white text-center max-w-[95vw] truncate">{songToRate.name}</p>
          <p className="text-base sm:text-lg text-gray-300 text-center max-w-[95vw] truncate">
            {songToRate.artist}
          </p>
          <p className="text-xs text-gray-400 mt-1 text-center">
            Submitted by: {songToRate.player?.name || 'Unknown Player'}
          </p>
        </div>

        {/* Rating system */}
        <div className="flex flex-row justify-center items-center mb-8">
          {[...Array(5)].map((_, index) => (
            <img
              key={index}
              src={record}
              alt={`rate this song ${index + 1} records`}
              className={`w-[48px] sm:w-[56px] m-2 sm:m-2.5 cursor-pointer transition-all duration-300 hover:scale-110 ${
                index <= selectedRating ? "opacity-100" : "opacity-50"
              }`}
              onClick={() => handleRatingClick(index)}
            />
          ))}
        </div>
      </div>
      {/* Submit button fixed at the bottom */}
      <div className="fixed left-0 right-0 bottom-0 flex justify-center pb-4 bg-gradient-to-t from-black/80 to-transparent z-20">
        <button 
          className={`bg-[#68d570] text-black font-bold w-full max-w-xs h-[52px] rounded-full cursor-pointer transition-all hover:scale-105 hover:bg-[#7de884] ${
            selectedRating < 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleSubmit}
          disabled={selectedRating < 0}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default RatingScreen; 