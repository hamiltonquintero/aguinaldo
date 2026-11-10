import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Gift, Sparkles, Heart, Calendar, DollarSign,
  MapPin, AlertCircle, ArrowLeft, Eye, EyeOff,
  ShieldCheck, RefreshCw, KeyRound, UserCheck, Delete,
} from 'lucide-react';
import { sound } from '../utils/sound';

// ─── Colores y avatares por índice ───────────────────────────
const MEMBER_THEMES = [
  { from: '#7c1d1d', to: '#1a0808', border: 'rgba(239,68,68,0.5)',  glow: 'rgba(239,68,68,0.2)',  avatar: '🎅' },
  { from: '#1a3a1a', to: '#0a160a', border: 'rgba(34,197,94,0.5)',  glow: 'rgba(34,197,94,0.2)',  avatar: '🤶' },
  { from: '#1a2f4a', to: '#0a1420', border: 'rgba(59,130,246,0.5)', glow: 'rgba(59,130,246,0.2)', avatar: '⛄' },
  { from: '#3a2a00', to: '#160f00', border: 'rgba(234,179,8,0.5)',  glow: 'rgba(234,179,8,0.2)',  avatar: '🦌' },
  { from: '#2d1a4a', to: '#12082a', border: 'rgba(168,85,247,0.5)', glow: 'rgba(168,85,247,0.2)', avatar: '🧝' },
  { from: '#1a2a3a', to: '#080f16', border: 'rgba(6,182,212,0.5)',  glow: 'rgba(6,182,212,0.2)',  avatar: '🎄' },
  { from: '#3a1a1a', to: '#160808', border: 'rgba(249,115,22,0.5)', glow: 'rgba(249,115,22,0.2)', avatar: '🎁' },
  { from: '#1a3a3a', to: '#081616', border: 'rgba(20,184,166,0.5)', glow: 'rgba(20,184,166,0.2)', avatar: '⭐' },
  { from: '#2a1a3a', to: '#100816', border: 'rgba(236,72,153,0.5)', glow: 'rgba(236,72,153,0.2)', avatar: '🔔' },
  { from: '#2a2a1a', to: '#101008', border: 'rgba(163,230,53,0.5)', glow: 'rgba(163,230,53,0.2)', avatar: '🕯️' },
  { from: '#3a1a2a', to: '#160810', border: 'rgba(244,63,94,0.5)',  glow: 'rgba(244,63,94,0.2)',  avatar: '🧦' },
  { from: '#1a1a3a', to: '#080816', border: 'rgba(99,102,241,0.5)', glow: 'rgba(99,102,241,0.2)', avatar: '🍪' },
];

