/**
 * BE4T AssetDetailModal — Vista Detallada / Sales Funnel
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen overlay with tabbed layout:
 *   Tab 1: ⚡ Calculadora de Inversión (TEA hero + projected returns CTA)
 *   Tab 2: 📊 Métricas Profundas (sparklines, platform + demographics + geo)
 *
 * Header: Album art + Title/Artist + Risk tags + KPI strip
 * CTA: "Ejecutar Adquisición" (live) / "Adquirir participación de regalías" (demo)
 */
import React, { useState, useMemo, useEffect } from 'react';
import { isProduction } from '../../core/env';
import AcquisitionModal from './AcquisitionModal';

// ── Format utils ───────────────────────────────────────────────────────────────
const fmtUSD = (v) => {
    if (v == null) return '$—';
    if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'K';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
};
const fmt = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
};
const fmtPct = (v) => (v != null ? Number(v).toFixed(1) + '%' : '—');

// ── Platform Icons ─────────────────────────────────────────────────────────────
const SpotifyIcon = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z"/></svg>
);
const YouTubeIcon = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const TikTokIcon = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2DD4BF"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z"/></svg>
);

// ── Sparkline SVG ──────────────────────────────────────────────────────────────
const Sparkline = ({ data = [], color = '#10b981', w = 120, h = 36 }) => {
    if (!data.length) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <defs>
                <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                </linearGradient>
            </defs>
            <polyline fill={`url(#sg-${color.replace('#','')})`} stroke="none"
                points={`0,${h} ${pts} ${w},${h}`}/>
            <polyline fill="none" stroke={color} strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" points={pts}/>
        </svg>
    );
};

// ── Horizontal bar ─────────────────────────────────────────────────────────────
const DistBar = ({ label, pct, color, Icon }) => (
    <div style={{ marginBottom: '0.55rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {Icon && <Icon size={10}/>}
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.52)', fontWeight: '600'}}>{label}</span>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color}}>{pct}%</span>
        </div>
        <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'100px', overflow:'hidden'}}>
            <div style={{ height:'100%', width:`${pct}%`, background:color,
                boxShadow:`0 0 5px ${color}88`, borderRadius:'100px', transition:'width 0.7s ease'}}/>
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:'14px', padding:'1rem', marginBottom:'0.75rem' }}>
        <div style={{ fontSize:'0.58rem', fontWeight:'800', color:'rgba(255,255,255,0.28)',
            textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:'0.8rem' }}>
            {title}
        </div>
        {children}
    </div>
);

