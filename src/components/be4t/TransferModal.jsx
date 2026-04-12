/**
 * BE4T TransferModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Allows users to transfer their ERC-1155 royalty tokens to another wallet.
 *
 * States: form → loading → success → error
 *
 * Props:
 *  holding   — the portfolio holding object { song, token_price, tokens, ... }
 *  onClose   — close callback
 */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { isProduction } from '../../core/env';

// ── Helpers ────────────────────────────────────────────────────────────────────
const isValidAddress = (addr) => /^0x[0-9a-fA-F]{40}$/.test(addr);

const humanizeTransferError = (err) => {
    const msg = (err?.message || String(err)).toLowerCase();
    if (msg.includes('user rejected') || msg.includes('user denied'))
        return 'Cancelaste la transacción.';
    if (msg.includes('insufficient funds') || msg.includes('insufficient balance'))
        return 'Saldo de gas insuficiente. Necesitas ETH en Base para pagar el gas.';
    if (msg.includes('invalid address') || msg.includes('invalid addressorchecksumaddress'))
        return 'Dirección de destino inválida. Asegúrate de que sea una dirección Ethereum válida (0x...).';
    if (msg.includes('execution reverted') || msg.includes('revert'))
        return 'El contrato rechazó la transferencia. Verifica que tienes suficientes tokens.';
    if (msg.includes('network') || msg.includes('timeout'))
        return 'Error de red. Revisa tu conexión e inténtalo de nuevo.';
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = () => (
    <div style={{
        width: '44px', height: '44px', borderRadius: '50%', margin: '0 auto',
        border: '3px solid rgba(139,92,246,0.15)',
        borderTopColor: '#8B5CF6',
        animation: 'tf-spin 0.9s linear infinite',
    }} />
);

// ── Main ───────────────────────────────────────────────────────────────────────
const TransferModal = ({ holding, onClose }) => {
    const [toAddress, setToAddress]   = useState('');
    const [qty, setQty]               = useState(1);
    const [status, setStatus]         = useState('form'); // form | loading | success | error
    const [txHash, setTxHash]         = useState(null);
    const [errorMsg, setErrorMsg]     = useState(null);
    const [addrError, setAddrError]   = useState(null);

    const maxQty     = holding.tokens ?? 1;
    const priceUSD   = holding.token_price ?? 10;
    const totalUSD   = priceUSD * qty;

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && status !== 'loading') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [status, onClose]);

    const validateAndSubmit = async () => {
        if (!isValidAddress(toAddress)) {
            setAddrError('Dirección inválida. Debe empezar con 0x y tener 42 caracteres.');
            return;
        }
        if (qty < 1 || qty > maxQty) {
            setAddrError(`Cantidad inválida. Máximo: ${maxQty}`);
            return;
        }
        setAddrError(null);
        setStatus('loading');

        try {
            if (!isProduction) {
                // Showcase simulation
                await new Promise(r => setTimeout(r, 1800));
                setTxHash('0xDEMO_' + Math.random().toString(16).slice(2, 18).toUpperCase());
                setStatus('success');
                return;
            }

            // Production: real ERC-1155 safeTransferFrom
            const { getThirdwebClient } = await import('../../core/web3Client');
            const web3 = await getThirdwebClient();
            if (!web3) throw new Error('Web3 client not initialised');

            const contractAddress = holding.contract_address;
            if (!contractAddress) throw new Error('No contract address for this asset');

            const { getContract, prepareContractCall, sendTransaction } = await import('thirdweb');
            // Need account from navigation-level wallet — for now we'll read from window.thirdweb if available
            const account = window.__be4t_account__;
            if (!account) throw new Error('Wallet not connected');

            const contract = getContract({ client: web3.client, chain: web3.chain, address: contractAddress });
            const tx = prepareContractCall({
                contract,
                method: 'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
                params: [account.address, toAddress, BigInt(holding.token_id ?? 0), BigInt(qty), '0x'],
            });
            const receipt = await sendTransaction({ transaction: tx, account });
            setTxHash(receipt.transactionHash);
            setStatus('success');

            // Notify backend
            await fetch('/api/update-token-supply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: holding.id, qty: 0, txHash: receipt.transactionHash }),
            }).catch(() => {});
        } catch (err) {
            setErrorMsg(humanizeTransferError(err));
            setStatus('error');
        }
    };

    const explorerUrl = txHash && !txHash.startsWith('0xDEMO')
        ? `https://sepolia.basescan.org/tx/${txHash}` : null;

    return (
        <>
            <style>{`
                @keyframes tf-spin     { to { transform: rotate(360deg); } }
                @keyframes tf-fade-in  {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes tf-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4); }
                    50%      { box-shadow: 0 0 0 18px rgba(139,92,246,0); }
                }
            `}</style>

            {/* Backdrop */}
            <div onClick={status !== 'loading' ? onClose : undefined} style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}>
                <div onClick={e => e.stopPropagation()} style={{
                    background: 'linear-gradient(160deg, #0d1117 0%, #0f1520 100%)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: '22px', padding: '2rem',
                    width: '100%', maxWidth: '440px',
                    animation: 'tf-fade-in 0.3s cubic-bezier(0.25,0.8,0.25,1)',
                    position: 'relative',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
                }}>
                    {status !== 'loading' && (
                        <button onClick={onClose} style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%', width: '28px', height: '28px',
                            color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                    )}

                    {/* ── FORM ── */}
                    {status === 'form' && (
                        <div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px',
                                    color: '#a78bfa', background: 'rgba(139,92,246,0.1)',
                                    border: '1px solid rgba(139,92,246,0.25)',
                                    borderRadius: '100px', padding: '0.25rem 0.85rem',
                                }}>
                                    {isProduction ? '🔗 Base Sepolia — Transferencia Real' : '🎬 Demo — Transferencia Simulada'}
                                </span>
                            </div>

                            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '0.25rem', letterSpacing: '-0.04em' }}>
                                Transferir participación
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                                {holding.song} — {holding.artist}
                            </p>

                            {/* Summary */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {[
                                        { label: 'Tokens propios',   value: `${maxQty}` },
                                        { label: 'Precio / Token',   value: `$${priceUSD}` },
                                        { label: 'Valor a transferir', value: `$${totalUSD.toFixed(2)} USD`, color: '#c4b5fd' },
                                        { label: 'Red',              value: 'Base Sepolia' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label}>
                                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{label}</div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: color || 'rgba(255,255,255,0.88)' }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Destination address */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.5rem' }}>
                                    Dirección de destino
                                </label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    value={toAddress}
                                    onChange={e => { setToAddress(e.target.value); setAddrError(null); }}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${addrError ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '10px', color: 'white',
                                        fontSize: '0.85rem', fontFamily: "'Courier New', monospace",
                                        outline: 'none', boxSizing: 'border-box',
                                    }}
                                />
                                {addrError && <p style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '0.4rem' }}>{addrError}</p>}
                            </div>

                            {/* Quantity */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.5rem' }}>
                                    Cantidad de tokens
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {['-', '+'].map((op, i) => (
                                        <button key={op} onClick={() => setQty(q => i === 0 ? Math.max(1, q - 1) : Math.min(maxQty, q + 1))}
                                            style={{ width: '36px', height: '36px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>
                                            {op}
                                        </button>
                                    ))}
                                    <span style={{ fontWeight: '900', fontSize: '1.4rem', minWidth: '2rem', textAlign: 'center', letterSpacing: '-0.04em' }}>{qty}</span>
                                    <span style={{ marginLeft: 'auto', fontWeight: '700', color: '#a78bfa', fontSize: '1rem' }}>${totalUSD.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={validateAndSubmit}
                                disabled={!toAddress}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: !toAddress
                                        ? 'rgba(139,92,246,0.12)'
                                        : 'linear-gradient(135deg, #4c1d95, #8B5CF6)',
                                    border: '1px solid rgba(139,92,246,0.35)',
                                    borderRadius: '13px', color: !toAddress ? 'rgba(255,255,255,0.3)' : 'white',
                                    fontWeight: '800', fontSize: '1rem', cursor: !toAddress ? 'not-allowed' : 'pointer',
                                    boxShadow: !toAddress ? 'none' : '0 4px 20px rgba(139,92,246,0.35)',
                                    transition: 'all 0.25s ease',
                                }}
                            >
                                {isProduction ? `Transferir ${qty} token${qty > 1 ? 's' : ''} →` : 'Simular transferencia →'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.6rem' }}>
                                {isProduction ? 'Requiere wallet conectada · Gas en ETH (Base)' : 'Modo demo · Sin costo'}
                            </p>
                        </div>
                    )}

                    {/* ── LOADING ── */}
                    {status === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                            <Spinner />
                            <h3 style={{ marginTop: '1.75rem', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                                {isProduction ? 'Ejecutando transferencia…' : 'Procesando…'}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                {isProduction ? 'Confirmando en Base Sepolia. No cierres esta ventana.' : 'Simulando la transferencia…'}
                            </p>
                        </div>
                    )}

                    {/* ── SUCCESS ── */}
                    {status === 'success' && (
                        <div style={{ textAlign: 'center', animation: 'tf-fade-in 0.4s ease' }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4c1d95, #8B5CF6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem', fontSize: '2rem',
                                animation: 'tf-pulse 1.5s ease 1',
                                boxShadow: '0 0 40px rgba(139,92,246,0.3)',
                            }}>↗</div>
                            <h3 style={{ fontWeight: '900', fontSize: '1.25rem', marginBottom: '0.4rem' }}>
                                ¡Transferencia exitosa!
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                <strong style={{ color: 'white' }}>{qty} token{qty > 1 ? 's' : ''}</strong> enviados a{' '}
                                <code style={{ fontSize: '0.78rem', color: '#a78bfa' }}>
                                    {toAddress.slice(0, 8)}…{toAddress.slice(-6)}
                                </code>
                            </p>
                            {txHash && (
                                <div style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', wordBreak: 'break-all' }}>
                                    <div style={{ fontSize: '0.6rem', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                                        {txHash.startsWith('0xDEMO') ? '⚡ Demo TX ID' : '🔗 Transaction Hash'}
                                    </div>
                                    <code style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>{txHash}</code>
                                </div>
                            )}
                            {explorerUrl && (
                                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{
                                    display: 'inline-flex', gap: '6px', alignItems: 'center',
                                    marginBottom: '1.25rem', color: '#a78bfa', fontSize: '0.82rem', fontWeight: '700',
                                    textDecoration: 'none', padding: '0.45rem 1rem',
                                    border: '1px solid rgba(139,92,246,0.25)', borderRadius: '100px',
                                    background: 'rgba(139,92,246,0.08)',
                                }}>Ver en BaseScan ↗</a>
                            )}
                            <button onClick={onClose} style={{
                                width: '100%', padding: '0.9rem',
                                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                                borderRadius: '13px', color: '#a78bfa', fontWeight: '700', cursor: 'pointer',
                            }}>Cerrar</button>
                        </div>
                    )}

                    {/* ── ERROR ── */}
                    {status === 'error' && (
                        <div style={{ textAlign: 'center', animation: 'tf-fade-in 0.4s ease' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem', fontSize: '1.8rem',
                            }}>⚠</div>
                            <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem', color: '#f87171' }}>
                                Transferencia fallida
                            </h3>
                            <p style={{
                                color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.65,
                                background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.12)',
                                borderRadius: '10px', padding: '0.85rem',
                            }}>{errorMsg}</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => { setStatus('form'); setErrorMsg(null); }} style={{
                                    flex: 1, padding: '0.85rem',
                                    background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                                    borderRadius: '12px', color: '#a78bfa', fontWeight: '700', cursor: 'pointer',
                                }}>Reintentar</button>
                                <button onClick={onClose} style={{
                                    flex: 1, padding: '0.85rem',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: '600', cursor: 'pointer',
                                }}>Cancelar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TransferModal;
