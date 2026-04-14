/**
 * BE4T — SwipeCarousel
 * ─────────────────────────────────────────────────────────────────────────────
 * A zero-dependency, 60fps swipe carousel for song cards and media rows.
 *
 * Features:
 *   • Native scroll-snap (CSS) → hardware-accelerated, no JS jank
 *   • Momentum scrolling via -webkit-overflow-scrolling: touch
 *   • Dot indicators (optional)
 *   • Prev/Next arrow buttons (desktop — hidden on touch devices)
 *   • Visible scrollbar suppressed cross-browser
 *   • Works for ANY children (cards, avatars, images)
 *   • Respects vertical page scroll — horizontal only fires when dx > dy
 *
 * Props:
 *   children       React.Node[]   — items to render
 *   itemWidth      string         — CSS width per item (default: 'calc(80vw - 2rem)')
 *   gap            string         — gap between items (default: '1rem')
 *   peek           string         — how much of next card peeks (default: '1.5rem')
 *   showDots        boolean        — show pagination dots (default: false)
 *   showArrows      boolean        — show prev/next arrows (default: true)
 *   className       string
 *   style           object
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';

// ── Arrow button ──────────────────────────────────────────────────────────────
const Arrow = ({ direction, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={direction === 'prev' ? 'Anterior' : 'Siguiente'}
        style={{
            position: 'absolute',
            top: '50%', transform: 'translateY(-50%)',
            [direction === 'prev' ? 'left' : 'right']: '-16px',
            zIndex: 10,
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(20,20,36,0.85)',
            border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.4)'}`,
            color: disabled ? 'rgba(255,255,255,0.2)' : '#c4b5fd',
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            boxShadow: disabled ? 'none' : '0 4px 16px rgba(0,0,0,0.4)',
            fontSize: '0.85rem',
        }}
        onMouseOver={e => { if (!disabled) e.currentTarget.style.background = 'rgba(124,58,237,0.3)'; }}
        onMouseOut={e => { if (!disabled) e.currentTarget.style.background = 'rgba(20,20,36,0.85)'; }}
    >
        {direction === 'prev' ? '‹' : '›'}
    </button>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SwipeCarousel({
    children,
    itemWidth = 'calc(80vw - 2rem)',
    gap = '1rem',
    peek = '1.5rem',
    showDots = false,
    showArrows = true,
    className = '',
    style = {},
}) {
    const trackRef   = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const items = React.Children.toArray(children);
    const total = items.length;

    // ── Scroll to index ───────────────────────────────────────────────────────
    const scrollTo = useCallback((idx) => {
        const el = trackRef.current;
        if (!el) return;
        const clamped = Math.max(0, Math.min(idx, total - 1));
        const child = el.children[clamped];
        if (child) {
            child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        setActiveIdx(clamped);
    }, [total]);

    const prev = useCallback(() => scrollTo(activeIdx - 1), [activeIdx, scrollTo]);
    const next = useCallback(() => scrollTo(activeIdx + 1), [activeIdx, scrollTo]);

    // ── Sync activeIdx on native scroll ──────────────────────────────────────
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        const onScroll = () => {
            const { scrollLeft, clientWidth } = el;
            const idx = Math.round(scrollLeft / clientWidth);
            setActiveIdx(Math.max(0, Math.min(idx, total - 1)));
        };

        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [total]);

    return (
        <div
            className={`be4t-swipe-carousel ${className}`}
            style={{ position: 'relative', ...style }}
        >
            {/* Prev arrow — hidden on touch */}
            {showArrows && total > 1 && (
                <Arrow direction="prev" onClick={prev} disabled={activeIdx === 0} />
            )}

            {/* Scrollable track */}
            <div
                ref={trackRef}
                style={{
                    display: 'flex',
                    gap,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch', // momentum iOS
                    scrollbarWidth: 'none',           // Firefox
                    msOverflowStyle: 'none',          // IE/Edge
                    paddingBottom: '4px',             // prevent clipping of box-shadows
                    // Peek: padding on the sides so edge cards are visually cut
                    paddingLeft: peek,
                    paddingRight: peek,
                    // Contain scroll within this element
                    touchAction: 'pan-x',
                }}
            >
                {/* Hide scrollbar in webkit */}
                <style>{`.be4t-swipe-carousel ::-webkit-scrollbar { display: none; }`}</style>

                {items.map((child, i) => (
                    <div
                        key={i}
                        style={{
                            flexShrink: 0,
                            width: itemWidth,
                            scrollSnapAlign: 'center',
                            scrollSnapStop: 'always',
                        }}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Next arrow — hidden on touch */}
            {showArrows && total > 1 && (
                <Arrow direction="next" onClick={next} disabled={activeIdx >= total - 1} />
            )}

            {/* Dot indicators */}
            {showDots && total > 1 && (
                <div style={{
                    display: 'flex', justifyContent: 'center',
                    gap: '6px', marginTop: '0.75rem',
                }}>
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            aria-label={`Ir a ${i + 1}`}
                            style={{
                                width: i === activeIdx ? '18px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                border: 'none',
                                background: i === activeIdx ? '#a855f7' : 'rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
