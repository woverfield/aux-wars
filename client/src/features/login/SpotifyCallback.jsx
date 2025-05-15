import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * SpotifyCallback component handles the OAuth callback from Spotify.
 * Processes the authorization code and exchanges it for access and refresh tokens.
 * 
 * @returns {JSX.Element} Rendered component
 */
export default function SpotifyCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const error = queryParams.get("error");

    if (error) {
      console.error("Spotify authentication error:", error);
      navigate("/");
      return;
    }

    if (!code) {
      console.error("No authorization code found.");
      navigate("/");
      return;
    }

    const codeVerifier = localStorage.getItem("spotify_code_verifier");
    if (!codeVerifier) {
      console.error("Missing code verifier.");
      navigate("/");
      return;
    }

    /**
     * Fetches access and refresh tokens from Spotify using the authorization code
     */
    const fetchToken = async () => {
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

      const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      });

      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        const data = await response.json();
        if (data.error) {
          console.error("Error fetching token:", data);
          navigate("/");
        } else {
          // Calculate and store the token expiry time in milliseconds
          const expiryTime = Date.now() + data.expires_in * 1000;
          localStorage.setItem("spotify_access_token", data.access_token);
          localStorage.setItem("spotify_refresh_token", data.refresh_token);
          localStorage.setItem("spotify_token_expiry", expiryTime);
          console.log("Spotify token fetched successfully + expiry time:", data.expires_in);
          navigate("/lobby");
        }
      } catch (err) {
        console.error("Failed to fetch token:", err);
        navigate("/");
      }
    };

    fetchToken();
  }, [location, navigate]);

  return (
    <div className="spotify-callback flex items-center justify-center h-screen">
      <p>Processing Spotify authentication...</p>
    </div>
  );
}
