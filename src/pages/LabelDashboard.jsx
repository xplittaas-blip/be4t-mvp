import React, { useMemo, useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { useDemoBalance } from '../hooks/useDemoBalance';
import { isShowcase, isProduction } from '../core/env';
import { Be4tTooltip } from '../components/be4t/Be4tTooltip';

// ── Brand palette ──────────────────────────────────────────────────────────────
const PURPLE = '#7c3aed';
const CYAN   = '#06b6d4';
const GREEN  = '#10b981';
const ORANGE = '#f97316';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtUSD = (n) =>
    n >= 1_000_000
        ? `$${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
            ? `$${(n / 1_000).toFixed(1)}k`
            : `$${n.toFixed(0)}`;

const fmtPct = (n) => `${parseFloat(n).toFixed(1)}%`;

// ── Build synthetic daily capital-flow series from portfolio data ──────────────
// In demo: each investment has acquiredAt timestamp → we bucket by day
function buildDailyFlow(portfolio) {
    if (!portfolio.length) return generateFlatline();

    const byDay = {};
    portfolio.forEach(h => {
        const d = new Date(h.acquiredAt || Date.now());
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        byDay[key] = (byDay[key] || 0) + (h.cost || 0);
    });

    // Fill last 14 days
    const days = [];
    const today = new Date();
    let cumulative = 0;
    for (let i = 13; i >= 0; i--) {
        const d   = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const daily = byDay[key] || 0;
        cumulative += daily;
        days.push({
            date:  d.toLocaleDateString('es', { month: 'short', day: 'numeric' }),
            daily,
            total: cumulative,
        });
    }
    return days;
}

// Fallback: flat zero line for 14 days
function generateFlatline() {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (13 - i));
        return {
            date:  d.toLocaleDateString('es', { month: 'short', day: 'numeric' }),
            daily: 0,
            total: 0,
        };
    });
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(10,6,30,0.95)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '10px', padding: '0.65rem 0.9rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ fontSize: '0.85rem', fontWeight: '700', color: p.color }}>
                    {p.name === 'total' ? 'Acumulado' : 'Nuevo'}: {fmtUSD(p.value)}
                </div>
            ))}
        </div>
    );
};

// ── KPI Card ───────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color = PURPLE, icon, tooltipText }) => (
    <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${color}33`,
        borderRadius: '16px', padding: '1.25rem 1.5rem',
        position: 'relative', overflow: 'hidden',
    }}>
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            pointerEvents: 'none',
        }} />
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '700', marginBottom: '0.35rem', display: 'flex', alignItems: 'center' }}>
            {label}
            {tooltipText && <Be4tTooltip content={tooltipText} />}
        </div>
        <div style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: '900', color, letterSpacing: '-0.04em', fontFamily: "'Courier New',monospace" }}>{value}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.3rem' }}>{sub}</div>}
    </div>
);

// ── Track Row ──────────────────────────────────────────────────────────────────
const TrackRow = ({ track, rank }) => {
    const soldPct    = Math.min(100, parseFloat(track.ownershipPct || 0) * (1 + rank * 0.15));
    const barColor   = soldPct > 70 ? ORANGE : soldPct > 35 ? CYAN : GREEN;
    const monthlyRoy = (track.cost || 0) * ((track.apy || 12) / 100) / 12;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.85rem 1rem', borderRadius: '12px',
            background: 'rgba(255,255,255,0.018)',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '0.5rem',
            transition: 'background 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.018)'}
        >
            {/* Cover */}
            <div style={{
                width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                background: track.coverUrl
                    ? `url(${track.coverUrl}) center/cover`
                    : `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
            }}>
                {!track.coverUrl && '🎵'}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.name || track.id}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {track.artist}
                </div>
                {/* Progress bar: % vendido */}
                <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: '2px',
                        background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`,
                        width: `${soldPct.toFixed(1)}%`,
                        transition: 'width 0.6s ease',
                    }} />
                </div>
            </div>
            {/* Stats */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: barColor }}>{fmtPct(soldPct)} vendido</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>${(track.cost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} cap.</div>
                <div style={{ fontSize: '0.65rem', color: GREEN, marginTop: '1px' }}>+{fmtUSD(monthlyRoy)}/mes</div>
            </div>
        </div>
    );
};

