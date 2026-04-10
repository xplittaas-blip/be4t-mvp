import React from 'react';
import { Twitter, Instagram, Disc as Discord, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation('common');

    return (
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
                        <a href="#">{t('footer_col1_3')}</a>
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
            <div className="footer-bottom">
                <p>© 2026 {t('rights')}</p>
            </div>
        </footer>
    );
};

export default Footer;
