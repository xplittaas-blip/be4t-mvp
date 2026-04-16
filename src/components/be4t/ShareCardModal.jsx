import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Link2, Twitter, MessageCircle, CheckCircle, Layers } from 'lucide-react';

// ── Canvas card renderer ──────────────────────────────────────────────────────
const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
const fmtNum = (n) => {
    if (!n || n < 1000) return String(n || 0);
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
    return (n / 1_000).toFixed(0) + 'K';
};

// Load image helper with CORS fallback
function loadImage(src) {
    return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

// Draw rounded rect helper
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
    ctx.lineTo(x,     y + r);
    ctx.quadraticCurveTo(x,     y,     x + r, y);
    ctx.closePath();
}

// Draw a fake-but-convincing QR matrix
function drawQR(ctx, x, y, size, url) {
    const cells = 21;
    const cell  = Math.floor(size / cells);
    const pad   = (size - cells * cell) / 2;

    // White bg
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    roundRect(ctx, x - 4, y - 4, size + 8, size + 8, 6);
    ctx.fill();

    ctx.fillStyle = '#090909';

    // Use URL hash as seed for deterministic pattern
    let seed = 0;
    for (let i = 0; i < url.length; i++) seed += url.charCodeAt(i);
    const lsfr = (s) => { let bit = ((s >> 0) ^ (s >> 2) ^ (s >> 3) ^ (s >> 5)) & 1; return (s >> 1) | (bit << 15); };

    let s = seed;
    for (let row = 0; row < cells; row++) {
        for (let col = 0; col < cells; col++) {
            s = lsfr(s);
            // Always draw corners (finder patterns) for authenticity
            const inTopLeft     = row < 8 && col < 8;
            const inTopRight    = row < 8 && col >= cells - 8;
            const inBottomLeft  = row >= cells - 8 && col < 8;
            let filled = s % 3 !== 0; // ~2/3 density

            if (inTopLeft || inTopRight || inBottomLeft) {
                // Draw finder pattern rings
                const inEdge = (r, c) =>
                    (r === 0 || r === 6 || c === 0 || c === 6) ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4);
                const lr = row < 8 ? row : row - (cells - 8);
                const lc = col < 8 ? col : col - (cells - 8);
                filled = inEdge(lr, lc);
            }

            if (filled) {
                ctx.fillRect(
                    x + pad + col * cell,
                    y + pad + row * cell,
                    cell, cell
                );
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
async function renderCard(canvas, opts) {
    const { holding, price, gainPct, profit, tradeLink, format } = opts;

    const W = 1080;
    const H = format === 'story' ? 1920 : 1080;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // ── 1. Background ─────────────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#0a0a12');
    bg.addColorStop(0.5, '#06060e');
    bg.addColorStop(1,   '#040408');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid (leather texture illusion)
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    const grid = 72;
    for (let x = 0; x <= W; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Glow orb — top left cyan
    const glow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 500);
    glow1.addColorStop(0,   'rgba(6,182,212,0.12)');
    glow1.addColorStop(1,   'rgba(6,182,212,0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    // Glow orb — bottom right purple
    const glow2 = ctx.createRadialGradient(W, H, 0, W, H, 600);
    glow2.addColorStop(0,   'rgba(124,58,237,0.1)');
    glow2.addColorStop(1,   'rgba(124,58,237,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // ── 2. BE4T header bar ────────────────────────────────────────────────────
    const headerY = format === 'story' ? 120 : 64;

    // Logo text
    ctx.font = 'bold 52px "Inter", "Helvetica Neue", sans-serif';
    const grad = ctx.createLinearGradient(64, 0, 340, 0);
    grad.addColorStop(0, '#7c3aed');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillText('BE4T', 64, headerY + 52);

    // "Investment Card" label
    ctx.font = '400 26px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('Investment Card', 64, headerY + 88);

    // Top-right: trade link (tiny)
    ctx.font = '400 20px "Courier New", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.6)';
    ctx.textAlign = 'right';
    ctx.fillText(tradeLink.replace('https://', ''), W - 64, headerY + 52);
    ctx.textAlign = 'left';

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(64, headerY + 110); ctx.lineTo(W - 64, headerY + 110); ctx.stroke();

    // ── 3. Cover art ──────────────────────────────────────────────────────────
    const coverSize = format === 'story' ? 420 : 300;
    const coverX    = format === 'story' ? (W - coverSize) / 2 : 64;
    const coverY    = format === 'story' ? 280 : headerY + 148;
    const coverR    = 24;

    // Load cover
    const coverImg = await loadImage(holding.coverUrl);

    // Draw cover shadow
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur  = 40;
    ctx.shadowOffsetY = 12;

    roundRect(ctx, coverX, coverY, coverSize, coverSize, coverR);
    if (coverImg) {
        ctx.save();
        roundRect(ctx, coverX, coverY, coverSize, coverSize, coverR);
        ctx.clip();
        ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
        ctx.restore();
    } else {
        // Gradient placeholder
        const cg = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
        cg.addColorStop(0, '#7c3aed');
        cg.addColorStop(1, '#06b6d4');
        ctx.fillStyle = cg;
        ctx.fill();
        // Music note icon placeholder
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `${coverSize * 0.35}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🎵', coverX + coverSize / 2, coverY + coverSize * 0.62);
        ctx.textAlign = 'left';
    }
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;
    ctx.shadowOffsetY = 0;

    // ── 4. Song info (right of cover on square, below on story) ───────────────
    const infoX = format === 'story' ? 64 : coverX + coverSize + 64;
    const infoY = format === 'story' ? coverY + coverSize + 64 : coverY;
    const infoW = format === 'story' ? W - 128 : W - infoX - 64;

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '600 22px "Inter", sans-serif';
    ctx.fillText('ACTIVO MUSICAL', infoX, infoY + 28);

    ctx.fillStyle = 'white';
    ctx.font = `bold ${format === 'story' ? 68 : 52}px "Inter", "Helvetica Neue", sans-serif`;
    // Wrap long names
    const songName = (holding.name || 'Canción').toUpperCase();
    const maxW = infoW;
    let songFontSize = format === 'story' ? 68 : 52;
    ctx.font = `bold ${songFontSize}px "Inter", sans-serif`;
    while (ctx.measureText(songName).width > maxW && songFontSize > 28) {
        songFontSize -= 2;
        ctx.font = `bold ${songFontSize}px "Inter", sans-serif`;
    }
    ctx.fillText(songName, infoX, infoY + 28 + songFontSize + 8);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = `400 ${format === 'story' ? 38 : 28}px "Inter", sans-serif`;
    ctx.fillText(holding.artist || 'Artista', infoX, infoY + 28 + songFontSize + 8 + (format === 'story' ? 56 : 42));

    const afterArtistY = infoY + 28 + songFontSize + 8 + (format === 'story' ? 56 : 42) + 60;

    // ── 5. BIG Profit Metric (Neon Green) ─────────────────────────────────────
    const profitBlockY = format === 'story' ? afterArtistY + 40 : afterArtistY;
    const profitColor  = profit >= 0 ? '#10b981' : '#ef4444';

    // Small label
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '600 21px "Courier New", monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText('PLUSVALÍA ESTIMADA', infoX, profitBlockY);
    ctx.letterSpacing = '0px';

    // Big number
    ctx.fillStyle = profitColor;
    ctx.shadowColor = profitColor;
    ctx.shadowBlur  = 28;
    const bigFontSize = format === 'story' ? 100 : 76;
    ctx.font = `900 ${bigFontSize}px "Inter", "Helvetica Neue", sans-serif`;
    const profitStr = `${profit >= 0 ? '+' : ''}${fmtUSD(profit)}`;
    ctx.fillText(profitStr, infoX, profitBlockY + bigFontSize + 12);
    ctx.shadowBlur = 0;

    // Percentage badge
    const pctStr = `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `700 ${format === 'story' ? 48 : 36}px "Inter", sans-serif`;
    ctx.fillText(pctStr, infoX, profitBlockY + bigFontSize + 12 + (format === 'story' ? 68 : 52));

    const afterProfitY = profitBlockY + bigFontSize + 12 + (format === 'story' ? 68 : 52) + 56;

    // ── 6. Stats row ──────────────────────────────────────────────────────────
    const stats = [
        { label: 'Precio de Oferta', val: fmtUSD(price),                          col: '#06b6d4' },
        { label: 'Streams',          val: '📈 ' + fmtNum(holding.spotifyStreams),   col: '#a78bfa' },
        { label: 'APY',              val: (holding.apy || 12).toFixed(1) + '%',    col: '#10b981' },
    ];
    const statW = (infoW) / 3;
    stats.forEach((s, i) => {
        const sx = infoX + i * statW;
        const sy = afterProfitY;

        // Pill bg
        roundRect(ctx, sx, sy, statW - 16, 78, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '400 18px "Inter", sans-serif';
        ctx.fillText(s.label, sx + 12, sy + 26);

        ctx.fillStyle = s.col;
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillText(s.val, sx + 12, sy + 60);
    });

    // ── 7. Bottom section (QR + disclaimer) ───────────────────────────────────
    const footerY = format === 'story' ? H - 340 : H - 220;

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(64, footerY); ctx.lineTo(W - 64, footerY); ctx.stroke();

    // QR on right
    const qrSize  = format === 'story' ? 160 : 120;
    const qrX     = W - 64 - qrSize;
    const qrY     = footerY + 28;
    drawQR(ctx, qrX, qrY, qrSize, tradeLink);

    // "Scan to invest" label
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '400 18px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to invest', qrX + qrSize / 2, qrY + qrSize + 28);
    ctx.textAlign = 'left';

    // Disclaimer left
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText('Activo digital emitido bajo normativas internacionales.', 64, footerY + 52);
    ctx.fillStyle = 'rgba(6,182,212,0.5)';
    ctx.font = '600 20px "Inter", sans-serif';
    ctx.fillText('🛡  Regulated Framework — CNAD El Salvador', 64, footerY + 84);

    // Token count
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '400 20px "Courier New", monospace';
    ctx.fillText(`${holding.fractions || '—'} fracciones  ·  be4t.ai`, 64, footerY + 118);

    // Watermark line
    const wmGrad = ctx.createLinearGradient(64, 0, W - 64, 0);
    wmGrad.addColorStop(0, '#7c3aed');
    wmGrad.addColorStop(1, '#06b6d4');
    ctx.strokeStyle = wmGrad;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(64, H - 40); ctx.lineTo(W - 64, H - 40); ctx.stroke();

    ctx.fillStyle = wmGrad;
    ctx.font = '700 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('be4t.ai  ·  La primera plataforma de regalías musicales tokenizadas', W / 2, H - 14);
    ctx.textAlign = 'left';
}

// ── ShareCardModal component ──────────────────────────────────────────────────
const ShareCardModal = ({ holding, price, gainPct, profit, tradeLink, onClose }) => {
    const canvasRef     = useRef(null);
    const [imgSrc, setImgSrc]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [format, setFormat]   = useState('square'); // 'square' | 'story'
    const [visible, setVisible] = useState(false);
    const [copied, setCopied]   = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setImgSrc(null);
            const canvas = canvasRef.current;
            if (!canvas) return;
            await renderCard(canvas, { holding, price, gainPct, profit, tradeLink, format });
            if (!cancelled) {
                setImgSrc(canvas.toDataURL('image/png', 0.92));
                setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [format]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imgSrc;
        a.download = `be4t-${holding.id || 'card'}-${format}.png`;
        a.click();
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2500);
    };

    const handleCopyLink = () => {
        navigator.clipboard?.writeText(tradeLink).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareText = `¡Acabo de poner en venta mis derechos de "${holding.name}" de ${holding.artist} en @BE4T 🚀 Capturando un +${gainPct.toFixed(1)}% de plusvalía. ¿Quién quiere ser el nuevo socio?\n${tradeLink}`;

    const content = (
        <div
            onClick={handleClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '560px',
                    background: 'linear-gradient(160deg, #0e0e18, #08080f)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '1.75rem',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                    transform: visible ? 'scale(1)' : 'scale(0.95)',
                    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    fontFamily: "'Inter', sans-serif",
                    color: 'white',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-0.03em', margin: 0 }}>
                            Tarjeta de Inversión
                        </h2>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>
                            Descarga y comparte para activar tu loop viral
                        </p>
                    </div>
                    <button onClick={handleClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0,
                    }}>
                        <X size={14} />
                    </button>
                </div>

                {/* Format Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[
                        { id: 'square', label: '◻ Post 1:1' },
                        { id: 'story',  label: '▭ Story 9:16' },
                    ].map(f => (
                        <button key={f.id} onClick={() => setFormat(f.id)} style={{
                            padding: '5px 14px', borderRadius: '100px',
                            background: format === f.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${format === f.id ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            color: format === f.id ? '#06b6d4' : 'rgba(255,255,255,0.4)',
                            fontSize: '0.68rem', fontWeight: '700', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Card Preview */}
                <div style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    aspectRatio: format === 'story' ? '9/16' : '1/1',
                    maxHeight: format === 'story' ? '420px' : '340px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', zIndex: 2, background: 'rgba(8,8,14,0.85)' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                border: '3px solid rgba(255,255,255,0.06)',
                                borderTop: '3px solid #06b6d4',
                                borderRadius: '50%',
                                animation: 'be4t-spin 0.8s linear infinite',
                            }} />
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                                Generando tu tarjeta de inversión...
                            </span>
                        </div>
                    )}
                    {imgSrc && (
                        <img
                            src={imgSrc}
                            alt="Share card preview"
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'contain',
                                opacity: loading ? 0 : 1,
                                transition: 'opacity 0.3s ease',
                            }}
                        />
                    )}
                </div>

                {/* Hidden canvas for rendering */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <button onClick={handleDownload} disabled={loading || !imgSrc} style={{
                        flex: 1.3, padding: '0.75rem',
                        background: loading ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        border: 'none', borderRadius: '12px',
                        color: loading ? 'rgba(255,255,255,0.2)' : 'white',
                        fontWeight: '800', fontSize: '0.78rem', cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                        transition: 'all 0.2s ease',
                    }}>
                        {downloaded ? <><CheckCircle size={13} /> Descargado</> : <><Download size={13} /> Descargar PNG</>}
                    </button>
                    <button onClick={handleCopyLink} style={{
                        flex: 1, padding: '0.75rem',
                        background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '12px',
                        color: copied ? '#10b981' : 'rgba(255,255,255,0.6)',
                        fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        transition: 'all 0.2s ease',
                    }}>
                        {copied ? <><CheckCircle size={13} /> Copiado</> : <><Link2 size={13} /> Copiar Link</>}
                    </button>
                </div>

                {/* Share Row */}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')} style={{
                        flex: 1, padding: '0.65rem',
                        background: 'rgba(29,161,242,0.08)', border: '1px solid rgba(29,161,242,0.2)',
                        borderRadius: '10px', color: '#1DA1F2',
                        fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,161,242,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(29,161,242,0.08)'}>
                        <Twitter size={12} /> X / Twitter
                    </button>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')} style={{
                        flex: 1, padding: '0.65rem',
                        background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)',
                        borderRadius: '10px', color: '#25D366',
                        fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.08)'}>
                        <MessageCircle size={12} /> WhatsApp
                    </button>
                    <button onClick={() => navigator.share?.({ url: tradeLink, title: `Compra mis derechos de ${holding.name}`, text: shareText })} style={{
                        flex: 1, padding: '0.65rem',
                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: '10px', color: '#a78bfa',
                        fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}>
                        <Layers size={12} /> Instagram
                    </button>
                </div>

                <style>{`
                    @keyframes be4t-spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default ShareCardModal;