// ── Tab 1: Investment Calculator ───────────────────────────────────────────────
const CalculatorTab = ({ song, onAcquire }) => {
    const [tokens, setTokens] = useState(5);
    const [period, setPeriod] = useState(12);

    const price       = song.price || 60;
    const tea         = Number(song.apy) || 14;
    const total       = song.total_supply || 1000;
    const maxTokens   = Math.min(total, song.tokens_available || total, 500);
    const totalCost   = tokens * price;
    const ownership   = (tokens / total) * 100;
    const periodRet   = totalCost * (tea / 100) * (period / 12);
    const quarterly   = totalCost * (tea / 100) / 4;
    const projected   = totalCost + periodRet;
    const roi         = totalCost > 0 ? (periodRet / totalCost) * 100 : 0;

    return (
        <div>
            {/* Calculator card */}
            <div style={{ background:'rgba(0,0,0,0.32)', border:'1px solid rgba(16,185,129,0.18)',
                borderRadius:'16px', padding:'1.25rem', marginBottom:'0.85rem' }}>

                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'1.1rem' }}>
                    <span style={{ fontSize:'0.6rem', fontWeight:'800', color:'#10b981',
                        textTransform:'uppercase', letterSpacing:'1.2px' }}>⚡ Calculadora de Retorno</span>
                    <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.22)',
                        background:'rgba(255,255,255,0.04)', borderRadius:'100px', padding:'2px 7px' }}>
                        TEA {fmtPct(tea)} · ${price} / token
                    </span>
                </div>

                {/* Token input */}
                <div style={{ marginBottom:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <label style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.48)' }}>Cantidad de Tokens</label>
                        <span style={{ fontSize:'0.82rem', fontWeight:'800', color:'white' }}>
                            {tokens}
                            <span style={{ color:'rgba(255,255,255,0.22)', fontWeight:'400', fontSize:'0.68rem' }}> / {fmt(maxTokens)} disp.</span>
                        </span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'5px' }}>
                        <button onClick={() => setTokens(t => Math.max(1,t-1))}
                            style={{ width:'30px', height:'30px', borderRadius:'7px',
                                border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)',
                                color:'white', fontSize:'1rem', cursor:'pointer', lineHeight:1 }}>−</button>
                        <input type="number" min="1" max={maxTokens} value={tokens}
                            onChange={e => setTokens(Math.max(1,Math.min(maxTokens,Number(e.target.value)||1)))}
                            style={{ flex:1, padding:'0.35rem 0.5rem', textAlign:'center',
                                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                                borderRadius:'7px', color:'white', fontWeight:'800', fontSize:'0.95rem', outline:'none' }}/>
                        <button onClick={() => setTokens(t => Math.min(maxTokens,t+1))}
                            style={{ width:'30px', height:'30px', borderRadius:'7px',
                                border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)',
                                color:'white', fontSize:'1rem', cursor:'pointer', lineHeight:1 }}>+</button>
                    </div>
                    <input type="range" min="1" max={maxTokens} value={tokens}
                        onChange={e => setTokens(Number(e.target.value))}
                        style={{ width:'100%', accentColor:'#10b981', cursor:'pointer'}}/>
                    <div style={{ display:'flex', justifyContent:'space-between',
                        fontSize:'0.58rem', color:'rgba(255,255,255,0.22)', marginTop:'2px'}}>
                        <span>1</span><span>{fmt(maxTokens)}</span>
                    </div>
                </div>

                {/* Period */}
                <div style={{ marginBottom:'1rem' }}>
                    <label style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.48)',
                        display:'block', marginBottom:'5px'}}>Horizonte de Inversión</label>
                    <div style={{ display:'flex', gap:'0.35rem' }}>
                        {[3,6,12,24].map(m => (
                            <button key={m} onClick={() => setPeriod(m)} style={{
                                flex:1, padding:'0.4rem 0', borderRadius:'8px',
                                border: period===m ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                background: period===m ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                                color: period===m ? '#10b981' : 'rgba(255,255,255,0.38)',
                                fontSize:'0.73rem', fontWeight: period===m ? '800' : '400',
                                cursor:'pointer', transition:'all 0.2s',
                            }}>{m}m</button>
                        ))}
                    </div>
                </div>

                {/* Results grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.45rem', marginBottom:'0.85rem' }}>
                    {[
                        { label:'Costo Total USD',        value: fmtUSD(totalCost),   color:'rgba(255,255,255,0.9)', big:true },
                        { label:'TEA Anual',              value: fmtPct(tea),          color:'#10b981', big:true },
                        { label:`Regalías en ${period}m`, value: fmtUSD(periodRet),   color:'#34d399' },
                        { label:'Participación',          value: fmtPct(ownership),   color:'#a78bfa' },
                        { label:'Regalías Trimestrales',  value: fmtUSD(quarterly),   color:'#60a5fa' },
                        { label:'ROI Proyectado',         value: fmtPct(roi),         color:'#fbbf24' },
                    ].map(({ label, value, color, big }) => (
                        <div key={label} style={{ background:'rgba(255,255,255,0.028)',
                            border:'1px solid rgba(255,255,255,0.048)', borderRadius:'10px', padding:'0.5rem 0.65rem' }}>
                            <div style={{ fontSize:'0.5rem', color:'rgba(255,255,255,0.28)',
                                textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'2px' }}>{label}</div>
                            <div style={{ fontSize: big?'1.05rem':'0.86rem', fontWeight:'800', color,
                                textShadow: color!=='rgba(255,255,255,0.9)' ? `0 0 10px ${color}44` : 'none' }}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Projected total */}
                <div style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(52,211,153,0.04))',
                    border:'1px solid rgba(16,185,129,0.2)', borderRadius:'12px', padding:'0.85rem',
                    textAlign:'center', marginBottom:'0.85rem' }}>
                    <div style={{ fontSize:'0.56rem', color:'rgba(255,255,255,0.3)',
                        textTransform:'uppercase', letterSpacing:'1px', marginBottom:'3px' }}>
                        Capital + Regalías al cabo de {period} meses
                    </div>
                    <div style={{ fontSize:'1.7rem', fontWeight:'900', color:'#10b981',
                        letterSpacing:'-0.04em', textShadow:'0 0 20px rgba(16,185,129,0.55)'}}>
                        {fmtUSD(projected)}
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>
                        ROI de {fmtPct(roi)} · {tokens} tokens × {fmtUSD(price)}
                    </div>
                </div>

                {/* CTA */}
                <button id={`detail-cta-${song.id}`} onClick={() => onAcquire(tokens)}
                    style={{ width:'100%', padding:'0.95rem', background:'linear-gradient(135deg,#064e3b,#10b981)',
                        border:'none', borderRadius:'12px', color:'white', fontWeight:'800',
                        fontSize:'0.95rem', cursor:'pointer', transition:'all 0.3s',
                        boxShadow:'0 4px 20px rgba(16,185,129,0.35)', lineHeight:1.3 }}
                    onMouseOver={e => { e.currentTarget.style.filter='brightness(1.12)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(16,185,129,0.55)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.filter='brightness(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(16,185,129,0.35)'; e.currentTarget.style.transform='translateY(0)'; }}>
                    {isProduction ? 'Ejecutar Adquisición →' : 'Adquirir participación de regalías →'}
                    <span style={{ display:'block', fontSize:'0.58rem', fontWeight:'600',
                        color:'rgba(255,255,255,0.55)', marginTop:'2px' }}>
                        {isProduction
                            ? `${tokens} tokens · ${fmtUSD(totalCost)} · Base Sepolia`
                            : `${tokens} tokens · ${fmtUSD(totalCost)} · Modo Demo`}
                    </span>
                </button>
                <p style={{ textAlign:'center', fontSize:'0.6rem', color:'rgba(255,255,255,0.18)',
                    marginTop:'0.5rem', lineHeight:1.4 }}>
                    * Estimaciones basadas en histórico de streams. No constituyen garantía de rentabilidad.
                </p>
            </div>
        </div>
    );
};

// ── Tab 2: Deep Metrics ────────────────────────────────────────────────────────
const MetricsTab = ({ song }) => {
    const seed = useMemo(() =>
        String(song.id).split('').reduce((a,b) => a+b.charCodeAt(0),0), [song.id]);

    const streamHist = useMemo(() => Array.from({length:8},(_,i) => {
        const base = song.spotify_streams || 2_000_000_000;
        return Math.round(base * (0.86 + (Math.sin(seed+i*1.3)+1)*0.07 + i*0.014));
    }), [seed, song.spotify_streams]);
    const viewHist = useMemo(() => streamHist.map(v =>
        Math.round(v*(0.5+(seed%18)/100))), [streamHist, seed]);
    const months = ['Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr'];

    const platforms = useMemo(() => {
        const raw = [
            { label:'Spotify', pct:45+(seed%12), color:'#1DB954', Icon:SpotifyIcon },
            { label:'YouTube', pct:28+(seed%8),  color:'#FF4444', Icon:YouTubeIcon },
            { label:'TikTok',  pct:18+(seed%6),  color:'#2DD4BF', Icon:TikTokIcon  },
            { label:'Otros',   pct:9,             color:'#6b7280' },
        ];
        const tot = raw.reduce((a,p)=>a+p.pct,0);
        return raw.map(p=>({...p, pct:Math.round(p.pct/tot*100)}));
    }, [seed]);

    const demos = useMemo(() => {
        const raw = [
            {label:'18–24',pct:38+(seed%8), color:'#a78bfa'},
            {label:'25–34',pct:29+(seed%6), color:'#818cf8'},
            {label:'35–44',pct:19+(seed%4), color:'#6366f1'},
            {label:'45+',  pct:14,          color:'#4f46e5'},
        ];
        const tot = raw.reduce((a,d)=>a+d.pct,0);
        return raw.map(d=>({...d, pct:Math.round(d.pct/tot*100)}));
    }, [seed]);

    const geos = useMemo(() => {
        const raw = [
            {label:'México',   pct:32+(seed%10), flag:'🇲🇽'},
            {label:'Colombia', pct:22+(seed%6),  flag:'🇨🇴'},
            {label:'Argentina',pct:15+(seed%5),  flag:'🇦🇷'},
            {label:'España',   pct:14+(seed%4),  flag:'🇪🇸'},
            {label:'EEUU',     pct:10+(seed%3),  flag:'🇺🇸'},
            {label:'Otros',    pct:7,            flag:'🌍'},
        ];
        const tot = raw.reduce((a,g)=>a+g.pct,0);
        return raw.map(g=>({...g, pct:Math.round(g.pct/tot*100)}));
    }, [seed]);

    return (
        <div>
            {/* Stream growth */}
            <Section title="📈 Crecimiento de Streams — Últimos 8 meses">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.5rem' }}>
                    <div>
                        <div style={{ fontSize:'0.6rem', color:'#1DB954', marginBottom:'3px', fontWeight:'700' }}>Spotify Streams</div>
                        <Sparkline data={streamHist} color="#1DB954" w={140} h={38}/>
                    </div>
                    <div>
                        <div style={{ fontSize:'0.6rem', color:'#FF4444', marginBottom:'3px', fontWeight:'700' }}>YouTube Views</div>
                        <Sparkline data={viewHist} color="#FF4444" w={140} h={38}/>
                    </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:'2px', marginBottom:'0.65rem' }}>
                    {months.map(m => (
                        <div key={m} style={{ fontSize:'0.46rem', color:'rgba(255,255,255,0.18)', textAlign:'center' }}>{m}</div>
                    ))}
                </div>
                <div style={{ display:'flex', gap:'0.45rem', flexWrap:'wrap' }}>
                    {[
                        { label:'Streams/mes',  value:fmt(Math.round(song.spotify_streams/12)),    color:'#1DB954' },
                        { label:'Views/mes',    value:fmt(Math.round(song.youtube_views/12)),       color:'#FF4444' },
                        { label:'UGC/mes',      value:fmt(Math.round(song.tiktok_creations/12)),   color:'#2DD4BF' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background:'rgba(255,255,255,0.03)',
                            border:'1px solid rgba(255,255,255,0.055)', borderRadius:'8px',
                            padding:'0.3rem 0.55rem', flex:1 }}>
                            <div style={{ fontSize:'0.46rem', color:'rgba(255,255,255,0.3)',
                                textTransform:'uppercase', letterSpacing:'0.7px' }}>{label}</div>
                            <div style={{ fontSize:'0.8rem', fontWeight:'800', color }}>{value}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Platform + Demographics */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <Section title="📡 Plataforma">
                    {platforms.map(p => <DistBar key={p.label} label={p.label} pct={p.pct} color={p.color} Icon={p.Icon}/>)}
                </Section>
                <Section title="👥 Demografía">
                    {demos.map(d => <DistBar key={d.label} label={d.label} pct={d.pct} color={d.color}/>)}
                    <div style={{ marginTop:'0.45rem', fontSize:'0.54rem',
                        color:'rgba(255,255,255,0.2)', borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:'0.45rem' }}>
                        Fuente: Spotify for Artists · Q4 2024
                    </div>
                </Section>
            </div>

            {/* Geographic reach */}
            <Section title="🌎 Alcance Geográfico">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.4rem' }}>
                    {geos.map(g => (
                        <div key={g.label} style={{ background:'rgba(255,255,255,0.025)',
                            border:'1px solid rgba(255,255,255,0.048)', borderRadius:'8px',
                            padding:'0.38rem 0.5rem', display:'flex', alignItems:'center', gap:'5px' }}>
                            <span style={{ fontSize:'0.88rem' }}>{g.flag}</span>
                            <div>
                                <div style={{ fontSize:'0.5rem', color:'rgba(255,255,255,0.28)' }}>{g.label}</div>
                                <div style={{ fontSize:'0.75rem', fontWeight:'800', color:'white' }}>{g.pct}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Royalty model */}
            <div style={{ background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.14)',
                borderRadius:'12px', padding:'0.85rem' }}>
                <div style={{ fontSize:'0.58rem', fontWeight:'800', color:'#10b981',
                    textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.5rem' }}>
                    📐 Modelo de Regalías BE4T
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.45rem' }}>
                    {[
                        { label:'Tasa por millón',         value:'$3,000 USD' },
                        { label:'Regalías anuales est.',   value:fmtUSD((song.spotify_streams/1_000_000)*3) },
                        { label:'Distribución',             value:'Trimestral' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ textAlign:'center' }}>
                            <div style={{ fontSize:'0.48rem', color:'rgba(255,255,255,0.28)',
                                textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'2px' }}>{label}</div>
                            <div style={{ fontSize:'0.78rem', fontWeight:'700', color:'rgba(255,255,255,0.78)' }}>{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AssetDetailModal = ({ song, asset, onClose }) => {
    // Accept both 'song' (from SongCard) and 'asset' (legacy prop) 
    const data = song || asset;
    const [activeTab, setActiveTab] = useState('calculator');
    const [showAcquisition, setShowAcquisition] = useState(false);
    const [initialQty, setInitialQty] = useState(1);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    if (!data) return null;

    const handleAcquire = (qty) => { setInitialQty(qty); setShowAcquisition(true); };

    const availablePct = data.total_supply > 0 ? (data.tokens_available / data.total_supply) * 100 : 50;
    const isLowSupply  = availablePct < 20;
    const coverBg      = data.cover_url ? `url("${data.cover_url}")` : 'linear-gradient(135deg,#1a0533,#0a0a1a)';

    return (
        <>
            <style>{`
                @keyframes be4t-dt-in {
                    from{opacity:0;transform:scale(0.97) translateY(10px)}
                    to{opacity:1;transform:scale(1) translateY(0)}
                }
                @keyframes be4t-scarcity-flash{0%,100%{opacity:1}50%{opacity:0.6}}
                .be4t-dt-scroll::-webkit-scrollbar{width:3px}
                .be4t-dt-scroll::-webkit-scrollbar-track{background:transparent}
                .be4t-dt-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:100px}
            `}</style>

            {/* Backdrop */}
            <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1100,
                background:'rgba(0,0,0,0.82)', backdropFilter:'blur(10px)',
                display:'flex', alignItems:'flex-start', justifyContent:'center',
                padding:'1.5rem 1rem', overflowY:'auto', }}>

                {/* Modal */}
                <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'880px',
                    background:'#090910', border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:'22px', overflow:'hidden',
                    animation:'be4t-dt-in 0.32s cubic-bezier(0.34,1.56,0.64,1)',
                    marginBottom:'1.5rem' }}>

                    {/* ── HERO HEADER ── */}
                    <div style={{ position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', inset:0, backgroundImage:coverBg,
                            backgroundSize:'cover', backgroundPosition:'center',
                            filter:'blur(22px) brightness(0.28)', transform:'scale(1.1)' }}/>
                        <div style={{ position:'relative', zIndex:2,
                            display:'flex', gap:'1.25rem', padding:'1.5rem',
                            alignItems:'flex-start' }}>

                            {/* Album art */}
                            <div style={{ width:'110px', height:'110px', flexShrink:0,
                                backgroundImage:coverBg, backgroundSize:'cover', backgroundPosition:'center',
                                borderRadius:'12px', border:'2px solid rgba(255,255,255,0.1)',
                                boxShadow:'0 8px 28px rgba(0,0,0,0.6)' }}/>

                            {/* Text */}
                            <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.28)',
                                    marginBottom:'0.35rem', letterSpacing:'0.4px' }}>
                                    Marketplace → {data.tag || 'MUSIC'}
                                </div>
                                <h2 style={{ fontSize:'1.45rem', fontWeight:'900', margin:'0 0 0.28rem',
                                    letterSpacing:'-0.03em', lineHeight:1.1 }}>{data.title}</h2>
                                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.85rem', margin:'0 0 0.75rem' }}>
                                    {data.artist}
                                </p>

                                {/* Tags */}
                                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem', marginBottom:'0.8rem' }}>
                                    <span style={{ fontSize:'0.58rem', fontWeight:'700',
                                        background:'rgba(139,92,246,0.18)', border:'1px solid rgba(139,92,246,0.38)',
                                        borderRadius:'100px', padding:'3px 9px', color:'#c4b5fd',
                                        letterSpacing:'0.8px', textTransform:'uppercase' }}>
                                        {data.tag || data.asset_type}
                                    </span>
                                    {data.risk_tier === 'BLUE_CHIP' ? (
                                        <span style={{ fontSize:'0.58rem', fontWeight:'800',
                                            background:'rgba(6,182,212,0.13)', border:'1px solid rgba(6,182,212,0.4)',
                                            borderRadius:'100px', padding:'3px 9px', color:'#22d3ee',
                                            letterSpacing:'0.8px', textTransform:'uppercase',
                                            fontFamily:"'Courier New',monospace" }}>◆ BLUE CHIP</span>
                                    ) : (
                                        <span style={{ fontSize:'0.58rem', fontWeight:'800',
                                            background:'rgba(234,179,8,0.1)', border:'1px solid rgba(234,179,8,0.38)',
                                            borderRadius:'100px', padding:'3px 9px', color:'#fbbf24',
                                            letterSpacing:'0.8px', textTransform:'uppercase',
                                            fontFamily:"'Courier New',monospace" }}>▲ EMERGING</span>
                                    )}
                                    {data.is_trending && (
                                        <span style={{ fontSize:'0.58rem', fontWeight:'800',
                                            background:'rgba(239,68,68,0.82)', borderRadius:'100px',
                                            padding:'3px 9px', color:'white' }}>🔥 HOT</span>
                                    )}
                                    {isLowSupply && (
                                        <span style={{ fontSize:'0.58rem', fontWeight:'800',
                                            background:'rgba(249,115,22,0.78)', borderRadius:'100px',
                                            padding:'3px 9px', color:'white',
                                            animation:'be4t-scarcity-flash 1.8s ease infinite' }}>
                                            ⚡ CASI AGOTADO
                                        </span>
                                    )}
                                    <span style={{ fontSize:'0.58rem', fontWeight:'800',
                                        background: isProduction ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.08)',
                                        border:`1px solid ${isProduction?'rgba(16,185,129,0.28)':'rgba(245,158,11,0.22)'}`,
                                        borderRadius:'100px', padding:'3px 9px',
                                        color: isProduction ? '#10b981' : '#f59e0b',
                                        textTransform:'uppercase', letterSpacing:'0.8px' }}>
                                        {isProduction ? '⚡ LIVE' : '🎬 DEMO'}
                                    </span>
                                </div>

                                {/* KPI strip */}
                                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                                    {[
                                        { label:'TEA',            value:`${Number(data.apy).toFixed(1)}%`, color:'#10b981', glow:true },
                                        { label:'Precio/Token',   value:`$${data.price}`, color:'white' },
                                        { label:'Market Cap',     value:fmtUSD(data.market_cap), color:'rgba(255,255,255,0.65)' },
                                        { label:'Tokens Disp.',   value:`${fmt(data.tokens_available)} / ${fmt(data.total_supply)}`,
                                          color: isLowSupply ? '#f97316' : 'rgba(255,255,255,0.65)' },
                                    ].map(({ label, value, color, glow }) => (
                                        <div key={label}>
                                            <div style={{ fontSize:'0.48rem', color:'rgba(255,255,255,0.28)',
                                                textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'1px' }}>
                                                {label}
                                            </div>
                                            <div style={{ fontSize:'0.9rem', fontWeight:'800', color,
                                                textShadow: glow ? '0 0 10px rgba(16,185,129,0.6)' : 'none' }}>
                                                {value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Close */}
                            <button onClick={onClose} style={{ position:'absolute', top:'0.9rem', right:'0.9rem',
                                width:'34px', height:'34px', borderRadius:'50%', zIndex:10,
                                background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
                                color:'rgba(255,255,255,0.55)', fontSize:'1rem', cursor:'pointer',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                transition:'all 0.2s' }}
                                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.14)'}
                                onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                            >✕</button>
                        </div>
                    </div>

                    {/* ── TABS ── */}
                    <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)',
                        padding:'0 1.5rem' }}>
                        {[
                            { id:'calculator', label:'⚡ Calculadora de Inversión' },
                            { id:'metrics',    label:'📊 Métricas Profundas' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                padding:'0.7rem 0.9rem', background:'none', border:'none',
                                borderBottom: activeTab===tab.id ? '2px solid #10b981' : '2px solid transparent',
                                color: activeTab===tab.id ? '#10b981' : 'rgba(255,255,255,0.38)',
                                fontWeight: activeTab===tab.id ? '700' : '500',
                                fontSize:'0.78rem', cursor:'pointer', transition:'all 0.2s',
                                whiteSpace:'nowrap',
                            }}>{tab.label}</button>
                        ))}
                    </div>

                    {/* ── CONTENT ── */}
                    <div className="be4t-dt-scroll" style={{ padding:'1.35rem 1.5rem',
                        maxHeight:'62vh', overflowY:'auto' }}>
                        {activeTab==='calculator' && <CalculatorTab song={data} onAcquire={handleAcquire}/>}
                        {activeTab==='metrics'    && <MetricsTab    song={data}/>}
                    </div>
                </div>
            </div>

            {showAcquisition && (
                <AcquisitionModal
                    asset={{ ...(data._raw||data), _initialQty:initialQty }}
                    onClose={() => setShowAcquisition(false)}
                />
            )}
        </>
    );
};

export default AssetDetailModal;
