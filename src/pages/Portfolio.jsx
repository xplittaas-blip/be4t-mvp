import React, { useState, lazy, Suspense, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDemoBalance } from '../hooks/useDemoBalance';
import { isShowcase } from '../core/env';
import { resolvePortfolio, calculateAPYFromStreams } from '../services/investmentService';
const TransferModal = lazy(() => import('../components/be4t/TransferModal'));

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
const fmtPct = (v) => `${(v || 0).toFixed(2)}%`;
const fmtNum = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
};

// ── Mini Sparkline ────────────────────────────────────────────────────────────
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

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color = 'white', glow }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '1.25rem 1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.3rem',
        boxShadow: glow ? `0 0 24px ${glow}22` : 'none',
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

// ── Live ROI ticker (re-renders every 5s to show accumulation) ────────────────
function useLiveTick(intervalMs = 5000) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return tick;
}

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyPortfolio = ({ onNavigate }) => (
    <div style={{
        textAlign: 'center', padding: '5rem 2rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
    }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
            Tu portafolio está vacío
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            {isShowcase
                ? `Tienes $50,000 USD en crédito demo. Explora el catálogo y adquiere tu primera participación de regalías.`
                : 'Explora el catálogo y realiza tu primera inversión en derechos musicales.'}
        </p>
        <button
            onClick={() => onNavigate?.('explorar')}
            style={{
                padding: '0.85rem 2rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontWeight: '800', fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                transition: 'all 0.3s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.6)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)'; }}
        >
            💰 Explorar Catálogo
        </button>
    </div>
);

// ── Investment Row ────────────────────────────────────────────────────────────
const InvestmentRow = ({ holding, index, isLast, onTransfer }) => {
    const {
        id, name, artist, fractions, cost, tokenPrice, totalSupply,
        apy, earnedToDate, ownershipPct, daysSince, coverUrl, acquiredAt,
    } = holding;

    const currentValue = fractions * (tokenPrice || cost / Math.max(fractions, 1));
    const gainLoss     = earnedToDate;
    const gainPct      = cost > 0 ? (earnedToDate / cost) * 100 : 0;
    const isPositive   = gainPct >= 0;

    // Live monthly projected earnings
    const monthlyEarnings = cost * ((apy || 12) / 100) / 12;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1.2fr 0.8fr',
                gap: '0.75rem',
                padding: '1.1rem 1.5rem',
                alignItems: 'center',
                borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.2s ease',
                cursor: 'default',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {/* Song info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                {/* Cover / avatar */}
                <div style={{
                    width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                    background: coverUrl ? `url(${coverUrl}) center/cover` : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                }}>
                    {!coverUrl && '🎵'}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name || id}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
                        {artist}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
                        <Sparkline positive={isPositive} />
                        <span style={{ fontSize: '0.62rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                            {daysSince === 0 ? 'Hoy' : `${daysSince}d`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tokens / fracciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', fontFamily: "'Courier New', monospace" }}>
                    {fractions}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                    {fmtPct(ownershipPct)} del total
                </span>
            </div>

            {/* Invertido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    {fmtUSD(cost)}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                    invertido
                </span>
            </div>

            {/* ROI en tiempo real */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{
                    fontSize: '0.92rem', fontWeight: '800',
                    color: isPositive ? '#10b981' : '#ef4444',
                    textShadow: isPositive ? '0 0 8px rgba(16,185,129,0.3)' : 'none',
                }}>
                    +{fmtUSD(earnedToDate)}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                    ≈ {fmtUSD(monthlyEarnings)}/mes
                </span>
            </div>

            {/* APY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{
                    fontSize: '1rem', fontWeight: '900', color: '#10b981',
                    letterSpacing: '-0.02em',
                    textShadow: '0 0 10px rgba(16,185,129,0.35)',
                    fontFamily: "'Courier New', monospace",
                }}>
                    {(apy || 12).toFixed(1)}%
                </span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>APY</span>
            </div>

            {/* Actions */}
            <div>
                <button
                    onClick={() => onTransfer?.(holding)}
                    style={{
                        padding: '4px 10px',
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: '8px',
                        color: '#a78bfa',
                        fontSize: '0.62rem', fontWeight: '700', cursor: 'pointer',
                        letterSpacing: '0.3px', whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                >
                    Transferir →
                </button>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Portfolio = ({ session, onNavigate }) => {
    useLiveTick(8000);
    const [transferTarget, setTransferTarget] = useState(null);
    const [prodPortfolio,  setProdPortfolio]  = useState([]);
    const { balance, portfolio: localPortfolio, reset } = useDemoBalance();

    // In production, fetch from Supabase on mount
    useEffect(() => {
        if (!isShowcase) {
            resolvePortfolio([]).then(p => setProdPortfolio(p));
        }
    }, []);

    // Use local (showcase) or remote (production) data
    const portfolio = isShowcase ? localPortfolio : prodPortfolio;

    // Aggregate KPIs
    const totalInvested   = portfolio.reduce((sum, h) => sum + (h.cost || 0), 0);
    const totalEarned     = portfolio.reduce((sum, h) => sum + (h.earnedToDate || 0), 0);
    const totalTokens     = portfolio.reduce((sum, h) => sum + (h.fractions || 0), 0);
    const avgApy          = portfolio.length
        ? portfolio.reduce((sum, h) => sum + (h.apy || 12), 0) / portfolio.length
        : 0;
    const portfolioValue  = totalInvested + totalEarned;

    return (
        <div style={{
            minHeight: '100vh', color: 'white',
            fontFamily: "'Inter', sans-serif",
            padding: '3rem 1.5rem',
            maxWidth: '1100px', margin: '0 auto',
        }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                        borderRadius: '100px', padding: '0.25rem 0.85rem', marginBottom: '0.75rem',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981', animation: 'be4t-nav-pulse 1.8s ease infinite' }} />
                        <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Courier New', monospace" }}>
                            Portfolio activo
                        </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.35rem', lineHeight: 1.05 }}>
                        Mis Canciones{' '}
                        <span style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            &amp; Regalías
                        </span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                        ROI calculado en tiempo real · TEA basada en streams de Spotify/YouTube
                    </p>
                </div>

                {/* Balance pill */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    background: 'rgba(255,255,255,0.04)', borderRadius: '14px',
                    padding: '0.85rem 1.25rem', border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'right',
                }}>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {isShowcase ? 'Crédito Demo' : 'Saldo Wallet'}
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#10b981' }}>
                        {fmtUSD(balance)}
                    </span>
                    {isShowcase && (
                        <button onClick={reset} style={{
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
                            fontSize: '0.6rem', cursor: 'pointer', textDecoration: 'underline',
                            textUnderlineOffset: '2px', padding: 0, textAlign: 'right',
                        }}>
                            Reiniciar demo
                        </button>
                    )}
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                <KpiCard
                    label="Valor del Portfolio"
                    value={fmtUSD(portfolioValue)}
                    sub={`${portfolio.length} activo${portfolio.length !== 1 ? 's' : ''}`}
                    color="white"
                />
                <KpiCard
                    label="Total Invertido"
                    value={fmtUSD(totalInvested)}
                    sub="Capital desplegado"
                    color="rgba(255,255,255,0.8)"
                />
                <KpiCard
                    label="Regalías Acumuladas"
                    value={fmtUSD(totalEarned)}
                    sub="ROI en tiempo real"
                    color="#10b981"
                    glow="#10b981"
                />
                <KpiCard
                    label="APY Promedio"
                    value={`${avgApy.toFixed(1)}%`}
                    sub="Retorno anual ponderado"
                    color="#10b981"
                    glow="#10b981"
                />
            </div>

            {/* ── Holdings Table or Empty State ── */}
            {portfolio.length === 0 ? (
                <EmptyPortfolio onNavigate={onNavigate} />
            ) : (
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
                            Activos de Regalías · {portfolio.length} posición{portfolio.length !== 1 ? 'es' : ''}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: '0.62rem', color: '#10b981', fontWeight: '700',
                                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: '100px', padding: '0.25rem 0.7rem',
                            }}>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                ROI Activo
                            </span>
                        </div>
                    </div>

                    {/* Column headers */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1.2fr 0.8fr',
                        gap: '0.75rem',
                        padding: '0.6rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        {['Activo', 'Tokens', 'Invertido', 'Regalías', 'APY', ''].map(col => (
                            <span key={col} style={{
                                fontSize: '0.56rem', color: 'rgba(255,255,255,0.25)',
                                textTransform: 'uppercase', letterSpacing: '1px',
                                fontFamily: "'Courier New', monospace",
                            }}>{col}</span>
                        ))}
                    </div>

                    {/* Rows */}
                    {portfolio.map((h, i) => (
                        <InvestmentRow
                            key={h.id}
                            holding={h}
                            index={i}
                            isLast={i === portfolio.length - 1}
                            onTransfer={setTransferTarget}
                        />
                    ))}

                    {/* Footer */}
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', margin: 0, lineHeight: 1.6 }}>
                            ROI calculado con la TEA de cada activo desde la fecha de adquisición.
                            Las regalías se acumulan diariamente según el rendimiento de Spotify &amp; YouTube.
                            {isShowcase && ' • Modo simulación: transacciones ficticias, rendimientos proyectados.'}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Disclaimer ── */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.12)', margin: 0, lineHeight: 1.7 }}>
                    IMPORTANTE: Los activos BLUE CHIP ofrecen retorno estable sobre catálogos con tracción probada.
                    Los activos EMERGING tienen mayor potencial de apreciación con riesgo elevado.
                    No constituye asesoría financiera. BE4T © 2025.
                </p>
            </div>

            {/* ── TransferModal ── */}
            {transferTarget && createPortal(
                <Suspense fallback={null}>
                    <TransferModal
                        holding={transferTarget}
                        onClose={() => setTransferTarget(null)}
                    />
                </Suspense>,
                document.body
            )}
        </div>
    );
};

export default Portfolio;
