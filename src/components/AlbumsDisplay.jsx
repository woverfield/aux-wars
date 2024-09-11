import React from "react";
import AlbumRow from "./AlbumRow";
import album1 from "../images/homepage-albums/album1.webp";
import album2 from "../images/homepage-albums/album2.webp";
import album3 from "../images/homepage-albums/album3.webp";
import album4 from "../images/homepage-albums/album4.webp";
import album5 from "../images/homepage-albums/album5.webp";
import album6 from "../images/homepage-albums/album6.webp";
import album7 from "../images/homepage-albums/album7.webp";
import album8 from "../images/homepage-albums/album8.webp";
import album9 from "../images/homepage-albums/album9.webp";
import album10 from "../images/homepage-albums/album10.webp";
import album11 from "../images/homepage-albums/album11.webp";
import album12 from "../images/homepage-albums/album12.webp";
import album13 from "../images/homepage-albums/album13.webp";
import album14 from "../images/homepage-albums/album14.webp";
import album15 from "../images/homepage-albums/album15.webp";
import album16 from "../images/homepage-albums/album16.webp";
import album17 from "../images/homepage-albums/album17.webp";
import album18 from "../images/homepage-albums/album18.webp";
import album19 from "../images/homepage-albums/album19.webp";
import album20 from "../images/homepage-albums/album20.webp";
import album21 from "../images/homepage-albums/album21.webp";
import album22 from "../images/homepage-albums/album22.webp";
import album23 from "../images/homepage-albums/album23.webp";
import album24 from "../images/homepage-albums/album24.webp";
import album25 from "../images/homepage-albums/album25.webp";
import album26 from "../images/homepage-albums/album26.webp";
import album27 from "../images/homepage-albums/album27.webp";

export default function AlbumsDisplay() {
  const albums = [
    album1,
    album2,
    album3,
    album4,
    album5,
    album6,
    album7,
    album8,
    album9,
    album10,
    album11,
    album12,
    album13,
    album14,
    album15,
    album16,
    album17,
    album18,
    album19,
    album20,
    album21,
    album22,
    album23,
    album24,
    album25,
    album26,
    album27,
  ];
  const firstAlbumRow = albums.slice(0, 9);
  const secondAlbumRow = albums.slice(9, 18);
  const thirdAlbumRow = albums.slice(18, 27);

  return (
    <div className="album-display h-screen absolute z-10 flex flex-col justify-center gap-16 md:gap-20">
      <AlbumRow albums={firstAlbumRow} isOuter={true} />
      <AlbumRow albums={secondAlbumRow} isOuter={false} />
      <AlbumRow albums={thirdAlbumRow} isOuter={true} />
    </div>
  );
}
