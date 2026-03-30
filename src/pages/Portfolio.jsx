import React from 'react';
import { DollarSign, Activity, PieChart, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Portfolio.css';

const Portfolio = () => {
    const { t } = useTranslation('common');

    const investments = [
        { id: 1, song: "Neon Nights (Extended Mix)", artist: "The Midnight Echo", tokens: 5, value: "$50.00", earned: "$3.45", roi: "+6.9%", yt: "2.1M", sp: "4.5M", trend: t('trend_growing') },
        { id: 2, song: "Summer Breeze v2", artist: "Luna Waves", tokens: 10, value: "$55.00", earned: "$1.20", roi: "+2.1%", yt: "850K", sp: "1.2M", trend: t('trend_stable') },
        { id: 3, song: "Urban Beats", artist: "DJ Matrix", tokens: 2, value: "$25.00", earned: "$4.10", roi: "+16.4%", yt: "5.4M", sp: "8.1M", trend: t('trend_momentum') }
    ];

    const SpotifyIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954" style={{ marginRight: '4px' }}>
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
        </svg>
    );

    const YouTubeIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF0000" style={{ marginRight: '4px' }}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );

    return (
        <div className="portfolio-page animate-fade-in">
            <header className="portfolio-header">
                <h1 className="page-title">{t('port_title')} <span className="text-gradient">{t('port_title_highlight')}</span></h1>
                <p className="page-subtitle">{t('port_subtitle')}</p>
            </header>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card glass-panel">
                    <div className="kpi-icon"><DollarSign size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">{t('total_value')}</span>
                        <span className="kpi-value text-gradient">$130.00</span>
                    </div>
                </div>
                <div className="kpi-card glass-panel">
                    <div className="kpi-icon"><Activity size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">{t('cum_yield')}</span>
                        <span className="kpi-value success-text">$8.75</span>
                    </div>
                </div>
                <div className="kpi-card glass-panel">
                    <div className="kpi-icon"><PieChart size={24} /></div>
                    <div className="kpi-info">
                        <span className="kpi-label">{t('avg_roi')}</span>
                        <span className="kpi-value">12.4%</span>
                    </div>
                </div>
            </div>

            <div className="portfolio-content">
                {/* Table of Assets */}
                <section className="assets-section glass-panel">
                    <div className="section-header">
                        <h2>{t('holdings')}</h2>
                        <button className="btn-secondary btn-small">{t('claim_yield')} $8.75</button>
                    </div>

                    <div className="table-responsive">
                        <table className="assets-table">
                            <thead>
                                <tr>
                                    <th>{t('col_asset')}</th>
                                    <th>Traction</th>
                                    <th>{t('col_tokens')}</th>
                                    <th>{t('col_value')}</th>
                                    <th>{t('col_earned')}</th>
                                    <th>{t('col_return')}</th>
                                    <th>{t('col_action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investments.map(inv => (
                                    <tr key={inv.id}>
                                        <td>
                                            <div className="asset-cell">
                                                <span className="asset-title">{inv.song}</span>
                                                <span className="asset-artist text-secondary">{inv.artist}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }} className="text-secondary">
                                                <div style={{ display: 'flex', alignItems: 'center' }}><SpotifyIcon /> {inv.sp} {t('metric_streams')}</div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}><YouTubeIcon /> {inv.yt} {t('metric_views')}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginTop: '2px' }}>{inv.trend}</div>
                                            </div>
                                        </td>
                                        <td>{inv.tokens}</td>
                                        <td>{inv.value}</td>
                                        <td><span className="success-text">{inv.earned}</span></td>
                                        <td>{inv.roi}</td>
                                        <td>
                                            <button className="icon-button"><ArrowUpRight size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

        </div>
    );
};

export default Portfolio;
