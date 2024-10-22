import React from "react";
import codeIcon from "../images/code-icon.svg";
import designIcon from "../images/design-icon.svg";
import { motion } from "framer-motion";

export default function HomeBtn({ dev }) {
  if (dev === "wilson") {
    return (
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <button className="dev-btn flex rounded-full py-4 px-2 gap-1 items-center justify-center">
          <img src={codeIcon} alt="" />
          <p className="text-xs">Wilson Overfield</p>
        </button>
      </motion.div>
    );
  } else {
    return (
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <button className="dev-btn flex rounded-full py-4 px-2 gap-1 items-center justify-center">
          <img src={designIcon} alt="" />
          <p className="text-xs">Kenny Morales</p>
        </button>
      </motion.div>
    );
  }
}
