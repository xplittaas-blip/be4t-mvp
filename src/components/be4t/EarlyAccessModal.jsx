import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../core/xplit/supabaseClient';

/* ─────────────────────────────────────────────────────────────────────────────
   BE4T — EarlyAccessModal
   "Early Access Waitlist" — lead capture for investor pitch
   Storage: Supabase (waitlist_leads) with Formspree fallback
───────────────────────────────────────────────────────────────────────────── */

const FORMSPREE_URL = import.meta.env.VITE_FORMSPREE_URL || '';

const COUNTRIES = [
    'Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'España',
    'Estados Unidos', 'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay',
    'Bolivia', 'Costa Rica', 'Panamá', 'Guatemala', 'Otro',
];

const PROFILE_OPTIONS = [
    { value: 'inversionista', label: 'Inversionista',      tag: 'INV',  desc: 'Invierto en catálogos musicales' },
    { value: 'artista',       label: 'Artista',             tag: 'ART',  desc: 'Quiero tokenizar mi música' },
    { value: 'sello',         label: 'Sello Discográfico',  tag: 'B2B',  desc: 'Infraestructura BE4T empresarial' },
    { value: 'fan',           label: 'Fan',                 tag: 'FAN',  desc: 'Apoyo a mis artistas favoritos' },
];

// ── Simple email regex ────────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// ── Animated stars bg ─────────────────────────────────────────────────────────
const Stars = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '20px', pointerEvents: 'none' }}>
        {[...Array(28)].map((_, i) => (
            <div key={i} style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: i % 5 === 0 ? '2px' : '1px',
                height: i % 5 === 0 ? '2px' : '1px',
                borderRadius: '50%',
                background: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#a855f7' : 'rgba(255,255,255,0.5)',
                animation: `be4t-twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite alternate`,
                opacity: 0.3 + Math.random() * 0.5,
            }} />
        ))}
    </div>
);

// ── Profile selector chip (typography-only, no icons) ──────────────────────────
const ProfileChip = ({ option, selected, onClick }) => {
    const [hov, setHov] = useState(false);
    const active = selected === option.value;
    return (
        <button
            type="button"
            onClick={() => onClick(option.value)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: '1 1 calc(50% - 0.3rem)',
                minWidth: '130px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: active
                    ? 'linear-gradient(135deg, rgba(0,212,255,0.07), rgba(139,92,246,0.12))'
                    : hov ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
                border: 'none',
                outline: active
                    ? '1.5px solid rgba(0,212,255,0.6)'
                    : hov ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.18s ease',
                boxShadow: active
                    ? 'inset 0 0 20px rgba(0,212,255,0.06), 0 0 0 3px rgba(0,212,255,0.1)'
                    : 'none',
            }}
        >
            <div style={{
                fontSize: '0.62rem', fontWeight: '700', letterSpacing: '1.5px',
                textTransform: 'uppercase', marginBottom: '0.3rem',
                color: active ? '#00D4FF' : 'rgba(255,255,255,0.3)',
                fontFamily: "'Inter Tight','Inter',sans-serif",
                transition: 'color 0.18s',
            }}>{option.tag}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '0.2rem', fontFamily: "'Inter Tight','Inter',sans-serif" }}>
                {option.label}
            </div>
            <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                {option.desc}
            </div>
        </button>
    );
};

// ── Validation error inline ──────────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Inter Tight','Inter',sans-serif" }}>
            {label}
        </label>
        {children}
        {error && <span style={{ fontSize: '0.7rem', color: '#f87171', letterSpacing: '0.2px' }}>{error}</span>}
    </div>
);

const inputStyle = (focused, err) => ({
    width: '100%', padding: '0.8rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${err ? 'rgba(239,68,68,0.6)' : focused ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '10px', color: 'white',
    fontSize: '0.93rem', outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
});

