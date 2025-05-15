// Test suite for main App component and login functionality
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { GameProvider } from './services/GameContext';
import { SocketProvider } from './services/SocketProvider';

// Mock navigation functionality for testing
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage for testing authentication
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Custom render function with required providers
const customRender = (ui, options) => {
  return render(
    <GameProvider>
      <SocketProvider>
        {ui}
      </SocketProvider>
    </GameProvider>,
    options
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Basic rendering test
  it('renders without crashing', () => {
    customRender(<App />);
  });

  // Test suite for login page functionality
  describe('Login Page', () => {
    // Test initial page load
    it('renders login page by default', () => {
      customRender(<App />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    // Test Spotify authentication button
    it('displays the Spotify login button', () => {
      customRender(<App />);
      expect(screen.getByText('Login with Spotify')).toBeInTheDocument();
    });

    // Test logo rendering
    it('displays the AnimatedLogo component', () => {
      customRender(<App />);
      const logo = screen.getByTestId('animated-logo');
      expect(logo).toBeInTheDocument();
    });

    // Test logo alt text
    it('has correct alt text for the logo', () => {
      customRender(<App />);
      const logo = screen.getByTestId('animated-logo');
      expect(logo).toHaveAttribute('alt', 'Aux Wars Logo');
    });

    // Test guest login option
    it('displays the guest login button', () => {
      customRender(<App />);
      expect(screen.getByText('Play As Guest')).toBeInTheDocument();
    });

    // Test help section
    it('displays the how to play link', () => {
      customRender(<App />);
      expect(screen.getByText('How to play')).toBeInTheDocument();
    });
  });
}); 