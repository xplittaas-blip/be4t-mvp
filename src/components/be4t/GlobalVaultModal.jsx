import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { resolvePortfolio } from '../../services/investmentService';
import { useDemoBalance } from '../../hooks/useDemoBalance';
import FanStatusPanel from './FanStatusPanel';

const GLOBAL_PERKS = [
    { category: 'FAN', label: 'Preventa VIP', description: 'Acceso anticipado a entradas de próximos shows.', min_tokens: 100 },
    { category: 'SOCIO', label: 'Merch Edición Limitada', description: 'Gorra exclusiva + Vinilo 7" numerado.', min_tokens: 500 },
    { category: 'VIP', label: 'VIP Backstage Session', description: 'Meet & Greet y acceso a prueba de sonido.', min_tokens: 2500 },
];

export default function GlobalVaultModal({ onClose }) {
    const [loading, setLoading] = useState(true);
    const [totalInvested, setTotalInvested] = useState(0);
    const { portfolio: demoPortfolio } = useDemoBalance();

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        let isMounted = true;

        async function fetchVaultData() {
            try {
                // resolvePortfolio handles isShowcase internally
                const portfolio = await resolvePortfolio(demoPortfolio);
                
                if (isMounted) {
                    // Sum total invested USD (which FanStatusPanel interprets as totalTokens/calcAmount)
                    const total = portfolio.reduce((sum, item) => sum + (item.cost || item.total_invested || 0), 0);
                    setTotalInvested(total);
                    setLoading(false);
                }
            } catch (error) {
                console.error("[GlobalVault] Failed to load portfolio:", error);
                if (isMounted) setLoading(false);
            }
        }

        fetchVaultData();
        return () => { isMounted = false; };
    }, [demoPortfolio]);

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                animation: 'vaultModalIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
        >
            <style>{`
                @keyframes vaultModalIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(180deg, rgba(20,15,35,0.95) 0%, rgba(10,8,20,0.98) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '680px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139, 92, 246, 0.1)',
                    position: 'relative',
                    padding: '2rem',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10,
                    }}
                >
                    ✕
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '100px', padding: '4px 12px',
                        marginBottom: '1rem'
                    }}>
                        <ShieldCheck size={14} color="#a855f7" />
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c4b5fd' }}>
                            Estado de Inversor
                        </span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
                        Bóveda de Perks Globales
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                        El nivel de tus beneficios se calcula en base al valor total invertido en tu portafolio.
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.5)' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', color: '#a855f7' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Cargando datos on-chain...</span>
                    </div>
                ) : (
                    <>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px', padding: '1.25rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: '1.5rem',
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Inversión Total
                                </div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#00f0ff', fontFamily: "'Courier New', monospace" }}>
                                    ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Perks Desbloqueados
                                </div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#4ade80' }}>
                                    {GLOBAL_PERKS.filter(p => totalInvested >= p.min_tokens).length} / {GLOBAL_PERKS.length}
                                </div>
                            </div>
                        </div>

                        {/* Reusing the beautiful FanStatusPanel logic */}
                        <FanStatusPanel 
                            perks={GLOBAL_PERKS}
                            calcAmount={totalInvested}
                            tokenPrice={1} /* tokenPrice is 1 so calcAmount equals totalTokens directly in FanStatus logic */
                            onScrollToSlider={() => {}} /* No-op in global modal */
                        />
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}
