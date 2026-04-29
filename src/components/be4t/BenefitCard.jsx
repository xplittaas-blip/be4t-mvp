import React, { useState } from 'react';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import { isShowcase } from '../../core/env';

export default function BenefitCard({ perk, userBalance }) {
    const { min_tokens, label, icon } = perk;
    const isUnlocked = userBalance >= min_tokens;
    
    const [claimed, setClaimed] = useState(false);

    const handleClaim = () => {
        if (!isUnlocked || claimed) return;
        
        if (isShowcase) {
            // Simple showcase success UI update
            setClaimed(true);
            setTimeout(() => {
                alert(`¡Beneficio Desbloqueado!\n\nHas reclamado "${label}". Recibirás un correo con las instrucciones de acceso muy pronto.`);
            }, 300);
        } else {
            // Live Mode: Prepare for Webhook
            setClaimed(true);
            console.log(`Webhook triggered for perk: ${label}`);
        }
    };

    return (
        <div 
            className={`
                relative overflow-hidden rounded-xl p-4 flex items-center justify-between transition-all duration-300
                border border-white/5 bg-[#111]/80 backdrop-blur-md
                ${isUnlocked ? 'hover:border-[#00FFCC]/30 hover:bg-[#1a1a1a]' : 'opacity-60 grayscale'}
            `}
        >
            {/* Left side: Icon & Label */}
            <div className="flex items-center space-x-4">
                <div 
                    className={`
                        w-12 h-12 flex items-center justify-center rounded-lg text-2xl
                        bg-[#000] border 
                        ${isUnlocked ? 'border-[#00FFCC]/20 shadow-[0_0_15px_rgba(0,255,204,0.15)]' : 'border-white/10'}
                    `}
                >
                    {icon}
                </div>
                <div>
                    <h4 className={`text-sm font-semibold tracking-wide ${isUnlocked ? 'text-white' : 'text-neutral-400'}`}>
                        {label}
                    </h4>
                    <div className="flex items-center mt-1 space-x-2">
                        {isUnlocked ? (
                            <Unlock size={12} className="text-[#00FFCC]" />
                        ) : (
                            <Lock size={12} className="text-neutral-500" />
                        )}
                        <span className={`text-xs font-mono tracking-widest ${isUnlocked ? 'text-[#00FFCC]' : 'text-neutral-500'}`}>
                            {min_tokens} TOKENS REQ.
                        </span>
                    </div>
                </div>
            </div>

            {/* Right side: Action Button */}
            <div className="flex-shrink-0 ml-4">
                {isUnlocked ? (
                    <button
                        onClick={handleClaim}
                        disabled={claimed}
                        className={`
                            px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-lg transition-all
                            ${claimed 
                                ? 'bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20 cursor-default'
                                : 'bg-[#00FFCC] text-black hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(0,255,204,0.4)]'
                            }
                        `}
                    >
                        {claimed ? (
                            <span className="flex items-center space-x-1">
                                <CheckCircle size={14} />
                                <span>Reclamado</span>
                            </span>
                        ) : (
                            'Reclamar'
                        )}
                    </button>
                ) : (
                    <div className="px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-lg bg-white/5 text-neutral-500 border border-white/5">
                        Bloqueado
                    </div>
                )}
            </div>
            
            {/* Progress indicator subtle background bar */}
            {!isUnlocked && userBalance > 0 && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-[#00FFCC]/20" 
                     style={{ width: `${Math.min((userBalance / min_tokens) * 100, 100)}%` }} />
            )}
        </div>
    );
}
