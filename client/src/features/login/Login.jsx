import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import spotifyIcon from "../../assets/spotify-icon.svg";
import AnimatedLogo from "../../components/AnimatedLogo";
import HomeBtn from "../../components/HomeBtn";
import HowToPlayModal from "../../components/HowToPlayModal";
import DevBtn from "../../components/DevBtn";
import {
  generateRandomString,
  generateCodeChallenge,
} from "../../services/spotifyAuth";
import { isTokenValid } from "../../services/spotifyApi";

/**
 * Login component handles user authentication with Spotify.
 * Provides option to login with Spotify.
 * 
 * @returns {JSX.Element} Rendered component
 */
export default function Login() {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    // Check token validity on mount
    if (isTokenValid()) {
      console.log("Access token is valid. Navigating to lobby...");
      navigate("/lobby");
    }
  }, [navigate]);

  /**
   * Handles user login with Spotify
   */
  const handleLogin = async () => {
    // 1) If the token in localStorage is still valid, go to lobby immediately
    if (isTokenValid()) {
      console.log("Access token still valid. Navigating to lobby...");
      navigate("/lobby");
      return;
    }

    // 2) If we reach here, token is missing or expired. Clear stale data.
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiry");

    // 3) Proceed with the Spotify auth flow
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    // Required scopes for playback and device control
    const scope = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-library-read",
      "user-library-modify"
    ].join(" ");
    console.log('Spotify auth scope:', scope);

    const codeVerifier = generateRandomString(128);
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(16);

    // Construct the Spotify login URL
    const authUrl = `https://accounts.spotify.com/authorize
?response_type=code
&client_id=${clientId}
&redirect_uri=${encodeURIComponent(redirectUri)}
&scope=${encodeURIComponent(scope)}
&state=${state}
&code_challenge_method=S256
&code_challenge=${codeChallenge}`;

    // 4) Redirect user to Spotify's authorization page
    window.location.href = authUrl;
  };

  return (
    <div data-testid="login-page" className="login h-screen flex flex-col justify-between py-6">
      <div className="login-top flex flex-col items-center gap-10 my-10">
        <AnimatedLogo />
        <div className="login-btns flex flex-col items-center gap-10 w-full max-w-xs">
          <HomeBtn
            onClick={handleLogin}
            className="spotify-btn"
            icon={spotifyIcon}
            text="Login with Spotify"
            padding="py-3 px-6"
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 pb-6">
        <button 
          onClick={() => setShowHowToPlay(true)}
          className="text-sm md:text-base text-white hover:underline transition-colors"
        >
          How to play
        </button>
        <div className="dev-links">
          <DevBtn />
        </div>
      </div>

      <HowToPlayModal 
        showModal={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
}
