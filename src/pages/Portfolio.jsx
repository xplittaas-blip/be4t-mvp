import React, { useState } from 'react';

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);
const fmt = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
};

// ── Static demo holdings (will be replaced with real Supabase data) ────────────
const HOLDINGS = [
    {
        id: 1,
        song: 'Bichota',
        artist: 'Karol G',
        risk_tier: 'BLUE_CHIP',
        tokens: 5,
        token_price: 10.00,
        sp: '1.3B',
        yt: '808M',
        royalties_earned: 3.45,
        apy: 14.2,
        trend: 'momentum',
    },
    {
        id: 2,
        song: 'La Fórmula',
        artist: 'Maluma ft. Marc Anthony',
        risk_tier: 'BLUE_CHIP',
        tokens: 10,
        token_price: 10.00,
        sp: '620M',
        yt: '380M',
        royalties_earned: 1.20,
        apy: 12.8,
        trend: 'stable',
    },
    {
        id: 3,
        song: 'Pepas',
        artist: 'Farruko',
        risk_tier: 'EMERGING',
        tokens: 2,
        token_price: 10.00,
        sp: '480M',
        yt: '210M',
        royalties_earned: 4.10,
        apy: 28.6,
        trend: 'growing',
    },
];

const TREND_LABELS = {
    momentum: { label: 'Momentum', color: '#a78bfa' },
    stable:   { label: 'Estable',  color: '#22d3ee' },
    growing:  { label: 'En alza',  color: '#10b981' },
};

