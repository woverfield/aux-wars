import React from "react";

export default function HomeBtn({ style, text }) {
  return (
    <button
      className={
        style === "join"
          ? "join-btn rounded-full py-4"
          : "host-btn rounded-full py-4"
      }
    >
      <p className="text-sm md:text-base">{text}</p>
    </button>
  );
}
