/**
 * ConfettiBlast.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Neon confetti canvas animation — fires when a demo investment is confirmed.
 * Uses requestAnimationFrame with physics-based particles (gravity + spin).
 * Zero dependencies — pure Canvas 2D API.
 *
 * Usage:
 *   <ConfettiBlast active={txState === 'success'} duration={3500} />
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Neon palette matching BE4T brand
const COLORS = [
    '#a855f7', // violet
    '#06b6d4', // cyan
    '#10b981', // green
    '#f97316', // orange
    '#ec4899', // pink
    '#fbbf24', // gold
    '#7c3aed', // deep purple
    '#38bdf8', // sky
];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function createParticle(canvas) {
    return {
        x:     randomBetween(canvas.width * 0.2, canvas.width * 0.8),
        y:     randomBetween(-30, -80),
        vx:    randomBetween(-6, 6),
        vy:    randomBetween(2, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size:  randomBetween(5, 11),
        spin:  randomBetween(-0.15, 0.15),
        angle: randomBetween(0, Math.PI * 2),
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        alpha: 1,
        gravity: randomBetween(0.08, 0.18),
    };
}

function ConfettiCanvas({ duration = 3500 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Fit to viewport
        const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        let frame = 0;
        const startTime = performance.now();
        let rafId;

        const tick = (now) => {
            const elapsed = now - startTime;
            if (elapsed > duration + 800) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Emit bursts in first 1.5s
            if (elapsed < 1500 && frame % 3 === 0) {
                for (let i = 0; i < 8; i++) particles.push(createParticle(canvas));
            }
            // Second burst at 600ms
            if (elapsed > 600 && elapsed < 700 && frame % 2 === 0) {
                for (let i = 0; i < 12; i++) particles.push(createParticle(canvas));
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.vy   += p.gravity;
                p.x    += p.vx;
                p.y    += p.vy;
                p.angle += p.spin;
                // Fade out when near bottom or after 3s
                if (p.y > canvas.height * 0.6 || elapsed > 2500) {
                    p.alpha = Math.max(0, p.alpha - 0.018);
                }
                if (p.alpha <= 0 || p.y > canvas.height + 50) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);

                // Glow effect
                ctx.shadowColor = p.color;
                ctx.shadowBlur  = 10;
                ctx.fillStyle   = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            frame++;
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
        };
    }, [duration]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                pointerEvents: 'none',
                zIndex: 99999,
            }}
        />
    );
}

export default function ConfettiBlast({ active, duration = 3500 }) {
    if (!active) return null;
    return createPortal(<ConfettiCanvas duration={duration} />, document.body);
}