// ── Tiny sparkline SVG ────────────────────────────────────────────────────────
const Sparkline = ({ positive }) => (
    <svg width="48" height="14" viewBox="0 0 48 14" style={{ flex: '0 0 48px' }}>
        <polyline
            points={positive
                ? '0,12 8,9 16,10 24,5 32,3 40,1 48,0'
                : '0,2  8,5 16,4 24,9 32,11 40,10 48,13'}
            fill="none"
            stroke={positive ? '#10b981' : '#ef4444'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// ── Risk Tier pill ────────────────────────────────────────────────────────────
const RiskBadge = ({ tier }) =>
    tier === 'BLUE_CHIP' ? (
        <span style={{
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.45)',
            borderRadius: '100px', padding: '2px 8px',
            fontSize: '0.58rem', fontWeight: '800', color: '#22d3ee',
            letterSpacing: '0.8px', fontFamily: "'Courier New', monospace",
            whiteSpace: 'nowrap',
        }}>BLUE CHIP</span>
    ) : (
        <span style={{
            background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.45)',
            borderRadius: '100px', padding: '2px 8px',
            fontSize: '0.58rem', fontWeight: '800', color: '#fbbf24',
            letterSpacing: '0.8px', fontFamily: "'Courier New', monospace",
            whiteSpace: 'nowrap',
        }}>EMERGING</span>
    );

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color = 'white' }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '1.25rem 1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.3rem',
    }}>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: "'Courier New', monospace" }}>
            {label}
        </span>
        <span style={{ fontSize: '1.75rem', fontWeight: '900', color, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {value}
        </span>
        {sub && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{sub}</span>}
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Portfolio = () => {
    const [claimable] = useState(8.75);

    const totalValue       = HOLDINGS.reduce((sum, h) => sum + h.tokens * h.token_price, 0);
    const totalRoyalties   = HOLDINGS.reduce((sum, h) => sum + h.royalties_earned, 0);
    const avgApy           = HOLDINGS.reduce((sum, h) => sum + h.apy, 0) / HOLDINGS.length;

    return (
        <div style={{
            minHeight: '100vh', color: 'white',
            fontFamily: "'Inter', sans-serif",
            padding: '3rem 1.5rem',
            maxWidth: '1080px', margin: '0 auto',
        }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '100px', padding: '0.25rem 0.85rem', marginBottom: '0.75rem',
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Courier New', monospace" }}>
                        Portfolio activo
                    </span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.35rem', lineHeight: 1.05 }}>
                    Tu Portafolio{' '}
                    <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        de Regalías
                    </span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                    Valor de tus activos basado en el rendimiento actual de las APIs de Spotify y YouTube.
                    Inviertes en la propiedad de la canción para recibir una fracción de las regalías de por vida.
                </p>
            </div>

            {/* ── KPI Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                <KpiCard
                    label="Valor de Activos"
                    value={fmtUSD(totalValue)}
                    sub={`${HOLDINGS.length} activos en portafolio`}
                    color="white"
                />
                <KpiCard
                    label="Regalías Acumuladas"
                    value={fmtUSD(totalRoyalties)}
                    sub="Flujo de caja recibido"
                    color="#10b981"
                />
                <KpiCard
                    label="APY Promedio"
                    value={`${avgApy.toFixed(1)}%`}
                    sub="Retorno anual ponderado"
                    color="#10b981"
                />
            </div>

            {/* ── Holdings Table ── */}
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px', overflow: 'hidden',
            }}>
                {/* Table header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                        Activos de Regalías
                    </h2>
                    <button
                        onClick={() => alert(`Reclamando ${fmtUSD(claimable)} en regalías...`)}
                        style={{
                            padding: '0.5rem 1.1rem',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(6,182,212,0.15))',
                            border: '1px solid rgba(16,185,129,0.4)',
                            borderRadius: '10px', color: '#10b981',
                            fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Reclamar Regalías {fmtUSD(claimable)} →
                    </button>
                </div>

                {/* Column headers */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 1fr',
                    gap: '0.5rem',
                    padding: '0.6rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                    {['Activo', 'Clasificación', 'Tokens', 'Valor', 'Regalías', 'APY'].map(col => (
                        <span key={col} style={{
                            fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)',
                            textTransform: 'uppercase', letterSpacing: '1px',
                            fontFamily: "'Courier New', monospace",
                        }}>{col}</span>
                    ))}
                </div>

                {/* Rows */}
                {HOLDINGS.map((h, i) => {
                    const trend = TREND_LABELS[h.trend] || TREND_LABELS.stable;
                    return (
                        <div key={h.id} style={{
                            display: 'grid',
                            gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 1fr',
                            gap: '0.5rem',
                            padding: '1rem 1.5rem',
                            alignItems: 'center',
                            borderBottom: i < HOLDINGS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Asset info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: '800', fontSize: '0.92rem', letterSpacing: '-0.02em' }}>{h.song}</span>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{h.artist}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                                    <Sparkline positive={h.trend !== 'stable'} />
                                    <span style={{ fontSize: '0.65rem', color: trend.color, fontWeight: '700' }}>
                                        {trend.label}
                                    </span>
                                </div>
                            </div>

                            {/* Risk Tier */}
                            <div><RiskBadge tier={h.risk_tier} /></div>

                            {/* Tokens owned */}
                            <span style={{ fontSize: '0.88rem', fontWeight: '700', fontFamily: "'Courier New', monospace" }}>
                                {h.tokens}
                            </span>

                            {/* Value */}
                            <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>
                                {fmtUSD(h.tokens * h.token_price)}
                            </span>

                            {/* Royalties earned */}
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#10b981' }}>
                                +{fmtUSD(h.royalties_earned)}
                            </span>

                            {/* APY */}
                            <span style={{
                                fontSize: '1rem', fontWeight: '900', color: '#10b981',
                                letterSpacing: '-0.02em',
                                textShadow: '0 0 10px rgba(16,185,129,0.4)',
                                fontFamily: "'Courier New', monospace",
                            }}>
                                {h.apy.toFixed(1)}%
                            </span>
                        </div>
                    );
                })}

                {/* Footer note */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', margin: 0, lineHeight: 1.6 }}>
                        Los valores de mercado se actualizan en tiempo real con datos de Spotify &amp; YouTube vía oráculos on-chain.
                        Las regalías se distribuyen automáticamente al wallet registrado.
                        El APY refleja el retorno anual estimado basado en el rendimiento actual del activo.
                    </p>
                </div>
            </div>

            {/* ── Disclaimer ── */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.15)', margin: 0, lineHeight: 1.7 }}>
                    IMPORTANTE: Invertir en activos de regalías implica riesgo. Los activos BLUE CHIP ofrecen retorno estable
                    sobre catálogos con tracción probada. Los activos EMERGING tienen mayor potencial de apreciación con riesgo elevado.
                    No constituye asesoría financiera. BE4T © 2025.
                </p>
            </div>
        </div>
    );
};

export default Portfolio;
