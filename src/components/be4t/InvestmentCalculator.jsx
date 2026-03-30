import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Music, ChevronRight } from 'lucide-react';

// BE4T Royalty Model: $3,000 USD per 1,000,000 streams
const ROYALTY_PER_MILLION_STREAMS = 3000;

const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const InvestmentCalculator = ({ asset }) => {
    const [fractions, setFractions] = useState(10);
    const [period, setPeriod] = useState(12); // months

    const totalSupply = asset?.total_supply || 1000;
    const totalValuation = asset?.valuation_usd || (asset?.token_price_usd * totalSupply) || 25000;
    const tokenPrice = totalValuation / totalSupply;

    const monthlyStreams = asset?.metadata?.spotify_streams
        ? asset.metadata.spotify_streams / 12
        : totalValuation * 2.5; // Estimate from valuation

    const annualStreams = monthlyStreams * 12;
    const annualRoyalties = (annualStreams / 1_000_000) * ROYALTY_PER_MILLION_STREAMS;

    const ownershipPct = fractions / totalSupply;
    const investmentCost = fractions * tokenPrice;
    const annualEarnings = annualRoyalties * ownershipPct;
    const periodEarnings = (annualEarnings / 12) * period;
    const apy = investmentCost > 0 ? (annualEarnings / investmentCost) * 100 : 0;
    const roi = investmentCost > 0 ? (periodEarnings / investmentCost) * 100 : 0;

    const projectedReturn = (investmentCost + periodEarnings).toFixed(2);

    const maxFractions = Math.min(totalSupply, 500);

    const sliderPct = useMemo(() => ((fractions - 1) / (maxFractions - 1)) * 100, [fractions, maxFractions]);

    return (
        <div style={{
            background: 'rgba(10, 10, 20, 0.7)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(144, 19, 254, 0.2)',
            marginTop: '0.5rem',
        }}>
            <h4 style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Music size={14} /> Calculadora de Retorno de Inversión
            </h4>

            {/* Royalty Model Info */}
            <div style={{
                background: 'rgba(144, 19, 254, 0.08)',
                border: '1px solid rgba(144, 19, 254, 0.2)',
                borderRadius: '10px',
                padding: '0.8rem 1rem',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
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
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#ce89ff',
                        background: 'rgba(144, 19, 254, 0.15)',
                        padding: '2px 12px',
                        borderRadius: '100px',
                    }}>{fractions}</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <input
                        type="range"
                        min="1"
                        max={maxFractions}
                        value={fractions}
                        onChange={(e) => setFractions(Number(e.target.value))}
                        style={{
                            width: '100%',
                            accentColor: '#9013fe',
                            cursor: 'pointer',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                    <span>1</span>
                    <span>{formatNumber(maxFractions)}</span>
                </div>
            </div>

            {/* Period Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>Horizonte de inversión</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[6, 12, 24, 36].map((m) => (
                        <button
                            key={m}
                            onClick={() => setPeriod(m)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: period === m ? '1px solid rgba(144, 19, 254, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                                background: period === m ? 'rgba(144, 19, 254, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: period === m ? '#ce89ff' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.8rem',
                                fontWeight: period === m ? '700' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {m}m
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.25rem',
            }}>
                {[
                    { label: 'Inversión Total', value: formatCurrency(investmentCost), color: 'rgba(255,255,255,0.9)' },
                    { label: `Retorno en ${period}m`, value: formatCurrency(periodEarnings), color: '#00f2fe' },
                    { label: 'APY Estimado', value: `${apy.toFixed(1)}%`, color: '#1DB954' },
                    { label: 'Propiedad', value: `${(ownershipPct * 100).toFixed(3)}%`, color: '#ce89ff' },
                ].map((item) => (
                    <div key={item.label} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                        padding: '0.8rem',
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
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1rem',
            }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Capital + Regalías al final del período
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1DB954', letterSpacing: '-0.02em' }}>
                    {formatCurrency(parseFloat(projectedReturn))}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                    ROI de {roi.toFixed(1)}% en {period} meses
                </div>
            </div>

            {/* Simular Inversión CTA */}
            <button
                style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #9013fe, #00c6ff)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'opacity 0.2s ease',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
                onClick={() => alert(`Simulación de compra: ${fractions} fracciones x ${formatCurrency(tokenPrice)} = ${formatCurrency(investmentCost)}\nAPY estimado: ${apy.toFixed(1)}%\n\n✅ En la versión real, aquí se conectará MetaMask.`)}
            >
                <DollarSign size={16} />
                Simular Inversión ({fractions} fracciones)
                <ChevronRight size={16} />
            </button>

            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '0.75rem', lineHeight: '1.4' }}>
                * Los retornos son estimaciones basadas en el histórico de streams. No constituyen garantía de rentabilidad futura.
            </p>
        </div>
    );
};

export default InvestmentCalculator;
