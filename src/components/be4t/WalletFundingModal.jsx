import React, { useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   BE4T — WalletFundingModal
   "Centro de Fondeo Híbrido" — Web3 wallets + Fiat local (PSE / bancos CO)
───────────────────────────────────────────────────────────────────────────── */

// ── Icons ─────────────────────────────────────────────────────────────────────
const MetaMaskIcon = () => (
    <svg width="28" height="28" viewBox="0 0 318 318" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M274.1 35.5 173.3 111l19-44.7L274.1 35.5z" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
        <path d="M44.4 35.5 144.3 111.7l-18.1-45.4L44.4 35.5z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M238.3 206.8l-26.5 40.6 56.7 15.6 16.3-55.4-46.5-.8z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M33.9 207.6l16.2 55.4 56.6-15.6-26.5-40.6-46.3.8z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M103.6 138.2l-15.8 23.9 56.3 2.5-1.9-60.6-38.6 34.2z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M214.9 138.2l-39-34.8-1.3 61.2 56.2-2.5-15.9-23.9z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M106.7 247.4l33.8-16.5-29.2-22.8-4.6 39.3z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M178 230.9l33.9 16.5-4.7-39.3-29.2 22.8z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    </svg>
);

const CoinbaseIcon = () => (
    <svg width="28" height="28" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <circle cx="512" cy="512" r="512" fill="#0052FF"/>
        <rect x="352" y="352" width="320" height="320" rx="160" fill="white"/>
    </svg>
);

const TrustWalletIcon = () => (
    <svg width="28" height="28" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <circle cx="512" cy="512" r="512" fill="#3375BB"/>
        <path d="M512 200 L750 310 L750 520 C750 660 640 770 512 820 C384 770 274 660 274 520 L274 310 Z" fill="white" opacity="0.9"/>
        <path d="M430 512 L490 572 L600 440" stroke="#3375BB" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
);

const WalletConnectIcon = () => (
    <svg width="28" height="28" viewBox="0 0 300 185" xmlns="http://www.w3.org/2000/svg">
        <circle cx="150" cy="92" r="92" fill="#3396FF"/>
        <path d="M73 88c43-42 112-42 155 0l5 5-18 18-5-5c-30-30-79-30-109 0l-5 5L78 93l-5-5z" fill="white"/>
        <path d="M167 124l15 15c1 1 3 1 4 0l9-9 9-9c1-1 1-3 0-4l-2-2-15 15-15-15-5 9z" fill="white"/>
        <path d="M115 124l2 2 15-15 15 15 5-9-15-15c-1-1-3-1-4 0l-18 18c-1 1-1 3 0 4z" fill="white"/>
    </svg>
);

const OKXIcon = () => (
    <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#000"/>
        <rect x="7" y="7" width="6" height="6" fill="white"/>
        <rect x="13" y="13" width="6" height="6" fill="white"/>
        <rect x="19" y="7" width="6" height="6" fill="white"/>
        <rect x="7" y="19" width="6" height="6" fill="white"/>
        <rect x="19" y="19" width="6" height="6" fill="white"/>
    </svg>
);

const PSEIcon = () => (
    <svg width="28" height="28" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" rx="6" fill="#E8F4FD"/>
        <text x="60" y="28" textAnchor="middle" fill="#0066CC" fontSize="18" fontWeight="900" fontFamily="Arial,sans-serif">PSE</text>
    </svg>
);

const BancolombiaIcon = () => (
    <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#FFCC00"/>
        <text x="50" y="65" textAnchor="middle" fill="#333" fontSize="18" fontWeight="900" fontFamily="Arial,sans-serif">BC</text>
    </svg>
);

const DaviviendaIcon = () => (
    <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#E30613"/>
        <text x="50" y="65" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">DAVI</text>
    </svg>
);

const NequiIcon = () => (
    <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#6A0DAD"/>
        <text x="50" y="65" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Arial,sans-serif">Nq</text>
    </svg>
);

// ── Colombian banks for PSE sub-flow ──────────────────────────────────────────
const CO_BANKS = [
    'Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA Colombia',
    'Nequi', 'Banco Popular', 'Banco Occidente', 'Banco Falabella',
    'Scotiabank Colpatria', 'Banco de Occidente', 'Itaú', 'Banco AV Villas',
];

// ── Option Row ────────────────────────────────────────────────────────────────
const OptionRow = ({ icon, label, badge, onClick, disabled }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem',
                width: '100%', padding: '0.9rem 1.1rem',
                background: hovered ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.04)',
                border: hovered
                    ? '1px solid transparent'
                    : '1px solid rgba(255,255,255,0.08)',
                backgroundImage: hovered
                    ? 'linear-gradient(rgba(139,92,246,0.08), rgba(6,182,212,0.08)), linear-gradient(135deg, #7c3aed, #06b6d4)'
                    : 'none',
                backgroundOrigin: hovered ? 'border-box' : 'padding-box',
                backgroundClip: hovered ? 'padding-box, border-box' : 'border-box',
                borderRadius: '12px',
                color: 'white', cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left', opacity: disabled ? 0.45 : 1,
                transition: 'all 0.22s ease',
                boxShadow: hovered ? '0 0 0 1px rgba(124,58,237,0.5), 0 0 18px rgba(6,182,212,0.15)' : 'none',
                position: 'relative',
            }}
        >
            {/* Gradient border on hover via box-shadow + outline trick */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '12px',
                background: hovered
                    ? 'linear-gradient(135deg, #7c3aed33, #06b6d433)'
                    : 'transparent',
                transition: 'all 0.22s ease',
                pointerEvents: 'none',
            }} />
            <div style={{ flexShrink: 0, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <span style={{ fontWeight: '600', fontSize: '0.93rem', flex: 1, letterSpacing: '-0.01em' }}>
                {label}
            </span>
            {badge && (
                <span style={{
                    fontSize: '0.6rem', fontWeight: '700', padding: '0.2rem 0.5rem',
                    borderRadius: '100px', background: 'rgba(6,182,212,0.2)',
                    border: '1px solid rgba(6,182,212,0.4)', color: '#06b6d4',
                    textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                }}>{badge}</span>
            )}
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1rem' }}>›</span>
        </button>
    );
};

