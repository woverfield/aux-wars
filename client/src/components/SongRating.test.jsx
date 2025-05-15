// Test suite for SongRating component and rating functionality
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SongRating from './SongRating';

// Mock track data for testing
const mockTrack = {
  name: 'Test Song',
  artists: [{ name: 'Test Artist 1' }, { name: 'Test Artist 2' }],
  album: {
    images: [
      { url: 'http://test.com/large.jpg' },
      { url: 'http://test.com/medium.jpg' },
      { url: 'http://test.com/small.jpg' }
    ]
  }
};

describe('SongRating', () => {
  // Basic component rendering test
  it('renders without crashing', () => {
    render(<SongRating track={mockTrack} />);
  });

  // Test song title display
  it('displays the song title', () => {
    render(<SongRating track={mockTrack} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
  });

  // Test artist names display
  it('displays the artist names', () => {
    render(<SongRating track={mockTrack} />);
    expect(screen.getByText('Test Artist 1, Test Artist 2')).toBeInTheDocument();
  });

  // Test album cover presence
  it('displays the album cover', () => {
    render(<SongRating track={mockTrack} />);
    const albumCover = screen.getByAltText('Test Song');
    expect(albumCover).toBeInTheDocument();
  });

  // Test album cover source
  it('uses the correct album cover image', () => {
    render(<SongRating track={mockTrack} />);
    const albumCover = screen.getByAltText('Test Song');
    expect(albumCover).toHaveAttribute('src', 'http://test.com/medium.jpg');
  });

  // Test rating UI elements
  it('displays 5 rating records', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    expect(records).toHaveLength(5);
  });

  // Test first record opacity after click
  it('updates first record opacity when clicked', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    fireEvent.click(records[2]);
    expect(records[0]).toHaveClass('opacity-100');
  });

  // Test second record opacity after click
  it('updates second record opacity when clicked', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    fireEvent.click(records[2]);
    expect(records[1]).toHaveClass('opacity-100');
  });

  // Test third record opacity after click
  it('updates third record opacity when clicked', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    fireEvent.click(records[2]);
    expect(records[2]).toHaveClass('opacity-100');
  });

  // Test fourth record opacity after click
  it('updates fourth record opacity when clicked', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    fireEvent.click(records[2]);
    expect(records[3]).toHaveClass('opacity-50');
  });

  // Test fifth record opacity after click
  it('updates fifth record opacity when clicked', () => {
    render(<SongRating track={mockTrack} />);
    const records = screen.getAllByAltText(/rate this song \d+ records/);
    fireEvent.click(records[2]);
    expect(records[4]).toHaveClass('opacity-50');
  });

  // Test song title display with missing images
  it('displays song title when album images are missing', () => {
    const trackWithoutImages = {
      name: 'No Image Song',
      artists: [{ name: 'No Image Artist' }],
      album: { images: [] }
    };
    render(<SongRating track={trackWithoutImages} />);
    expect(screen.getByText('No Image Song')).toBeInTheDocument();
  });

  // Test artist name display with missing images
  it('displays artist name when album images are missing', () => {
    const trackWithoutImages = {
      name: 'No Image Song',
      artists: [{ name: 'No Image Artist' }],
      album: { images: [] }
    };
    render(<SongRating track={trackWithoutImages} />);
    expect(screen.getByText('No Image Artist')).toBeInTheDocument();
  });

  // Test no album images are rendered when missing
  it('does not render album images when they are missing', () => {
    const trackWithoutImages = {
      name: 'No Image Song',
      artists: [{ name: 'No Image Artist' }],
      album: { images: [] }
    };
    render(<SongRating track={trackWithoutImages} />);
    const images = screen.queryAllByRole('img');
    const albumImages = images.filter(img => img.alt === 'No Image Song');
    expect(albumImages).toHaveLength(0);
  });
}); 