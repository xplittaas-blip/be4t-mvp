import React from 'react';
import { 
    FileText, 
    Cpu, 
    UserCheck, 
    BarChart3, 
    Coins, 
    ArrowRight,
    Play
} from 'lucide-react';

const FlowStep = ({ icon: Icon, title, desc, stepNum, color = '#7c3aed' }) => (
    <div style={{
        position: 'relative',
        flex: 1,
        minWidth: '220px',
        padding: '2rem 1.5rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        textAlign: 'center',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'default',
        overflow: 'hidden'
    }}
    className="flow-step-card"
    onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.border = `1px solid ${color}66`;
        e.currentTarget.style.background = `rgba(255,255,255,0.04)`;
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}11`;
    }}
    onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        e.currentTarget.style.boxShadow = 'none';
    }}
    >
        {/* Step Number Badge */}
        <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1.2rem',
            fontSize: '0.7rem',
            fontWeight: '900',
            color: 'rgba(255,255,255,0.2)',
            fontFamily: "'Courier New', monospace",
            letterSpacing: '2px'
        }}>
            0{stepNum}
        </div>

        {/* Icon Container */}
        <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: `linear-gradient(135deg, ${color}33 0%, transparent 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: `1px solid ${color}22`,
            position: 'relative'
        }}>
            <Icon size={28} color={color} />
            <div style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '20px',
                border: `1px solid ${color}44`,
                opacity: 0.3,
                animation: 'ping 3s infinite ease-in-out'
            }} />
        </div>

        <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '800', 
            marginBottom: '0.75rem', 
            color: 'white',
            letterSpacing: '-0.02em'
        }}>
            {title}
        </h3>
        <p style={{ 
            fontSize: '0.85rem', 
            color: 'rgba(255,255,255,0.45)', 
            lineHeight: 1.6,
            margin: 0
        }}>
            {desc}
        </p>
    </div>
);

const ProtocolFlow = () => {
    const steps = [
        {
            icon: FileText,
            title: 'Originación',
            desc: 'Acuerdo legal entre la disquera y el SPV de BE4T para tokenizar regalías.',
            color: '#a855f7' // Purple
        },
        {
            icon: Cpu,
            title: 'Tokenización',
            desc: 'Emisión de Smart Contracts en Base L2 representando el % de la obra.',
            color: '#7c3aed' // Violet
        },
        {
            icon: UserCheck,
            title: 'Adquisición',
            desc: 'Fans compran fracciones con Fiat o Cripto mediante billeteras inteligentes.',
            color: '#06b6d4' // Cyan
        },
        {
            icon: BarChart3,
            title: 'Recaudación',
            desc: 'Las plataformas de streaming liquidan a BE4T según el desempeño real.',
            color: '#10b981' // Green
        },
        {
            icon: Coins,
            title: 'Distribución',
            desc: 'El Smart Contract dispersa las ganancias a cada holder automáticamente.',
            color: '#f59e0b' // Amber
        }
    ];

    return (
        <section style={{ 
            padding: '8rem 2rem', 
            background: 'linear-gradient(to bottom, transparent, #080614, transparent)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Text Decoration */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '15rem',
                fontWeight: '900',
                color: 'rgba(255,255,255,0.015)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 0,
                userSelect: 'none'
            }}>
                PROTOCOL FLOW
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: 'rgba(124,58,237,0.1)', 
                        border: '1px solid rgba(124,58,237,0.3)', 
                        padding: '6px 14px', 
                        borderRadius: '100px',
                        marginBottom: '1.5rem'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px #7c3aed' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            Model & Governance
                        </span>
                    </div>
                    <h2 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 3.2rem)', 
                        fontWeight: '900', 
                        color: 'white', 
                        letterSpacing: '-0.04em',
                        marginBottom: '1rem',
                        lineHeight: 1.1
                    }}>
                        De la canción <span className="text-gradient">al portafolio</span>
                    </h2>
                    <p style={{ 
                        fontSize: '1.1rem', 
                        color: 'rgba(255,255,255,0.5)', 
                        maxWidth: '650px', 
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        BE4T utiliza una estructura legal robusta y tecnología blockchain para democratizar la propiedad intelectual musical.
                    </p>
                </div>

                {/* Steps Grid */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1.25rem', 
                    flexWrap: 'wrap',
                    alignItems: 'stretch'
                }}>
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <FlowStep 
                                {...step} 
                                stepNum={index + 1} 
                            />
                            {index < steps.length - 1 && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.1)',
                                    padding: '0 0.5rem',
                                    className: 'flow-connector'
                                }}>
                                    <ArrowRight size={20} className="hidden-mobile" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Operational Highlight */}
                <div style={{ 
                    marginTop: '4rem', 
                    padding: '2.5rem', 
                    background: 'rgba(124,58,237,0.03)', 
                    border: '1px solid rgba(124,58,237,0.1)', 
                    borderRadius: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2.5rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '30px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 20px 40px rgba(124,58,237,0.2)'
                    }}>
                        <Play size={48} fill="white" color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', marginBottom: '0.6rem' }}>
                            Transparencia Inmutable
                        </h4>
                        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
                            Cada transacción se registra en la red <strong>Base</strong>, permitiendo una auditoría pública 
                            de cada fracción emitida y cada centavo distribuido. La tecnología Smart Contract garantiza 
                            que el fan reciba su parte sin intermediarios.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'white', fontWeight: '700' }}>
                            Base L2
                        </div>
                        <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'white', fontWeight: '700' }}>
                            ERC-1155
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes ping {
                    0% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.1; }
                    100% { transform: scale(1); opacity: 0.3; }
                }
                @media (max-width: 1024px) {
                    .hidden-mobile { display: none; }
                }
            `}</style>
        </section>
    );
};

export default ProtocolFlow;
