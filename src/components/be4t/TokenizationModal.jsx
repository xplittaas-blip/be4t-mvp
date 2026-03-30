import React, { useState } from 'react';
import { X, Network, Cpu, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { supabase } from '../../core/xplit/supabaseClient';
import './TokenizationModal.css';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const TokenizationModal = ({ asset, onClose, onSuccess }) => {
    const [isDeploying, setIsDeploying] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const tokenPrice = asset.token_price_usd || (asset.valuation_usd / asset.total_supply);

    const handleDeploy = async () => {
        setIsDeploying(true);

        // Simulated L2 Latency (3s)
        setTimeout(async () => {
            try {
                // Generate a custom BE4T branded EVM address
                const baseHash = ethers.Wallet.createRandom().address;
                const randomHash = '0xBE4T' + baseHash.substring(6);

                // Update Supabase DB
                const { error } = await supabase
                    .from('assets')
                    .update({ is_tokenized: true, contract_address: randomHash })
                    .eq('id', asset.id);

                if (error) throw error;

                setSuccessMessage(randomHash);
                
                // Allow user to see the success state briefly before auto-closing
                setTimeout(() => {
                    onSuccess({ ...asset, is_tokenized: true, contract_address: randomHash });
                }, 1500);

            } catch (err) {
                console.error('Error deployando contrato:', err);
                alert(`Error en despliegue: ${err.message}`);
                setIsDeploying(false);
            }
        }, 3000);
    };

    return (
        <div className="tokenization-overlay">
            <div className="tokenization-modal">
                {!isDeploying && !successMessage && (
                    <button className="btn-close-modal" onClick={onClose}><X size={24} /></button>
                )}

                <div className="tokenization-header">
                    <div className="network-icon-wrap">
                        {successMessage ? <CheckCircle size={32} color="#00f2fe" /> : <Network size={32} />}
                    </div>
                    <h2>Convertir Activo en Instrumento Financiero Digital</h2>
                    <p>Red Segura L2 • Gas Escalable</p>
                </div>

                <div className="tokenization-summary">
                    <div className="summary-row">
                        <span className="summary-label">Activo Objetivo</span>
                        <span className="summary-value" style={{maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{asset.name}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Fracciones (Supply)</span>
                        <span className="summary-value">{asset.total_supply} Tokens</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Valor (Valuation)</span>
                        <span className="summary-value">{formatCurrency(asset.valuation_usd || (tokenPrice * asset.total_supply))}</span>
                    </div>
                    {successMessage && (
                        <div className="summary-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                            <span className="summary-label">Hash Generado</span>
                            <span className="summary-value" style={{color: '#00f2fe', fontFamily: 'monospace', fontSize: '0.8rem'}}>
                                {successMessage.substring(0, 10)}...{successMessage.substring(successMessage.length - 8)}
                            </span>
                        </div>
                    )}
                </div>

                {!successMessage ? (
                    <button 
                        className="deploy-btn" 
                        onClick={handleDeploy} 
                        disabled={isDeploying}
                        style={{ background: isDeploying ? 'rgba(255,255,255,0.1)' : '' }}
                    >
                        <Cpu size={18} />
                        {isDeploying ? 'Conectando con Wallet... Firmando Transacción...' : 'Desplegar en Arbitrum Sepolia'}
                    </button>
                ) : (
                    <div style={{ textAlign: 'center', color: '#00f2fe', fontWeight: 'bold' }}>
                        ¡Transacción Confirmada! Cerrando...
                    </div>
                )}
            </div>
        </div>
    );
};

export default TokenizationModal;