// ── Main Modal ────────────────────────────────────────────────────────────────
const EarlyAccessModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ name: '', email: '', profile: '', country: '' });
    const [errors, setErrors] = useState({});
    const [focused, setFocused] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [count] = useState(137); // simulated early-adopter counter
    const firstInputRef = useRef(null);

    // Reset on open & focus first input
    useEffect(() => {
        if (isOpen) {
            setForm({ name: '', email: '', profile: '', country: '' });
            setErrors({});
            setStatus('idle');
            setErrorMsg('');
            setTimeout(() => firstInputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    // ESC + body scroll lock
    useEffect(() => {
        if (!isOpen) return;
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [isOpen, onClose]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Tu nombre es requerido';
        if (!form.email.trim()) e.email = 'El email es requerido';
        else if (!isValidEmail(form.email)) e.email = 'Email no válido';
        if (!form.profile) e.profile = 'Selecciona tu perfil';
        return e;
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setStatus('loading');

        const payload = {
            full_name:   form.name.trim(),
            email:       form.email.trim().toLowerCase(),
            profile_type: form.profile,
            country:     form.country || null,
            created_at:  new Date().toISOString(),
            source:      'be4t_pitch_modal',
        };

        try {
            // ── Primary: Supabase ──────────────────────────────────────────
            const { error: sbErr } = await supabase
                .from('waitlist_leads')
                .insert([payload]);

            if (sbErr) {
                // If table doesn't exist (code 42P01) fall through to Formspree
                if (!sbErr.code?.includes('42P01') && !sbErr.message?.includes('does not exist')) {
                    // Conflict (duplicate email) → still show success
                    if (sbErr.code === '23505') {
                        setStatus('success');
                        return;
                    }
                    throw new Error(sbErr.message);
                }
                // Fall through to Formspree
                throw new Error('table_missing');
            }
            setStatus('success');
        } catch (primaryErr) {
            // ── Fallback: Formspree ────────────────────────────────────────
            if (FORMSPREE_URL) {
                try {
                    const res = await fetch(FORMSPREE_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                        body: JSON.stringify({
                            name:    payload.full_name,
                            email:   payload.email,
                            profile: payload.profile_type,
                            country: payload.country,
                            source:  payload.source,
                        }),
                    });
                    if (res.ok) { setStatus('success'); return; }
                } catch (_) { /* fallthrough to error */ }
            }
            console.error('Waitlist submission failed:', primaryErr);
            setErrorMsg('Hubo un problema. Escríbenos a hola@be4t.co');
            setStatus('error');
        }
    };

    const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const ne={...e}; delete ne[k]; return ne; }); };

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                @keyframes be4t-twinkle { from{opacity:0.2} to{opacity:0.9} }
                @keyframes be4t-modal-in {
                    from { opacity:0; transform: translate(-50%,-48%) scale(0.96); }
                    to   { opacity:1; transform: translate(-50%,-50%) scale(1); }
                }
                @keyframes be4t-pulse-border {
                    0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
                    50%     { box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }
                }
                .be4t-ea-input:focus { border-color: rgba(139,92,246,0.6) !important; }
                .be4t-ea-select option { background: #0f1117; color: white; }
            `}</style>

            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: 1100,
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }} />

            {/* Modal */}
            <div
                role="dialog" aria-modal="true" aria-label="Obtener Acceso Anticipado"
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'fixed', zIndex: 1101,
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(94vw, 500px)',
                    maxHeight: '92vh', overflowY: 'auto',
                    background: 'rgba(8,8,18,0.95)',
                    backdropFilter: 'blur(32px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '20px',
                    boxShadow: '0 0 0 1px rgba(6,182,212,0.08), 0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
                    animation: 'be4t-modal-in 0.35s ease forwards',
                    padding: '1.75rem',
                }}
            >
                <Stars />
                <div style={{ position: 'relative', zIndex: 1 }}>

                    {/* ── IDLE / FORM VIEW ── */}
                    {status !== 'success' && (
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Close */}
                            <button type="button" onClick={onClose} aria-label="Cerrar"
                                style={{
                                    position: 'absolute', top: '-0.5rem', right: '-0.5rem',
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:'1rem',
                                }}>✕</button>

                            {/* Header */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                {/* Badge */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'rgba(0,212,255,0.06)',
                                    border: '1px solid rgba(0,212,255,0.2)',
                                    borderRadius: '100px', padding: '0.3rem 1rem',
                                    marginBottom: '0.9rem',
                                }}>
                                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 6px #00D4FF' }} />
                                    <span style={{ fontSize: '0.62rem', color: '#00D4FF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Inter Tight','Inter',sans-serif" }}>
                                        Early Access — Cupos Limitados
                                    </span>
                                </div>

                                <h2 style={{
                                    margin: '0 0 0.6rem',
                                    fontFamily: "'Inter Tight', 'Inter', sans-serif",
                                    fontWeight: '900', fontSize: 'clamp(1.35rem, 4vw, 1.7rem)',
                                    background: 'linear-gradient(90deg, #ffffff 30%, #c4b5fd 80%, #06b6d4)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    letterSpacing: '-0.04em', lineHeight: 1.15,
                                }}>
                                    Sé el primero en invertir en los próximos hits mundiales.
                                </h2>

                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.55 }}>
                                    Cupos limitados para la fase Beta. Únete a{' '}
                                    <strong style={{ color: '#c4b5fd' }}>{count.toLocaleString()} personas</strong>
                                    {' '}que ya están en la lista.
                                </p>
                            </div>

                            {/* ── Form fields ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>

                                {/* Name */}
                                <Field label="Nombre Completo *" error={errors.name}>
                                    <input
                                        ref={firstInputRef}
                                        type="text" placeholder="Andrés García"
                                        value={form.name}
                                        onChange={e => set('name')(e.target.value)}
                                        onFocus={() => setFocused('name')}
                                        onBlur={() => setFocused('')}
                                        className="be4t-ea-input"
                                        style={inputStyle(focused === 'name', errors.name)}
                                        autoComplete="name"
                                    />
                                </Field>

                                {/* Email */}
                                <Field label="Correo Electrónico *" error={errors.email}>
                                    <input
                                        type="email" placeholder="andres@ejemplo.com"
                                        value={form.email}
                                        onChange={e => set('email')(e.target.value)}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused('')}
                                        className="be4t-ea-input"
                                        style={inputStyle(focused === 'email', errors.email)}
                                        autoComplete="email"
                                        inputMode="email"
                                    />
                                </Field>

                                {/* Profile */}
                                <Field label="¿Quién eres? *" error={errors.profile}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {PROFILE_OPTIONS.map(opt => (
                                            <ProfileChip
                                                key={opt.value} option={opt}
                                                selected={form.profile}
                                                onClick={(v) => set('profile')(v)}
                                            />
                                        ))}
                                    </div>
                                </Field>

                                {/* Country (optional) */}
                                <Field label="País (Opcional)">
                                    <select
                                        value={form.country}
                                        onChange={e => set('country')(e.target.value)}
                                        className="be4t-ea-select"
                                        style={{ ...inputStyle(focused === 'country', false), cursor: 'pointer' }}
                                        onFocus={() => setFocused('country')}
                                        onBlur={() => setFocused('')}
                                    >
                                        <option value="">Selecciona tu país...</option>
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>

                            {/* Error banner */}
                            {status === 'error' && (
                                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem', color: '#fca5a5', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
                                    {errorMsg}
                                </div>
                            )}

                            {/* CTA button */}
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                style={{
                                    width: '100%', padding: '1rem', minHeight: '54px',
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                                    backgroundSize: '200% auto',
                                    border: 'none', borderRadius: '14px',
                                    color: 'white', fontWeight: '900', fontSize: '1.05rem',
                                    cursor: status === 'loading' ? 'wait' : 'pointer',
                                    letterSpacing: '-0.01em',
                                    boxShadow: '0 4px 28px rgba(124,58,237,0.45), 0 0 0 1px rgba(139,92,246,0.2)',
                                    transition: 'all 0.25s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    animation: status === 'idle' ? 'be4t-pulse-border 2.5s ease infinite' : 'none',
                                }}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                                            style={{ animation: 'be4t-spin 0.8s linear infinite' }}>
                                            <path d="M12 2a10 10 0 0 1 10 10"/>
                                            <style>{'@keyframes be4t-spin { to { transform: rotate(360deg); }}'}</style>
                                        </svg>
                                        Reservando tu lugar...
                                    </>
                                ) : 'Unirme a la Lista de Espera'}
                            </button>

                            {/* Terms micro-copy */}
                            <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', lineHeight: 1.5 }}>
                                Sin spam. Puedes darte de baja cuando quieras. Tus datos están protegidos bajo nuestra{' '}
                                <a href="#" style={{ color: '#7c3aed', textDecoration: 'none' }}>Política de Privacidad</a>.
                            </p>
                        </form>
                    )}

                    {/* ── SUCCESS VIEW ── */}
                    {status === 'success' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem', padding: '1.5rem 0.5rem', textAlign: 'center' }}>
                            {/* Check circle */}
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))',
                                border: '1.5px solid rgba(0,212,255,0.5)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 32px rgba(0,212,255,0.2)',
                                animation: 'be4t-pulse-border 2s ease infinite',
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>

                            <div>
                                <h3 style={{
                                    margin: '0 0 0.5rem',
                                    fontFamily: "'Inter Tight', sans-serif",
                                    fontWeight: '900', fontSize: '1.4rem',
                                    background: 'linear-gradient(90deg, #ffffff, #c4b5fd)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>¡Estás en la lista!</h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    <strong style={{ color: 'white' }}>{form.name.split(' ')[0]}</strong>, te notificaremos en{' '}
                                    <strong style={{ color: '#06b6d4' }}>{form.email}</strong>{' '}
                                    cuando tu acceso esté listo.
                                </p>
                            </div>

                            {/* Perks — gradient bar accent, no emoji */}
                            <div style={{ width: '100%', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                {[
                                    { tag: '01', title: 'Acceso Prioritario', text: 'Notificación antes de la apertura general.' },
                                    { tag: '02', title: 'Comisión 0%',       text: 'En tu primera operación de inversión.' },
                                    { tag: '03', title: 'Datos Exclusivos',  text: 'Análisis de tendencias antes del lanzamiento.' },
                                ].map((p, i) => (
                                    <div key={p.tag} style={{ display: 'flex', alignItems: 'stretch', background: 'rgba(255,255,255,0.025)', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <div style={{ width: '3px', background: 'linear-gradient(180deg,#00D4FF,#8B5CF6)', flexShrink: 0 }} />
                                        <div style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                <span style={{ fontSize: '0.58rem', fontWeight: '700', color: 'rgba(0,212,255,0.7)', letterSpacing: '1px', fontFamily: "'Inter Tight',sans-serif" }}>{p.tag}</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>{p.title}</span>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{p.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                                <button onClick={onClose}
                                    style={{
                                        flex: 1, padding: '0.85rem',
                                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                                        border: 'none', borderRadius: '12px',
                                        color: 'white', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                                        boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                                    }}>
                                    Explorar Marketplace →
                                </button>
                                <button
                                    onClick={() => {
                                        const text = `Acabo de unirme a la lista de espera de @be4t - la plataforma para invertir en la música que amas 🎵🚀 → be4t.co`;
                                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                                        window.open(url, '_blank');
                                    }}
                                    style={{
                                        padding: '0.85rem 1rem',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '12px', color: 'rgba(255,255,255,0.7)',
                                        fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}>
                                    𝕏 Compartir
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EarlyAccessModal;
