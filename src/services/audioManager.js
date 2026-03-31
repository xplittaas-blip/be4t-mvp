/**
 * BE4T Global Audio Manager
 *
 * Ensures only ONE track plays at a time across all SongCards.
 * Provides fade-in effect for premium UX.
 */

let _audio = null;          // Current HTMLAudioElement
let _stopPrev = null;       // Callback to notify the previous card to reset its UI
let _fadeTimer = null;      // Interval for fade-in

const FADE_STEP = 0.06;     // Volume increment per tick
const FADE_TICK_MS = 40;    // ~25 steps to reach full volume = 1 second fade-in

export const audioManager = {
    /**
     * Play a preview URL.
     * @param {string} url - Direct audio URL (Spotify 30s preview)
     * @param {Function} onStop - Called when THIS card should reset its UI (another card started, or audio ended)
     * @returns {HTMLAudioElement} The audio element being played
     */
    play(url, onStop) {
        // 1. Stop previous audio and notify its card to reset UI
        if (_fadeTimer) { clearInterval(_fadeTimer); _fadeTimer = null; }
        if (_audio) {
            _audio.pause();
            _audio.src = '';
        }
        if (_stopPrev && _stopPrev !== onStop) {
            _stopPrev();
        }

        // 2. Create new audio with fade-in
        const audio = new Audio(url);
        audio.volume = 0;
        _audio = audio;
        _stopPrev = onStop;

        // 3. Play (handle browser autoplay policy)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('[AudioManager] Playback blocked by browser:', err.message);
                onStop(); // Reset card UI if blocked
            });
        }

        // 4. Fade in to full volume
        _fadeTimer = setInterval(() => {
            if (!_audio || _audio !== audio) { clearInterval(_fadeTimer); return; }
            audio.volume = Math.min(1, audio.volume + FADE_STEP);
            if (audio.volume >= 1) { clearInterval(_fadeTimer); _fadeTimer = null; }
        }, FADE_TICK_MS);

        // 5. Auto-reset when track ends naturally
        audio.onended = () => {
            if (_audio === audio) { _audio = null; _stopPrev = null; }
            onStop();
        };

        return audio;
    },

    /**
     * Stop current playback (e.g. when card unmounts or component teardown).
     * @param {HTMLAudioElement} audio - The audio element returned by play()
     */
    stop(audio) {
        if (_audio && _audio === audio) {
            if (_fadeTimer) { clearInterval(_fadeTimer); _fadeTimer = null; }
            _audio.pause();
            _audio.src = '';
            _audio = null;
            _stopPrev = null;
        }
    },

    /** True if the given audio element is the currently playing one */
    isCurrent(audio) {
        return _audio === audio && audio && !audio.paused;
    },
};
