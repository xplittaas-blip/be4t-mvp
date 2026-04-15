import React, { useState, useMemo, useEffect } from 'react';
import { useDemoBalance } from '../hooks/useDemoBalance';
import { isShowcase } from '../core/env';

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);
const fmtPct = (v) => `${v >= 0 ? '+' : ''}${Number(v).toFixed(1)}%`;

// ── Palette ───────────────────────────────────────────────────────────────────
const PURPLE = '#8b5cf6';
const CYAN   = '#06b6d4';
const GREEN  = '#10b981';
const RED    = '#ef4444';
const ORANGE = '#f97316';

// ── Generate deterministic sparkline data ─────────────────────────────────────
function genSparkline(seed, trend = 'up', points = 20) {
    let v = 100;
    const arr = [];
    for (let i = 0; i < points; i++) {
        const rng = Math.sin(seed * 9.301 + i * 4.732) * 0.5 + 0.5;
        const drift = trend === 'up' ? 0.6 : trend === 'down' ? -0.4 : 0.1;
        v += (rng - 0.5 + drift * 0.1) * 5;
        arr.push(Math.max(10, v));
    }
    return arr;
}

// ── Sparkline SVG component ───────────────────────────────────────────────────
function Sparkline({ data, color = GREEN, width = 80, height = 32 }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 2;
    const points = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (width - pad * 2);
        const y = height - pad - ((v - min) / range) * (height - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const last = data[data.length - 1];
    const first = data[0];
    const positiveTrend = last >= first;
    const lineColor = positiveTrend ? GREEN : RED;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                fill="none"
                stroke={lineColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ── Mock external listings ────────────────────────────────────────────────────
const MOCK_SELLERS = [
    {
        id: 'mock-1',
        name: 'Tusa',
        artist: 'Karol G ft. Nicki Minaj',
        coverUrl: null,
        seller: '0x3F8...2aE',
        fractions: 8,
        originalCost: 800,
        listPrice: 1020,
        apy: 22,
        risk: 'BLUE_CHIP',
        trend: 'up',
        seed: 11,
    },
    {
        id: 'mock-2',
        name: 'Hawái',
        artist: 'Maluma',
        coverUrl: null,
        seller: 'DJ_Miami',
        fractions: 15,
        originalCost: 1500,
        listPrice: 1875,
        apy: 18,
        risk: 'EMERGING',
        trend: 'up',
        seed: 29,
    },
    {
        id: 'mock-3',
        name: 'Pepas',
        artist: 'Farruko',
        coverUrl: null,
        seller: 'User429',
        fractions: 5,
        originalCost: 600,
        listPrice: 570,
        apy: 26,
        risk: 'EMERGING',
        trend: 'down',
        seed: 47,
    },
    {
        id: 'mock-4',
        name: 'Bandido',
        artist: 'Jhay Cortez',
        coverUrl: null,
        seller: 'Inversor_Pro',
        fractions: 20,
        originalCost: 2000,
        listPrice: 2600,
        apy: 14,
        risk: 'BLUE_CHIP',
        trend: 'up',
        seed: 63,
    },
    {
        id: 'mock-5',
        name: 'Dakiti',
        artist: 'Bad Bunny ft. Jhay Cortez',
        coverUrl: null,
        seller: 'CryptoFan88',
        fractions: 3,
        originalCost: 450,
        listPrice: 490,
        apy: 30,
        risk: 'EMERGING',
        trend: 'up',
        seed: 81,
    },
];

// ── Buy Modal ─────────────────────────────────────────────────────────────────
function BuyModal({ listing, balance, onConfirm, onClose }) {
    const canAfford = balance >= listing.listPrice;
    const premium = ((listing.listPrice - listing.originalCost) / listing.originalCost) * 100;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'rgba(14,10,30,0.98)',
                    border: '1px solid rgba(139,92,246,0.35)',
                    borderRadius: '24px', padding: '2rem',
                    maxWidth: '440px', width: '100%',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.15)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ fontSize: '0.62rem', color: CYAN, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.25rem' }}>
                    ⚡ Compra Secundaria — P2P
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
                    {listing.name}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                    {listing.artist} · Vendido por <span style={{ color: CYAN }}>{listing.seller}</span>
                </p>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Precio de Compra</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: CYAN }}>{fmtUSD(listing.listPrice)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>vs. Precio Original</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: premium >= 0 ? ORANGE : GREEN }}>
                            {fmtPct(premium)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tokens Incluidos</div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>{listing.fractions} tokens</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>APY del Activo</div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: GREEN }}>{listing.apy}%</div>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: canAfford ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${canAfford ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: '10px', fontSize: '0.78rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Tu saldo: </span>
                    <span style={{ color: canAfford ? GREEN : RED, fontWeight: '800' }}>{fmtUSD(balance)}</span>
                    {!canAfford && <span style={{ color: RED, marginLeft: '8px' }}>— Saldo insuficiente</span>}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose}
                        style={{ flex: 1, padding: '0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', cursor: 'pointer' }}
                    >Cancelar</button>
                    <button
                        disabled={!canAfford || !isShowcase}
                        onClick={() => canAfford && onConfirm(listing)}
                        style={{
                            flex: 2, padding: '0.875rem',
                            background: canAfford ? `linear-gradient(135deg, ${PURPLE}, ${CYAN})` : 'rgba(255,255,255,0.05)',
                            border: 'none', borderRadius: '12px',
                            color: canAfford ? 'white' : 'rgba(255,255,255,0.25)',
                            fontWeight: '800', fontSize: '0.9rem',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            boxShadow: canAfford ? '0 4px 20px rgba(139,92,246,0.4)' : 'none',
                        }}
                    >
                        {canAfford ? '⚡ Comprar a Fan' : '💸 Saldo Insuficiente'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, onBuy }) {
    const [hovered, setHovered] = useState(false);
    const sparkData = useMemo(() => genSparkline(listing.seed || Math.random() * 100, listing.trend || 'up'), [listing.seed, listing.trend]);
    const premium = ((listing.listPrice - listing.originalCost) / listing.originalCost) * 100;
    const isPositive = premium >= 0;
    const monthlyRoy = (listing.listPrice * (listing.apy / 100) / 12);
    const isUserListing = listing.seller === 'Tú';

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'rgba(12,10,26,0.95)',
                border: `1px solid ${hovered
                    ? (isUserListing ? 'rgba(6,182,212,0.6)' : 'rgba(139,92,246,0.45)')
                    : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '20px', overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.25,0.8,0.25,1)',
                transform: hovered ? 'translateY(-5px)' : 'none',
                boxShadow: hovered
                    ? (isUserListing ? '0 16px 48px rgba(6,182,212,0.15)' : '0 16px 48px rgba(139,92,246,0.2)')
                    : '0 4px 24px rgba(0,0,0,0.4)',
            }}
        >
            {/* Header gradient band */}
            <div style={{
                height: '4px',
                background: isUserListing
                    ? `linear-gradient(90deg, ${CYAN}, ${PURPLE})`
                    : (isPositive ? `linear-gradient(90deg, ${PURPLE}, ${GREEN})` : `linear-gradient(90deg, ${ORANGE}, ${RED})`),
            }} />

            <div style={{ padding: '1.25rem' }}>
                {/* Top row: song info + seller tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {listing.name}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', margin: '0.2rem 0 0' }}>
                            {listing.artist}
                        </p>
                    </div>
                    <span style={{
                        flexShrink: 0, marginLeft: '0.75rem',
                        fontSize: '0.6rem', fontWeight: '800',
                        background: isUserListing ? 'rgba(6,182,212,0.15)' : 'rgba(139,92,246,0.1)',
                        border: `1px solid ${isUserListing ? 'rgba(6,182,212,0.4)' : 'rgba(139,92,246,0.25)'}`,
                        color: isUserListing ? CYAN : '#c4b5fd',
                        borderRadius: '100px', padding: '3px 9px',
                        letterSpacing: '0.5px',
                    }}>
                        {isUserListing ? '📌 Tu Listing' : `👤 ${listing.seller}`}
                    </span>
                </div>

                {/* Financial terminal block */}
                <div style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', overflow: 'hidden',
                    marginBottom: '1rem',
                }}>
                    {/* Row 1: Price + premium */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ padding: '0.65rem 0.85rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '3px' }}>Precio Venta</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: CYAN, letterSpacing: '-0.03em' }}>{fmtUSD(listing.listPrice)}</div>
                        </div>
                        <div style={{ padding: '0.65rem 0.85rem' }}>
                            <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '3px' }}>vs. Original</div>
                            <div style={{ fontSize: '1rem', fontWeight: '800', color: isPositive ? ORANGE : GREEN }}>{fmtPct(premium)}</div>
                        </div>
                    </div>

                    {/* Row 2: APY + Monthly + Sparkline */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '2px' }}>APY Actual</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: GREEN, letterSpacing: '-0.04em', textShadow: `0 0 12px ${GREEN}55` }}>{listing.apy}%</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '2px' }}>Regalías/Mes</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: GREEN }}>{fmtUSD(monthlyRoy)}</div>
                        </div>
                        {/* Sparkline */}
                        <div style={{ flexShrink: 0 }}>
                            <Sparkline data={sparkData} width={72} height={28} />
                        </div>
                    </div>

                    {/* Row 3: Fractions + Risk */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.5rem 0.85rem' }}>
                        <div>
                            <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '2px' }}>Lote</div>
                            <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>{listing.fractions} tokens</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '2px' }}>Tier</div>
                            <span style={{
                                fontSize: '0.58rem', fontWeight: '800',
                                color: listing.risk === 'BLUE_CHIP' ? CYAN : '#fbbf24',
                                border: `1px solid ${listing.risk === 'BLUE_CHIP' ? 'rgba(6,182,212,0.35)' : 'rgba(251,191,36,0.35)'}`,
                                borderRadius: '100px', padding: '2px 8px',
                                background: listing.risk === 'BLUE_CHIP' ? 'rgba(6,182,212,0.08)' : 'rgba(251,191,36,0.08)',
                            }}>
                                {listing.risk === 'BLUE_CHIP' ? 'BLUE CHIP' : 'EMERGING'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                {!isUserListing ? (
                    <button
                        onClick={() => onBuy(listing)}
                        style={{
                            width: '100%', padding: '0.8rem',
                            background: `linear-gradient(135deg, ${PURPLE} 0%, #a855f7 50%, ${CYAN} 100%)`,
                            backgroundSize: '200% auto',
                            border: 'none', borderRadius: '12px',
                            color: 'white', fontWeight: '800', fontSize: '0.85rem',
                            cursor: 'pointer', transition: 'all 0.3s ease',
                            boxShadow: '0 4px 18px rgba(124,58,237,0.4)',
                        }}
                        onMouseOver={e => { e.currentTarget.style.backgroundPosition = 'right center'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundPosition = 'left center'; e.currentTarget.style.transform = 'none'; }}
                    >
                        ⚡ Comprar a Fan
                    </button>
                ) : (
                    <div style={{
                        width: '100%', padding: '0.65rem', textAlign: 'center',
                        background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                        borderRadius: '12px', fontSize: '0.75rem', color: CYAN, fontWeight: '700',
                    }}>
                        🛒 Tu activo está en venta — espera a un comprador
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Stats Header ──────────────────────────────────────────────────────────────
function MarketStat({ label, value, color = 'white' }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '0.85rem 1.1rem',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{label}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '900', color, letterSpacing: '-0.03em' }}>{value}</div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const SecondaryMarket = ({ onNavigate }) => {
    const { balance, portfolio, acquire } = useDemoBalance();
    const [buyTarget, setBuyTarget]       = useState(null);
    const [successMsg, setSuccessMsg]     = useState('');
    const [sortBy, setSortBy]             = useState('premium');
    const [filterRisk, setFilterRisk]     = useState('all');

    // Combine user-listed tokens with mock external
    const userListings = portfolio
        .filter(h => h.isListed)
        .map(h => ({
            id: h.id,
            name: h.name || h.id,
            artist: h.artist || '—',
            coverUrl: h.coverUrl || null,
            seller: 'Tú',
            fractions: h.fractions,
            originalCost: h.cost,
            listPrice: h.listPrice || h.cost * 1.1,
            apy: h.apy || 14,
            risk: h.fractions > 10 ? 'BLUE_CHIP' : 'EMERGING',
            trend: 'up',
            seed: h.cost || 42,
        }));

    const allListings = useMemo(() => {
        const combined = [...userListings, ...MOCK_SELLERS];

        // Filter
        const filtered = filterRisk === 'all'
            ? combined
            : combined.filter(l => l.risk === filterRisk);

        // Sort
        return filtered.sort((a, b) => {
            if (sortBy === 'premium') {
                const pa = ((a.listPrice - a.originalCost) / a.originalCost) * 100;
                const pb = ((b.listPrice - b.originalCost) / b.originalCost) * 100;
                return pa - pb;
            }
            if (sortBy === 'apy')   return b.apy - a.apy;
            if (sortBy === 'price') return a.listPrice - b.listPrice;
            return 0;
        });
    }, [userListings, sortBy, filterRisk]);

    const totalVolume = allListings.reduce((s, l) => s + l.listPrice, 0);
    const avgApy      = allListings.length ? allListings.reduce((s, l) => s + l.apy, 0) / allListings.length : 0;
    const activeListings = allListings.length;

    const handleBuyConfirm = (listing) => {
        // Simulate purchase: deduct from balance, add to portfolio
        acquire(listing.id + '-p2p', listing.listPrice, listing.fractions, {
            name:       listing.name,
            artist:     listing.artist,
            tokenPrice: listing.listPrice / listing.fractions,
            totalSupply: 10000,
            apy:        listing.apy,
            coverUrl:   listing.coverUrl,
        });
        setBuyTarget(null);
        setSuccessMsg(`¡Compraste ${listing.fractions} tokens de "${listing.name}" por ${fmtUSD(listing.listPrice)}! Ya están en tu portafolio.`);
        setTimeout(() => setSuccessMsg(''), 5000);
    };

    const SELECT_STYLE = {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', padding: '0.45rem 0.85rem',
        color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem',
        cursor: 'pointer', outline: 'none',
    };

    return (
        <div style={{ minHeight: '100vh', color: 'white', paddingBottom: '5rem', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                @keyframes sm-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
                @keyframes sm-slide-in { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
                .sm-card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
                    gap: 1.25rem;
                }
                @media (max-width: 480px) {
                    .sm-card-grid { grid-template-columns: 1fr; }
                    .sm-stats-grid { grid-template-columns: 1fr 1fr !important; }
                    .sm-filters { flex-direction: column !important; align-items: flex-start !important; }
                }
            `}</style>

            {/* ── Page Header ── */}
            <div style={{
                background: 'linear-gradient(160deg, rgba(20,8,45,0.99) 0%, rgba(6,12,28,0.99) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '2.5rem 1.5rem 2rem',
                marginBottom: '2rem',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: CYAN, boxShadow: `0 0 8px ${CYAN}`, display: 'inline-block', animation: 'sm-pulse 1.8s ease infinite' }} />
                        <span style={{ fontSize: '0.62rem', color: CYAN, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Mercado P2P — En Vivo
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900',
                        letterSpacing: '-0.04em', lineHeight: 1.05,
                        background: `linear-gradient(135deg, #fff 0%, ${PURPLE} 50%, ${CYAN} 100%)`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem',
                    }}>
                        Mercado Secundario
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: '560px', lineHeight: 1.6 }}>
                        Compra tokens de fans que buscan liquidez — a precios de mercado real, con APY incluido. Tu dinero nunca está atrapado.
                    </p>

                    {/* Stats bar */}
                    <div className="sm-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginTop: '1.75rem', maxWidth: '700px' }}>
                        <MarketStat label="Activos Listados" value={activeListings} color={CYAN} />
                        <MarketStat label="Volumen Total" value={fmtUSD(totalVolume)} color={PURPLE} />
                        <MarketStat label="APY Promedio" value={`${avgApy.toFixed(1)}%`} color={GREEN} />
                        <MarketStat label="Tu Saldo" value={fmtUSD(balance)} color={GREEN} />
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

                {/* ── Demo Notice ── */}
                {isShowcase && (
                    <div style={{
                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)',
                        borderRadius: '14px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                        fontSize: '0.8rem',
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>🎮</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                            <strong style={{ color: '#c4b5fd' }}>Modo Demo:</strong> Puedes comprar cualquier activo con tu crédito de {fmtUSD(balance)}.
                            Para listar tus propios tokens, ve a{' '}
                            <span
                                onClick={() => onNavigate?.('mis-canciones')}
                                style={{ color: CYAN, cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}
                            >
                                Mis Canciones
                            </span>.
                        </span>
                    </div>
                )}

                {/* Success notification */}
                {successMsg && (
                    <div style={{
                        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)',
                        borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
                        animation: 'sm-slide-in 0.3s ease',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>✅</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', lineHeight: 1.5 }}>{successMsg}</span>
                    </div>
                )}

                {/* ── Filters ── */}
                <div className="sm-filters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                        <h2 style={{ fontSize: '0.88rem', fontWeight: '800', margin: 0, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Order Book — {activeListings} ofertas activas
                        </h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={SELECT_STYLE}>
                            <option value="all">Todos los Tiers</option>
                            <option value="BLUE_CHIP">🔵 Blue Chip</option>
                            <option value="EMERGING">⭐ Emerging</option>
                        </select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={SELECT_STYLE}>
                            <option value="premium">Menor Premium</option>
                            <option value="apy">Mayor APY</option>
                            <option value="price">Menor Precio</option>
                        </select>
                    </div>
                </div>

                {/* ── Card Grid ── */}
                {allListings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.25)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <p style={{ fontSize: '1rem', fontWeight: '700' }}>No hay activos listados con ese filtro.</p>
                        <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>Cambia los filtros o lista tus propias canciones desde Mis Canciones.</p>
                    </div>
                ) : (
                    <div className="sm-card-grid">
                        {allListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} onBuy={setBuyTarget} />
                        ))}
                    </div>
                )}

                {/* Footer note */}
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.12)', marginTop: '2rem', textAlign: 'center', lineHeight: 1.7 }}>
                    Mercado Secundario BE4T · Precios establecidos por los vendedores · Las regalías se transfieren al nuevo propietario al instante · Modo Demo
                </p>
            </div>

            {/* Buy Modal */}
            {buyTarget && (
                <BuyModal
                    listing={buyTarget}
                    balance={balance}
                    onConfirm={handleBuyConfirm}
                    onClose={() => setBuyTarget(null)}
                />
            )}
        </div>
    );
};

export default SecondaryMarket;
