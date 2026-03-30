import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, PieChart, ShieldCheck, Cpu, Music, TrendingUp, User } from 'lucide-react';
import { BarChartMockup, DistributionChartMockup } from './ChartMockup';
import InvestmentCalculator from './InvestmentCalculator';
import './AssetDetailModal.css';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
};

const SpotifyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);
const YouTubeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const TABS = [
    { id: 'royalties', label: 'Regalías', icon: <PieChart size={14} /> },
    { id: 'bio', label: 'Artista', icon: <User size={14} /> },
    { id: 'invertir', label: 'Invertir', icon: <TrendingUp size={14} /> },
];

const AssetDetailModal = ({ asset, onClose, onTokenizeClick }) => {
    const [activeTab, setActiveTab] = useState('royalties');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    if (!asset) return null;

    const isMusic = asset.asset_type === 'music';
    const accentTheme = isMusic ? 'theme-music-modal' : 'theme-custom-modal';
    const totalValuation = asset.valuation_usd || (asset.token_price_usd * asset.total_supply) || 0;
    const meta = asset.metadata || {};

    const renderTabContent = () => {
        if (!isMusic) {
            return (
                <div className="dynamic-section">
                    <h4 className="section-label"><ShieldCheck size={16} /> Garantías y Colaterales</h4>
                    <div className="collateral-list">
                        <div className="collateral-item bg-gray">
                            <span className="collateral-key">Fondo de Garantía</span>
                            <span className="collateral-val">Cobertura del 80% sobre saldo insoluto</span>
                        </div>
                        <div className="collateral-item bg-gray">
                            <span className="collateral-key">Contrato Marco</span>
                            <span className="collateral-val">Registrado en Cámara de Comercio</span>
                        </div>
                        {Object.entries(meta).map(([k, v]) => (
                            <div key={k} className="collateral-item bg-gray">
                                <span className="collateral-key" style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                                <span className="collateral-val">{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'royalties':
                return (
                    <div>
                        {/* Streaming Stats */}
                        {(meta.spotify_streams || meta.youtube_views) && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '0.75rem',
                                marginBottom: '1.25rem',
                            }}>
                                <div style={{ background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                                        <SpotifyIcon />
                                        <span style={{ fontSize: '0.7rem', color: '#1DB954', textTransform: 'uppercase', letterSpacing: '1px' }}>Spotify</span>
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>{formatNumber(meta.spotify_streams)}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>streams</div>
                                </div>
                                <div style={{ background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                                        <YouTubeIcon />
                                        <span style={{ fontSize: '0.7rem', color: '#FF0000', textTransform: 'uppercase', letterSpacing: '1px' }}>YouTube</span>
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>{formatNumber(meta.youtube_views)}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>views</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>🎵 TikTok</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>{formatNumber(meta.tiktok_creations)}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>creations</div>
                                </div>
                            </div>
                        )}

                        {/* Royalty Distribution */}
                        <div className="dynamic-section">
                            <h4 className="section-label"><PieChart size={16} /> Distribución de Regalías</h4>
                            <DistributionChartMockup distributions={[
                                { label: 'Spotify', percentage: 55, color: '#1DB954' },
                                { label: 'Apple Music', percentage: 30, color: '#FA243C' },
                                { label: 'YouTube', percentage: 15, color: '#FF0000' }
                            ]} />
                        </div>

                        {/* Royalty Revenue Estimate */}
                        {meta.spotify_streams && (
                            <div style={{
                                background: 'rgba(0, 242, 254, 0.06)',
                                border: '1px solid rgba(0, 242, 254, 0.15)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginTop: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Regalías Anuales Estimadas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#00f2fe' }}>
                                        {formatCurrency((meta.spotify_streams / 1_000_000) * 3000)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Modelo BE4T</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>$3K / 1M streams</div>
                                </div>
                            </div>
                        )}

                        {/* Historical Chart */}
                        <div className="performance-chart-section" style={{ marginTop: '1rem' }}>
                            <h4 className="section-label">Histórico de Ingresos (Simulado)</h4>
                            <BarChartMockup data={[
                                { label: 'Ene', value: 450 }, { label: 'Feb', value: 520 },
                                { label: 'Mar', value: 480 }, { label: 'Abr', value: 610 },
                                { label: 'May', value: 590 }, { label: 'Jun', value: 680 },
                            ]} />
                        </div>
                    </div>
                );

            case 'bio':
                return (
                    <div>
                        {/* Artist Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #9013fe, #00c6ff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: '800', flexShrink: 0,
                            }}>
                                {(meta.artist || asset.name).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{meta.artist || asset.name}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                                    {meta.genre || 'Música'} · {meta.label || 'Indie'} · {meta.release_year || '2024'}
                                </p>
                            </div>
                        </div>

                        {/* Monthly Listeners */}
                        {meta.monthly_listeners && (
                            <div style={{
                                background: 'rgba(29,185,84,0.08)',
                                border: '1px solid rgba(29,185,84,0.2)',
                                borderRadius: '10px', padding: '0.75rem 1rem',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: '1.25rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <SpotifyIcon />
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Oyentes mensuales en Spotify</span>
                                </div>
                                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1DB954' }}>
                                    {formatNumber(meta.monthly_listeners)}
                                </span>
                            </div>
                        )}

                        {/* Bio */}
                        {meta.bio && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h4 className="section-label"><User size={14} /> Biografía</h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.7', marginTop: '0.5rem' }}>
                                    {meta.bio}
                                </p>
                            </div>
                        )}

                        {/* Review */}
                        {meta.review && (
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '12px', padding: '1rem', 
                                borderLeft: '3px solid rgba(144, 19, 254, 0.6)',
                            }}>
                                <h4 className="section-label" style={{ marginBottom: '0.5rem' }}><Music size={14} /> Reseña del Track</h4>
                                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.87rem', lineHeight: '1.7', fontStyle: 'italic' }}>
                                    {meta.review}
                                </p>
                            </div>
                        )}

                        {/* Legal */}
                        <div className="legal-section glass-panel" style={{ marginTop: '1rem' }}>
                            <div className="legal-icon"><FileText size={24} /></div>
                            <div className="legal-info">
                                <h4 className="legal-title">Documentación Legal</h4>
                                <p className="legal-desc">
                                    ISRC: <strong>{meta.isrc || 'N/A'}</strong> · Certificado de Derechos Digitales BE4T
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'invertir':
                return <InvestmentCalculator asset={asset} />;

            default:
                return null;
        }
    };

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-container asset-detail-modal ${accentTheme}`} onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <div className="modal-header">
                    <span className="modal-badge">{isMusic ? `${meta.genre || 'Activo Musical'}` : 'Activo Institucional'}</span>
                    <h2 className="modal-title">{asset.name}</h2>
                    <p className="modal-subtitle">
                        {isMusic
                            ? `${meta.artist || ''} · ISRC: ${meta.isrc || 'N/A'}`
                            : `ID: ${asset.id}`}
                    </p>

                    {/* Financial Quick Stats */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Valuación</div>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ce89ff' }}>{formatCurrency(totalValuation)}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Por Fracción</div>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#00f2fe' }}>{formatCurrency(asset.token_price_usd || totalValuation / asset.total_supply)}</div>
                        </div>
                        {isMusic && meta.yield_estimate && (
                            <div style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>APY Est.</div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1DB954' }}>{meta.yield_estimate}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs (only for music) */}
                {isMusic && (
                    <div style={{
                        display: 'flex',
                        gap: '0.25rem',
                        padding: '0 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        marginBottom: '0',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                    }}>
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab.id ? '2px solid #9013fe' : '2px solid transparent',
                                    color: activeTab === tab.id ? '#ce89ff' : 'rgba(255,255,255,0.45)',
                                    fontWeight: activeTab === tab.id ? '700' : '400',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="modal-body">
                    {renderTabContent()}
                </div>

                <div className="modal-footer">
                    {onTokenizeClick && !asset.is_tokenized && (
                        <button
                            className="primary-btn full-width"
                            style={{ background: 'rgba(144, 19, 254, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
                            onClick={() => {
                                alert('Preparando despliegue en Arbitrum Testnet...');
                                onClose();
                                onTokenizeClick();
                            }}
                        >
                            <Cpu size={18} /> Generar Smart Contract
                        </button>
                    )}
                    <button 
                        className="primary-btn full-width" 
                        style={{ background: 'var(--primary-color)' }}
                        onClick={() => setActiveTab('invertir')}
                    >
                        Invertir en este Activo
                    </button>
                    <p className="footer-disclaimer">La ejecución técnica y la infraestructura de liquidación es gestionada por BE4T.</p>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AssetDetailModal;
