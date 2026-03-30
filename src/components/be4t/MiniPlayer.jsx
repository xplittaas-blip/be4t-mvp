import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useGlobalPlayer } from '../../context/GlobalPlayerContext';
import './MiniPlayer.css';

const MiniPlayer = () => {
    const {
        currentTrack,
        isPlaying,
        progress,
        volume,
        setVolume,
        togglePlay,
        seekTo
    } = useGlobalPlayer();

    if (!currentTrack) return null;

    const handleProgressClick = (e) => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        seekTo(percent);
    };

    const handleVolumeClick = (e) => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width);
        setVolume(Math.max(0, Math.min(1, percent)));
    };

    const toggleMute = () => {
        if (volume > 0) {
            setVolume(0);
        } else {
            setVolume(1);
        }
    };

    // Calculate time display (assuming 30s preview)
    const currentTime = 30 * (progress / 100);
    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "0:00";
        const m = Math.floor(timeInSeconds / 60);
        const s = Math.floor(timeInSeconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`mini-player-container ${currentTrack ? 'visible' : ''}`}>

            <div className="mp-left">
                <img
                    src={currentTrack.cover_image || currentTrack.artist_image}
                    alt={currentTrack.title}
                    className="mp-cover"
                />
                <div className="mp-info">
                    <span className="mp-title">{currentTrack.title}</span>
                    <span className="mp-artist">{currentTrack.artist}</span>
                </div>
            </div>

            <div className="mp-center">
                <div className="mp-controls">
                    <button className="mp-btn" title="Previous preview (coming soon)">
                        <SkipBack size={20} />
                    </button>

                    <button className="mp-btn play-pause" onClick={togglePlay}>
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
                    </button>

                    <button className="mp-btn" title="Next preview (coming soon)">
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="mp-progress-wrapper">
                    <span className="mp-time">{formatTime(currentTime)}</span>
                    <div className="mp-progress-bar" onClick={handleProgressClick}>
                        <div className="mp-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="mp-time">0:30</span>
                </div>
            </div>

            <div className="mp-right">
                <button className="mp-btn" onClick={toggleMute}>
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="mp-volume-wrapper">
                    <div className="mp-volume-bar" onClick={handleVolumeClick}>
                        <div className="mp-volume-fill" style={{ width: `${volume * 100}%` }}></div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MiniPlayer;
