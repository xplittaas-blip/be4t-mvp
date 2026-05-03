import React, { useState } from 'react';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import { isShowcase } from '../../core/env';
import ConfettiBlast from './ConfettiBlast';

export default function BenefitCard({ perk, userBalance, tierIndex }) {
    const { min_tokens, label, description, icon, category } = perk;
    const isUnlocked = userBalance >= min_tokens;
    
    const [claimed, setClaimed] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleClaim = () => {
        if (!isUnlocked || claimed) return;
        
        if (isShowcase) {
            setClaimed(true);
            setShowConfetti(true);
            setTimeout(() => {
                alert(`¡Beneficio Tier ${tierIndex + 1} Desbloqueado!\n\nHas reclamado "${label}". Recibirás un correo con las instrucciones de acceso muy pronto.`);
                setShowConfetti(false);
            }, 600);
        } else {
            setClaimed(true);
            console.log(`Webhook triggered for perk: ${label}`);
        }
    };

    return (
        <div 
            className={`
                relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between transition-all duration-500
                border backdrop-blur-md h-full min-h-[280px]
                ${isUnlocked 
                    ? 'border-[#00FFCC]/40 bg-gradient-to-b from-[#0c0c0c] to-[#111] shadow-[0_0_30px_rgba(0,255,204,0.1)] hover:shadow-[0_0_40px_rgba(0,255,204,0.2)] hover:-translate-y-1' 
                    : 'border-white/5 bg-[#111]/60 opacity-70 grayscale hover:opacity-90 hover:grayscale-0'
                }
            `}
        >
            <ConfettiBlast active={showConfetti} duration={2000} />
            
            {/* Top Area: Icon & Category */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div 
                        className={`
                            w-14 h-14 flex items-center justify-center rounded-xl text-3xl
                            bg-black border transition-colors duration-500
                            ${isUnlocked ? 'border-[#00FFCC]/50 shadow-[0_0_20px_rgba(0,255,204,0.2)]' : 'border-white/10'}
                        `}
                    >
                        {icon}
                    </div>
                    <div className="text-right">
                        <span className={`text-[0.65rem] font-bold tracking-widest uppercase px-2 py-1 rounded-md ${isUnlocked ? 'bg-[#00FFCC]/10 text-[#00FFCC]' : 'bg-white/5 text-neutral-400'}`}>
                            Tier {tierIndex + 1}
                        </span>
                        <div className="text-[0.6rem] text-neutral-500 uppercase tracking-wider mt-1">{category}</div>
                    </div>
                </div>

                <h4 className={`text-lg font-bold tracking-tight mb-2 leading-tight ${isUnlocked ? 'text-white' : 'text-neutral-400'}`}>
                    {label}
                </h4>
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                    {description || `Acceso exclusivo a ${label.toLowerCase()} para los holders.`}
                </p>
            </div>

            {/* Bottom Area: Status & Action */}
            <div className="mt-auto">
                <div className="flex items-center space-x-2 mb-3">
                    {isUnlocked ? (
                        <Unlock size={14} className="text-[#00FFCC]" />
                    ) : (
                        <Lock size={14} className="text-neutral-500" />
                    )}
                    <span className={`text-xs font-mono tracking-widest font-semibold ${isUnlocked ? 'text-[#00FFCC]' : 'text-neutral-500'}`}>
                        {min_tokens} TOKENS
                    </span>
                </div>

                {isUnlocked ? (
                    <button
                        onClick={handleClaim}
                        disabled={claimed}
                        className={`
                            w-full py-3 text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-300
                            ${claimed 
                                ? 'bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20 cursor-default'
                                : 'bg-[#00FFCC] text-black hover:bg-white hover:text-black shadow-[0_0_15px_rgba(0,255,204,0.3)] hover:shadow-[0_0_25px_rgba(0,255,204,0.5)]'
                            }
                        `}
                    >
                        {claimed ? (
                            <span className="flex items-center justify-center space-x-2">
                                <CheckCircle size={16} />
                                <span>Reclamado</span>
                            </span>
                        ) : (
                            'Reclamar Beneficio'
                        )}
                    </button>
                ) : (
                    <div className="w-full py-3 text-xs font-bold tracking-widest uppercase rounded-xl bg-white/5 text-neutral-500 border border-white/5 text-center flex flex-col items-center justify-center gap-1">
                        <span>Bloqueado</span>
                        <span className="text-[0.55rem] font-normal normal-case tracking-normal">
                            Invierte {Math.max(0, min_tokens - userBalance)} tokens más
                        </span>
                    </div>
                )}
            </div>
            
            {/* Progress indicator subtle background bar */}
            {!isUnlocked && userBalance > 0 && (
                <div className="absolute bottom-0 left-0 h-1 bg-[#00FFCC]/30 transition-all duration-500" 
                     style={{ width: `${Math.min((userBalance / min_tokens) * 100, 100)}%` }} />
            )}
        </div>
    );
}
