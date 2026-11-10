import React, { useMemo } from 'react';

// ─── Copos de nieve cayendo ───────────────────────────────────
function Snowflakes({ count = 18 }) {
  const flakes = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left:     `${(i * 5.5 + 2) % 98}%`,
    size:     8 + (i % 5) * 4,
    duration: 8 + (i % 7) * 2,
    delay:    (i * 0.7) % 9,
    opacity:  0.15 + (i % 4) * 0.08,
    symbol:   ['❄', '❅', '❆', '·', '✦'][i % 5],
  })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {flakes.map(f => (
        <div
          key={f.id}
          className="absolute animate-snowfall select-none"
          style={{
            left:           f.left,
            top:            '-24px',
            fontSize:       `${f.size}px`,
            color:          'rgba(255,255,255,0.7)',
            animationDuration:  `${f.duration}s`,
            animationDelay:     `${f.delay}s`,
            opacity:        f.opacity,
            filter:         'blur(0.3px)',
          }}
        >
          {f.symbol}
        </div>
      ))}
    </div>
  );
}

// ─── Partículas doradas que suben ────────────────────────────
function GoldenParticles({ count = 14 }) {
  const particles = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left:     `${(i * 7.1 + 3) % 94}%`,
    bottom:   `${(i * 11) % 60}%`,
    size:     3 + (i % 3) * 2,
    duration: 4 + (i % 5) * 1.5,
    delay:    (i * 0.5) % 6,
    color:    ['#f1b72e','#fde68a','#fbbf24','#fff','#34d399'][i % 5],
    shape:    i % 3 === 0 ? '2px' : '50%',
  })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-golden-rise"
          style={{
            left:               p.left,
            bottom:             p.bottom,
            width:              `${p.size}px`,
            height:             `${p.size}px`,
            borderRadius:       p.shape,
            background:         p.color,
            boxShadow:          `0 0 ${p.size * 2}px ${p.color}`,
            animationDuration:  `${p.duration}s`,
            animationDelay:     `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Orbes de luz pulsantes ───────────────────────────────────
function LightOrbs() {
  const orbs = [
    { w: 300, h: 300, top: '10%',  left: '20%',  color: 'rgba(241,183,46,0.08)',  dur: 12, delay: 0   },
    { w: 250, h: 250, top: '50%',  right: '10%', color: 'rgba(196,30,58,0.08)',   dur: 15, delay: 3   },
    { w: 200, h: 200, bottom:'5%', left: '30%',  color: 'rgba(22,91,51,0.10)',    dur: 10, delay: 6   },
    { w: 180, h: 180, top: '30%',  left: '5%',   color: 'rgba(192,132,252,0.06)', dur: 18, delay: 2   },
    { w: 220, h: 220, top: '20%',  right: '25%', color: 'rgba(96,165,250,0.06)',  dur: 14, delay: 7   },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-orb-float"
          style={{
            width:              `${o.w}px`,
            height:             `${o.h}px`,
            top:                o.top,
            left:               o.left,
            right:              o.right,
            bottom:             o.bottom,
            background:         `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter:             'blur(30px)',
            animationDuration:  `${o.dur}s`,
            animationDelay:     `${o.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Estrellas que parpadean con glow ─────────────────────────
function GlowStars({ count = 20 }) {
  const stars = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left:     `${(i * 4.9 + 1) % 97}%`,
    top:      `${(i * 7.3 + 2) % 92}%`,
    size:     2 + (i % 3),
    dur:      1.5 + (i % 4) * 0.5,
    delay:    (i * 0.3) % 4,
    color:    ['#f1b72e','#fff','#34d399','#c084fc','#60a5fa','#fb7185'][i % 6],
  })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left:               s.left,
            top:                s.top,
            width:              `${s.size}px`,
            height:             `${s.size}px`,
            background:         s.color,
            boxShadow:          `0 0 ${s.size * 3}px ${s.color}, 0 0 ${s.size * 6}px ${s.color}44`,
            animationDuration:  `${s.dur}s`,
            animationDelay:     `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Estrellas fugaces ────────────────────────────────────────
function ShootingStars() {
  const shots = [
    { top: '15%', left: '10%', delay: 4,  dur: 1.5, rot: '25deg'  },
    { top: '30%', left: '50%', delay: 11, dur: 1.2, rot: '30deg'  },
    { top: '8%',  left: '70%', delay: 18, dur: 1.8, rot: '20deg'  },
    { top: '45%', left: '5%',  delay: 7,  dur: 1.3, rot: '35deg'  },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shots.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top:   s.top,
            left:  s.left,
            width: '80px',
            height: '1.5px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), transparent)',
            borderRadius: '2px',
            transform: `rotate(${s.rot})`,
            transformOrigin: 'left center',
            animation: `shootingStarDiag ${s.dur}s ${s.delay}s ease-out infinite`,
            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Elementos navideños flotantes ────────────────────────────
function FloatingElements() {
  const elements = [
    { symbol: '🔔', size: '1.4rem', top: '8%',   left: '6%',   dur: 3,   delay: 0,   swing: true  },
    { symbol: '⭐',  size: '1rem',  top: '12%',  right: '8%',  dur: 4,   delay: 1,   swing: false },
    { symbol: '🎀',  size: '1.2rem',top: '25%',  left: '3%',   dur: 3.5, delay: 2,   swing: false },
    { symbol: '❄️',  size: '1.3rem',top: '18%',  right: '4%',  dur: 5,   delay: 0.5, swing: false },
    { symbol: '🌟',  size: '0.9rem',bottom:'30%',left: '4%',   dur: 4.5, delay: 1.5, swing: false },
    { symbol: '🎶',  size: '1.1rem',bottom:'25%',right: '5%',  dur: 3.8, delay: 0.8, swing: false },
    { symbol: '✨',  size: '1rem',  top: '40%',  left: '2%',   dur: 4.2, delay: 2.5, swing: false },
    { symbol: '🕯️', size: '1.2rem',top: '55%',  right: '3%',  dur: 3.2, delay: 1.2, swing: false },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((el, i) => (
        <div
          key={i}
          className="absolute select-none"
          style={{
            top:        el.top,
            left:       el.left,
            right:      el.right,
            bottom:     el.bottom,
            fontSize:   el.size,
            opacity:    0.35,
            animation:  el.swing
              ? `bellSwing ${el.dur}s ${el.delay}s ease-in-out infinite`
              : `float ${el.dur}s ${el.delay}s ease-in-out infinite`,
            filter:     'drop-shadow(0 0 6px rgba(241,183,46,0.4))',
          }}
        >
          {el.symbol}
        </div>
      ))}
    </div>
  );
}

// ─── Barrido de luz (sheen) sobre un panel ────────────────────
export function PanelSheen() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none"
      style={{ zIndex: 2 }}
    >
      <div
        className="absolute top-0 bottom-0 w-1/3"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          animation: 'panelSheen 6s 1s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// ─── Aureola expansiva (efecto reveal) ───────────────────────
export function RevealHalo({ color = 'rgba(241,183,46,0.3)' }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[0, 0.4, 0.8].map((delay, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '200px',
            height: '200px',
            border: `1.5px solid ${color}`,
            animation: `haloExpand 2.4s ${delay}s ease-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL — se usa como fondo ─────────────────
export default function FestiveBackground({
  snow = true,
  particles = true,
  orbs = true,
  stars = true,
  shooting = true,
  floating = true,
  intensity = 'normal', // 'subtle' | 'normal' | 'epic'
}) {
  const counts = {
    subtle: { snow: 8,  particles: 6,  stars: 10 },
    normal: { snow: 16, particles: 12, stars: 20 },
    epic:   { snow: 28, particles: 20, stars: 32 },
  }[intensity] || { snow: 16, particles: 12, stars: 20 };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {orbs     && <LightOrbs />}
      {stars    && <GlowStars count={counts.stars} />}
      {snow     && <Snowflakes count={counts.snow} />}
      {particles && <GoldenParticles count={counts.particles} />}
      {shooting && <ShootingStars />}
      {floating && <FloatingElements />}
    </div>
  );
}
