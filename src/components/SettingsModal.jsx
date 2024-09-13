import React from "react";
import { useEffect } from "react";

export default function SettingsModal({ showModal, onClose }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal, onClose]);

  if (!showModal) return null;

  return (
    <div className="settings-modal">
      <div className="settings">
        <div className="round-settings">
          <p className="text-xl">Nickname: </p>
          <div className="flex flex-col gap-5 sm:w-1/2 w-full">
            <input type="text" className="w-full rounded-md" />
            <div className="lobby-code-count flex gap-5">
              <div className="lobby-container rounded-md lobby-code flex flex-col gap-2">
                <p className="text-xs font-normal">Code</p>
                <p className="text-2xl ">342324</p>
              </div>
              <div className="lobby-container rounded-md lobby-count flex flex-col gap-2">
                <p className="text-xs font-normal">Players</p>
                <p className="text-2xl">4/8</p>
              </div>
            </div>
          </div>
        </div>
        <div className="misc-settings"></div>
      </div>
    </div>
  );
}
