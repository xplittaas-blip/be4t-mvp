import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

export const Be4tTooltip = ({ children, content }) => {
    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <button
                        type="button"
                        style={{
                            all: 'unset',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            fontSize: '9px',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                            cursor: 'help',
                            marginLeft: '6px',
                            verticalAlign: 'middle',
                            boxShadow: '0 0 4px rgba(16, 185, 129, 0.3)',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        i
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        sideOffset={6}
                        style={{
                            zIndex: 1000,
                            maxWidth: '240px',
                            padding: '10px 14px',
                            backgroundColor: 'rgba(15, 17, 23, 0.96)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: '0.75rem',
                            lineHeight: 1.5,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            animation: 'be4t-tooltip-in 0.2s ease-out forwards',
                            transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
                        }}
                    >
                        <style>{`
                            @keyframes be4t-tooltip-in {
                                from { opacity: 0; transform: scale(0.95) translateY(2px); }
                                to { opacity: 1; transform: scale(1) translateY(0); }
                            }
                        `}</style>
                        {content}
                        <Tooltip.Arrow fill="rgba(16, 185, 129, 0.3)" width={12} height={6} />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};
