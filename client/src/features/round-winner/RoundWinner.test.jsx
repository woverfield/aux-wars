/**
 * Test suite for RoundWinner component and winner display functionality.
 * Tests component rendering, song display, and navigation elements.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoundWinner from './RoundWinner';
import Song from '../../components/Song';
import album from './album-placeholder.jpg';

/**
 * Mock song data for testing winner display
 * @type {Array<JSX.Element>} Array of Song components with test data
 */
const mockSongs = [
  <Song 
    key="1" 
    track="Test Track 1" 
    artist="Test Artist 1" 
    player="Player 1" 
    albumCover={album} 
    rating="20" 
    winner="winner" 
  />,
  <Song 
    key="2" 
    track="Test Track 2" 
    artist="Test Artist 2" 
    player="Player 2" 
    albumCover={album} 
    rating="15" 
    winner="not-winner" 
  />
];

describe('RoundWinner', () => {
  /**
   * Test basic component rendering
   */
  it('renders without crashing', () => {
    render(<RoundWinner songs={mockSongs} />);
  });

  /**
   * Test winner song display
   */
  it('displays the first song', () => {
    render(<RoundWinner songs={mockSongs} />);
    expect(screen.getByText('Test Track 1')).toBeInTheDocument();
  });

  /**
   * Test non-winner song display
   */
  it('displays the second song', () => {
    render(<RoundWinner songs={mockSongs} />);
    expect(screen.getByText('Test Track 2')).toBeInTheDocument();
  });

  /**
   * Test navigation button presence
   */
  it('displays the next button', () => {
    render(<RoundWinner songs={mockSongs} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
}); 