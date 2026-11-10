import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

// Calcula tiempo restante hasta el 25 de diciembre más próximo
function getCountdown() {
  const now = new Date();
  let xmas = new Date(now.getFullYear(), 11, 25); // 25 dic
  if (now > xmas) xmas = new Date(now.getFullYear() + 1, 11, 25);
  const diff = xmas - now;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return { d, h, m, s };
}

// Número animado que cuenta hacia abajo
function CountUnit({ value, label }) {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplay(value);
        setFlipping(false);
        prev.current = value;
      }, 250);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden glass-card glow-gold"
        style={{ 
          background: 'linear-gradient(145deg, rgba(26,10,10,0.9), rgba(42,13,13,0.9))', 
          border: '2px solid rgba(241,183,46,0.6)',
          boxShadow: '0 0 20px rgba(241,183,46,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Línea divisoria tipo reloj flip */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/60 z-10" />
        {/* Número */}
        <div
          className="absolute inset-0 flex items-center justify-center font-serif font-black text-3xl sm:text-4xl text-gold-gradient"
          style={{
            transform: flipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
            transition: 'transform 0.25s ease',
            transformOrigin: 'center bottom',
          }}
        >
          {String(display).padStart(2, '0')}
        </div>
        {/* Brillo superior */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 pointer-events-none" />
      </div>
      <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}

// Copo decorativo que cae
function DecoFlake({ style }) {
  return (
    <div
      className="absolute text-white/20 select-none pointer-events-none animate-float"
      style={style}
    >
      ❄
    </div>
  );
}

export default function WelcomeScreen({ onEnter }) {
  const [countdown, setCountdown] = useState(getCountdown());
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Fade in al montar
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Ticker del countdown
  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    sound.playSparkle();
    setIsExiting(true);
    setTimeout(onEnter, 700);
  };

  // Copos decorativos fijos
  const flakes = [
    { fontSize: '2rem',  top: '10%', left: '5%',  animationDelay: '0s',   animationDuration: '4s'  },
    { fontSize: '1.2rem',top: '20%', left: '15%', animationDelay: '1s',   animationDuration: '5s'  },
    { fontSize: '2.5rem',top: '8%',  right: '8%', animationDelay: '0.5s', animationDuration: '4.5s'},
    { fontSize: '1rem',  top: '30%', right: '5%', animationDelay: '1.5s', animationDuration: '3.5s'},
    { fontSize: '1.8rem',top: '15%', left: '45%', animationDelay: '0.8s', animationDuration: '5.5s'},
    { fontSize: '1.3rem',bottom:'20%',left: '8%', animationDelay: '0.3s', animationDuration: '4.2s'},
    { fontSize: '2rem',  bottom:'15%',right:'10%',animationDelay: '1.2s', animationDuration: '3.8s'},
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 100% 100% at 50% 0%, #16382b 0%, #0a1a28 40%, #060d14 100%)',
        opacity: isExiting ? 0 : (showContent ? 1 : 0),
        transform: isExiting ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* Copos decorativos */}
      {flakes.map((f, i) => <DecoFlake key={i} style={f} />)}

      {/* Luces parpadeantes de fondo con glow */}
      <div className="ambient-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle"
            style={{
              width: `${3 + Math.random() * 4}px`,
              height: `${3 + Math.random() * 4}px`,
              background: ['#f1b72e','#c41e3a','#34d399','#60a5fa','#c084fc'][i % 5],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              filter: 'blur(1px)',
              boxShadow: `0 0 12px currentColor`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Árbol de navidad animado con glow */}
        <div
          className="text-7xl sm:text-8xl mb-4 select-none animate-float"
          style={{ filter: 'drop-shadow(0 0 30px rgba(52,211,153,0.7))' }}
        >
          🎄
        </div>

        {/* Badge mejorado */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-2 border-christmas-gold/60 text-yellow-300 text-xs font-bold uppercase tracking-widest mb-4 glow-gold">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          Aguinaldo Navideño Familiar 2026
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>

        {/* Título principal con glow pulsante */}
        <h1
          className="font-serif font-black text-gold-gradient text-glow-pulse mb-2 leading-tight"
          style={{ fontSize: 'clamp(2rem, 7vw, 4rem)' }}
        >
          Amigo Secreto
        </h1>
        <h2
          className="font-serif font-bold text-snow-white mb-6 leading-tight"
          style={{ fontSize: 'clamp(1rem, 3.5vw, 1.8rem)' }}
        >
          & Juegos Navideños 🎅
        </h2>

        <p className="text-slate-300 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
          Organiza el sorteo de tu familia, comparte el link por WhatsApp y que cada quien descubra su amigo secreto con una animación mágica 🎁
        </p>

        {/* Cuenta regresiva con glass effect */}
        <div className="mb-8">
          <p className="text-xs text-christmas-gold uppercase tracking-widest font-bold mb-3 flex items-center justify-center gap-2 text-glow-pulse">
            <span>⭐</span> Faltan para Navidad <span>⭐</span>
          </p>
          <div className="flex items-end gap-2 sm:gap-4 justify-center">
            <CountUnit value={countdown.d} label="Días" />
            <span className="text-christmas-gold text-3xl font-black mb-4 animate-pulse">:</span>
            <CountUnit value={countdown.h} label="Horas" />
            <span className="text-christmas-gold text-3xl font-black mb-4 animate-pulse">:</span>
            <CountUnit value={countdown.m} label="Min" />
            <span className="text-christmas-gold text-3xl font-black mb-4 animate-pulse">:</span>
            <CountUnit value={countdown.s} label="Seg" />
          </div>
        </div>

        {/* Botón de entrada mejorado */}
        <button
          onClick={handleEnter}
          className="group relative px-10 py-4 rounded-2xl font-black text-lg sm:text-xl text-slate-950 shadow-2xl transition-all transform hover:scale-110 active:scale-95 animate-pulse-glow glow-gold"
          style={{
            background: 'linear-gradient(135deg, #fff3b0, #f1b72e, #d4af37)',
            boxShadow: '0 0 40px rgba(241,183,46,0.6), 0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-2xl group-hover:rotate-12 transition-transform">🎁</span>
            Entrar a la Celebración
            <span className="text-2xl group-hover:-rotate-12 transition-transform">🎄</span>
          </span>
          {/* Shimmer */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }}
          />
        </button>

        {/* Tagline */}
        <p className="mt-5 text-[11px] text-slate-500 flex items-center gap-1.5">
          <span>🔒</span> Sorteo privado y seguro · Cada quien solo ve su resultado
        </p>
      </div>

      {/* Muñeco de nieve decorativo abajo */}
      <div
        className="absolute bottom-0 right-6 text-5xl sm:text-7xl select-none animate-float pointer-events-none"
        style={{ animationDelay: '1s', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      >
        ⛄
      </div>
      <div
        className="absolute bottom-0 left-6 text-5xl sm:text-7xl select-none animate-float pointer-events-none"
        style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      >
        🦌
      </div>
    </div>
  );
}
