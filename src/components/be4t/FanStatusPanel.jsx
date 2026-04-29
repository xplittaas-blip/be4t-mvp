import React from 'react';
import { Lock, Check } from 'lucide-react';

export default function FanStatusPanel({ perks, currentTokens = 0, projectedTokens = 0 }) {
    if (!perks || perks.length === 0) return null;

    const totalTokens = currentTokens + projectedTokens;
    const unlockedCount = perks.filter(p => totalTokens >= p.min_tokens).length;

    return (
        <div className="bg-[#080808] border border-white/5 rounded-2xl p-4 w-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[0.65rem] font-bold tracking-widest text-[#00FFCC] uppercase flex items-center gap-2">
                    <span className="text-lg">✨</span> TU ESTATUS DE FAN: BENEFICIOS EXCLUSIVOS
                </h3>
                <span className="text-xs text-neutral-500 font-mono">{unlockedCount}/{perks.length}</span>
            </div>

            <div className="flex flex-col space-y-2">
                {perks.map((perk, idx) => {
                    const { min_tokens, label, description, icon, category } = perk;
                    const isUnlocked = totalTokens >= min_tokens;

                    return (
                        <div 
                            key={idx}
                            className={`
                                relative overflow-hidden rounded-xl p-3 flex items-center transition-all duration-500
                                ${isUnlocked 
                                    ? 'bg-gradient-to-r from-[#00FFCC]/10 to-transparent border border-[#00FFCC]/30 shadow-[0_0_15px_rgba(0,255,204,0.1)]' 
                                    : 'bg-[#111]/40 border border-white/5 grayscale opacity-60'
                                }
                            `}
                        >
                            {/* Icon */}
                            <div className={`
                                w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-lg mr-3
                                ${isUnlocked ? 'bg-[#00FFCC]/20 shadow-[0_0_10px_rgba(0,255,204,0.2)]' : 'bg-white/5'}
                            `}>
                                {icon}
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[0.55rem] font-bold uppercase tracking-widest ${isUnlocked ? 'text-[#00FFCC]' : 'text-neutral-500'}`}>
                                        TIER • {category}
                                    </span>
                                    <span className="text-[0.55rem] font-mono text-neutral-600">
                                        {min_tokens}+ tokens
                                    </span>
                                </div>
                                <h4 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-neutral-400'}`}>
                                    {label}
                                </h4>
                                <p className="text-[0.65rem] text-neutral-500 truncate mt-0.5">
                                    {description}
                                </p>
                            </div>

                            {/* Status Icon */}
                            <div className="ml-2 flex-shrink-0">
                                {isUnlocked ? (
                                    <div className="w-6 h-6 rounded-full bg-[#00FFCC]/20 flex items-center justify-center border border-[#00FFCC]/40 shadow-[0_0_10px_rgba(0,255,204,0.3)]">
                                        <Check size={12} className="text-[#00FFCC]" />
                                    </div>
                                ) : (
                                    <Lock size={14} className="text-neutral-600" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {unlockedCount < perks.length && (
                <div className="mt-4 text-center">
                    <p className="text-[0.55rem] tracking-[0.2em] text-neutral-500 uppercase font-semibold">
                        Sube tu inversión para desbloquear más perks ↑
                    </p>
                </div>
            )}
        </div>
    );
}