// ─── Teclado numérico táctil ──────────────────────────────────
function NumPad({ value, onChange, maxLength = 6 }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const handleKey = useCallback((k) => {
    if (k === '⌫') {
      onChange(value.slice(0, -1));
    } else if (value.length < maxLength) {
      onChange(value + k);
    }
  }, [value, onChange, maxLength]);

  return (
    <div className="w-full">
      {/* Display de puntos */}
      <div className="flex items-center justify-center gap-3 mb-6 h-14">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className="transition-all duration-200"
            style={{
              width: i < value.length ? '18px' : '14px',
              height: i < value.length ? '18px' : '14px',
              borderRadius: '50%',
              background: i < value.length
                ? 'linear-gradient(135deg, #f1b72e, #d4af37)'
                : 'rgba(255,255,255,0.15)',
              boxShadow: i < value.length ? '0 0 12px rgba(241,183,46,0.6)' : 'none',
              transform: i < value.length ? 'scale(1)' : 'scale(0.8)',
            }}
          />
        ))}
      </div>

      {/* Grid de teclas */}
      <div className="grid grid-cols-3 gap-2.5">
        {keys.map((k, i) => (
          <button
            key={i}
            type="button"
            onClick={() => k && handleKey(k)}
            disabled={!k}
            className={`
              h-14 rounded-2xl font-bold text-xl transition-all duration-150 touch-ripple
              active:scale-90
              ${!k ? 'invisible' : k === '⌫'
                ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 active:bg-white/20'
                : 'bg-white/10 border border-white/15 text-white hover:bg-white/20 active:bg-white/30'
              }
            `}
            style={{
              boxShadow: k && k !== '⌫' ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {k === '⌫' ? <Delete className="w-5 h-5 mx-auto" /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Modal / Sheet desde abajo ────────────────────────────────
function BottomSheet({ children, onBack, title }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/95 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full sm:max-w-sm overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] text-slate-100"
        style={{
          background: 'linear-gradient(170deg, #0d2018 0%, #09140f 60%, #0f0810 100%)',
          border: '1.5px solid rgba(241,183,46,0.25)',
          borderBottom: 'none',
          boxShadow: '0 -20px 80px rgba(0,0,0,0.9), 0 0 40px rgba(241,183,46,0.05)',
        }}
      >
        {/* Barra de color arriba */}
        <div className="h-1 w-full bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-red" />

        {/* Handle móvil */}
        <div className="sm:hidden flex justify-center pt-3 pb-0">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Resplandores de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-christmas-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-christmas-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 pb-10 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Pantalla de reveal full-screen ──────────────────────────
function RevealScreen({ result, onClose }) {
  const [showContent, setShowContent] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Secuencia cinematográfica
    const t1 = setTimeout(() => setShowContent(true), 100);
    const t2 = setTimeout(() => setShowName(true), 800);
    const t3 = setTimeout(() => setShowDetails(true), 1800);
    const t4 = setTimeout(() => setShowButton(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 50%, #0d2018 0%, #060d14 50%, #0a0510 100%)' }}
    >
      {/* Estrellas de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="absolute animate-twinkle rounded-full"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: ['#f1b72e','#fff','#34d399','#c084fc','#60a5fa'][i % 5],
              left: `${(i * 4.1) % 96}%`,
              top: `${(i * 7.3) % 90}%`,
              animationDelay: `${(i * 0.18) % 3}s`,
              animationDuration: `${1.5 + (i % 4) * 0.4}s`,
              opacity: 0.5,
              filter: 'blur(0.3px)',
              boxShadow: '0 0 6px currentColor',
            }}
          />
        ))}
      </div>

      {/* Resplandor central pulsante */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="w-[400px] h-[400px] rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(241,183,46,0.08) 0%, rgba(196,30,58,0.05) 50%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm">

        {/* Fase 1: emojis festivos */}
        <div
          className="text-5xl sm:text-6xl mb-6 transition-all duration-700"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(20px)',
          }}
        >
          🎉🎊🎉
        </div>

        {/* Label */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 transition-all duration-700"
          style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 text-xs font-black uppercase tracking-widest">
            Tu Amigo Secreto es...
          </span>
        </div>

        {/* Fase 2: EL NOMBRE — lo más importante */}
        <div
          className="w-full mb-5 transition-all duration-1000"
          style={{
            opacity: showName ? 1 : 0,
            transform: showName ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(30px)',
          }}
        >
          <div
            className="relative px-6 py-8 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(196,30,58,0.25) 0%, rgba(22,91,51,0.25) 50%, rgba(196,30,58,0.25) 100%)',
              border: '2px solid rgba(241,183,46,0.6)',
              boxShadow: showName
                ? '0 0 60px rgba(241,183,46,0.3), 0 0 120px rgba(241,183,46,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                : 'none',
              transition: 'box-shadow 1s ease',
            }}
          >
            {/* Destellos en las esquinas */}
            <div className="absolute top-2 left-3 text-christmas-gold opacity-60 animate-twinkle text-sm">✦</div>
            <div className="absolute top-2 right-3 text-christmas-gold opacity-60 animate-twinkle text-sm" style={{ animationDelay: '0.5s' }}>✦</div>
            <div className="absolute bottom-2 left-3 text-christmas-gold opacity-60 animate-twinkle text-sm" style={{ animationDelay: '1s' }}>✦</div>
            <div className="absolute bottom-2 right-3 text-christmas-gold opacity-60 animate-twinkle text-sm" style={{ animationDelay: '1.5s' }}>✦</div>

            <h2
              className="font-serif font-black text-gold-gradient name-glow leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 11vw, 4rem)' }}
            >
              {result.matchName}
            </h2>
          </div>
        </div>

        {/* Fase 3: detalles */}
        <div
          className="w-full space-y-3 transition-all duration-700"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {result.matchWishlist && (
            <div
              className="text-left p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-3.5 h-3.5 fill-christmas-red text-christmas-red" />
                <span className="text-christmas-gold font-bold text-xs uppercase tracking-wider">Ideas de regalo</span>
              </div>
              <p className="text-slate-200 text-sm italic leading-relaxed">{result.matchWishlist}</p>
            </div>
          )}

          {(result.budget || result.date) && (
            <div className="grid grid-cols-2 gap-2">
              {result.budget && (
                <div className="p-3 rounded-2xl flex items-center gap-2"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Presupuesto</span>
                    <span className="font-bold text-emerald-300 text-xs">{result.budget}</span>
                  </div>
                </div>
              )}
              {result.date && (
                <div className="p-3 rounded-2xl flex items-center gap-2"
                  style={{ background: 'rgba(196,30,58,0.1)', border: '1px solid rgba(196,30,58,0.2)' }}
                >
                  <Calendar className="w-3.5 h-3.5 text-christmas-gold shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Entrega</span>
                    <span className="font-bold text-red-200 text-xs">{result.date}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fase 4: botón */}
        <div
          className="w-full mt-5 transition-all duration-700"
          style={{
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-white text-base shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 touch-ripple"
            style={{
              background: 'linear-gradient(135deg, #065f46, #047857)',
              border: '1px solid rgba(16,185,129,0.4)',
              boxShadow: '0 0 30px rgba(16,185,129,0.2), 0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <EyeOff className="w-5 h-5" />
            ¡Listo! Ocultar 🤫
          </button>
          <p className="text-[10px] text-slate-600 mt-3">
            Puedes volver cuando quieras con tu PIN para verlo de nuevo.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function GroupRevealView({
  groupEventData,
  pinFlowState,
  isLoadingGroup,
  onSelectMember,
  onClaimPin,
  onVerifyPin,
  onResetFlow,
}) {
  const { event, members = [] } = groupEventData || {};
  const { step, member, result, error, attemptsLeft, isLocked, isLoading } = pinFlowState || {};

  const [pin, setPin]           = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep]   = useState('first'); // 'first' | 'confirm'

  useEffect(() => {
    setPin('');
    setConfirmPin('');
    setPinStep('first');
  }, [step, member?.id]);

  // Confeti al revelar
  useEffect(() => {
    if (step === 'revealed') {
      sound.playGiftOpen();
      try {
        setTimeout(() => {
          confetti({ particleCount: 180, spread: 110, origin: { y: 0.4 }, colors: ['#c41e3a','#165b33','#f1b72e','#ffffff','#c084fc'] });
        }, 900);
        setTimeout(() => {
          confetti({ particleCount: 100, angle: 60, spread: 70, origin: { x: 0 }, colors: ['#f1b72e','#ff4d4d'] });
          confetti({ particleCount: 100, angle: 120, spread: 70, origin: { x: 1 }, colors: ['#165b33','#f1b72e'] });
        }, 1300);
      } catch {}
    }
  }, [step]);

  const handleClaimPin = useCallback(() => {
    if (pinStep === 'first') {
      if (pin.length < 4) return;
      setPinStep('confirm');
      return;
    }
    // step confirm
    onClaimPin(pin, confirmPin);
  }, [pinStep, pin, confirmPin, onClaimPin]);

  const handleVerifyPin = useCallback(() => {
    if (pin.length < 4) return;
    onVerifyPin(pin);
  }, [pin, onVerifyPin]);

  // ── Reveal full-screen ────────────────────────────────────
  if (step === 'revealed' && result) {
    return <RevealScreen result={result} onClose={onResetFlow} />;
  }

  return (
    <div className="max-w-lg mx-auto pb-8 px-1">

      {/* ══════════════════════════════════════════════════════
          HERO DEL EVENTO
          ══════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-3xl mb-5"
        style={{
          background: 'linear-gradient(160deg, #0f2d1f 0%, #0a1a12 35%, #1a0a14 100%)',
          border: '1.5px solid rgba(241,183,46,0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Resplandores decorativos */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(241,183,46,0.12) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,91,51,0.15) 0%, transparent 70%)' }}
        />

        {/* Estrellas decorativas */}
        {[
          { top:'12%', left:'8%', size:'text-xs', delay:'0s' },
          { top:'20%', right:'10%', size:'text-sm', delay:'0.5s' },
          { top:'8%', left:'40%', size:'text-xs', delay:'1s' },
          { bottom:'15%', left:'12%', size:'text-sm', delay:'0.3s' },
          { bottom:'20%', right:'8%', size:'text-xs', delay:'0.8s' },
        ].map((s, i) => (
          <div key={i} className={`absolute ${s.size} animate-twinkle pointer-events-none select-none`}
            style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, animationDelay: s.delay, color: 'rgba(241,183,46,0.5)' }}
          >✦</div>
        ))}

        <div className="relative z-10 px-6 pt-8 pb-7 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(241,183,46,0.1)', border: '1px solid rgba(241,183,46,0.3)' }}
          >
            <Sparkles className="w-3 h-3 text-christmas-gold animate-spin" />
            <span className="text-yellow-300 text-[11px] font-black uppercase tracking-widest">Aguinaldo Navideño</span>
            <Sparkles className="w-3 h-3 text-christmas-gold animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>

          {/* Árbol */}
          <div className="text-6xl sm:text-7xl mb-3 animate-float select-none"
            style={{ filter: 'drop-shadow(0 0 24px rgba(52,211,153,0.6))' }}
          >🎄</div>

          {/* Título */}
          <h1
            className="font-serif font-black text-gold-gradient leading-none mb-3"
            style={{ fontSize: 'clamp(1.7rem, 7vw, 3rem)' }}
          >
            {event?.title || 'Aguinaldo Navideño'}
          </h1>

          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-5 leading-relaxed">
            Toca tu nombre, crea tu PIN y descubre quién es tu
            <strong className="text-white"> amigo secreto</strong> 🎁
          </p>

          {/* Chips de info */}
          {(event?.date || event?.budget || event?.location) && (
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {event?.date && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Calendar className="w-3 h-3 text-christmas-gold" />
                  <span className="text-slate-300">{event.date}{event.time ? ` · ${event.time}` : ''}</span>
                </span>
              )}
              {event?.budget && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <strong className="text-emerald-300">{event.budget}</strong>
                </span>
              )}
              {event?.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span className="text-slate-300">{event.location}</span>
                </span>
              )}
            </div>
          )}
          {event?.rules && (
            <p className="mt-3 text-xs text-slate-400 italic px-3 py-2 rounded-xl inline-block"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              ✨ {event.rules}
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          INSTRUCCIÓN
          ══════════════════════════════════════════════════════ */}
      <div className="text-center mb-4 px-2">
        <h2 className="font-serif font-black text-white mb-1"
          style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)' }}
        >
          👇 ¿Cuál es tu nombre?
        </h2>
        <p className="text-xs text-slate-500">
          Toca solo el tuyo — nadie más verá tu resultado
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          GRID DE PARTICIPANTES
          ══════════════════════════════════════════════════════ */}
      {isLoadingGroup ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="text-5xl animate-bounce">🎄</div>
          <p className="text-sm text-christmas-gold animate-pulse font-semibold">Cargando participantes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {members.map((m, idx) => {
            const theme = MEMBER_THEMES[idx % MEMBER_THEMES.length];
            const isLocked = m.isLocked;
            const hasClaimed = m.isClaimed;

            return (
              <button
                key={m.id}
                onClick={() => !isLocked && onSelectMember(m)}
                disabled={isLocked}
                className="relative group flex flex-col items-center gap-2.5 py-5 px-3 rounded-3xl text-center transition-all duration-300 touch-ripple active:scale-95 disabled:cursor-not-allowed stagger-in"
                style={{
                  background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.to} 100%)`,
                  border: `1.5px solid ${isLocked ? 'rgba(239,68,68,0.3)' : hasClaimed ? 'rgba(241,183,46,0.5)' : theme.border}`,
                  boxShadow: isLocked ? 'none' : `0 4px 20px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  animationDelay: `${idx * 0.06}s`,
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                {/* Brillo hover */}
                {!isLocked && (
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 30%, ${theme.glow} 0%, transparent 70%)` }}
                  />
                )}

                {/* Avatar */}
                <div
                  className="text-4xl transition-all duration-300 select-none"
                  style={{ filter: isLocked ? 'grayscale(1)' : `drop-shadow(0 0 10px ${theme.glow})` }}
                >
                  {isLocked ? '🔒' : theme.avatar}
                </div>

                {/* Nombre */}
                <h4 className="font-black text-sm text-white leading-tight px-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  {m.name}
                </h4>

                {/* Badge */}
                {hasClaimed && !isLocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                    style={{ background: 'rgba(241,183,46,0.2)', border: '1px solid rgba(241,183,46,0.5)', color: '#fde68a' }}
                  >🔑 PIN listo</span>
                )}
                {!hasClaimed && !isLocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
                  >✨ Entrar</span>
                )}
                {isLocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                  >Bloqueado</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Privacidad */}
      <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-slate-600">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
        Sistema privado — solo tú ves tu resultado
      </div>


      {/* ══════════════════════════════════════════════════════
          MODAL: CREAR PIN (primera vez) — con teclado numérico
          ══════════════════════════════════════════════════════ */}
      {step === 'create' && member && (
        <BottomSheet onBack={onResetFlow}>
          {/* Cabecera */}
          <div className="flex items-center gap-3 mb-5">
            <div className="text-4xl" style={{ filter: `drop-shadow(0 0 10px ${MEMBER_THEMES[members.findIndex(m=>m.id===member.id) % MEMBER_THEMES.length].glow})` }}>
              {MEMBER_THEMES[members.findIndex(m=>m.id===member.id) % MEMBER_THEMES.length].avatar}
            </div>
            <div className="text-left">
              <p className="text-xs text-christmas-gold font-black uppercase tracking-widest">
                {pinStep === 'first' ? '✨ Primera vez' : '🔄 Confirma tu PIN'}
              </p>
              <h3 className="font-serif font-black text-white text-xl leading-tight">
                {pinStep === 'first' ? `¡Hola, ${member.name}!` : '¿Todo igual?'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-5 text-center">
            {pinStep === 'first'
              ? <>Elige un <strong className="text-white">PIN de 4 a 6 dígitos</strong>. Solo tú lo sabrás. 🔒</>
              : <>Ingresa el mismo PIN de nuevo para confirmar.</>
            }
          </p>

          {/* Teclado numérico */}
          <NumPad
            value={pinStep === 'first' ? pin : confirmPin}
            onChange={pinStep === 'first' ? setPin : setConfirmPin}
            maxLength={6}
          />

          {/* Error de no coincidencia */}
          {pinStep === 'confirm' && confirmPin.length >= pin.length && confirmPin !== pin && (
            <p className="mt-3 text-xs text-red-400 bg-red-950/50 p-2.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Los PINs no coinciden. Vuelve a intentarlo.
            </p>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-400 bg-red-950/50 p-2.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={() => { if (pinStep === 'confirm') { setPinStep('first'); setConfirmPin(''); } else { onResetFlow(); } }}
              className="px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 text-sm font-semibold transition-colors flex items-center gap-1 touch-ripple"
            >
              <ArrowLeft className="w-4 h-4" />
              {pinStep === 'first' ? 'Volver' : 'Atrás'}
            </button>
            <button
              type="button"
              onClick={handleClaimPin}
              disabled={
                isLoading ||
                (pinStep === 'first' && pin.length < 4) ||
                (pinStep === 'confirm' && (confirmPin.length < 4 || confirmPin !== pin))
              }
              className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 touch-ripple disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #f1b72e, #d4af37)', color: '#0a0f06' }}
            >
              {isLoading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creando...</>
                : pinStep === 'first'
                  ? <><KeyRound className="w-4 h-4" /> Continuar →</>
                  : <><Gift className="w-4 h-4" /> ¡Abrir mi regalo! 🎁</>
              }
            </button>
          </div>
        </BottomSheet>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL: INGRESAR PIN (visitas siguientes)
          ══════════════════════════════════════════════════════ */}
      {step === 'enter' && member && (
        <BottomSheet onBack={onResetFlow}>
          <div className="flex items-center gap-3 mb-5">
            <div className="text-4xl">
              {MEMBER_THEMES[members.findIndex(m=>m.id===member.id) % MEMBER_THEMES.length].avatar}
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Tu PIN secreto</p>
              <h3 className="font-serif font-black text-white text-xl leading-tight">{member.name}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-5 text-center">
            Ingresa tu <strong className="text-white">PIN</strong> para ver tu amigo secreto 🎁
          </p>

          <NumPad value={pin} onChange={setPin} maxLength={6} />

          {error && (
            <div className="mt-3 text-xs text-red-400 bg-red-950/50 p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div>
                {error}
                {attemptsLeft > 0 && !isLocked && (
                  <span className="block mt-0.5 font-black text-orange-400">{attemptsLeft} intento{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-600 text-center mt-3">
            ¿Olvidaste tu PIN? Pídele al organizador que lo resetee.
          </p>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onResetFlow}
              className="px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 text-sm font-semibold flex items-center gap-1 touch-ripple"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <button
              type="button"
              onClick={handleVerifyPin}
              disabled={pin.length < 4 || isLoading}
              className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 touch-ripple disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #c41e3a, #991b1b)' }}
            >
              {isLoading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verificando...</>
                : <><Gift className="w-4 h-4" /> Ver mi regalo 🎁</>
              }
            </button>
          </div>
        </BottomSheet>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL: BLOQUEADO
          ══════════════════════════════════════════════════════ */}
      {step === 'locked' && member && (
        <BottomSheet onBack={onResetFlow}>
          <div className="text-center py-2">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="font-serif text-xl font-black text-red-400 mb-2">Cuenta bloqueada</h3>
            <p className="text-sm text-slate-300 mb-2 leading-relaxed">
              {error || 'Demasiados intentos fallidos.'}
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Espera unos minutos o pídele al organizador que te desbloquee.
            </p>
            <button
              onClick={onResetFlow}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 touch-ripple transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la lista
            </button>
          </div>
        </BottomSheet>
      )}

    </div>
  );
}
