import React from 'react';
import { motion } from 'framer-motion';

/**
 * HowToPlayModal component displays game instructions in a modal overlay.
 * Matches the app's styling and uses Framer Motion for animations.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showModal - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @returns {JSX.Element} Rendered component
 */
export default function HowToPlayModal({ showModal, onClose }) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#121212] rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">How to Play</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 text-white">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-[#1db954]">Game Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Join a lobby with friends using the game code provided by the host.</li>
              <li>Each round, you'll receive a prompt and have time to choose a song that best fits it.</li>
              <li>Once all songs are submitted, players will rate each entry on a scale of 1 to 5 records.</li>
              <li>The player with the most records at the end wins!</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-[#1db954]">Rules</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Minimum 3 players required to start a game</li>
              <li>Each player must submit a song within the time limit</li>
              <li>You cannot rate your own song</li>
              <li>Premium Spotify account required for playback</li>
              <li>Host can customize number of rounds and time limits</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-[#1db954]">Tips</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Choose songs that best match the prompt's theme</li>
              <li>Consider the mood and atmosphere of the song</li>
              <li>Be creative with your song selections!</li>
            </ul>
          </section>
        </div>
      </motion.div>
    </div>
  );
} 