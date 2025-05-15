import React from "react";

/**
 * PromptTag component displays a selectable prompt tag with different styles for selected/unselected states.
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Text to display in the tag
 * @param {boolean} props.selected - Whether the tag is currently selected
 * @param {Function} props.onClick - Callback when the tag is clicked
 * @returns {JSX.Element} Rendered component
 */
export default function PromptTag({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1 border ${
        selected
          ? "green-btn text-white"
          : "bg-gray-700 text-white border-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
