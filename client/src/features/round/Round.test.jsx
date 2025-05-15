// Test suite for Round component and game round functionality
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Round from './Round';
import { GameProvider } from '../../services/GameContext';
import { createContext, useContext } from 'react';
import { searchSpotifyTracks } from '../../services/spotifyApi';

// Create test socket context for WebSocket testing
const TestSocketContext = createContext();

// Mock Spotify API for song search functionality
vi.mock('../../services/spotifyApi', () => ({
  searchSpotifyTracks: vi.fn(),
}));

// Mock socket instance for WebSocket communication
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
};

// Mock navigation for testing routing
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock SocketProvider for WebSocket testing
vi.mock('../../services/SocketProvider', () => ({
  useSocket: () => mockSocket,
}));

// Initial game state for testing
const mockGameState = {
  currentPrompt: "Test prompt",
  players: [],
  phase: "roundStart",
};

// Helper function to render Round component with required providers
const renderRound = (gameCode = "TEST123") => {
  return render(
    <MemoryRouter initialEntries={[`/round/${gameCode}`]}>
      <TestSocketContext.Provider value={mockSocket}>
        <GameProvider initialState={mockGameState}>
          <Routes>
            <Route path="/round/:gameCode" element={<Round />} />
          </Routes>
        </GameProvider>
      </TestSocketContext.Provider>
    </MemoryRouter>
  );
};

describe('Round Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchSpotifyTracks.mockResolvedValue([
      { id: '1', name: 'Test Song 1', artists: [{ name: 'Artist 1' }] },
      { id: '2', name: 'Test Song 2', artists: [{ name: 'Artist 2' }] },
    ]);
  });

  // Test initial round state
  it('renders the initial round start view', () => {
    renderRound();
    expect(screen.getByText('The prompt is:')).toBeInTheDocument();
  });

  // Test prompt display
  it('displays the current prompt', () => {
    renderRound();
    expect(screen.getByDisplayValue('Test prompt')).toBeInTheDocument();
  });

  // Test song selection view transition
  it('transitions to song selection view when "Select Song" is clicked', () => {
    renderRound();
    fireEvent.click(screen.getByText('Select Song'));
    expect(screen.getByPlaceholderText('What do you want to play?')).toBeInTheDocument();
  });

  // Test song search functionality
  it('searches for songs when typing in the search bar', async () => {
    renderRound();
    fireEvent.click(screen.getByText('Select Song'));
    
    const searchInput = screen.getByPlaceholderText('What do you want to play?');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test search' } });
    });
    
    await waitFor(() => {
      expect(searchSpotifyTracks).toHaveBeenCalledWith('test search');
    });
  });

  // Test song search results display
  it('displays search results after searching', async () => {
    renderRound();
    fireEvent.click(screen.getByText('Select Song'));
    
    const searchInput = screen.getByPlaceholderText('What do you want to play?');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test search' } });
    });

    await waitFor(() => {
      const songElements = screen.getAllByText('Test Song 1');
      expect(songElements.length).toBeGreaterThan(0);
    });
  });

  // Test song selection
  it('emits song selection event when a song is selected', async () => {
    renderRound();
    fireEvent.click(screen.getByText('Select Song'));
    
    const searchInput = screen.getByPlaceholderText('What do you want to play?');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test search' } });
    });

    await waitFor(() => {
      const songElements = screen.getAllByText('Test Song 1');
      expect(songElements.length).toBeGreaterThan(0);
    });

    const songElements = screen.getAllByText('Test Song 1');
    fireEvent.click(songElements[0]);

    await waitFor(() => {
      const selectButton = screen.getByText('Select Song', { selector: 'button' });
      expect(selectButton).toBeInTheDocument();
      fireEvent.click(selectButton);
    });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('song-selected', {
      trackId: '1',
      gameCode: 'TEST123',
    });
  });

  // Test prompt modal display
  it('shows prompt modal when "View Prompt" is clicked', () => {
    renderRound();
    fireEvent.click(screen.getByText('Select Song'));
    fireEvent.click(screen.getByText('View Prompt'));
    expect(screen.getByText('The prompt is:')).toBeInTheDocument();
  });

  // Test navigation on phase change
  it('handles navigation back to lobby when phase changes', async () => {
    renderRound();
    
    const phaseChangeHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'game-phase-updated'
    )[1];
    
    await act(async () => {
      phaseChangeHandler({ phase: 'lobby' });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/lobby/TEST123', { replace: true });
  });
}); 