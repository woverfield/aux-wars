import React from "react";
import logo from "../images/landing-logo.svg";
import { motion } from "framer-motion";

export default function AnimatedLogo() {
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <motion.img
      className="landing-logo p-12"
      src={logo}
      alt="Aux Wars Logo"
      animate={pulseAnimation}
    />
  );
}
