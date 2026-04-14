import React, { useState, useMemo, lazy, Suspense } from 'react';
import { TrendingUp, DollarSign, Music, ChevronRight, Zap, CreditCard, CheckCircle } from 'lucide-react';
import { isShowcase, isProduction } from '../../core/env';
import { useDemoBalance } from '../../hooks/useDemoBalance';

// Lazy-load PayModal only in production to keep showcase bundle lean
const ThirdwebPayModal = isProduction
    ? lazy(() => import('./ThirdwebPayModal'))
    : null;

// ── BE4T Royalty Model ────────────────────────────────────────────────────────
const ROYALTY_PER_MILLION_STREAMS = 3000;

const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1000)      return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

// ── Main Component ────────────────────────────────────────────────────────────
const InvestmentCalculator = ({ asset, session }) => {
    const [fractions, setFractions] = useState(10);
    const [period,    setPeriod]    = useState(12);
    const [showPay,   setShowPay]   = useState(false);  // Thirdweb Pay modal
    const [txState,   setTxState]   = useState('idle'); // idle | processing | success | error

    // ── Ghost Balance (Showcase only) ────────────────────────────────────────
    const { balance, acquire, acquired: isAcquired, hasBalance } = useDemoBalance();
    const songAcquired = isAcquired(asset?.id || asset?.track_id || 'unknown');

    // ── Financial calculations ───────────────────────────────────────────────
    const totalSupply    = asset?.total_supply || 1000;
    const totalValuation = asset?.valuation_usd || (asset?.token_price_usd * totalSupply) || 25000;
    const tokenPrice     = totalValuation / totalSupply;

    const monthlyStreams  = asset?.metadata?.spotify_streams
        ? asset.metadata.spotify_streams / 12
        : totalValuation * 2.5;
    const annualStreams   = monthlyStreams * 12;
    const annualRoyalties= (annualStreams / 1_000_000) * ROYALTY_PER_MILLION_STREAMS;

    const ownershipPct   = fractions / totalSupply;
    const investmentCost = fractions * tokenPrice;
    const annualEarnings = annualRoyalties * ownershipPct;
    const periodEarnings = (annualEarnings / 12) * period;
    const apy            = investmentCost > 0 ? (annualEarnings / investmentCost) * 100 : 0;
    const roi            = investmentCost > 0 ? (periodEarnings / investmentCost) * 100 : 0;
    const projectedReturn= (investmentCost + periodEarnings).toFixed(2);
    const maxFractions   = Math.min(totalSupply, 500);
    const sliderPct      = useMemo(() => ((fractions - 1) / (maxFractions - 1)) * 100, [fractions, maxFractions]);

    // ── Insufficient balance warning (Showcase) ──────────────────────────────
    const canAfford      = isShowcase ? hasBalance(investmentCost) : true;

    // ── Button state ─────────────────────────────────────────────────────────
    const btnLabel = (() => {
        if (txState === 'processing') return '⏳ Procesando...';
        if (txState === 'success')    return '✅ ¡Adquirido!';
        if (isShowcase) {
            if (songAcquired)  return `✅ Ya tienes ${songAcquired.fractions} fracciones`;
            if (!canAfford)    return '💸 Saldo insuficiente';
            return `🎮 Invertir (Crédito Demo) · ${fractions} fracc.`;
        }
        return `💳 Fondear e Invertir · ${fractions} fracc.`;
    })();

    const btnGradient = isShowcase
        ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)'
        : 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)';

    const btnDisabled = txState === 'processing' || txState === 'success'
        || (isShowcase && (!canAfford || !!songAcquired));

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleShowcaseAcquire = () => {
        if (btnDisabled) return;
        setTxState('processing');

        setTimeout(() => {
            const songId = asset?.id || asset?.track_id || 'unknown';

            // Build rich metadata for Portfolio tracking
            const songMeta = {
                name:          asset?.name || asset?.title || 'Canción',
                artist:        asset?.metadata?.artist || asset?.artist || 'Artista',
                tokenPrice,
                totalSupply,
                apy:           parseFloat(apy.toFixed(2)),
                spotifyStreams: asset?.metadata?.spotify_streams || 0,
                coverUrl:      asset?.metadata?.cover_url || asset?.cover_url || null,
            };

            const result = acquire(songId, investmentCost, fractions, songMeta);

            if (result.ok) {
                setTxState('success');
            } else {
                setTxState('error');
                setTimeout(() => setTxState('idle'), 2500);
            }
        }, 1200);
    };

    const handleProductionInvest = () => {
        // Open Thirdweb Pay modal so user can fund their Smart Wallet
        setShowPay(true);
    };

    const handlePaySuccess = () => {
        setShowPay(false);
        setTxState('success');
    };

    const handleClick = isShowcase ? handleShowcaseAcquire : handleProductionInvest;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            background: 'rgba(10, 10, 20, 0.7)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(144, 19, 254, 0.2)',
            marginTop: '0.5rem',
        }}>
            {/* Header */}
            <h4 style={{
                fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px',
                color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
                <Music size={14} /> Calculadora de Retorno de Inversión
            </h4>

            {/* ── Mode Badge ────────────────────────────────────────────────── */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: isShowcase ? 'rgba(124,58,237,0.12)' : 'rgba(14,165,233,0.12)',
                border: `1px solid ${isShowcase ? 'rgba(124,58,237,0.3)' : 'rgba(14,165,233,0.3)'}`,
                borderRadius: '100px', marginBottom: '1.25rem',
                fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em',
                color: isShowcase ? '#c4b5fd' : '#38bdf8',
            }}>
                {isShowcase ? (
                    <><Zap size={10} /> DEMO · Crédito ficticio</>
                ) : (
                    <><CreditCard size={10} /> REAL · Thirdweb Pay</>
                )}
            </div>

            {/* ── Balance pill (Showcase) ───────────────────────────────────── */}
            {isShowcase && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: canAfford ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${canAfford ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    borderRadius: '10px', padding: '0.6rem 0.9rem', marginBottom: '1.25rem',
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        Crédito demo disponible
                    </span>
                    <span style={{
                        fontWeight: '800', fontSize: '1rem',
                        color: canAfford ? '#4ade80' : '#f87171',
                    }}>
                        {formatCurrency(balance)}
                    </span>
                </div>
            )}

            {/* Royalty Model Info */}
            <div style={{
                background: 'rgba(144, 19, 254, 0.08)',
                border: '1px solid rgba(144, 19, 254, 0.2)',
                borderRadius: '10px', padding: '0.8rem 1rem',
                fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)',
                marginBottom: '1.5rem', display: 'flex',
                gap: '0.5rem', alignItems: 'flex-start',
            }}>
                <TrendingUp size={12} style={{ marginTop: '2px', color: '#ce89ff', flexShrink: 0 }} />
                <span>
                    Modelo BE4T: <strong style={{ color: '#ce89ff' }}>$3,000 USD</strong> por cada millón de streams.
                    Este activo generó <strong style={{ color: '#ce89ff' }}>{formatNumber(Math.round(annualStreams))}</strong> streams anuales estimados.
                </span>
            </div>

            {/* Fractions Slider */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Fracciones a adquirir</label>
                    <span style={{
                        fontSize: '1.1rem', fontWeight: '700', color: '#ce89ff',
                        background: 'rgba(144, 19, 254, 0.15)',
                        padding: '2px 12px', borderRadius: '100px',
                    }}>{fractions}</span>
                </div>
                <input
                    type="range" min="1" max={maxFractions} value={fractions}
                    onChange={(e) => setFractions(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#9013fe', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                    <span>1</span><span>{formatNumber(maxFractions)}</span>
                </div>
            </div>

            {/* Period Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>Horizonte de inversión</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[6, 12, 24, 36].map((m) => (
                        <button key={m} onClick={() => setPeriod(m)} style={{
                            flex: 1, padding: '0.5rem', borderRadius: '8px',
                            border: period === m ? '1px solid rgba(144, 19, 254, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                            background: period === m ? 'rgba(144, 19, 254, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: period === m ? '#ce89ff' : 'rgba(255,255,255,0.5)',
                            fontSize: '0.8rem', fontWeight: period === m ? '700' : '400',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                        }}>
                            {m}m
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { label: 'Inversión Total',    value: formatCurrency(investmentCost), color: 'rgba(255,255,255,0.9)' },
                    { label: `Retorno en ${period}m`, value: formatCurrency(periodEarnings), color: '#00f2fe' },
                    { label: 'APY Estimado',       value: `${apy.toFixed(1)}%`,           color: '#1DB954' },
                    { label: 'Propiedad',          value: `${(ownershipPct * 100).toFixed(3)}%`, color: '#ce89ff' },
                ].map((item) => (
                    <div key={item.label} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px', padding: '0.8rem',
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{item.label}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '700', color: item.color }}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Projected Return Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1), rgba(0, 242, 254, 0.1))',
                border: '1px solid rgba(29, 185, 84, 0.25)',
                borderRadius: '12px', padding: '1rem',
                textAlign: 'center', marginBottom: '1rem',
            }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Capital + Regalías al final del período</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1DB954', letterSpacing: '-0.02em' }}>
                    {formatCurrency(parseFloat(projectedReturn))}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                    ROI de {roi.toFixed(1)}% en {period} meses
                </div>
            </div>

            {/* ── Success State ────────────────────────────────────────────────── */}
            {txState === 'success' && isShowcase && songAcquired && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '12px', padding: '0.85rem 1rem',
                    marginBottom: '0.75rem',
                    animation: 'fadeIn 0.4s ease',
                }}>
                    <CheckCircle size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: '700', color: '#4ade80', fontSize: '0.88rem' }}>
                            ✅ Fracciones adquiridas
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.1rem' }}>
                            {songAcquired.fractions} fracc. · Saldo restante: {formatCurrency(balance)}
                        </div>
                    </div>
                </div>
            )}

            {/* ── CTA Button ───────────────────────────────────────────────────── */}
            <button
                disabled={btnDisabled}
                onClick={handleClick}
                style={{
                    width: '100%', padding: '0.95rem',
                    borderRadius: '12px',
                    background: btnDisabled ? 'rgba(255,255,255,0.06)' : btnGradient,
                    border: 'none',
                    color: btnDisabled ? 'rgba(255,255,255,0.3)' : 'white',
                    fontWeight: '700', fontSize: '0.95rem',
                    cursor: btnDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: btnDisabled ? 'none' : '0 4px 20px rgba(144,19,254,0.3)',
                }}
                onMouseOver={e => { if (!btnDisabled) e.currentTarget.style.opacity = '0.88'; }}
                onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
            >
                {txState === 'processing' ? (
                    <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Procesando...</>
                ) : isShowcase ? (
                    <><Zap size={15} /> {btnLabel}</>
                ) : (
                    <><CreditCard size={15} /> {btnLabel} <ChevronRight size={14} /></>
                )}
            </button>

            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '0.75rem', lineHeight: '1.4' }}>
                {isShowcase
                    ? '🎮 Modo Demo — Practica con crédito ficticio. Sin dinero real involucrado.'
                    : '* Los retornos son estimaciones. Inversión sujeta a riesgo. No constituyen garantía.'}
            </p>

            {/* ── Thirdweb Pay Modal (Production only) ────────────────────────── */}
            {isProduction && ThirdwebPayModal && (
                <Suspense fallback={null}>
                    <ThirdwebPayModal
                        isOpen={showPay}
                        onClose={() => setShowPay(false)}
                        onSuccess={handlePaySuccess}
                        songName={asset?.name || asset?.title || 'este activo'}
                        amountUSD={Math.ceil(investmentCost)}
                    />
                </Suspense>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default InvestmentCalculator;
