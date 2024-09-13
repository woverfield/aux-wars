import React from "react";
import logo from "../images/landing-logo.svg";
import HomeBtn from "../components/HomeBtn";
import DevBtn from "../components/DevBtn";
import AlbumsDisplay from "../components/AlbumsDisplay";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative h-svh overflow-hidden">
      <AlbumsDisplay />
      <div className="landing h-svh flex flex-col justify-around relative z-20">
        <div className="landing-top flex flex-col items-center my-10">
          <img className="landing-logo p-12" src={logo} alt="" />
          <div className="landing-join flex flex-col items-center gap-8">
            <input
              className="join-code text-center text-2xl py-3 text-white"
              type="text"
              placeholder="Enter Code"
            />
            <Link to="/lobby" className="w-full text-center">
              <HomeBtn style="join-btn" text="Join game" />
            </Link>
          </div>
        </div>
        <div className="landing-bottom flex flex-col items-center gap-1 pt-20">
          <HomeBtn style="host-btn" text="Host game" />
          <div className="dev-links flex gap-5 m-5">
            <DevBtn dev="wilson" />
            <DevBtn dev="kenny" />
          </div>
        </div>
      </div>
    </div>
  );
}
