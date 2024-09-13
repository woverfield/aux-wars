import React from 'react'
import AlbumsDisplay from '../components/AlbumsDisplay';
import logo from "../images/aux-wars-logo.svg";

export default function PlayerLobby() {
    return (
        <div className="relative h-svh overflow-hidden">
            <AlbumsDisplay />
            <div className='player-lobby h-svh flex flex-col relative z-20'>
                <div className="lobby-header flex justify-around items-center">
                    <div className='lobby-header-left flex gap-2'>
                        <img src={logo} alt="" />
                        <p className="text-2xl text-white">Lobby</p>
                    </div>
                    <button className="leave-btn rounded-full py-4">
                        <p className="text-sm md:text-base">Leave Lobby</p>
                    </button>
                </div>
                <div className='lobby-body'>
                    <div className='lobby-info'>

                    </div>
                    <div className='lobby-players'>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
