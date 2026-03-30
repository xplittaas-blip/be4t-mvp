import React from 'react';
import { ArrowRight, PlayCircle, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Home.css';

const Home = () => {
    const { t } = useTranslation('common');

    const handleNavigate = (page) => {
        document.dispatchEvent(new CustomEvent('navigate', { detail: page }));
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content animate-fade-in">
                    <div className="hero-badge">BE4T MUSIC</div>
                    <h1 className="hero-headline text-gradient">{t('home_hero_title')}</h1>

                    <div className="hero-paragraphs">
                        <p className="hero-lead">{t('home_hero_desc1')}</p>
                        <p className="text-secondary">{t('home_hero_desc2')}</p>
                        <p className="text-secondary">{t('home_hero_desc3')}</p>
                    </div>

                    <div className="hero-ctas">
                        <button
                            className="btn-primary"
                            onClick={() => handleNavigate('explore')}
                        >
                            <PlayCircle size={20} className="mr-2" />
                            {t('home_cta_explore')}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => handleNavigate('artist-invite')}
                        >
                            {t('home_cta_artist')} <ArrowRight size={18} className="ml-2" />
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => handleNavigate('investor-waitlist')}
                        >
                            {t('home_cta_investor')} <ArrowRight size={18} className="ml-2" />
                        </button>
                    </div>
                </div>

                {/* Visual Decoration */}
                <div className="hero-visual">
                    <div className="glow-orb primary-glow"></div>
                    <div className="glow-orb secondary-glow"></div>
                    <div className="glass-panel abstract-card">
                        <TrendingUp size={48} className="text-gradient mb-4" />
                        <h3>Own a Part of the Music</h3>
                        <p className="text-secondary mt-2">Get your share of royalties powered by transparent streaming data.</p>
                    </div>
                    <div className="glass-panel abstract-card floating-card">
                        <Users size={48} className="success-text mb-4" />
                        <h3>Fan-First Platform</h3>
                        <p className="text-secondary mt-2">Connecting artists and listeners to build a sustainable music culture.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
