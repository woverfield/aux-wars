import React, { useEffect, useRef } from 'react'
import record from '../assets/record.svg'
import { useState } from 'react';
import SearchBar from './SearchBar';
import { 
    initializeSpotifyPlayer, 
    playSpotifyTrack, 
    pauseSpotifyPlayback
} from '../services/spotifyApi';

/**
 * SongRating component displays a song for rating and provides playback controls.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.track - Spotify track object containing song details
 * @param {string} props.prompt - Current game prompt
 * @returns {JSX.Element} Rendered component
 */
export default function SongRating({ track, prompt }) {
    // Get album cover URL from track object, with fallbacks
    const albumCover =
        track.album?.images?.[1]?.url ||
        track.album?.images?.[0]?.url ||
        null;

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [deviceId, setDeviceId] = useState(null);
    const playerRef = useRef(null);

    // Initialize Spotify player on component mount
    useEffect(() => {
        let mounted = true;
        async function setupPlayer() {
            try {
                console.log('Initializing Spotify Player...');
                const { player, deviceId } = await initializeSpotifyPlayer();
                if (!mounted) return;
                playerRef.current = player;
                setDeviceId(deviceId);
                console.log('Spotify Player initialized:', player, deviceId);
                player.addListener('ready', ({ device_id }) => {
                    console.log('Player is ready with device_id:', device_id);
                });
                player.addListener('not_ready', () => {
                    console.log('Player is not ready');
                });
                player.addListener('player_state_changed', (state) => {
                    setIsPlaying(state && !state.paused);
                    console.log('Player state changed:', state);
                });
            } catch (err) {
                console.error('Error initializing Spotify Player:', err);
            }
        }
        setupPlayer();
        return () => { mounted = false; };
    }, []);

    /**
     * Handles rating selection by index
     * @param {number} index - Selected rating index (0-4)
     */
    const handleClick = (index) => {
        setSelectedIndex(index);
    };

    /**
     * Toggles play/pause state for the current track
     */
    const handlePlayPause = async () => {
        console.log('Play/Pause clicked. deviceId:', deviceId, 'track.uri:', track.uri, 'isPlaying:', isPlaying);
        if (!deviceId || !track.uri) {
            console.warn('Cannot play/pause: deviceId or track.uri missing');
            return;
        }
        try {
            if (!isPlaying) {
                console.log('Attempting to play track:', track.uri, 'on device:', deviceId);
                await playSpotifyTrack(track.uri, deviceId);
                setIsPlaying(true);
            } else {
                console.log('Attempting to pause playback on device:', deviceId);
                await pauseSpotifyPlayback(deviceId);
                setIsPlaying(false);
            }
        } catch (err) {
            console.error('Error in play/pause:', err);
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen box-border pt-4 pb-24 px-2 sm:pt-8 sm:pb-32 overflow-y-auto">
            {/* Prompt display */}
            <div className="w-full max-w-2xl mx-auto mb-4">
                <SearchBar value={prompt || ''} readOnly onChange={() => {}} />
            </div>
            
            {/* Album cover */}
            {albumCover && (
                <img
                    src={albumCover}
                    alt={track.name}
                    className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-lg shadow-md object-cover mb-2"
                    style={{ maxWidth: '80vw', maxHeight: '30vh' }}
                />
            )}
            
            {/* Play/Pause controls */}
            <button
                className="mb-2 px-6 py-2 rounded-full bg-[#1db954] text-white font-bold text-lg flex items-center gap-2 shadow hover:bg-[#1ed760] transition-all"
                onClick={handlePlayPause}
                disabled={!deviceId || !track.uri}
                style={{ minWidth: 120 }}
            >
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25l13.5 6.75-13.5 6.75V5.25z" />
                    </svg>
                )}
                {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            {/* Track information */}
            <div className="flex flex-col justify-center items-center mt-3">
                <p className="text-xl sm:text-2xl font-semibold mt-2.5 text-white text-center max-w-[90vw] truncate">{track.name}</p>
                <p className="text-sm text-gray-300 mb-5 text-center max-w-[90vw] truncate">
                    {track.artists.map((a) => a.name).join(", ")}
                </p>
            </div>
            
            {/* Rating system */}
            <div className="flex flex-row justify-center items-center mb-6">
                {[...Array(5)].map((_, index) => (
                    <img
                        key={index}
                        src={record}
                        alt={`rate this song ${index + 1} records`}
                        className={`w-[32px] sm:w-[40px] m-1 sm:m-1.5 cursor-pointer transition-all duration-300 hover:scale-110 ${
                            index <= selectedIndex ? "opacity-100" : "opacity-50"
                            }`}
                        onClick={() => handleClick(index)}
                    />
                ))}
            </div>
            
            {/* Submit button */}
            <div className="fixed left-0 right-0 bottom-0 flex justify-center pb-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                <button className="bg-[#68d570] text-black font-bold w-full max-w-xs h-[45px] rounded-full cursor-pointer transition-all hover:scale-105 hover:bg-[#7de884]">
                    Submit
                </button>
            </div>
        </div>
    )
}
