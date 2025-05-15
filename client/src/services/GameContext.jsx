import React, { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * GameContext provides global state management for the game.
 * Handles game state, player information, rounds, prompts, and results.
 */
const GameContext = createContext();

/**
 * Initial state for the game context
 * @type {Object}
 */
const initialState = {
  currentPrompt: '',
  players: [],
  phase: 'lobby', // lobby, songSelection, rating, results, gameOver
  gameCode: '',
  availablePrompts: [
    "A song that makes you feel nostalgic",
    "A song that reminds you of summer",
    "A song that gets you pumped up",
    "A song that makes you want to dance",
    "A song that you love but others might not know",
    "A song that tells a great story",
    "A song that you discovered recently",
    "A song that you associate with a specific memory",
    "A song that you think is underrated",
    "A song that you could listen to on repeat"
  ],
  selectedPrompts: [
    "A song that makes you feel nostalgic",
    "A song that reminds you of summer",
    "A song that gets you pumped up",
    "A song that makes you want to dance",
    "A song that you love but others might not know",
    "A song that tells a great story",
    "A song that you discovered recently",
    "A song that you associate with a specific memory",
    "A song that you think is underrated",
    "A song that you could listen to on repeat"
  ],
  numberOfRounds: 3,
  roundLength: 30,
  submittedSongs: [], // Array of songs submitted for the current round
  currentRatingIndex: 0, // Index of the song currently being rated
  songRatings: {}, // Object mapping songId -> array of ratings
  hasVoted: false, // Whether the current user has voted in this rating round
  roundResults: {}, // Results of the current round
  allRoundResults: {}, // Object mapping roundNumber -> round results
  currentRound: 1, // Current round number
  isGameOver: false, // Whether the game is over
};

/**
 * Logs state changes for debugging purposes
 * @param {Object} action - The action being dispatched
 * @param {Object} prevState - Previous state
 * @param {Object} nextState - Next state
 */
const logStateChange = (action, prevState, nextState) => {
  console.log(`GameContext: ${action.type}`, {
    prev: {
      hasRoundResults: !!prevState.roundResults,
      roundResultsSize: prevState.roundResults?.songs?.length || 0
    },
    next: {
      hasRoundResults: !!nextState.roundResults,
      roundResultsSize: nextState.roundResults?.songs?.length || 0
    },
    payload: action.payload
  });
};

/**
 * Reducer function for managing game state
 * @param {Object} state - Current state
 * @param {Object} action - Action to dispatch
 * @returns {Object} New state
 */
const gameReducer = (state, action) => {
  let nextState;
  
  switch (action.type) {
    case 'SET_PROMPT':
      nextState = { ...state, currentPrompt: action.payload };
      return nextState;
      
    case 'SET_PLAYERS':
      nextState = { ...state, players: action.payload };
      return nextState;
      
    case 'SET_PHASE':
      nextState = { ...state, phase: action.payload };
      return nextState;
      
    case 'SET_GAME_CODE':
      nextState = { ...state, gameCode: action.payload };
      return nextState;
      
    case 'SET_AVAILABLE_PROMPTS':
      nextState = { ...state, availablePrompts: action.payload };
      return nextState;
      
    case 'SET_SELECTED_PROMPTS':
      nextState = { ...state, selectedPrompts: action.payload };
      return nextState;
      
    case 'SET_ROUNDS':
      nextState = { ...state, numberOfRounds: action.payload };
      return nextState;
      
    case 'SET_ROUND_LENGTH':
      nextState = { ...state, roundLength: action.payload };
      return nextState;
      
    case 'SET_SUBMITTED_SONGS':
      nextState = { ...state, submittedSongs: action.payload };
      return nextState;
      
    case 'ADD_SUBMITTED_SONG':
      nextState = { 
        ...state, 
        submittedSongs: [...state.submittedSongs, action.payload]
      };
      return nextState;
      
    case 'CLEAR_SUBMITTED_SONGS':
      nextState = { ...state, submittedSongs: [] };
      return nextState;
      
    case 'SET_CURRENT_RATING_INDEX':
      nextState = { ...state, currentRatingIndex: action.payload };
      return nextState;
      
    case 'SET_HAS_VOTED':
      nextState = { ...state, hasVoted: action.payload };
      return nextState;
      
    case 'ADD_SONG_RATING':
      const { songId, rating, voterId } = action.payload;
      // Get existing ratings or initialize empty array
      const existingRatings = state.songRatings[songId] || [];
      // Add new rating with voter ID
      const updatedRatings = [...existingRatings, { rating, voterId }];
      
      nextState = { 
        ...state, 
        songRatings: { 
          ...state.songRatings, 
          [songId]: updatedRatings 
        } 
      };
      return nextState;
      
    case 'SET_ROUND_RESULTS':
      // Store results for the current round in allRoundResults
      const updatedAllResults = {
        ...state.allRoundResults,
        [state.currentRound]: action.payload
      };
      
      nextState = { 
        ...state, 
        roundResults: action.payload,
        allRoundResults: updatedAllResults
      };
      logStateChange(action, state, nextState);
      return nextState;
      
    case 'SET_CURRENT_ROUND':
      nextState = { ...state, currentRound: action.payload };
      return nextState;
      
    case 'SET_GAME_OVER':
      nextState = { ...state, isGameOver: action.payload };
      return nextState;
      
    case 'NEXT_ROUND':
      // Check if this was the final round
      const isGameOver = state.currentRound >= state.numberOfRounds;
      
      nextState = { 
        ...state, 
        currentRound: state.currentRound + 1,
        submittedSongs: [],
        currentRatingIndex: 0,
        hasVoted: false,
        songRatings: {},
        phase: isGameOver ? 'gameOver' : 'songSelection',
        isGameOver: isGameOver
        // Keep roundResults - they'll be replaced when new ones come in
      };
      logStateChange(action, state, nextState);
      return nextState;
      
    case 'RESET_GAME':
      // Reset game state but keep some settings
      nextState = {
        ...initialState,
        gameCode: state.gameCode,
        players: state.players,
        selectedPrompts: state.selectedPrompts,
        numberOfRounds: state.numberOfRounds,
        roundLength: state.roundLength
      };
      return nextState;
      
    default:
      return state;
  }
};

/**
 * GameProvider component that wraps the application and provides game state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.initialState] - Optional initial state
 * @returns {JSX.Element} Provider component
 */
export const GameProvider = ({ children, initialState: initialGameState = initialState }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Debug logging for state changes
  useEffect(() => {
    if (state.roundResults?.songs) {
      console.log(`GameContext: Current round results has ${state.roundResults.songs.length} songs`);
    }
  }, [state.roundResults]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Custom hook to access the game context
 * @returns {Object} Game context containing state and dispatch
 * @throws {Error} If used outside of GameProvider
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
