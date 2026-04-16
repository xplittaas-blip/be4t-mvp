import React, { useState } from 'react';
import { Twitter, Instagram, Disc as Discord, Youtube, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Footer.css';
import RegulatoryModal from './RegulatoryModal';

const Footer = () => {
    const { t } = useTranslation('common');
    const [showRegulatoryModal, setShowRegulatoryModal] = useState(false);

    return (
        <>
            <footer className="footer border-t border-light">
                <div className="footer-content">
                <div className="footer-brand">
                    <h2 className="brand-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}><span className="brand-x text-gradient" style={{ fontSize: '3rem', marginRight: '-3px' }}>X</span>plit</h2>
                    <p className="footer-desc">{t('footer_desc')}</p>
                </div>
                <div className="footer-links">
                    <div className="link-group">
                        <h4>{t('footer_col1')}</h4>
                        <a href="#">{t('footer_col1_1')}</a>
                        <a href="#">{t('footer_col1_2')}</a>
                        {/* New Compliance Link! */}
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowRegulatoryModal(true); }}>
                            🛡️ Regulatory Compliance
                        </a>
                    </div>
                    <div className="link-group">
                        <h4>{t('footer_col2')}</h4>
                        <a href="#" onClick={(e) => { e.preventDefault(); document.dispatchEvent(new CustomEvent('navigate', { detail: 'artist-invite' })) }}>{t('footer_col2_1')}</a>
                        <a href="#">{t('footer_col2_2')}</a>
                        <a href="#">{t('footer_col2_3')}</a>
                    </div>
                    <div className="link-group">
                        <h4>{t('footer_col3')}</h4>
                        <a href="#">{t('footer_col3_1')}</a>
                        <a href="#">{t('footer_col3_2')}</a>
                        <a href="#">{t('footer_col3_3')}</a>
                    </div>
                </div>
            </div>
            
            {/* Regulatory Footer Strip */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0', margin: '0 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <ShieldCheck size={18} color="#10b981" />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
                        <strong style={{ color: '#10b981' }}>Regulated Framework:</strong> En proceso de registro ante la <span style={{ color: 'white' }}>Comisión Nacional de Activos Digitales</span> de El Salvador.
                    </span>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 {t('rights')}</p>
            </div>
        </footer>
            {showRegulatoryModal && <RegulatoryModal onClose={() => setShowRegulatoryModal(false)} />}
        </>
    );
};

export default Footer;
