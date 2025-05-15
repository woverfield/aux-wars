import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../services/GameContext';
import { useSocket, useSocketConnection, useGameTransition } from '../../services/SocketProvider';
import PlayerResult from '../../components/PlayerResult';
import AnimatedLogo from '../../components/AnimatedLogo';
import backIcon from '../../assets/back-icon.svg';

/**
 * GameWinner component displays the final game results showing the winner and all players' stats.
 * Includes animations, navigation controls, and handles game state transitions.
 * 
 * @returns {JSX.Element} Rendered component
 */
export default function GameWinner() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const isConnected = useSocketConnection();
  const setGameTransition = useGameTransition();
  const { state, dispatch } = useGame();
  const { allRoundResults } = state;

  // Handle game transition animation
  useEffect(() => {
    setGameTransition(true);
    const timer = setTimeout(() => {
      setGameTransition(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [setGameTransition]);

  // Handle disconnection
  useEffect(() => {
    if (!isConnected) {
      navigate("/lobby", { replace: true });
    }
  }, [isConnected, navigate]);

  /**
   * Builds player statistics from round results including wins, records, and songs.
   * @returns {Array<Object>} Array of player stats objects with the following properties:
   *   - playerId: string - Unique identifier for the player
   *   - playerName: string - Display name of the player
   *   - wins: number - Number of rounds won
   *   - totalRecords: number - Total records earned across all rounds
   *   - songs: Array<Object> - List of songs submitted by the player
   */
  const buildPlayerStats = () => {
    const stats = {};
    Object.values(allRoundResults || {}).forEach((round, roundIdx) => {
      if (!round.songs) return;
      
      const winnerSongId = round.winnerSongId;
      
      round.songs.forEach(song => {
        const playerId = song.player?.id;
        if (!playerId) return;
        
        if (!stats[playerId]) {
          stats[playerId] = {
            playerId,
            playerName: song.player.name,
            wins: 0,
            totalRecords: 0,
            songs: [],
          };
        }
        
        stats[playerId].songs.push({
          ...song,
          round: roundIdx + 1,
          isRoundWinner: song.songId === winnerSongId
        });
        
        stats[playerId].totalRecords += song.totalRecords || 0;
        
        if (song.songId === winnerSongId) {
          stats[playerId].wins += 1;
        }
      });
    });
    return Object.values(stats);
  };

  // Sort players by wins and records
  const sortedPlayers = buildPlayerStats()
    .sort((a, b) => b.wins - a.wins || b.totalRecords - a.totalRecords);

  // Separate winner from other players
  const winner = sortedPlayers[0];
  const rest = sortedPlayers.slice(1);

  /**
   * Handles returning to the lobby and resetting game state.
   * Emits a return-to-lobby event to the server and navigates back to the lobby.
   */
  const handleReturnToLobby = () => {
    setGameTransition(true);
    dispatch({ type: "RESET_GAME" });
    socket.emit("return-to-lobby", { gameCode });
    navigate(`/lobby/${gameCode}`, { replace: true });
  };

  return (
    <div className="relative flex flex-col w-full max-w-7xl mx-auto pt-2 pb-2 px-2 md:p-6 bg-transparent items-center">
      {/* Navigation controls */}
      <div className="w-full flex flex-row justify-start mb-2 mt-4">
        <button
          className="flex items-center gap-2 py-2 px-4 rounded-md text-white font-semibold cursor-pointer transition-all bg-[#242424] hover:bg-[#191414]"
          onClick={handleReturnToLobby}
        >
          <img src={backIcon} alt="Back" className="w-5 h-5 pt-0.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Logo section */}
      <div className="flex justify-center w-full mb-4">
        <AnimatedLogo />
      </div>

      {/* Winner display */}
      {winner && (
        <PlayerResult
          playerName={winner.playerName}
          albums={winner.songs.map(song => song.albumCover)}
          wins={winner.wins}
          totalRecords={winner.totalRecords}
          isWinner={true}
        />
      )}

      {/* Other players list */}
      <div className="w-full flex flex-col items-center gap-2 pb-4 overflow-y-auto" style={{ maxHeight: '30vh', minHeight: '10rem' }}>
        {rest.map((player, idx) => (
          <PlayerResult
            key={player.playerId}
            playerName={player.playerName}
            albums={player.songs.map(song => song.albumCover)}
            wins={player.wins}
            totalRecords={player.totalRecords}
            isWinner={false}
          />
        ))}
      </div>
    </div>
  );
} 