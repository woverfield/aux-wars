import React from "react";
import codeIcon from "../images/code-icon.svg";
import designIcon from "../images/design-icon.svg";

export default function HomeBtn({ dev }) {
  if (dev === "wilson") {
    return (
      <button className="dev-btn flex rounded-full py-4 px-2 gap-1 items-center justify-center">
        <img src={codeIcon} alt="" />
        <p className="text-xs">Wilson Overfield</p>
      </button>
    );
  } else {
    return (
      <button className="dev-btn flex rounded-full py-4 px-2 gap-1 items-center justify-center">
        <img src={designIcon} alt="" />
        <p className="text-xs">Kenny Morales</p>
      </button>
    );
  }
}