// ── Demo Banner ────────────────────────────────────────────────────────────────
const DemoBanner = () => (
    <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '14px', padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
    }}>
        <span style={{ fontSize: '1.4rem' }}>🎮</span>
        <div>
            <div style={{ fontSize: '0.72rem', color: PURPLE, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Modo Demo Activo</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                Las métricas se actualizan en tiempo real con las inversiones de tu sesión demo. ¡Invierte en una canción y regresa a ver los números subir!
            </div>
        </div>
    </div>
);

// ── Role Guard (Production) ────────────────────────────────────────────────────
const AccessDenied = ({ onBack }) => (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontWeight: '900', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Acceso Restringido</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Este panel es exclusivo para administradores de distribuidoras verificadas (LABEL_ADMIN). Contacta a tu gestor de cuenta BE4T para solicitar acceso.
        </p>
        <button onClick={onBack} style={{ padding: '0.75rem 2rem', background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`, border: 'none', borderRadius: '100px', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
            ← Volver al Marketplace
        </button>
    </div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const LabelDashboard = ({ session, onNavigate }) => {
    const { portfolio, labelLedger } = useDemoBalance();
    const [tick, setTick] = useState(0);

    // Live ticker: re-render every 4s to update earned-to-date
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 4000);
        return () => clearInterval(id);
    }, []);

    // ── Route guard (production only) ─────────────────────────────────────────
    if (isProduction) {
        const role = session?.user?.user_metadata?.user_role
            || session?.user?.app_metadata?.user_role
            || null;
        if (role !== 'LABEL_ADMIN') {
            return <AccessDenied onBack={() => onNavigate?.('explore')} />;
        }
    }

    // ── KPI calculations from live portfolio / ledger ─────────────────────────
    const currentHoldersArray = portfolio.filter(p => !p.exited);
    const totalCapital   = isShowcase ? labelLedger.gross_capital : portfolio.reduce((s, h) => s + (h.cost || 0), 0);
    const uniqueInvestors = isShowcase ? Math.max(1, currentHoldersArray.length) : portfolio.length;
    const totalTokens    = isShowcase ? portfolio.reduce((s, h) => s + (h.fractions || 0), 0) + labelLedger.reserve_inventory : portfolio.reduce((s, h) => s + (h.fractions || 0), 0);
    const estimatedSave  = totalCapital * 0.15; // 15% marketing savings metric
    const totalEarned    = currentHoldersArray.reduce((s, h) => s + (h.earnedToDate || 0), 0);
    const avgApy         = currentHoldersArray.length
        ? currentHoldersArray.reduce((s, h) => s + (h.apy || 12), 0) / currentHoldersArray.length
        : 14;

    // ── Chart data ────────────────────────────────────────────────────────────
    const dailyFlow = useMemo(() => buildDailyFlow(portfolio), [portfolio]);

    // ── Tracks for bar chart (top 5 by capital) ───────────────────────────────
    const topTracks = [...currentHoldersArray].sort((a, b) => (b.cost || 0) - (a.cost || 0)).slice(0, 5);

    // ── Bar chart: capital por canción ────────────────────────────────────────
    const barData = topTracks.map(h => ({
        name: (h.name || h.id || '?').substring(0, 14),
        capital: h.cost || 0,
        apy: h.apy || 12,
    }));

    const BAR_COLORS = [PURPLE, CYAN, GREEN, ORANGE, '#ec4899'];

    return (
        <div style={{ minHeight: '100vh', color: 'white', padding: '0 0 4rem' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800;900&display=swap');
                .ldb-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 1.75rem; margin-bottom: 1.5rem; }
                .ldb-section-title { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.3); font-weight: 700; margin-bottom: 1.25rem; }
                .ldb-live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${GREEN}; box-shadow: 0 0 6px ${GREEN}; display: inline-block; animation: ldb-pulse 1.8s ease infinite; }
                @keyframes ldb-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>

            {/* ── Page Header ── */}
            <div style={{
                background: 'linear-gradient(160deg, rgba(20,10,40,0.98) 0%, rgba(8,6,20,0.98) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '2.5rem 1.5rem 2rem',
                marginBottom: '2rem',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span className="ldb-live-dot" />
                        <span style={{ fontSize: '0.62rem', color: GREEN, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            Live — {isShowcase ? 'Demo Playground' : 'Production'}
                        </span>
                    </div>
                    <h1 style={{
                        fontFamily: "'Inter Tight','Inter',sans-serif",
                        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                        fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1.05,
                        background: 'linear-gradient(135deg, #fff 0%, #a855f7 50%, #06b6d4 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        marginBottom: '0.5rem',
                    }}>
                        Business Dashboard
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: '600px' }}>
                        Panel ejecutivo — capital inyectado, comunidad de socios y flujo de regalías de tu catálogo.
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Demo banner */}
                {isShowcase && <DemoBanner />}

                {/* ── KPI Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <KpiCard icon="💰" label="Capital Inyectado" tooltipText="Suma de todos los aportes de fans que se convierten en liquidez para la disquera." value={fmtUSD(totalCapital)} sub={`${portfolio.length} activo${portfolio.length !== 1 ? 's' : ''} tokenizado${portfolio.length !== 1 ? 's' : ''}`} color={PURPLE} />
                    <KpiCard icon="🤝" label="Socios Inversores" value={uniqueInvestors.toLocaleString()} sub="fans co-propietarios" color={CYAN} />
                    <KpiCard icon="🎯" label="Tokens Emitidos" value={totalTokens.toLocaleString()} sub={`APY promedio: ${fmtPct(avgApy)}`} color={GREEN} />
                    <KpiCard icon="📈" label="Ahorro Mktg. Est." tooltipText="Representa el 15% del capital inyectado que la disquera ya no gasta en publicidad tradicional." value={fmtUSD(estimatedSave)} sub="vs. campañas tradicionales (15%)" color={ORANGE} />
                    <KpiCard icon="💎" label="Regalías Acumuladas" tooltipText="Calculado proporcionalmente según tu cantidad de tokens y la TEA del activo." value={`$${totalEarned.toFixed(2)}`} sub="generadas en esta sesión" color="#ec4899" />
                </div>

                {/* ── Capital Flow Chart ── */}
                <div className="ldb-section">
                    <div className="ldb-section-title">Flujo de Capital — Últimos 14 días</div>
                    {totalCapital === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                            📊 Los datos aparecerán aquí en cuanto realices tu primera inversión como fan.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={dailyFlow} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cgTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PURPLE} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="cgDaily" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => fmtUSD(v)} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" name="total" stroke={PURPLE} strokeWidth={2} fill="url(#cgTotal)" dot={false} />
                                <Area type="monotone" dataKey="daily" name="daily" stroke={CYAN} strokeWidth={1.5} fill="url(#cgDaily)" dot={false} strokeDasharray="4 2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ── Two-column responsive: tracks + bar chart ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

                    {/* Track list */}
                    <div className="ldb-section">
                        <div className="ldb-section-title">Canciones del Catálogo — % Vendido</div>
                        {portfolio.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>
                                🎵 Aún no hay activos tokenizados en este catálogo.<br />
                                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>Invierte en canciones para verlas aquí.</span>
                            </div>
                        ) : (
                            topTracks.map((track, i) => (
                                <TrackRow key={track.id || i} track={track} rank={i} />
                            ))
                        )}
                    </div>

                    {/* Bar chart: capital distribution */}
                    <div className="ldb-section">
                        <div className="ldb-section-title">Distribución de Capital por Track</div>
                        {barData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>Sin datos aún.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tickFormatter={v => fmtUSD(v)} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Bar dataKey="capital" name="total" radius={[0, 6, 6, 0]}>
                                        {barData.map((_, i) => (
                                            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── Loop Virtuoso explainer (demo only) ── */}
                {isShowcase && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.05) 100%)',
                        border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '1.5rem',
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem',
                    }}>
                        <div>
                            <div style={{ fontSize: '0.6rem', color: PURPLE, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>🔄 El Loop Virtuoso</div>
                            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                                El fan invierte en una canción → el capital aparece aquí → la disquera ve el % vendido subir → el artista recibe adelantos → produce más → más regalías para los fans.
                            </div>
                        </div>
                        {[
                            { label: 'Capital total demo', value: fmtUSD(totalCapital), color: PURPLE },
                            { label: 'Ahorro en mktg', value: fmtUSD(estimatedSave), color: GREEN },
                            { label: 'Tokens emitidos', value: totalTokens.toLocaleString(), color: CYAN },
                        ].map(stat => (
                            <div key={stat.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                                <div style={{ fontWeight: '900', color: stat.color, fontSize: '1.3rem', fontFamily: "'Courier New',monospace", marginTop: '4px' }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabelDashboard;
