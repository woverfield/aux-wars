import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DevBtn from "../components/DevBtn";
import spotifyIcon from "../images/spotify-icon.svg";
import { motion } from "framer-motion";
import AnimatedLogo from "../components/AnimatedLogo";

export default function Login() {
  const navigate = useNavigate();

  const loginWithSpotify = () => {
    navigate("/lobby");
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
              onClick={loginWithSpotify}
            >
              <img src={spotifyIcon} alt="" className="min-w-8" />
              <p className="text-sm md:text-base">Login with Spotify</p>
            </button>
          </motion.div>
        </div>
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
