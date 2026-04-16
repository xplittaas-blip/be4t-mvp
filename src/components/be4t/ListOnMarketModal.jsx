import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, Zap, Link2, Twitter, MessageCircle, Share2, CheckCircle, ImageIcon } from 'lucide-react';
import ShareCardModal from './ShareCardModal';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);

const formatNumber = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'K';
    return String(n);
};

// ── Market Demand Signal ──────────────────────────────────────────────────────
function getDemandSignal(streams) {
    if (!streams || streams < 1_000_000)
        return { label: 'Demanda Emergente', color: '#f97316', dot: '#f97316', detail: 'Activo en crecimiento — mayor potencial de apreciación.' };
    if (streams < 100_000_000)
        return { label: 'Alta Demanda', color: '#10b981', dot: '#10b981', detail: 'Esta canción está en el Top 200 global. Se venderá rápido.' };
    return { label: '🔥 Demanda Máxima', color: '#06b6d4', dot: '#06b6d4', detail: 'Hit consolidado con más de 100M streams. Liquidez casi inmediata.' };
}

// ── Share link generator ──────────────────────────────────────────────────────
const makeTradeLink = (id) => `https://be4t.ai/trade/${id}`;

const shareText = (holding, listPrice, gainPct) =>
    `¡Acabo de poner en venta mis derechos de "${holding.name}" de ${holding.artist} en @BE4T 🚀 Capturando un ${gainPct.toFixed(1)}% de plusvalía. ¿Quién quiere ser el nuevo socio?\n${makeTradeLink(holding.id)}`;

/**
 * ListOnMarketModal
 * Props:
 *   holding   — investment record
 *   onConfirm — (price: number) => void
 *   onClose   — () => void
 */
