import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SLIDES } from './pitchSlides';

const C = { bg:'#08080f', accent:'#00f0ff', purple:'#a855f7', gold:'#facc15', green:'#4ade80', red:'#ff4d6d', dim:'rgba(255,255,255,0.4)', border:'rgba(255,255,255,0.08)' };

const Tag = ({ color, children }) => (
  <span style={{ display:'inline-block', fontSize:'0.62rem', fontWeight:800, letterSpacing:'2px', textTransform:'uppercase', color, border:`1px solid ${color}55`, borderRadius:100, padding:'4px 14px', marginBottom:'1.5rem' }}>{children}</span>
);

const H2 = ({ children, style }) => (
  <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, margin:'0 0 1rem', color:'white', ...style }}>{children}</h2>
);

const Dim = ({ children, style }) => <p style={{ color:C.dim, lineHeight:1.7, margin:0, ...style }}>{children}</p>;

const Card = ({ color='rgba(255,255,255,0.08)', children, style }) => (
  <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${color}`, borderRadius:16, padding:'1.5rem', ...style }}>{children}</div>
);

const Pt = ({ color, title, text }) => (
  <li style={{ display:'flex', gap:'0.85rem', marginBottom:'1.1rem', listStyle:'none', padding:0 }}>
    <span style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0, marginTop:9 }} />
    <div><div style={{ fontWeight:700, fontSize:'0.95rem' }}>{title}</div><Dim style={{ fontSize:'0.85rem', marginTop:3 }}>{text}</Dim></div>
  </li>
);

const renderSlide = (s) => {
  if (s.type === 'cover') return (
    <div style={{ textAlign:'center', position:'relative' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,240,255,0.07) 0%, transparent 65%)', pointerEvents:'none' }} />
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <h1 style={{ fontSize:'clamp(5rem,14vw,9rem)', fontWeight:950, letterSpacing:'-0.05em', margin:'0 0 1.5rem', lineHeight:0.88 }}
        dangerouslySetInnerHTML={{ __html: s.title.replace('<accent>', `<span style="color:${C.accent}">`).replace('</accent>', '</span>') }} />
      <Dim style={{ fontSize:'1.2rem', maxWidth:620, margin:'0 auto' }}>{s.subtitle}</Dim>
    </div>
  );

  if (s.type === 'problem') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.red}>{s.eyebrow}</Tag>
      <H2>{s.title}</H2>
      <Card color={`${C.gold}33`} style={{ marginBottom:'2rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
        <span style={{ fontSize:'2rem', flexShrink:0 }}>{s.analogy.icon}</span>
        <div><div style={{ fontWeight:800, color:C.gold, marginBottom:4 }}>{s.analogy.title}</div><Dim style={{ fontSize:'0.88rem' }}>{s.analogy.text}</Dim></div>
      </Card>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {s.cols.map(col => (
          <Card key={col.heading} color={`${col.color}22`}>
            <div style={{ color:col.color, fontWeight:800, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'1.25rem', borderBottom:`1px solid ${col.color}22`, paddingBottom:'0.75rem' }}>{col.heading}</div>
            <ul style={{ padding:0, margin:0 }}>{col.points.map(([t,d]) => <Pt key={t} color={col.color} title={t} text={d} />)}</ul>
          </Card>
        ))}
      </div>
    </div>
  );

  if (s.type === 'loop') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <H2>{s.title}</H2>
      <Dim style={{ maxWidth:640, marginBottom:'2.5rem', fontSize:'0.95rem' }}>{s.subtitle}</Dim>
      <div style={{ display:'flex', alignItems:'center', gap:'0', marginBottom:'2.5rem', overflowX:'auto' }}>
        {s.steps.map((st, i) => (
          <React.Fragment key={st.label}>
            <div style={{ textAlign:'center', minWidth:140, flex:'0 0 auto' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:`${st.color}15`, border:`2px solid ${st.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', margin:'0 auto 0.75rem', boxShadow:`0 0 20px ${st.color}30` }}>{st.icon}</div>
              <div style={{ fontWeight:700, fontSize:'0.82rem', color:'white', marginBottom:4, lineHeight:1.3 }}>{st.label}</div>
              <div style={{ fontSize:'0.7rem', color:st.color }}>{st.sub}</div>
            </div>
            {i < s.steps.length - 1 && <div style={{ color:'rgba(255,255,255,0.15)', fontSize:'1.5rem', flexShrink:0, padding:'0 0.25rem', marginBottom:20 }}>→</div>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
        {s.benefits.map(b => (
          <Card key={b.title}>
            <div style={{ fontSize:'1.4rem', marginBottom:'0.6rem' }}>{b.icon}</div>
            <div style={{ fontWeight:800, fontSize:'0.9rem', marginBottom:'0.4rem' }}>{b.title}</div>
            <Dim style={{ fontSize:'0.82rem' }}>{b.desc}</Dim>
          </Card>
        ))}
      </div>
    </div>
  );

  if (s.type === 'market') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.green}>{s.eyebrow}</Tag>
      <H2 style={{ marginBottom:'2rem' }}>{s.title}</H2>
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.5rem' }}>
        {s.stats.map(st => (
          <div key={st.label} style={{ display:'flex', alignItems:'center', gap:'1.5rem', background:'rgba(255,255,255,0.02)', border:`1px solid ${st.color}22`, borderRadius:14, padding:'1.25rem 1.75rem' }}>
            <div style={{ fontWeight:900, fontSize:'clamp(1.8rem,3.5vw,2.6rem)', color:st.color, fontFamily:'monospace', minWidth:150, flexShrink:0 }}>{st.value}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:4 }}>
                <span style={{ fontWeight:700, color:'white' }}>{st.label}</span>
                <span style={{ fontSize:'0.7rem', fontWeight:800, color:st.color, background:`${st.color}15`, padding:'2px 10px', borderRadius:100, border:`1px solid ${st.color}33` }}>{st.pct}</span>
              </div>
              <Dim style={{ fontSize:'0.82rem' }}>{st.sub}</Dim>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(0,240,255,0.04)', border:`1px solid ${C.accent}22`, borderRadius:12, padding:'1rem 1.5rem', color:C.accent, fontSize:'0.88rem' }}>{s.insight}</div>
    </div>
  );

  if (s.type === 'valuation') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.gold}>{s.eyebrow}</Tag>
      <H2>{s.title}</H2>
      <Dim style={{ maxWidth:640, marginBottom:'2rem', fontSize:'0.95rem' }}>{s.subtitle}</Dim>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {s.pillars.map(p => (
            <Card key={p.name} color={`${p.color}22`} style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:`${p.color}15`, border:`1px solid ${p.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{p.icon}</div>
              <div><div style={{ fontWeight:800, color:p.color, marginBottom:4 }}>{p.name}</div><Dim style={{ fontSize:'0.83rem' }}>{p.desc}</Dim></div>
            </Card>
          ))}
        </div>
        <Card color={`${C.gold}33`}>
          <div style={{ fontWeight:800, color:C.gold, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'1.25rem' }}>{s.example.title}</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>{s.example.rows.map(([k,v]) => (
              <tr key={k} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding:'0.7rem 0', color:C.dim, fontSize:'0.85rem' }}>{k}</td>
                <td style={{ padding:'0.7rem 0', textAlign:'right', fontWeight:800, color:'white', fontFamily:'monospace' }}>{v}</td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </div>
  );

  if (s.type === 'secondary') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.purple}>{s.eyebrow}</Tag>
      <H2>{s.title}</H2>
      <Dim style={{ maxWidth:640, marginBottom:'2.5rem', fontSize:'0.95rem' }}>{s.subtitle}</Dim>
      <div style={{ display:'flex', alignItems:'center', gap:'0', marginBottom:'2.5rem', background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, borderRadius:16, padding:'2rem' }}>
        {s.flow.map((f, i) => (
          <React.Fragment key={f.label}>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>{f.icon}</div>
              <div style={{ fontSize:'0.78rem', color:f.color, fontWeight:700, whiteSpace:'pre-line', lineHeight:1.5 }}>{f.label}</div>
            </div>
            {i < s.flow.length - 1 && <div style={{ color:'rgba(255,255,255,0.15)', fontSize:'1.4rem', padding:'0 0.5rem', flexShrink:0 }}>→</div>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
        {s.metrics.map(m => (
          <Card key={m.label} color={`${m.color}33`} style={{ textAlign:'center' }}>
            <div style={{ fontSize:'2.2rem', fontWeight:900, color:m.color, fontFamily:'monospace', marginBottom:8 }}>{m.value}</div>
            <Dim style={{ fontSize:'0.82rem' }}>{m.label}</Dim>
          </Card>
        ))}
      </div>
    </div>
  );

  if (s.type === 'features') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.purple}>{s.eyebrow}</Tag>
      <H2 style={{ marginBottom:'2rem' }}>{s.title}</H2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.1rem' }}>
        {s.list.map(f => (
          <Card key={f.title}>
            <div style={{ fontSize:'1.6rem', marginBottom:'0.65rem' }}>{f.icon}</div>
            <div style={{ fontWeight:800, fontSize:'0.95rem', marginBottom:'0.4rem' }}>{f.title}</div>
            <Dim style={{ fontSize:'0.83rem' }}>{f.desc}</Dim>
          </Card>
        ))}
      </div>
    </div>
  );

  if (s.type === 'infra') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <H2 style={{ marginBottom:'2rem' }}>{s.title}</H2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.1rem' }}>
        {s.layers.map(l => (
          <Card key={l.name} color={`${l.color}33`}>
            <div style={{ color:l.color, fontWeight:800, fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'1rem', borderBottom:`1px solid ${l.color}22`, paddingBottom:'0.65rem' }}>{l.name}</div>
            {l.items.map(it => (
              <div key={it} style={{ display:'flex', gap:'0.4rem', marginBottom:'0.55rem' }}>
                <span style={{ color:l.color, flexShrink:0 }}>▸</span>
                <span style={{ color:'rgba(255,255,255,0.72)', fontSize:'0.83rem' }}>{it}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );

  if (s.type === 'legal') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.gold}>{s.eyebrow}</Tag>
      <H2>{s.title}</H2>
      <Card color={`${s.status.color}44`} style={{ marginBottom:'2rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
        <div style={{ fontSize:'1.5rem', flexShrink:0 }}>⚠️</div>
        <div><div style={{ fontWeight:800, color:s.status.color, marginBottom:4 }}>{s.status.label}</div><Dim style={{ fontSize:'0.88rem' }}>{s.status.text}</Dim></div>
      </Card>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
        <Card color={`${s.jurisdiction.color}33`}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>{s.jurisdiction.flag}</div>
          <div style={{ fontWeight:900, color:s.jurisdiction.color, fontSize:'1.2rem', marginBottom:4 }}>{s.jurisdiction.country}</div>
          <div style={{ fontWeight:700, color:'white', marginBottom:4, fontSize:'0.9rem' }}>{s.jurisdiction.law}</div>
          <div style={{ display:'inline-block', fontSize:'0.7rem', fontWeight:800, color:s.jurisdiction.color, background:`${s.jurisdiction.color}15`, border:`1px solid ${s.jurisdiction.color}33`, borderRadius:100, padding:'3px 12px', marginBottom:'0.75rem' }}>Objetivo: {s.jurisdiction.target}</div>
          <Dim style={{ fontSize:'0.83rem' }}>{s.jurisdiction.why}</Dim>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {s.pillars.map(p => (
            <Card key={p.title} style={{ display:'flex', gap:'0.85rem', alignItems:'flex-start' }}>
              <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{p.icon}</span>
              <div><div style={{ fontWeight:800, marginBottom:3, fontSize:'0.9rem' }}>{p.title}</div><Dim style={{ fontSize:'0.82rem' }}>{p.desc}</Dim></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (s.type === 'roadmap') return (
    <div style={{ width:'100%', maxWidth:1120 }}>
      <Tag color={C.purple}>{s.eyebrow}</Tag>
      <H2 style={{ marginBottom:'2.5rem' }}>{s.title}</H2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
        {s.phases.map(p => (
          <Card key={p.phase} color={`${p.color}33`} style={{ position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:p.color }} />
            <div style={{ color:p.color, fontWeight:900, fontSize:'0.72rem', letterSpacing:'2px', textTransform:'uppercase', marginBottom:4 }}>{p.phase}</div>
            <div style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'1.25rem' }}>{p.name}</div>
            {p.items.map(it => (
              <div key={it} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.6rem' }}>
                <span style={{ color:p.color, flexShrink:0 }}>✓</span>
                <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.85rem' }}>{it}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );

  if (s.type === 'cta') return (
    <div style={{ textAlign:'center', maxWidth:780, margin:'0 auto' }}>
      <Tag color={C.accent}>{s.eyebrow}</Tag>
      <H2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', marginBottom:'1rem' }}>{s.title}</H2>
      <Dim style={{ fontSize:'1rem', maxWidth:520, margin:'0 auto 3rem' }}>{s.subtitle}</Dim>
      <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'3.5rem' }}>
        {s.buttons.map(b => (
          <a key={b.label} href={b.url} target="_blank" rel="noopener noreferrer" style={{
            display:'inline-flex', alignItems:'center', gap:'0.6rem',
            background: b.primary ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : 'rgba(255,255,255,0.05)',
            border: b.primary ? 'none' : `1px solid ${C.border}`,
            borderRadius:14, padding:'1rem 2rem', color:'white', fontWeight:800, fontSize:'0.95rem',
            textDecoration:'none', cursor:'pointer',
            boxShadow: b.primary ? `0 8px 30px rgba(0,240,255,0.2)` : 'none',
          }}>
            <span>{b.icon}</span> {b.label}
          </a>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:'3rem', flexWrap:'wrap', borderTop:`1px solid ${C.border}`, paddingTop:'2rem' }}>
        {s.contacts.map(c => (
          <div key={c.label} style={{ textAlign:'left' }}>
            <div style={{ fontSize:'0.62rem', color:C.dim, textTransform:'uppercase', letterSpacing:'1px', marginBottom:4 }}>{c.label}</div>
            <div style={{ fontWeight:700, color:C.accent, fontSize:'0.88rem' }}>{c.val}</div>
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
    const fn = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onExit?.();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [next, prev, onExit]);

  return (
    <div style={{ position:'fixed', inset:0, background:C.bg, zIndex:9999, color:'white', display:'flex', flexDirection:'column', fontFamily:"'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900;950&display=swap');
        * { box-sizing: border-box; }
        a { transition: opacity 0.2s ease; } a:hover { opacity: 0.85; }
      `}</style>

      {/* Top bar */}
      <div style={{ padding:'1.25rem 2.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ fontWeight:900, fontSize:'1.3rem', letterSpacing:'-0.04em' }}>
          BE<span style={{ color:C.accent }}>4</span>T <span style={{ fontWeight:400, fontSize:'0.7rem', opacity:0.3, marginLeft:8 }}>PITCH DECK 2026</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ display:'flex', gap:'0.35rem' }}>
            {SLIDES.map((sl, i) => (
              <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? 22 : 7, height:7, borderRadius:100, border:'none', background: i === cur ? C.accent : 'rgba(255,255,255,0.15)', cursor:'pointer', transition:'all 0.3s ease', padding:0 }} />
            ))}
          </div>
          <button onClick={onExit} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:100, padding:'5px 16px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'0.7rem', fontWeight:700 }}>ESC</button>
        </div>
      </div>

      {/* Slide */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem 3rem', overflow:'hidden' }}>
        <div key={cur} style={{ animation:'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)', width:'100%', display:'flex', justifyContent:'center' }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
          {renderSlide(SLIDES[cur])}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'1rem 2.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
        <span style={{ fontSize:'0.75rem', color:C.dim, fontWeight:600 }}>{SLIDES[cur].label} · {cur+1} / {total}</span>
        <div style={{ display:'flex', gap:'0.6rem' }}>
          <button disabled={cur === 0} onClick={prev} style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, color:'white', cursor: cur === 0 ? 'not-allowed' : 'pointer', opacity: cur === 0 ? 0.25 : 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronLeft size={16} />
          </button>
          <button disabled={cur === total-1} onClick={next} style={{ width:40, height:40, borderRadius:'50%', background: cur === total-1 ? 'rgba(255,255,255,0.04)' : C.accent, border:'none', color: cur === total-1 ? 'white' : '#000', cursor: cur === total-1 ? 'not-allowed' : 'pointer', opacity: cur === total-1 ? 0.25 : 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
