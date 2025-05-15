import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

/**
 * SocketContext provides socket.io connection management for the application.
 * Handles connection state, reconnection logic, and game phase transitions.
 */
const SocketContext = createContext(null);

// Get the server URL from environment variables or use a default
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Create a singleton socket instance
let socketInstance = null;

// Track if we're currently transitioning between game phases
let isInGameTransition = false;

/**
 * SocketProvider component that manages socket.io connection and provides socket context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const ignoreDisconnectsUntil = useRef(0);

  /**
   * Marks that we're in a game transition and temporarily ignores disconnects
   * @param {boolean} inTransition - Whether we're in a transition
   */
  const setGameTransition = (inTransition) => {
    isInGameTransition = inTransition;
    if (inTransition) {
      // Ignore disconnects for the next 5 seconds during transitions
      ignoreDisconnectsUntil.current = Date.now() + 5000;
    }
  };

  useEffect(() => {
    // Use existing socket instance if available
    if (!socketInstance) {
      console.log('Creating new socket instance');
      socketInstance = io(SERVER_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket'],
        forceNew: false,
        autoConnect: true
      });

      // Set up socket event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        
        // Don't redirect during game phase transitions
        if (isInGameTransition || Date.now() < ignoreDisconnectsUntil.current) {
          console.log('Ignoring connect error during game transition');
          return;
        }
        
        // Only redirect to lobby if we're not in a game
        if (!window.location.pathname.includes('/lobby/')) {
          console.log('Redirecting to lobby due to connection error');
          navigate('/lobby', { replace: true });
        }
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        // Don't redirect during game phase transitions
        if (isInGameTransition || Date.now() < ignoreDisconnectsUntil.current) {
          console.log('Ignoring disconnect during game transition');
          return;
        }
        
        // Only redirect on unexpected disconnects and if we're not in a game
        if ((reason === 'io server disconnect' || reason === 'transport close') 
            && !window.location.pathname.includes('/lobby/')) {
          console.log('Redirecting to lobby due to disconnect');
          navigate('/lobby', { replace: true });
        }
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
        setIsConnected(false);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setIsConnected(false);
        
        // Don't redirect during game phase transitions
        if (isInGameTransition || Date.now() < ignoreDisconnectsUntil.current) {
          console.log('Ignoring reconnect failure during game transition');
          return;
        }
        
        // Only redirect if we're not in a game
        if (!window.location.pathname.includes('/lobby/')) {
          console.log('Redirecting to lobby due to reconnection failure');
          navigate('/lobby', { replace: true });
        }
      });
      
      // Listen for game phase transitions
      socketInstance.on('game-phase-updated', ({ phase }) => {
        console.log('Game phase updated:', phase);
        setGameTransition(true);
        // Reset transition flag after a delay
        setTimeout(() => {
          setGameTransition(false);
        }, 3000);
      });
      
      // Listen for game errors
      socketInstance.on('game-error', ({ message }) => {
        console.error('Game error:', message);
        
        // Show alert with the error message
        alert(message);
        
        // No need to navigate - the phase update will handle that if needed
      });
    } else {
      // If we have an existing socket instance, check its connection state
      console.log('Using existing socket instance');
      setIsConnected(socketInstance.connected);
    }

    setSocket(socketInstance);

    // Cleanup on unmount - don't close the socket, just remove specific listeners
    return () => {
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('connect_error');
        socketInstance.off('disconnect');
        socketInstance.off('reconnect');
        socketInstance.off('reconnect_error');
        socketInstance.off('reconnect_failed');
        socketInstance.off('game-phase-updated');
        socketInstance.off('game-error');
      }
    };
  }, [navigate]);

  // Add a connection check effect
  useEffect(() => {
    if (socket && !isConnected) {
      console.log('Socket exists but not connected, attempting to connect...');
      socket.connect();
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    setGameTransition
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Custom hook to access the socket instance
 * @returns {Object} Socket.io instance
 * @throws {Error} If used outside of SocketProvider
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
}

/**
 * Custom hook to access the socket connection state
 * @returns {boolean} Whether the socket is connected
 * @throws {Error} If used outside of SocketProvider
 */
export function useSocketConnection() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketConnection must be used within a SocketProvider');
  }
  return context.isConnected;
}

/**
 * Custom hook to access the game transition state setter
 * @returns {Function} Function to set game transition state
 * @throws {Error} If used outside of SocketProvider
 */
export function useGameTransition() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useGameTransition must be used within a SocketProvider');
  }
  return context.setGameTransition;
}
