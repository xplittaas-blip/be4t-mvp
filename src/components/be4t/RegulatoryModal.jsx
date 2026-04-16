import React from 'react';

const RegulatoryModal = ({ onClose }) => {
    return (
        <div 
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    background: 'linear-gradient(145deg, #161224, #0d0a15)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.9), inset 0 0 100px rgba(0,0,0,0.8)',
                    borderRadius: '20px', padding: '2.5rem',
                    maxWidth: '550px', width: '100%',
                    position: 'relative',
                    // Faux leather/noise texture
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E"), linear-gradient(145deg, #161224, #0d0a15)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                        background: 'rgba(255,255,255,0.05)', border: 'none',
                        color: 'rgba(255,255,255,0.5)', width: '32px', height: '32px',
                        borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                    ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', boxShadow: '0 0 20px rgba(16,185,129,0.15)'
                    }}>
                        ⚖️
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                            Seguridad Jurídica
                        </h2>
                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
                            Regulatory Compliance
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c4b5fd', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🏛️ Marco Legal
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                            BE4T utiliza la Ley de Emisión de Activos Digitales de El Salvador para garantizar la propiedad real de los tokens.
                        </p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c4b5fd', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🔐 Custodia
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                            Los derechos están vinculados legalmente a contratos de recaudo digitalizados custodiados bajo máximos estándares de seguridad.
                        </p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c4b5fd', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🌐 Transparencia
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                            Auditoría on-chain de cada movimiento de regalías. Trazabilidad absoluta respaldada criptográficamente.
                        </p>
                    </div>

                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', lineHeight: 1.5 }}>
                    La inversión en activos digitales conlleva riesgos. BE4T opera bajo rigurosos protocolos de cumplimiento normativo internacional para proteger el capital y liquidar rendimientos de forma lícita y auditable.
                </div>
            </div>
        </div>
    );
};

export default RegulatoryModal;
