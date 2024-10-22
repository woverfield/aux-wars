import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DevBtn from "../components/DevBtn";
import spotifyIcon from "../images/spotify-icon.svg";
import { motion } from "framer-motion";
import AnimatedLogo from "../components/AnimatedLogo";

export default function Login() {
  const CLIENT_ID = "da205d8ef838424c9d2ee0c66029fd41";
  const REDIRECT_URI = "http://localhost:3000/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tokenParams = new URLSearchParams(hash.substring(1));
      const accessToken = tokenParams.get("access_token");

      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem("access_token", accessToken);
        setConnectionSuccess(true);
      }
    }

    window.history.replaceState(null, null, " ");
  }, []);

  useEffect(() => {
    if (token) {
      setTimeout(() => {
        navigate("/lobby");
      }, 2000);
    }
  }, [token, navigate]);

  const getSpotifyToken = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;
    window.location.href = authUrl;
  };

  return (
    <>
      <div className="landing h-svh flex flex-col justify-between py-6 relative z-20">
        <div className="landing-top flex flex-col items-center my-10">
          <AnimatedLogo />
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="my-5"
          >
            <button
              className="spotify-btn rounded-full py-2 px-8 scale-125"
              onClick={getSpotifyToken}
            >
              <img src={spotifyIcon} alt="Spotify Icon" className="min-w-8" />
              <p className="text-sm md:text-base">Connect with Spotify</p>
            </button>
          </motion.div>
        </div>

        {connectionSuccess && (
          <p className="ready text-center mt-4">
            Connected to Spotify! Redirecting to the lobby...
          </p>
        )}

        <div className="landing-bottom flex flex-col items-center gap-1 pt-20">
          <div className="dev-links flex gap-5 m-5">
            <DevBtn dev="wilson" />
            <DevBtn dev="kenny" />
          </div>
        </div>
      </div>
    </>
  );
}
