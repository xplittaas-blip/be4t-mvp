import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SLIDES } from './pitchSlides';

const C = { bg:'#08080f', accent:'#00f0ff', purple:'#a855f7', gold:'#facc15', green:'#4ade80', red:'#ff4d6d', dim:'rgba(255,255,255,0.4)', border:'rgba(255,255,255,0.07)' };

const Tag = ({ color, children }) => (
  <span style={{ display:'inline-block', fontSize:'0.62rem', fontWeight:800, letterSpacing:'2px', textTransform:'uppercase', color, border:`1px solid ${color}55`, borderRadius:100, padding:'4px 14px', marginBottom:'1.5rem' }}>{children}</span>
);

const Pt = ({ color, title, text }) => (
  <li style={{ display:'flex', gap:'1rem', marginBottom:'1.25rem', listStyle:'none' }}>
    <span style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0, marginTop:8 }} />
    <div><div style={{ fontWeight:800, fontSize:'1rem', color:'white' }}>{title}</div><div style={{ color:C.dim, fontSize:'0.88rem', marginTop:4, lineHeight:1.6 }}>{text}</div></div>
  </li>
);

const renderSlide = (s) => {
  if (s.type === 'cover') return (
    <div style={{ textAlign:'center', position:'relative' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <h1 style={{ fontSize:'clamp(5rem,12vw,9rem)', fontWeight:950, letterSpacing:'-0.05em', margin:'0 0 1.5rem', lineHeight:0.9 }}
        dangerouslySetInnerHTML={{ __html: s.title.replace('<accent>', `<span style="color:${C.accent}">`).replace('</accent>', '</span>') }} />
      <p style={{ fontSize:'1.3rem', color:C.dim, maxWidth:600, margin:'0 auto', lineHeight:1.7 }}>{s.subtitle}</p>
    </div>
  );

  if (s.type === 'two-col') return (
    <div style={{ width:'100%', maxWidth:1100 }}>
      <Tag color={C.red}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:900, marginBottom:'3rem' }}>{s.title}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem' }}>
        {[s.left, s.right].map((col) => (
          <div key={col.heading} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${col.color}22`, borderRadius:20, padding:'2rem' }}>
            <h3 style={{ color:col.color, fontWeight:800, fontSize:'1.1rem', marginBottom:'1.5rem', textTransform:'uppercase', letterSpacing:'1px' }}>{col.heading}</h3>
            <ul style={{ padding:0, margin:0 }}>{col.points.map(([t,d]) => <Pt key={t} color={col.color} title={t} text={d} />)}</ul>
          </div>
        ))}
      </div>
    </div>
  );

  if (s.type === 'three-cards') return (
    <div style={{ width:'100%', maxWidth:1100, textAlign:'center' }}>
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:900, marginBottom:'0.75rem' }}>{s.title}</h2>
      <p style={{ color:C.dim, maxWidth:700, margin:'0 auto 3rem', fontSize:'1.05rem', lineHeight:1.7 }}>{s.subtitle}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
        {s.cards.map(c => (
          <div key={c.title} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${c.color}33`, borderRadius:20, padding:'2rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>{c.icon}</div>
            <h4 style={{ color:c.color, fontWeight:800, marginBottom:'0.75rem' }}>{c.title}</h4>
            <p style={{ color:C.dim, lineHeight:1.7, fontSize:'0.9rem' }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (s.type === 'market') return (
    <div style={{ width:'100%', maxWidth:1100 }}>
      <Tag color={C.green}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:900, marginBottom:'3rem' }}>{s.title}</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', marginBottom:'2rem' }}>
        {s.stats.map((st, i) => (
          <div key={st.label} style={{ display:'flex', alignItems:'center', gap:'2rem', background:'rgba(255,255,255,0.02)', border:`1px solid ${st.color}22`, borderRadius:16, padding:'1.5rem 2rem' }}>
            <div style={{ fontWeight:900, fontSize:'clamp(2rem,4vw,3rem)', color:st.color, fontFamily:'monospace', minWidth:160 }}>{st.value}</div>
            <div>
              <div style={{ fontWeight:700, color:'white', marginBottom:4 }}>{st.label}</div>
              <div style={{ color:C.dim, fontSize:'0.85rem' }}>{st.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:`rgba(0,240,255,0.05)`, border:`1px solid ${C.accent}33`, borderRadius:12, padding:'1rem 1.5rem', color:C.accent, fontSize:'0.9rem' }}>{s.insight}</div>
    </div>
  );

  if (s.type === 'revenue') return (
    <div style={{ width:'100%', maxWidth:1100 }}>
      <Tag color={C.gold}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:900, marginBottom:'2.5rem' }}>{s.title}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.25rem', marginBottom:'2rem' }}>
        {s.streams.map(r => (
          <div key={r.name} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, borderRadius:16, padding:'1.5rem', display:'flex', gap:'1rem' }}>
            <span style={{ fontSize:'1.75rem', flexShrink:0 }}>{r.icon}</span>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:6 }}>
                <span style={{ fontWeight:800, fontSize:'1rem' }}>{r.name}</span>
                <span style={{ fontWeight:900, color:C.gold, fontSize:'1rem', background:'rgba(250,204,21,0.1)', padding:'2px 10px', borderRadius:100 }}>{r.pct}</span>
              </div>
              <div style={{ color:C.dim, fontSize:'0.88rem', lineHeight:1.6 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:12, padding:'1.25rem 1.75rem', display:'flex', gap:'2rem', alignItems:'center' }}>
        <span style={{ fontSize:'1.25rem' }}>📊</span>
        <div><span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem' }}>{s.unit.label}</span><br /><strong style={{ color:C.green }}>{s.unit.rev}</strong></div>
      </div>
    </div>
  );

  if (s.type === 'features') return (
    <div style={{ width:'100%', maxWidth:1100 }}>
      <Tag color={C.purple}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:900, marginBottom:'2.5rem' }}>{s.title}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem' }}>
        {s.list.map(f => (
          <div key={f.title} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, borderRadius:16, padding:'1.5rem' }}>
            <div style={{ fontSize:'1.75rem', marginBottom:'0.75rem' }}>{f.icon}</div>
            <h4 style={{ fontWeight:800, marginBottom:'0.5rem' }}>{f.title}</h4>
            <p style={{ color:C.dim, fontSize:'0.85rem', lineHeight:1.65, margin:0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (s.type === 'infra') return (
    <div style={{ width:'100%', maxWidth:1100 }}>
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:900, marginBottom:'2.5rem' }}>{s.title}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem' }}>
        {s.layers.map(l => (
          <div key={l.name} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${l.color}33`, borderRadius:16, padding:'1.5rem' }}>
            <div style={{ color:l.color, fontWeight:800, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'1rem', borderBottom:`1px solid ${l.color}22`, paddingBottom:'0.75rem' }}>{l.name}</div>
            {l.items.map(it => (
              <div key={it} style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start', marginBottom:'0.6rem' }}>
                <span style={{ color:l.color, marginTop:2, flexShrink:0 }}>▸</span>
                <span style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.85rem' }}>{it}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  if (s.type === 'roadmap') return (
    <div style={{ width:'100%', maxWidth:1100 }}>
      <Tag color={C.purple}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:900, marginBottom:'3rem' }}>{s.title}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
        {s.phases.map(p => (
          <div key={p.phase} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${p.color}33`, borderRadius:20, padding:'2rem', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:p.color }} />
            <div style={{ color:p.color, fontWeight:900, fontSize:'0.75rem', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'0.5rem' }}>{p.phase}</div>
            <div style={{ fontWeight:800, fontSize:'1.2rem', color:'white', marginBottom:'1.5rem' }}>{p.name}</div>
            {p.items.map(it => (
              <div key={it} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.65rem' }}>
                <span style={{ color:p.color, flexShrink:0 }}>✓</span>
                <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.88rem' }}>{it}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  if (s.type === 'cta') return (
    <div style={{ textAlign:'center', maxWidth:800, margin:'0 auto' }}>
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <h2 style={{ fontSize:'clamp(2.5rem,6vw,5rem)', fontWeight:950, letterSpacing:'-0.04em', lineHeight:1.05, marginBottom:'1.5rem' }}>{s.title}</h2>
      <p style={{ fontSize:'1.1rem', color:C.dim, maxWidth:540, margin:'0 auto 3rem', lineHeight:1.7 }}>{s.subtitle}</p>
      <a href="mailto:hola@be4t.com" style={{ display:'inline-flex', alignItems:'center', gap:'0.75rem', background:`linear-gradient(135deg, ${C.accent}, ${C.purple})`, border:'none', borderRadius:16, padding:'1.1rem 3rem', color:'white', fontWeight:800, fontSize:'1.1rem', textDecoration:'none', cursor:'pointer', boxShadow:`0 12px 40px rgba(0,240,255,0.25)`, marginBottom:'3.5rem' }}>
        Agendar Demo → hola@be4t.com
      </a>
      <div style={{ display:'flex', justifyContent:'center', gap:'3rem', flexWrap:'wrap' }}>
        {s.contacts.map(c => (
          <div key={c.label} style={{ textAlign:'left' }}>
            <div style={{ fontSize:'0.65rem', color:C.dim, textTransform:'uppercase', letterSpacing:'1px', marginBottom:4 }}>{c.label}</div>
            <div style={{ fontWeight:700, color:C.accent }}>{c.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
};

export default function PitchDeck({ onExit }) {
  const [cur, setCur] = useState(0);
  const total = SLIDES.length;

  const prev = useCallback(() => setCur(c => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCur(c => Math.min(total - 1, c + 1)), [total]);

  useEffect(() => {
    const fn = e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'Escape') onExit?.(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [next, prev, onExit]);

  return (
    <div style={{ position:'fixed', inset:0, background:C.bg, zIndex:9999, color:'white', display:'flex', flexDirection:'column', fontFamily:"'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div style={{ padding:'1.5rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontWeight:900, fontSize:'1.4rem', letterSpacing:'-0.04em' }}>
          BE<span style={{ color:C.accent }}>4</span>T <span style={{ fontWeight:400, fontSize:'0.75rem', opacity:0.35, marginLeft:8 }}>PITCH DECK 2026</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ display:'flex', gap:'0.4rem' }}>
            {SLIDES.map((sl, i) => (
              <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? 24 : 8, height:8, borderRadius:100, border:'none', background: i === cur ? C.accent : 'rgba(255,255,255,0.15)', cursor:'pointer', transition:'all 0.3s ease', padding:0 }} />
            ))}
          </div>
          <button onClick={onExit} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, borderRadius:100, padding:'6px 18px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'0.72rem', fontWeight:700 }}>ESC</button>
        </div>
      </div>

      {/* Slide area */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 4rem', overflow:'hidden' }}>
        <div key={cur} style={{ animation:'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1)', width:'100%', display:'flex', justifyContent:'center' }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }`}</style>
          {renderSlide(SLIDES[cur])}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'1.25rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:`1px solid ${C.border}` }}>
        <span style={{ fontSize:'0.8rem', color:C.dim, fontWeight:600 }}>{SLIDES[cur].label} · {cur + 1}/{total}</span>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button disabled={cur === 0} onClick={prev} style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, color:'white', cursor: cur === 0 ? 'not-allowed' : 'pointer', opacity: cur === 0 ? 0.3 : 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronLeft size={18} />
          </button>
          <button disabled={cur === total - 1} onClick={next} style={{ width:44, height:44, borderRadius:'50%', background: cur === total - 1 ? 'rgba(255,255,255,0.04)' : C.accent, border:'none', color: cur === total - 1 ? 'white' : 'black', cursor: cur === total - 1 ? 'not-allowed' : 'pointer', opacity: cur === total - 1 ? 0.3 : 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
