import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDemoBalance } from '../hooks/useDemoBalance';
import { isShowcase } from '../core/env';
import { resolvePortfolio } from '../services/investmentService';
import { Be4tTooltip } from '../components/be4t/Be4tTooltip';
import InstantExitModal from '../components/be4t/InstantExitModal';
import ListOnMarketModal from '../components/be4t/ListOnMarketModal';
const TransferModal = lazy(() => import('../components/be4t/TransferModal'));

// ── Constants ─────────────────────────────────────────────────────────────────
const SECONDS_PER_YEAR = 31_536_000;

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtUSD = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
const fmtMicro = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(v || 0);
const fmtPct = (v) => `${(v || 0).toFixed(2)}%`;

// ── Mobile CSS ────────────────────────────────────────────────────────────────
const PORTFOLIO_MOBILE_CSS = `
/* === Portfolio Mobile Fixes === */
@media (max-width: 640px) {

  /* Page wrapper padding */
  .pf-page { padding: 1rem !important; }

  /* Header: stack title + balance pill */
  .pf-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem !important;
  }
  .pf-balance {
    width: 100% !important;
    text-align: left !important;
    min-width: 0 !important;
  }

  /* KPI grid: 2 cols on mobile */
  .pf-kpi-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.6rem !important;
  }

  /* Investment card padding */
  .pf-card { padding: 1rem !important; }

  /* Top row inside card: stack vertically */
  .pf-card-top {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }

  /* Live ticker takes full width on mobile */
  .pf-ticker { align-self: stretch !important; }

  /* Stats grid: 2x2 instead of 1x4 */
  .pf-stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.6rem !important;
  }

  /* Action buttons: full width row */
  .pf-actions {
    flex-wrap: wrap !important;
    gap: 0.4rem !important;
  }
  .pf-actions button {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    font-size: 0.62rem !important;
    padding: 7px 8px !important;
    text-align: center !important;
    white-space: nowrap !important;
  }
}
`;

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
const InvestmentCard = ({ holding, isLast, onTransfer, onAction }) => {
    const [isManaging, setIsManaging] = useState(false);
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
        className="pf-card"
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
            {/* ── Top row: Song info + Live Ticker ── */}
            <div className="pf-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
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
                <div className="pf-ticker"><LiveEarningsTicker cost={cost} apy={apy} acquiredAt={acquiredAt} /></div>
            </div>

            {/* ── Bottom row: stats grid ── */}
            <div className="pf-stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                        Invertido
                        <Be4tTooltip content="Es el capital total que tú has destinado para adquirir participaciones en esta canción específica." />
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{fmtUSD(cost)}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Tokens</div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', fontFamily: "'Courier New', monospace" }}>
                        {fractions} <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>({fmtPct(ownershipPct)})</span>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                        Regalías/mes
                        <Be4tTooltip content="Es la estimación de lo que tú recibirás mensualmente según tus tokens y el rendimiento de la obra." />
                    </div>
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

            {/* Action buttons */}
            <div className="pf-actions" style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                {isManaging ? (
                    <>
                        <button
                            disabled={holding.isListed}
                            onClick={() => { setIsManaging(false); onAction('sell', holding); }}
                            style={{
                                padding: '5px 12px', background: holding.isListed ? 'transparent' : 'rgba(239,68,68,0.1)', border: holding.isListed ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px', color: holding.isListed ? 'rgba(255,255,255,0.3)' : '#f87171', fontSize: '0.65rem', fontWeight: '700',
                                cursor: holding.isListed ? 'not-allowed' : 'pointer'
                            }}
                            title={holding.isListed ? "Debes retirar tu oferta del mercado secundario antes de vender a la disquera" : ""}
                        >
                            Devolver Tokens (-10%)
                        </button>
                        {holding.isListed ? (
                            <button
                                onClick={() => { setIsManaging(false); onAction('unlist', holding); }}
                                style={{
                                    padding: '5px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                                    borderRadius: '8px', color: '#fcd34d', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer'
                                }}
                            >
                                Retirar del Mercado
                            </button>
                        ) : (
                            <button
                                onClick={() => { setIsManaging(false); onAction('list', holding); }}
                                style={{
                                    padding: '5px 12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
                                    borderRadius: '8px', color: '#22d3ee', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer'
                                }}
                            >
                                Revender Tokens
                            </button>
                        )}

                    </>
                ) : (
                    <>
                        {holding.isListed && (
                            <span style={{ fontSize: '0.65rem', color: '#22d3ee', alignSelf: 'center', fontWeight: '800', marginRight: 'auto', border: '1px solid #22d3ee33', padding: '2px 8px', borderRadius: '100px', background: '#22d3ee11' }}>
                                🛒 En Mercado (Listed)
                            </span>
                        )}
                        <button
                            onClick={() => setIsManaging(true)}
                            style={{
                                padding: '5px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px', color: 'white', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            Gestionar Activo ⚙️
                        </button>
                        <button
                            onClick={() => onTransfer?.(holding)}
                            style={{
                                padding: '5px 12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)',
                                borderRadius: '8px', color: '#a78bfa', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            Transferir →
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ── Main Portfolio Component ───────────────────────────────────────────────────
const Portfolio = ({ session, walletAddress, onNavigate }) => {
    const [transferTarget, setTransferTarget] = useState(null);
    const [prodPortfolio, setProdPortfolio]   = useState([]);
    const [exitTarget, setExitTarget]         = useState(null);
    const [exitingIds, setExitingIds]         = useState(new Set());
    const [listTarget, setListTarget]         = useState(null);  // holding to list on market
    const { balance, portfolio: localPortfolio, reset, instantExit, listOnMarket, unlistFromMarket, isPersisted, isLoaded } = useDemoBalance(walletAddress);

    const handleAction = (action, holding) => {
        if (action === 'sell') {
            if (holding.isListed) return;
            setExitTarget(holding);
        } else if (action === 'list') {
            setListTarget(holding);          // open modal
        } else if (action === 'unlist') {
            unlistFromMarket(holding.id);
        }
    };

    const handleConfirmExit = () => {
        if (!exitTarget) return;
        instantExit(exitTarget.id);
        // Trigger slide-out animation THEN close modal
        setExitingIds(prev => new Set([...prev, exitTarget.id]));
        setTimeout(() => {
            setExitingIds(prev => { const n = new Set(prev); n.delete(exitTarget.id); return n; });
        }, 500);
        setExitTarget(null);
    };

    // In production: fetch from Supabase
    useEffect(() => {
        if (!isShowcase) {
            resolvePortfolio([]).then(p => setProdPortfolio(p));
        }
    }, []);

    const portfolio = isShowcase ? localPortfolio : prodPortfolio;
    const actPortfolio = portfolio.filter(p => !p.exited);

    // ── KPIs ──
    const totalInvested  = actPortfolio.reduce((s, h) => s + (h.cost || 0), 0);
    const totalEarned    = actPortfolio.reduce((s, h) => s + (h.earnedToDate || 0), 0);
    const avgApy         = actPortfolio.length
        ? actPortfolio.reduce((s, h) => s + (h.apy || 12), 0) / actPortfolio.length
        : 0;
    const portfolioValue = totalInvested + totalEarned;

    return (
        <div style={{ minHeight: '100vh', background: '#08080f', fontFamily: "'Inter', sans-serif", color: 'white' }}>
            <style>{PORTFOLIO_MOBILE_CSS}</style>
            <div className="pf-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>
            {/* ── Header ── */}
            <div className="pf-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                        borderRadius: '100px', padding: '0.25rem 0.85rem', marginBottom: '0.75rem',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981', animation: 'be4t-nav-pulse 1.8s ease infinite' }} />
                        <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Courier New', monospace" }}>
                            Streaming en vivo · {actPortfolio.length} activo{actPortfolio.length !== 1 ? 's' : ''}
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

                    {/* ── Persistence status indicator ── */}
                    <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', borderRadius: '100px', border: `1px solid ${isPersisted ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.1)'}`, background: isPersisted ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.03)' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isPersisted ? '#06b6d4' : 'rgba(255,255,255,0.2)', display: 'inline-block', boxShadow: isPersisted ? '0 0 5px #06b6d4' : 'none' }} />
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: isPersisted ? '#06b6d4' : 'rgba(255,255,255,0.25)', fontFamily: "'Courier New', monospace" }}>
                            {isPersisted ? '☁ Demo Mode: Data Persisted' : isLoaded ? '💾 Demo Mode: Local Only' : '⏳ Cargando portfolio...'}
                        </span>
                    </div>
                </div>

                {/* Balance pill */}
                <div className="pf-balance" style={{
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
            <div className="pf-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '2rem' }}>
                <KpiCard label="Valor Portfolio" value={fmtUSD(portfolioValue)} sub={`${actPortfolio.length} posiciones`} />
                <KpiCard label="Capital Invertido" value={fmtUSD(totalInvested)} sub="Total desplegado" color="rgba(255,255,255,0.8)" />
                <KpiCard label="Regalías Acumuladas" value={fmtUSD(totalEarned)} sub="ROI histórico" color="#10b981" glow="#10b981" />
                <KpiCard label="APY Promedio" value={`${avgApy.toFixed(1)}%`} sub="Retorno anualizado" color="#10b981" glow="#10b981" />
            </div>

            {/* ── Cards or Empty State ── */}
            {actPortfolio.length === 0 ? (
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

                    {actPortfolio.map((h, i) => (
                        <div
                            key={h.id}
                            style={{
                                opacity:   exitingIds.has(h.id) ? 0   : 1,
                                transform: exitingIds.has(h.id) ? 'translateX(60px) scale(0.97)' : 'translateX(0) scale(1)',
                                maxHeight: exitingIds.has(h.id) ? '0' : '500px',
                                overflow:  'hidden',
                                transition: 'opacity 0.4s ease, transform 0.4s ease, max-height 0.45s ease',
                            }}
                        >
                            <InvestmentCard
                                holding={h}
                                isLast={i === actPortfolio.length - 1}
                                onTransfer={setTransferTarget}
                                onAction={handleAction}
                            />
                        </div>
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

            {exitTarget && (
                <InstantExitModal
                    holding={exitTarget}
                    onConfirm={handleConfirmExit}
                    onClose={() => setExitTarget(null)}
                />
            )}

            {listTarget && (
                <ListOnMarketModal
                    holding={listTarget}
                    onConfirm={(price) => {
                        listOnMarket(listTarget.id, price);
                    }}
                    onClose={() => setListTarget(null)}
                />
            )}
        </div>{/* /pf-page */}
        </div>
    );
};

export default Portfolio;
