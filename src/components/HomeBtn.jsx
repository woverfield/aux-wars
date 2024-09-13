import React from "react";

export default function HomeBtn({ style, text }) {
  return (
    <button className={`${style} rounded-full py-4`}>
      <p className="text-sm md:text-base">{text}</p>
    </button>
  );
}
