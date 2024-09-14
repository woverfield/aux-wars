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
    <>
      <div className="settings-modal">
        <div className="settings container mx-auto p-5 mt-32">
          <div className="round-settings">
            <p className="text-md font-semibold">Number of Rounds: </p>
            <div className="flex flex-col gap-5 sm:w-1/2 w-full">
              <input type="text" className="w-full rounded-md" />
              <p className="text-md font-semibold">Round Length: </p>
              <div className="round-lengths grid grid-cols-2 gap-5 text-center font-normal text-xl">
                <button>
                  <div className="round-container rounded-md">
                    <p className="">15 sec</p>
                  </div>
                </button>
                <button>
                  <div className="round-container rounded-md">
                    <p className="">30 sec</p>
                  </div>
                </button>
                <button>
                  <div className="round-container rounded-md">
                    <p className="">1 min</p>
                  </div>
                </button>
                <button>
                  <div className="round-container rounded-md">
                    <p className="">2 min</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className="fixed bottom-0 w-full font-normal text-white py-10"
        onClick={onClose}
      >
        <p className="text-center">close</p>
      </button>
    </>
  );
}
