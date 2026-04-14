import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDemoBalance } from '../hooks/useDemoBalance';
import { isShowcase } from '../core/env';
import { resolvePortfolio } from '../services/investmentService';
const TransferModal = lazy(() => import('../components/be4t/TransferModal'));

// ── Constants ─────────────────────────────────────────────────────────────────
const SECONDS_PER_YEAR = 31_536_000;

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
const fmtMicro = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(v || 0);
const fmtPct = (v) => `${(v || 0).toFixed(2)}%`;

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

// ── 🔴 LIVE EARNINGS TICKER — ticks every second ──────────────────────────────
// Formula: cost × (apy/100) / 31,536,000 seconds per increment
const LiveEarningsTicker = ({ cost, apy, acquiredAt }) => {
    const ratePerSec = (cost * (apy / 100)) / SECONDS_PER_YEAR;
    const secsSinceAcquisition = () => (Date.now() - (acquiredAt || Date.now())) / 1000;

    const [earned, setEarned] = useState(() => ratePerSec * secsSinceAcquisition());
    const rafRef = useRef(null);

    useEffect(() => {
        let last = performance.now();

        const tick = (now) => {
            const dt = (now - last) / 1000; // seconds elapsed since last frame
            last = now;
            setEarned(prev => prev + ratePerSec * dt);
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [ratePerSec]);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '12px',
            padding: '0.65rem 0.9rem',
            minWidth: '160px',
        }}>
            <div style={{ fontSize: '0.55rem', color: 'rgba(16,185,129,0.7)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '3px', fontFamily: "'Courier New', monospace" }}>
                🔴 LIVE · Regalías acumuladas
            </div>
            <div style={{
                fontSize: '1.05rem', fontWeight: '900',
                color: '#10b981',
                fontFamily: "'Courier New', monospace",
                letterSpacing: '-0.01em',
                textShadow: '0 0 12px rgba(16,185,129,0.5)',
            }}>
                {fmtMicro(earned)}
            </div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px', fontFamily: "'Courier New', monospace" }}>
                +{fmtMicro(ratePerSec)}/seg
            </div>
        </div>
    );
};

// ── Mini Sparkline ────────────────────────────────────────────────────────────
const Sparkline = ({ positive }) => (
    <svg width="52" height="16" viewBox="0 0 52 16">
        <polyline
            points={positive
                ? '0,14 9,10 18,11 27,5 36,3 44,1 52,0'
                : '0,2  9,6  18,5 27,10 36,12 44,11 52,14'}
            fill="none"
            stroke={positive ? '#10b981' : '#ef4444'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyPortfolio = ({ onNavigate }) => (
    <div style={{
        textAlign: 'center', padding: '5rem 2rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
    }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎵</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
            Tu portafolio está vacío
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            {isShowcase
                ? 'Tienes $50,000 USD en crédito demo. Explora el catálogo y adquiere tu primera participación de regalías.'
                : 'Explora el catálogo y realiza tu primera inversión en derechos musicales.'}
        </p>
        <button
            onClick={() => onNavigate?.('explorar')}
            style={{
                padding: '0.9rem 2.25rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                backgroundSize: '200% auto',
                border: 'none', borderRadius: '14px',
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

// ── Investment Card ───────────────────────────────────────────────────────────
const InvestmentCard = ({ holding, isLast, onTransfer }) => {
    const {
        id, name, artist, fractions, cost, tokenPrice, totalSupply,
        apy = 12, earnedToDate = 0, ownershipPct = 0, daysSince = 0,
        coverUrl, acquiredAt,
    } = holding;

    const monthlyEarning = cost * (apy / 100) / 12;
    const gainPct        = cost > 0 ? (earnedToDate / cost) * 100 : 0;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: isLast ? 0 : '0.75rem',
            transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
            {/* ── Top row: Song info + Live Ticker ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {/* Left: cover + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                        background: coverUrl
                            ? `url(${coverUrl}) center/cover`
                            : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}>
                        {!coverUrl && '🎵'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.02em' }}>
                            {name || id}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '1px' }}>
                            {artist}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                            <Sparkline positive />
                            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>
                                {daysSince === 0 ? 'Adquirido hoy' : `${daysSince}d activo`}
                            </span>
                            <span style={{
                                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                                borderRadius: '100px', padding: '1px 7px',
                                fontSize: '0.58rem', color: '#a78bfa', fontWeight: '700',
                            }}>
                                {fmtPct(apy)} APY
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: LIVE TICKER */}
                <LiveEarningsTicker cost={cost} apy={apy} acquiredAt={acquiredAt} />
            </div>

            {/* ── Bottom row: stats grid ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Invertido</div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{fmtUSD(cost)}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Tokens</div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', fontFamily: "'Courier New', monospace" }}>
                        {fractions} <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>({fmtPct(ownershipPct)})</span>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Regalías/mes</div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#10b981' }}>
                        {fmtUSD(monthlyEarning)}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>ROI total</div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: gainPct > 0 ? '#10b981' : 'white' }}>
                        +{gainPct.toFixed(4)}%
                    </div>
                </div>
            </div>

            {/* Transfer button */}
            <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => onTransfer?.(holding)}
                    style={{
                        padding: '5px 12px',
                        background: 'rgba(139,92,246,0.08)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        borderRadius: '8px',
                        color: '#a78bfa', fontSize: '0.65rem', fontWeight: '700',
                        cursor: 'pointer', letterSpacing: '0.3px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                >
                    Transferir participación →
                </button>
            </div>
        </div>
    );
};

// ── Main Portfolio Component ───────────────────────────────────────────────────
const Portfolio = ({ session, onNavigate }) => {
    const [transferTarget, setTransferTarget] = useState(null);
    const [prodPortfolio, setProdPortfolio]   = useState([]);
    const { balance, portfolio: localPortfolio, reset } = useDemoBalance();

    // In production: fetch from Supabase
    useEffect(() => {
        if (!isShowcase) {
            resolvePortfolio([]).then(p => setProdPortfolio(p));
        }
    }, []);

    const portfolio = isShowcase ? localPortfolio : prodPortfolio;

    // ── KPIs ──
    const totalInvested  = portfolio.reduce((s, h) => s + (h.cost || 0), 0);
    const totalEarned    = portfolio.reduce((s, h) => s + (h.earnedToDate || 0), 0);
    const avgApy         = portfolio.length
        ? portfolio.reduce((s, h) => s + (h.apy || 12), 0) / portfolio.length
        : 0;
    const portfolioValue = totalInvested + totalEarned;

    return (
        <div style={{
            minHeight: '100vh', color: 'white',
            fontFamily: "'Inter', sans-serif",
            padding: '3rem 1.5rem',
            maxWidth: '960px', margin: '0 auto',
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
                            Streaming en vivo · {portfolio.length} activo{portfolio.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 0.35rem', lineHeight: 1.05 }}>
                        Mis Canciones{' '}
                        <span style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            &amp; Regalías
                        </span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                        Tus regalías suben en tiempo real · {SECONDS_PER_YEAR.toLocaleString()} segundos al año de streaming global
                    </p>
                </div>

                {/* Balance pill */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
                    padding: '1rem 1.4rem', border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'right', minWidth: '160px',
                }}>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        {isShowcase ? '💳 Crédito Demo' : '🔗 Saldo Wallet'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#10b981' }}>
                        {fmtUSD(balance)}
                    </div>
                    {isShowcase && (
                        <button onClick={reset} style={{
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.18)',
                            fontSize: '0.58rem', cursor: 'pointer', textDecoration: 'underline',
                            textUnderlineOffset: '2px', padding: '4px 0 0', display: 'block', width: '100%', textAlign: 'right',
                        }}>
                            Reiniciar demo
                        </button>
                    )}
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '2rem' }}>
                <KpiCard label="Valor Portfolio" value={fmtUSD(portfolioValue)} sub={`${portfolio.length} posiciones`} />
                <KpiCard label="Capital Invertido" value={fmtUSD(totalInvested)} sub="Total desplegado" color="rgba(255,255,255,0.8)" />
                <KpiCard label="Regalías Acumuladas" value={fmtUSD(totalEarned)} sub="ROI histórico" color="#10b981" glow="#10b981" />
                <KpiCard label="APY Promedio" value={`${avgApy.toFixed(1)}%`} sub="Retorno anualizado" color="#10b981" glow="#10b981" />
            </div>

            {/* ── Cards or Empty State ── */}
            {portfolio.length === 0 ? (
                <EmptyPortfolio onNavigate={onNavigate} />
            ) : (
                <div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '0.88rem', fontWeight: '800', margin: 0, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.6)' }}>
                            ACTIVOS DE REGALÍAS
                        </h2>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.6rem', color: '#10b981', fontWeight: '700',
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '100px', padding: '0.25rem 0.75rem',
                        }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'be4t-nav-pulse 1s ease infinite' }} />
                            Actualizando en tiempo real
                        </span>
                    </div>

                    {portfolio.map((h, i) => (
                        <InvestmentCard
                            key={h.id}
                            holding={h}
                            isLast={i === portfolio.length - 1}
                            onTransfer={setTransferTarget}
                        />
                    ))}

                    {/* Footer note */}
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', marginTop: '1.5rem', lineHeight: 1.7, textAlign: 'center' }}>
                        Regalías calculadas con TEA de cada activo · Fórmula: Inversión × TEA ÷ 31,536,000 seg/año
                        {isShowcase ? ' · Modo simulación — rendimientos proyectados, no reales.' : ' · Datos en cadena Base Mainnet.'}
                    </p>
                </div>
            )}

            {/* ── Disclaimer ── */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.1)', margin: 0, lineHeight: 1.7 }}>
                    No constituye asesoría financiera. BE4T © 2025 — Infraestructura de derechos musicales digitales.
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
