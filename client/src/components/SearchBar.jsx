import React from "react";
import searchIcon from "../assets/search-icon.svg";

/**
 * SearchBar component provides a styled search input with an icon.
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Change handler for input
 * @param {string} [props.placeholder=""] - Placeholder text for input
 * @param {boolean} [props.readOnly=false] - Whether the input is read-only
 * @returns {JSX.Element} Rendered component
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "",
  readOnly = false,
}) {
  return (
    <div className="search-area flex justify-center w-full overflow-x-auto">
      <div className="search-bar flex gap-2.5 rounded-md">
        <img src={searchIcon} alt="Search Icon" className="w-5 flex-shrink-0" />
        <input
          type="text"
          className={
            readOnly
              ? "w-full text-white opacity-50 focus:outline-none whitespace-nowrap overflow-x-auto"
              : "w-full text-white focus:outline-none"
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
