import React from "react";
import { motion } from "framer-motion";

export default function AlbumRow({ albums, isOuter }) {
  return (
    <motion.div
      animate={isOuter ? { x: ["5%", "-40%"] } : { x: ["-40%", "5%"] }}
      transition={{
        duration: 100,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <div className="album-row flex gap-10">
        {albums.map((album, index) => (
          <div key={index} className="album">
            <img src={album} alt="" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