// ── PSE Sub-Flow ──────────────────────────────────────────────────────────────
const PSEFlow = ({ onBack, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [bank, setBank] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        if (!amount || !bank) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1800));
        setLoading(false);
        onSuccess({ method: 'PSE', amount, bank });
    };

    const formatted = amount
        ? Number(amount.replace(/\D/g, '')).toLocaleString('es-CO')
        : '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <button onClick={onBack}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                    ← Volver
                </button>
                <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>PSE — Pago en Línea</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Débito inmediato desde tu cuenta bancaria</div>
                </div>
            </div>

            {/* Amount */}
            <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Monto en COP
                </label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>$</span>
                    <input
                        type="text" inputMode="numeric" placeholder="0"
                        value={formatted}
                        onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '');
                            setAmount(raw);
                        }}
                        style={{
                            width: '100%', padding: '0.85rem 1rem 0.85rem 1.8rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '10px', color: 'white',
                            fontSize: '1.1rem', fontWeight: '700',
                            outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                    />
                    <span style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>COP</span>
                </div>
                {/* Quick amounts */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {['50000','100000','250000','500000'].map(v => (
                        <button key={v} onClick={() => setAmount(v)}
                            style={{
                                padding: '0.3rem 0.7rem', borderRadius: '100px', cursor: 'pointer',
                                background: amount === v ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                                border: amount === v ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                color: amount === v ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap',
                            }}>
                            ${Number(v).toLocaleString('es-CO')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bank selector */}
            <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Tu Banco
                </label>
                <select
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                    style={{
                        width: '100%', padding: '0.85rem 1rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${bank ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: '10px', color: bank ? 'white' : 'rgba(255,255,255,0.35)',
                        fontSize: '0.92rem', outline: 'none', cursor: 'pointer',
                        boxSizing: 'border-box',
                    }}
                >
                    <option value="" style={{ background: '#0f1117', color: 'rgba(255,255,255,0.4)' }}>Selecciona tu banco...</option>
                    {CO_BANKS.map(b => <option key={b} value={b} style={{ background: '#0f1117', color: 'white' }}>{b}</option>)}
                </select>
            </div>

            {/* Security note */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '10px', padding: '0.7rem 0.9rem' }}>
                <span>🔒</span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    Redireccionarás al portal seguro de PSE. Tu sesión bancaria es privada y no se almacena en BE4T.
                </p>
            </div>

            {/* CTA */}
            <button
                onClick={handlePay}
                disabled={!amount || !bank || loading}
                style={{
                    width: '100%', padding: '1rem', minHeight: '52px',
                    background: (!amount || !bank)
                        ? 'rgba(255,255,255,0.08)'
                        : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    border: 'none', borderRadius: '12px',
                    color: (!amount || !bank) ? 'rgba(255,255,255,0.3)' : 'white',
                    fontWeight: '800', fontSize: '1rem', cursor: (!amount || !bank) ? 'not-allowed' : 'pointer',
                    boxShadow: (!amount || !bank) ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
            >
                {loading ? (
                    <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                            style={{ animation: 'be4t-spin 0.8s linear infinite' }}>
                            <path d="M12 2a10 10 0 0 1 10 10"/>
                            <style>{'@keyframes be4t-spin { to { transform: rotate(360deg); }}'}</style>
                        </svg>
                        Redirigiendo a PSE...
                    </>
                ) : `Pagar $${amount ? Number(amount).toLocaleString('es-CO') : '0'} COP via PSE →`}
            </button>
        </div>
    );
};

// ── Success Screen ────────────────────────────────────────────────────────────
const SuccessScreen = ({ detail, onClose }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0', textAlign: 'center' }}>
        <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', boxShadow: '0 0 24px rgba(34,197,94,0.4)',
        }}>✓</div>
        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem' }}>¡Todo listo!</h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem' }}>
            {detail.method === 'PSE'
                ? `Pago de $${Number(detail.amount).toLocaleString('es-CO')} COP iniciado desde ${detail.bank}`
                : `${detail.method} conectado exitosamente`}
        </p>
        <button onClick={onClose}
            style={{
                padding: '0.85rem 2rem', marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            }}>
            Explorar Marketplace →
        </button>
    </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const WalletFundingModal = ({ isOpen, onClose }) => {
    const [view, setView] = useState('main'); // 'main' | 'pse' | 'success'
    const [successDetail, setSuccessDetail] = useState(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) { setView('main'); setSuccessDetail(null); }
    }, [isOpen]);

    // Trap focus / close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [isOpen, onClose]);

    const connectWeb3 = useCallback((walletName) => {
        setTimeout(() => {
            setSuccessDetail({ method: walletName });
            setView('success');
        }, 800);
    }, []);

    if (!isOpen) return null;

    const WEB3_OPTIONS = [
        { id: 'metamask',      icon: <MetaMaskIcon />,      label: 'MetaMask',      badge: 'Popular' },
        { id: 'coinbase',      icon: <CoinbaseIcon />,      label: 'Coinbase Wallet' },
        { id: 'trustwallet',   icon: <TrustWalletIcon />,   label: 'Trust Wallet' },
        { id: 'walletconnect', icon: <WalletConnectIcon />, label: 'WalletConnect',  badge: 'Multi-chain' },
        { id: 'okx',           icon: <OKXIcon />,           label: 'OKX Wallet' },
    ];

    const FIAT_OPTIONS = [
        {
            id: 'pse', icon: <PSEIcon />, label: 'PSE — Pagos Seguros en Línea', badge: 'CO',
            onClick: () => setView('pse'),
        },
        {
            id: 'banks', icon: (
                <div style={{ display: 'flex', gap: '3px' }}>
                    <BancolombiaIcon /><DaviviendaIcon /><NequiIcon />
                </div>
            ),
            label: 'Bancolombia · Davivienda · Nequi',
            onClick: () => setView('pse'),
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 999,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
            />

            {/* Modal panel */}
            <div
                role="dialog" aria-modal="true" aria-label="Fondea tu cuenta BE4T"
                style={{
                    position: 'fixed', zIndex: 1000,
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(92vw, 460px)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    background: 'rgba(10,10,20,0.92)',
                    backdropFilter: 'blur(28px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: '20px',
                    boxShadow: '0 0 0 1px rgba(6,182,212,0.1), 0 32px 80px rgba(0,0,0,0.7)',
                    padding: '1.5rem',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── MAIN VIEW ── */}
                {view === 'main' && (
                    <>
                        {/* Close */}
                        <button onClick={onClose} aria-label="Cerrar"
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>✕</button>

                        {/* Header */}
                        <div style={{ marginBottom: '1.25rem', paddingRight: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '1.3rem' }}>💳</span>
                                <h2 style={{
                                    margin: 0,
                                    fontFamily: "'Inter Tight', 'Inter', sans-serif",
                                    fontWeight: '900', fontSize: '1.25rem',
                                    background: 'linear-gradient(90deg, #ffffff 40%, #c4b5fd)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>Fondea tu cuenta BE4T</h2>
                            </div>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                                Selecciona un método para conectar tu wallet o agregar créditos
                            </p>
                        </div>

                        {/* ── Section A: Web3 ── */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #7c3aed44, transparent)' }} />
                                <span style={{
                                    fontSize: '0.62rem', fontWeight: '700', letterSpacing: '2px',
                                    color: '#a855f7', textTransform: 'uppercase',
                                }}>⛓ Métodos Digitales (Web3)</span>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, #06b6d444)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {WEB3_OPTIONS.map(opt => (
                                    <OptionRow
                                        key={opt.id}
                                        icon={opt.icon}
                                        label={opt.label}
                                        badge={opt.badge}
                                        onClick={() => connectWeb3(opt.label)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ── Section B: Fiat ── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #06b6d444, transparent)' }} />
                                <span style={{
                                    fontSize: '0.62rem', fontWeight: '700', letterSpacing: '2px',
                                    color: '#06b6d4', textTransform: 'uppercase',
                                }}>🏦 Créditos Fiat (Bancos Locales)</span>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, #7c3aed44)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {FIAT_OPTIONS.map(opt => (
                                    <OptionRow
                                        key={opt.id}
                                        icon={opt.icon}
                                        label={opt.label}
                                        badge={opt.id === 'pse' ? 'Recomendado' : undefined}
                                        onClick={opt.onClick}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <p style={{ textAlign: 'center', marginTop: '1.25rem', margin: '1.25rem 0 0', fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
                            Al conectar aceptas los{' '}
                            <a href="#" style={{ color: '#7c3aed', textDecoration: 'none' }}>términos y condiciones</a>
                            {' '}de BE4T. Tus fondos están protegidos.
                        </p>
                    </>
                )}

                {/* ── PSE VIEW ── */}
                {view === 'pse' && (
                    <PSEFlow
                        onBack={() => setView('main')}
                        onSuccess={(detail) => {
                            setSuccessDetail(detail);
                            setView('success');
                        }}
                    />
                )}

                {/* ── SUCCESS VIEW ── */}
                {view === 'success' && (
                    <SuccessScreen detail={successDetail} onClose={onClose} />
                )}
            </div>
        </>
    );
};

export default WalletFundingModal;