const ListOnMarketModal = ({ holding, onConfirm, onClose }) => {
    const suggested     = parseFloat((holding.cost * 1.15).toFixed(2));
    const [price, setPrice]     = useState(suggested);
    const [phase, setPhase]     = useState('form'); // 'form' | 'flying' | 'success'
    const [visible, setVisible] = useState(false);
    const [copied, setCopied]   = useState(false);
    const [showShareCard, setShowShareCard] = useState(false);
    const inputRef = useRef(null);

    const demand     = getDemandSignal(holding.spotifyStreams);
    const tradeLink  = makeTradeLink(holding.id);
    const profit     = price - holding.cost;
    const gainPct    = holding.cost > 0 ? (profit / holding.cost) * 100 : 0;
    const priceValid = !isNaN(price) && price > 0;

    // Mount fade-in
    useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const handleConfirm = async () => {
        if (!priceValid) return;
        setPhase('flying');
        await new Promise(r => setTimeout(r, 900));
        onConfirm(price);
        setPhase('success');
    };

    const handleCopy = () => {
        navigator.clipboard?.writeText(tradeLink).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(holding, price, gainPct))}`, '_blank');
    };
    const shareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText(holding, price, gainPct))}`, '_blank');
    };

    const content = (
        <div
            onClick={phase === 'form' ? handleClose : undefined}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '460px',
                    background: 'linear-gradient(160deg, #0e0e16, #09090f)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E"), linear-gradient(160deg, #0e0e16, #09090f)`,
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(6,182,212,0.1)',
                    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(20px)',
                    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    fontFamily: "'Inter', sans-serif",
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* ── FORM PHASE ── */}
                {phase === 'form' && (
                    <>
                        {/* Close */}
                        <button onClick={handleClose} style={{
                            position: 'absolute', top: '1.1rem', right: '1.1rem',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%', width: '30px', height: '30px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'rgba(255,255,255,0.45)',
                        }}>
                            <X size={13} />
                        </button>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                background: holding.coverUrl ? `url(${holding.coverUrl}) center/cover` : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                            }}>
                                {!holding.coverUrl && '🎵'}
                            </div>
                            <div>
                                <div style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '-0.03em' }}>{holding.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{holding.artist}</div>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.35rem' }}>
                            Poner en Mercado Secundario
                        </h2>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                            Fija el precio de venta. Tu activo aparecerá en el tablero de <strong style={{ color: '#06b6d4' }}>Premium Assets</strong> visible para toda la comunidad.
                        </p>

                        {/* ── Market Demand Badge ── */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${demand.color}33`,
                            borderRadius: '10px', padding: '0.7rem 0.9rem',
                            marginBottom: '1.25rem',
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: demand.dot, flexShrink: 0, boxShadow: `0 0 6px ${demand.dot}` }} />
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: demand.color, letterSpacing: '0.04em' }}>
                                    {demand.label}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
                                    {holding.spotifyStreams ? `${formatNumber(holding.spotifyStreams)} streams · ` : ''}{demand.detail}
                                </div>
                            </div>
                        </div>

                        {/* ── Price Input ── */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>
                                Precio de Venta (USD)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700',
                                }}>$</span>
                                <input
                                    ref={inputRef}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                                    style={{
                                        width: '100%', padding: '0.85rem 1rem 0.85rem 1.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${priceValid ? 'rgba(6,182,212,0.35)' : 'rgba(239,68,68,0.35)'}`,
                                        borderRadius: '12px', color: 'white',
                                        fontSize: '1.3rem', fontWeight: '800',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        fontFamily: "'Courier New', monospace",
                                        transition: 'border-color 0.2s ease',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                {[0, 10, 20, 30].map(pct => {
                                    const p = parseFloat((holding.cost * (1 + pct / 100)).toFixed(2));
                                    return (
                                        <button key={pct} onClick={() => setPrice(p)} style={{
                                            padding: '2px 9px', borderRadius: '100px', fontSize: '0.62rem', fontWeight: '700',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: Math.abs(price - p) < 0.1 ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                                            color: Math.abs(price - p) < 0.1 ? '#06b6d4' : 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer', transition: 'all 0.15s ease',
                                        }}>
                                            {pct === 0 ? 'Par' : `+${pct}%`}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Profit Calculator ── */}
                        <div style={{
                            background: profit >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                            border: `1px solid ${profit >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            borderRadius: '12px', padding: '0.9rem 1rem',
                            marginBottom: '1.5rem',
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem',
                        }}>
                            {[
                                { label: 'Comprado a', value: fmtUSD(holding.cost), color: 'rgba(255,255,255,0.7)' },
                                { label: 'Plusvalía neta', value: (profit >= 0 ? '+' : '') + fmtUSD(profit), color: profit >= 0 ? '#10b981' : '#ef4444' },
                                { label: 'Ganancia %', value: (gainPct >= 0 ? '+' : '') + gainPct.toFixed(1) + '%', color: gainPct >= 0 ? '#10b981' : '#ef4444' },
                            ].map(item => (
                                <div key={item.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: item.color, fontFamily: "'Courier New', monospace" }}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* ── Buttons ── */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleClose} style={{
                                flex: 1, padding: '0.8rem',
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'rgba(255,255,255,0.55)',
                                fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!priceValid}
                                style={{
                                    flex: 1.6, padding: '0.8rem',
                                    background: priceValid
                                        ? 'linear-gradient(135deg, #0e7490, #06b6d4)'
                                        : 'rgba(255,255,255,0.06)',
                                    border: 'none',
                                    borderRadius: '12px', color: priceValid ? 'white' : 'rgba(255,255,255,0.2)',
                                    fontWeight: '800', fontSize: '0.82rem',
                                    cursor: priceValid ? 'pointer' : 'not-allowed',
                                    boxShadow: priceValid ? '0 4px 20px rgba(6,182,212,0.3)' : 'none',
                                    transition: 'all 0.2s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                }}
                                onMouseEnter={e => { if (priceValid) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(6,182,212,0.45)'; }}}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = priceValid ? '0 4px 20px rgba(6,182,212,0.3)' : 'none'; }}
                            >
                                <TrendingUp size={14} /> Publicar en Mercado
                            </button>
                        </div>
                    </>
                )}

                {/* ── FLYING PHASE ── */}
                {phase === 'flying' && (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            animation: 'be4t-flyout 0.9s cubic-bezier(0.4,0,0.2,1) forwards',
                            display: 'inline-block',
                            marginBottom: '1rem',
                        }}>
                            🎵
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
                            Publicando tu activo...
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                            Transfiriendo a la vitrina de Premium Assets
                        </div>
                    </div>
                )}

                {/* ── SUCCESS PHASE ── */}
                {phase === 'success' && (
                    <>
                        {/* Glow accent */}
                        <div style={{
                            position: 'absolute', top: '-40px', right: '-40px',
                            width: '160px', height: '160px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '56px', height: '56px', margin: '0 auto 1rem',
                                background: 'rgba(6,182,212,0.1)', border: '2px solid rgba(6,182,212,0.35)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem',
                                animation: 'be4t-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                            }}>✓</div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.35rem' }}>
                                ¡Activo Publicado!
                            </h2>
                            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem', lineHeight: 1.6 }}>
                                Tus derechos de <strong style={{ color: 'white' }}>"{holding.name}"</strong> ya están en la vitrina de Premium Assets por{' '}
                                <strong style={{ color: '#06b6d4' }}>{fmtUSD(price)}</strong>.
                            </p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', padding: '2px 10px', fontSize: '0.62rem', color: '#10b981', fontWeight: '700' }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'be4t-nav-pulse 1.5s infinite' }} />
                                Plusvalía estimada: +{gainPct.toFixed(1)}%
                            </div>
                        </div>

                        {/* ── Share link ── */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '12px', padding: '0.85rem 1rem',
                            marginBottom: '1rem',
                        }}>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                                Link de oferta — comparte para vender rápido
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <code style={{
                                    flex: 1, fontSize: '0.72rem', color: '#06b6d4',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    fontFamily: "'Courier New', monospace",
                                }}>
                                    {tradeLink}
                                </code>
                                <button onClick={handleCopy} style={{
                                    flexShrink: 0, padding: '4px 10px',
                                    background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.1)',
                                    border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(6,182,212,0.25)'}`,
                                    borderRadius: '8px', cursor: 'pointer',
                                    color: copied ? '#10b981' : '#06b6d4', fontSize: '0.65rem', fontWeight: '700',
                                    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '4px',
                                }}>
                                    {copied ? <CheckCircle size={11} /> : <Link2 size={11} />}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>
                        </div>

                        {/* ── Share Buttons ── */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>
                                Comparte y activa tu loop viral
                            </div>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                <button onClick={shareTwitter} style={{
                                    flex: 1, padding: '0.65rem 0.5rem',
                                    background: 'rgba(29,161,242,0.08)', border: '1px solid rgba(29,161,242,0.2)',
                                    borderRadius: '10px', color: '#1DA1F2',
                                    fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,161,242,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(29,161,242,0.08)'}
                                >
                                    <Twitter size={13} /> X (Twitter)
                                </button>
                                <button onClick={shareWhatsApp} style={{
                                    flex: 1, padding: '0.65rem 0.5rem',
                                    background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)',
                                    borderRadius: '10px', color: '#25D366',
                                    fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.08)'}
                                >
                                    <MessageCircle size={13} /> WhatsApp
                                </button>
                                <button onClick={() => { navigator.share?.({ url: tradeLink, title: `Compra mis derechos de ${holding.name}` }); }} style={{
                                    flex: 1, padding: '0.65rem 0.5rem',
                                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                                    borderRadius: '10px', color: '#a78bfa',
                                    fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                >
                                    <Share2 size={13} /> Más
                                </button>
                            </div>
                        </div>

                        {/* Copy suggestion */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '10px', padding: '0.75rem 0.9rem', marginBottom: '1.25rem',
                        }}>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                                Copy sugerido
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                                "¡Acabo de poner en venta mis derechos de <strong style={{ color: 'white' }}>"{holding.name}"</strong> de {holding.artist} en @BE4T 🚀 Capturando un <strong style={{ color: '#10b981' }}>+{gainPct.toFixed(1)}%</strong> de plusvalía. ¿Quién quiere ser el nuevo socio?"
                            </p>
                        </div>

                        {/* Primary CTA — Share Card */}
                        <button
                            onClick={() => setShowShareCard(true)}
                            style={{
                                width: '100%', padding: '0.9rem',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                                backgroundSize: '200% auto',
                                border: 'none', borderRadius: '12px', color: 'white',
                                fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                                boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                                marginBottom: '0.6rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'all 0.25s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundPosition = 'right center'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.6)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundPosition = 'left center'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.4)'; }}
                        >
                            🖼 Generar Tarjeta Viral →
                        </button>
                        <button onClick={handleClose} style={{
                            width: '100%', padding: '0.7rem',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px', color: 'rgba(255,255,255,0.35)',
                            fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer',
                        }}>
                            Ver en Premium Assets →
                        </button>
                    </>
                )}

                <style>{`
                    @keyframes be4t-flyout {
                        0%   { transform: translate(0,0) scale(1); opacity:1; }
                        60%  { transform: translate(80px,-30px) scale(0.7) rotate(12deg); opacity:0.7; }
                        100% { transform: translate(160px,-80px) scale(0.3) rotate(25deg); opacity:0; }
                    }
                    @keyframes be4t-pop {
                        0%   { transform: scale(0.5); opacity:0; }
                        100% { transform: scale(1);   opacity:1; }
                    }
                `}</style>
            </div>
        </div>
    );

    return (
        <>
            {createPortal(content, document.body)}
            {showShareCard && (
                <ShareCardModal
                    holding={holding}
                    price={price}
                    gainPct={gainPct}
                    profit={profit}
                    tradeLink={tradeLink}
                    onClose={() => setShowShareCard(false)}
                />
            )}
        </>
    );
};

export default ListOnMarketModal;
