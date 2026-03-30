import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const GlobalPlayerContext = createContext();

export const GlobalPlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [volume, setVolume] = useState(1);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        const handleError = (e) => {
            console.error("Audio playback error", e);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    // Effect to handle play/pause sync when state changes
    useEffect(() => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.play().catch(e => {
                console.warn("Autoplay prevented or error:", e);
                setIsPlaying(false);
            });
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Effect to handle volume changes
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    const playTrack = (track) => {
        if (!track || !track.preview_url) {
            console.warn("No preview URL available for this track:", track);
            return;
        }

        const audio = audioRef.current;

        // If clicking the same track, just toggle
        if (currentTrack && currentTrack.id === track.id) {
            setIsPlaying(prev => !prev);
            return;
        }

        // New track selected
        audio.src = track.preview_url;
        setCurrentTrack(track);
        setProgress(0);
        setIsPlaying(true);
    };

    const pauseTrack = () => {
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (currentTrack) {
            setIsPlaying(prev => !prev);
        }
    };

    const seekTo = (percentage) => {
        const audio = audioRef.current;
        if (audio.duration) {
            const seekTime = (percentage / 100) * audio.duration;
            audio.currentTime = seekTime;
            setProgress(percentage);
        }
    };

    return (
        <GlobalPlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                progress,
                volume,
                setVolume,
                playTrack,
                pauseTrack,
                togglePlay,
                seekTo
            }}
        >
            {children}
        </GlobalPlayerContext.Provider>
    );
};

export const useGlobalPlayer = () => useContext(GlobalPlayerContext);
