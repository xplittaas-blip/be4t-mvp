/**
 * BE4T — useSwipe hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects horizontal swipe gestures on a ref element.
 * Does NOT prevent vertical scroll — only fires when dx > dy (truly horizontal).
 *
 * Usage:
 *   const ref = useRef();
 *   useSwipe(ref, {
 *     onSwipeLeft:  () => next(),
 *     onSwipeRight: () => prev(),
 *     threshold: 40,  // px needed to register as a swipe
 *   });
 */

import { useEffect } from 'react';

export function useSwipe(ref, { onSwipeLeft, onSwipeRight, threshold = 40 } = {}) {
    useEffect(() => {
        const el = ref?.current;
        if (!el) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const onTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        };

        const onTouchEnd = (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const dt = Date.now() - startTime;

            // Only fire if horizontal intent (dx > dy) and within 500ms
            if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) || dt > 500) return;

            if (dx < 0 && onSwipeLeft)  onSwipeLeft();
            if (dx > 0 && onSwipeRight) onSwipeRight();
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend',   onTouchEnd,   { passive: true });

        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchend',   onTouchEnd);
        };
    }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}

export default useSwipe;
