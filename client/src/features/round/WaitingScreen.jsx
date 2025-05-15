import React from "react";

/**
 * WaitingScreen component displays a loading state while waiting for other players
 * to complete their actions in the game.
 * 
 * @param {Object} props - Component props
 * @param {number} props.completedCount - Number of players who have completed their action
 * @param {number} props.totalCount - Total number of players in the game
 * @param {string} [props.message] - Optional custom message to display
 * @returns {JSX.Element} Rendered component
 */
export default function WaitingScreen({ completedCount, totalCount, message }) {
  const defaultMessage = "Your song has been submitted! Hang tight while everyone else makes their selection.";
  
  return (
    <div className="waiting-screen flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="text-center p-4 md:p-8 max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">
          Waiting for other players
        </h2>
        
        {completedCount !== undefined && totalCount !== undefined && (
          <p className="text-lg md:text-xl text-white mb-6 md:mb-8">
            {completedCount} of {totalCount} players have submitted
          </p>
        )}
        
        <div className="loader mt-4">
          <div className="spinner-border animate-pulse text-green-500 h-12 w-12 md:h-16 md:w-16 rounded-full bg-green-500"></div>
        </div>
        
        <p className="text-white mt-8 md:mt-10 text-sm md:text-base">
          {message || defaultMessage}
        </p>
      </div>
    </div>
  );
} 