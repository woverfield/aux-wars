import React from "react";
import { motion } from "framer-motion";

export default function HomeBtn({ style, text }) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <button className={`${style} rounded-full py-4`}>
        <p className="text-sm md:text-base">{text}</p>
      </button>
    </motion.div>
  );
}
