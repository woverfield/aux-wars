import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../services/GameContext";
import { useSocket, useSocketConnection, useGameTransition } from "../../services/SocketProvider";
import { searchSpotifyTracks, isTokenValid } from "../../services/spotifyApi";
import RoundStart from "./RoundStart";
import SongSelection from "./SongSelection";
import PromptModal from "./PromptModal";
import WaitingScreen from "./WaitingScreen";
import RatingScreen from "./RatingScreen";

/**
 * Round component manages the game round flow including song selection and rating phases.
 * Handles socket events for game state updates, player interactions, and phase transitions.
 * 
 * @returns {JSX.Element} The rendered round component
 */
export default function Round() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const isConnected = useSocketConnection();
  const setGameTransition = useGameTransition();
  const { state, dispatch } = useGame();

  // State Management
  // ===============

  // Song Selection State
  const [isSongSelectionView, setIsSongSelectionView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPromptModal, setShowPromptModal] = useState(false);
  
  // Submission Tracking State
  const [hasSongSubmitted, setHasSongSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  
  // Rating Phase State
  const [isRatingPhase, setIsRatingPhase] = useState(false);
  const [songToRate, setSongToRate] = useState(null);
  const [ratingIndex, setRatingIndex] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasRatingSubmitted, setHasRatingSubmitted] = useState(false);
  const [ratingSubmittedCount, setRatingSubmittedCount] = useState(0);
  
  // Transition State
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Effects
  // =======

  /**
   * Checks token validity and redirects if invalid
   */
  useEffect(() => {
    if (!isTokenValid()) {
      console.log("No valid Spotify token found in round, redirecting to login...");
      navigate("/login");
      return;
    }
  }, [navigate]);

  /**
   * Redirects to lobby if not connected to socket
   */
  useEffect(() => {
    if (!isConnected && !isTransitioning) {
      if (!window.location.pathname.includes('/lobby/')) {
        navigate("/lobby", { replace: true });
      }
    }
  }, [isConnected, navigate, isTransitioning]);

  /**
   * Handles prompt updates and requests current prompt on mount
   */
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePromptUpdate = ({ prompt }) => {
      console.log("Received prompt update:", prompt);
      dispatch({ type: "SET_PROMPT", payload: prompt });
    };

    socket.on("prompt-updated", handlePromptUpdate);
    socket.emit("request-prompt", { gameCode });

    return () => {
      socket.off("prompt-updated", handlePromptUpdate);
    };
  }, [socket, isConnected, dispatch, gameCode]);

  /**
   * Manages song submission updates and tracking
   */
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("song-selected", ({ playerId }) => {
      if (playerId === socket.id) {
        setHasSongSubmitted(true);
      }
      setSubmittedCount(prev => prev + 1);
    });

    socket.on("song-submission-update", ({ submitted, total }) => {
      setSubmittedCount(submitted);
      setTotalPlayers(total);
    });

    socket.emit("get-submission-status", { gameCode });

    return () => {
      socket.off("song-selected");
      socket.off("song-submission-update");
    };
  }, [socket, isConnected, gameCode]);

  /**
   * Handles rating phase events and transitions
   */
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("start-rating", (data) => {
      const { ratingIndex, totalSongs, songToRate } = data;
      
      setGameTransition(true);
      
      setIsRatingPhase(true);
      setRatingIndex(ratingIndex);
      setTotalSongs(totalSongs);
      setSongToRate(songToRate);
      setHasRatingSubmitted(false);
      setRatingSubmittedCount(0);
      
      if (songToRate.player.id === socket.id) {
        console.log("Skipping rating own song");
        socket.emit("submit-rating", {
          gameCode,
          songId: songToRate.songId,
          rating: -1,
        });
        setHasRatingSubmitted(true);
      }
    });

    socket.on("rating-update", ({ submitted, total, songId }) => {
      setRatingSubmittedCount(submitted);
      setTotalPlayers(total);
    });

    socket.on("round-results", ({ results }) => {
      setIsTransitioning(true);
      setGameTransition(true);
      
      console.log("Received round results:", JSON.stringify(results, null, 2));
      
      if (!results || !results.songs) {
        console.error("Invalid round results received:", results);
      } else {
        console.log(`Received ${results.songs.length} songs in round results`);
      }
      
      dispatch({ type: "SET_ROUND_RESULTS", payload: results });
      navigate(`/lobby/${gameCode}/results`, { replace: true });
    });

    return () => {
      socket.off("start-rating");
      socket.off("rating-update");
      socket.off("round-results");
    };
  }, [socket, isConnected, gameCode, navigate, dispatch, setGameTransition]);

  /**
   * Auto-skips rating for player's own song
   */
  useEffect(() => {
    if (isRatingPhase && songToRate && songToRate.player.id === socket.id) {
      console.log("Auto-skipping rating for own song");
      socket.emit("submit-rating", {
        gameCode,
        songId: songToRate.songId,
        rating: -1
      });
      setHasRatingSubmitted(true);
    }
  }, [isRatingPhase, songToRate, socket, gameCode]);

  /**
   * Handles game phase changes and transitions
   */
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("game-phase-updated", ({ phase, currentRound }) => {
      setIsTransitioning(true);
      setGameTransition(true);
      
      console.log(`Phase changed to: ${phase}`);
      dispatch({ type: "SET_PHASE", payload: phase });
      if (typeof currentRound !== 'undefined') {
        dispatch({ type: "SET_CURRENT_ROUND", payload: currentRound });
      }
      
      if (phase === "lobby") {
        if (!window.location.pathname.includes('/lobby/')) {
          navigate(`/lobby/${gameCode}`, { replace: true });
        }
      } else if (phase === "rating") {
        setIsRatingPhase(true);
        setHasSongSubmitted(false);
        setIsTransitioning(false);
      } else if (phase === "results") {
        navigate(`/lobby/${gameCode}/results`, { replace: true });
      } else if (phase === "songSelection") {
        setIsRatingPhase(false);
        setHasSongSubmitted(false);
        setIsSongSelectionView(false);
        setIsTransitioning(false);
      }
    });

    return () => socket.off("game-phase-updated");
  }, [socket, isConnected, gameCode, navigate, dispatch, setGameTransition]);

  /**
   * Handles Spotify track search with debouncing
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const tracksOrError = await searchSpotifyTracks(searchTerm);
        if (tracksOrError?.error === "refresh_revoked") {
          console.log("Spotify token revoked, redirecting to login...");
          navigate("/login", { replace: true });
          return;
        }
        setSearchResults(tracksOrError);
      } catch (error) {
        console.error("Error searching tracks:", error);
        if (!isTransitioning) {
          if (!window.location.pathname.includes('/lobby/')) {
            navigate("/lobby", { replace: true });
          }
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, navigate, isTransitioning]);

  /**
   * Monitors player count and game viability
   */
  useEffect(() => {
    if (!socket || !isConnected) return;

    if (totalPlayers < 3 && totalPlayers > 0) {
      console.log("Not enough players to continue the game");
    }
  }, [totalPlayers, socket, isConnected, navigate]);

  /**
   * Handles game error events
   */
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("game-error", ({ message }) => {
      console.error("Game error:", message);
    });

    return () => {
      socket.off("game-error");
    };
  }, [socket, isConnected]);

  // Event Handlers
  // =============

  /**
   * Handles song selection and submission
   * @param {Object} track - The selected track object
   */
  const handleSelectSong = (track) => {
    if (!socket || !isConnected) {
      if (!isTransitioning) {
        if (!window.location.pathname.includes('/lobby/')) {
          navigate("/lobby", { replace: true });
        }
      }
      return;
    }

    socket.emit("song-selected", {
      gameCode,
      trackId: track.id,
      trackDetails: {
        name: track.name,
        artist: track.artists[0].name,
        albumCover: track.album.images[0].url,
        previewUrl: track.preview_url,
      },
    });

    setHasSongSubmitted(true);
    setIsSongSelectionView(false);
  };

  /**
   * Handles song rating submission
   * @param {string} songId - The ID of the song being rated
   * @param {number} rating - The rating value
   */
  const handleSubmitRating = (songId, rating) => {
    if (!socket || !isConnected) {
      if (!isTransitioning) {
        if (!window.location.pathname.includes('/lobby/')) {
          navigate("/lobby", { replace: true });
        }
      }
      return;
    }
    
    socket.emit("submit-rating", {
      gameCode,
      songId,
      rating
    });
    
    setHasRatingSubmitted(true);
    
    dispatch({
      type: "ADD_SONG_RATING",
      payload: {
        songId,
        rating,
        voterId: socket.id
      }
    });
  };

  // Render Logic
  // ===========

  if (!isTokenValid()) {
    return null;
  }

  if (!isConnected && !isTransitioning) {
    return null;
  }

  const renderContent = () => {
    if (isRatingPhase) {
      if (hasRatingSubmitted) {
        return (
          <WaitingScreen 
            completedCount={ratingSubmittedCount} 
            totalCount={totalPlayers}
            message="Waiting for other players to rate this song..." 
          />
        );
      } else if (songToRate) {
        return (
          <RatingScreen
            currentPrompt={state.currentPrompt}
            songToRate={songToRate}
            onSubmitRating={handleSubmitRating}
            currentIndex={ratingIndex}
            totalSongs={totalSongs}
          />
        );
      }
    } else {
      if (hasSongSubmitted) {
        return (
          <WaitingScreen 
            completedCount={submittedCount} 
            totalCount={totalPlayers}
            message="Waiting for other players to submit their songs..." 
          />
        );
      } else if (isSongSelectionView) {
        return (
          <SongSelection
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            searchResults={searchResults}
            onSelectSong={handleSelectSong}
            onShowPrompt={() => setShowPromptModal(true)}
            showPromptModal={showPromptModal}
          />
        );
      } else {
        return (
          <RoundStart 
            currentPrompt={state.currentPrompt}
            onStartSelection={() => setIsSongSelectionView(true)}
          />
        );
      }
    }
  };

  return (
    <div className="round-start flex flex-col items-center justify-center text-white p-4">
      {renderContent()}

      {showPromptModal && !hasSongSubmitted && !isRatingPhase && (
        <PromptModal
          currentPrompt={state.currentPrompt}
          onClose={() => setShowPromptModal(false)}
        />
      )}
    </div>
  );
}
