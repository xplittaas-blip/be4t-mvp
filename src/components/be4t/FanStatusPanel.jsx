import React from 'react';

export default function FanStatusPanel({ perks = [], currentTokens = 0, projectedTokens = 0 }) {
    // Always render — perks are always provided as forcedPerks from SongDetail
    const totalTokens = (currentTokens || 0) + (projectedTokens || 0);
    const unlockedCount = perks.filter(p => totalTokens >= p.min_tokens).length;

    const TIER_COLORS = {
        FAN:   { accent: '#00FFCC', glow: 'rgba(0,255,204,0.15)', border: 'rgba(0,255,204,0.35)' },
        SOCIO: { accent: '#a855f7', glow: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.35)' },
        VIP:   { accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
    };

    return (
        <div style={{
            background: 'rgba(5,5,15,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '16px',
            width: '100%',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{
                    fontSize: '0.6rem',
                    fontWeight: '800',
                    letterSpacing: '0.15em',
                    color: '#00FFCC',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                    <span style={{ fontSize: '1rem' }}>✨</span>
                    TU ESTATUS DE FAN: BENEFICIOS EXCLUSIVOS
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                    {unlockedCount}/{perks.length}
                </span>
            </div>

            {/* Tier cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {perks.map((perk, idx) => {
                    const isUnlocked = totalTokens >= perk.min_tokens;
                    const colors = TIER_COLORS[perk.category] || TIER_COLORS.FAN;

                    return (
                        <div
                            key={idx}
                            style={{
                                borderRadius: '12px',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.4s ease',
                                background: isUnlocked
                                    ? `linear-gradient(135deg, ${colors.glow} 0%, transparent 100%)`
                                    : 'rgba(255,255,255,0.025)',
                                border: `1px solid ${isUnlocked ? colors.border : 'rgba(255,255,255,0.05)'}`,
                                boxShadow: isUnlocked ? `0 0 20px ${colors.glow}` : 'none',
                                filter: isUnlocked ? 'none' : 'grayscale(80%)',
                                opacity: isUnlocked ? 1 : 0.55,
                            }}
                        >
                            {/* Icon bubble */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                flexShrink: 0,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem',
                                background: isUnlocked ? colors.glow : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isUnlocked ? colors.border : 'transparent'}`,
                                boxShadow: isUnlocked ? `0 0 12px ${colors.glow}` : 'none',
                            }}>
                                {perk.icon}
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.52rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: isUnlocked ? colors.accent : 'rgba(255,255,255,0.3)',
                                    marginBottom: '2px',
                                }}>
                                    TIER · {perk.category} · {perk.min_tokens.toLocaleString()}+ tokens
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    color: isUnlocked ? 'white' : 'rgba(255,255,255,0.4)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {perk.label}
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: 'rgba(255,255,255,0.35)',
                                    marginTop: '2px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {perk.description}
                                </div>
                            </div>

                            {/* Status icon */}
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '0.75rem',
                                background: isUnlocked ? colors.glow : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isUnlocked ? colors.border : 'rgba(255,255,255,0.08)'}`,
                                boxShadow: isUnlocked ? `0 0 10px ${colors.glow}` : 'none',
                                color: isUnlocked ? colors.accent : 'rgba(255,255,255,0.3)',
                                fontWeight: '800',
                            }}>
                                {isUnlocked ? '✓' : '🔒'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer hint */}
            {unlockedCount < perks.length && (
                <div style={{
                    marginTop: '10px',
                    textAlign: 'center',
                    fontSize: '0.55rem',
                    fontWeight: '700',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)',
                }}>
                    ↑ Sube tu inversión para desbloquear más perks
                </div>
            )}
            {unlockedCount === perks.length && (
                <div style={{
                    marginTop: '10px',
                    textAlign: 'center',
                    fontSize: '0.6rem',
                    fontWeight: '800',
                    color: '#00FFCC',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 10px rgba(0,255,204,0.5)',
                }}>
                    🎉 TODOS LOS PERKS DESBLOQUEADOS
                </div>
            )}
        </div>
    );
}
