import React, { useState } from 'react';
import { Search, Building2 } from 'lucide-react';

// BE4T brand logo SVG
const BE4TLogo = () => (
    <div style={{
        width: '32px', height: '32px',
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

const TABS = [
    { id: 'explorar', label: '↗ Explorar', primary: true },
    { id: 'mis-canciones', label: '♫ Mis Canciones' },
    { id: 'lista-espera', label: '☺ Lista de Espera' },
    { id: 'portafolio', label: '⊞ Mi Portafolio' },
];

const selectStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    outline: 'none',
};

const MarketplaceHeader = ({
    activeTab,
    onTabChange,
    userMode,
    onModeChange,
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    typeFilter,
    onTypeChange,
}) => {
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(10, 10, 18, 0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
            <div style={{
                maxWidth: '1280px', margin: '0 auto',
                padding: '0 1.5rem',
                display: 'flex', alignItems: 'center',
                height: '60px', gap: '1rem',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, cursor: 'pointer' }}>
                    <BE4TLogo />
                    <span style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>BE4T</span>
                </div>

                {/* Search */}
                <div style={{
                    position: 'relative', flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ position: 'absolute', left: '10px', zIndex: 1, pointerEvents: 'none' }}>
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Buscar artistas, canciones..."
                        style={{
                            paddingLeft: '32px', paddingRight: '12px',
                            height: '34px', width: '220px',
                            background: searchFocused ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)',
                            border: `1px solid ${searchFocused ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px', color: 'white', fontSize: '0.82rem', outline: 'none',
                            transition: 'all 0.2s ease',
                        }}
                    />
                </div>

                {/* Nav tabs */}
                <nav className="be4t-nav-tabs-scroll" style={{ flex: 1 }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            style={{
                                padding: '0.35rem 0.85rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: tab.id === activeTab
                                    ? (tab.primary ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(139,92,246,0.2)')
                                    : 'transparent',
                                color: tab.id === activeTab ? 'white' : 'rgba(255,255,255,0.5)',
                                fontWeight: tab.id === activeTab ? '600' : '400',
                                fontSize: '0.82rem', cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Right actions: Para Disqueras, Para Fans, Para Artistas */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                        onClick={() => onModeChange('disquera')}
                        style={{
                            padding: '0.35rem 0.9rem',
                            borderRadius: '100px',
                            border: '1px solid rgba(20,184,166,0.5)',
                            background: userMode === 'disquera' ? 'rgba(20,184,166,0.2)' : 'transparent',
                            color: userMode === 'disquera' ? '#2dd4bf' : '#2dd4bf',
                            fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ⊞ Para Disqueras
                    </button>
                    <button
                        onClick={() => onModeChange('fan')}
                        style={{
                            padding: '0.35rem 0.9rem',
                            borderRadius: '100px',
                            border: `1px solid ${userMode === 'fan' ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.15)'}`,
                            background: userMode === 'fan' ? 'rgba(139,92,246,0.15)' : 'transparent',
                            color: userMode === 'fan' ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                            fontWeight: userMode === 'fan' ? '600' : '400',
                            fontSize: '0.8rem', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Para Fans
                    </button>
                    <button
                        onClick={() => onModeChange('artista')}
                        style={{
                            padding: '0.35rem 0.9rem',
                            borderRadius: '100px',
                            border: 'none', background: 'transparent',
                            color: userMode === 'artista' ? 'white' : 'rgba(255,255,255,0.5)',
                            fontWeight: userMode === 'artista' ? '600' : '400',
                            fontSize: '0.8rem', cursor: 'pointer',
                        }}
                    >
                        Para Artistas
                    </button>
                </div>
            </div>
        </header>
    );
};

export default MarketplaceHeader;
