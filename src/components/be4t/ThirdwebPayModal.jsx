/**
 * ThirdwebPayModal — BE4T Fiat-to-Crypto Onramp (Real Test Only)
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps Thirdweb's PayEmbed in a slide-up modal sheet.
 * Allows users without ETH/USDC balance to fund their Smart Wallet
 * via credit card before confirming the token investment.
 *
 * Only rendered in production mode — tree-shaken out in showcase builds.
 *
 * Props:
 *   isOpen       boolean         — controls visibility
 *   onClose      () => void
 *   onSuccess    () => void      — called when payment confirmed
 *   songName     string          — for display context
 *   amountUSD    number          — suggested buy amount
 */

import React, { useEffect } from 'react';
import { PayEmbed } from 'thirdweb/react';
import { baseSepolia } from 'thirdweb/chains';
import { client } from '../../core/thirdwebClient';

const OVERLAY_STYLE = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    transition: 'opacity 0.25s ease',
};

const SHEET_STYLE = {
    width: '100%',
    maxWidth: '480px',
    background: '#0d0f17',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px 24px 0 0',
    padding: '0 0 2rem',
    overflow: 'hidden',
    boxShadow: '0 -24px 80px rgba(0,0,0,0.6)',
    animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
};

const DRAG_HANDLE_STYLE = {
    width: '40px', height: '4px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '2px',
    margin: '12px auto 0',
};

const HEADER_STYLE = {
    padding: '1rem 1.25rem 0.75rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
};

export default function ThirdwebPayModal({ isOpen, onClose, onSuccess, songName, amountUSD }) {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                .tw-pay-close:hover { opacity: 0.7; }
            `}</style>

            <div style={OVERLAY_STYLE} onClick={onClose}>
                <div style={SHEET_STYLE} onClick={e => e.stopPropagation()}>
                    {/* Drag handle */}
                    <div style={DRAG_HANDLE_STYLE} />

                    {/* Header */}
                    <div style={HEADER_STYLE}>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'white', letterSpacing: '-0.02em' }}>
                                Fondear e Invertir
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>
                                Invirtiendo en <span style={{ color: '#a855f7' }}>{songName}</span>
                            </div>
                        </div>
                        <button
                            className="tw-pay-close"
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Info strip */}
                    <div style={{
                        margin: '0 1.25rem 1rem',
                        padding: '0.65rem 0.9rem',
                        background: 'rgba(168,85,247,0.1)',
                        border: '1px solid rgba(168,85,247,0.25)',
                        borderRadius: '10px',
                        fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)',
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    }}>
                        <span style={{ fontSize: '0.9rem' }}>🔐</span>
                        <span>
                            Los fondos se acreditarán en tu Smart Wallet de Base Sepolia.
                            Podrás reinvertir o retirar en cualquier momento.
                        </span>
                    </div>

                    {/* Thirdweb PayEmbed */}
                    <div style={{ padding: '0 1.25rem' }}>
                        <PayEmbed
                            client={client}
                            theme="dark"
                            payOptions={{
                                mode: 'fund_wallet',
                                prefillBuy: {
                                    chain: baseSepolia,
                                    amount: amountUSD ? String(amountUSD) : '10',
                                },
                            }}
                            style={{ width: '100%', borderRadius: '16px' }}
                        />
                    </div>

                    {/* Footer note */}
                    <p style={{
                        textAlign: 'center', fontSize: '0.68rem',
                        color: 'rgba(255,255,255,0.25)',
                        margin: '0.75rem 1.25rem 0',
                        lineHeight: 1.5,
                    }}>
                        Powered by Thirdweb Pay · Pagos procesados por Stripe/Coinbase
                    </p>
                </div>
            </div>
        </>
    );
}
