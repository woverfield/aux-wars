import React from "react";
import AlbumsDisplay from "../components/AlbumsDisplay";
import { Outlet } from "react-router-dom";

export default function MainDisplay() {
  return (
    <div className="relative h-svh overflow-hidden">
      <AlbumsDisplay />
      <Outlet />
    </div>
  );
}
