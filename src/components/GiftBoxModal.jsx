import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { EyeOff, Heart, Calendar, DollarSign, Sparkles } from 'lucide-react';

const PHASE = { IDLE: 'idle', SPINNING: 'spinning', OPENING: 'opening', REVEALED: 'revealed' };

// ─── Efecto typewriter ────────────────────────────────────────
function useTypewriter(text, speed = 80, startDelay = 400) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(timer);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(timer);
    }, startDelay);
    return () => clearTimeout(delay);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ─── Partículas mágicas que salen de la caja ─────────────────
function MagicParticles() {
  return (
    <div className="magic-particles pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${25 + (i * 7) % 50}%`,
            top:  `${10 + (i * 11) % 50}%`,
            width:  `${6 + (i % 3) * 3}px`,
            height: `${6 + (i % 3) * 3}px`,
            background: ['#f1b72e','#c41e3a','#fff','#34d399','#c084fc'][i % 5],
            animationDelay: `${0.3 + (i % 4) * 0.15}s`,
            animationDuration: `${0.7 + (i % 3) * 0.3}s`,
            animationName: ['particleFly1','particleFly2','particleFly3','particleFly4','particleFly5'][i % 5],
            animationFillMode: 'forwards',
            borderRadius: i % 3 === 0 ? '2px' : '50%',
          }}
        />
      ))}
    </div>
  );
}

// ─── Caja 3D CSS ──────────────────────────────────────────────
function GiftBox3D({ phase, onClick }) {
  const isSpinning = phase === PHASE.SPINNING;
  const isOpening  = phase === PHASE.OPENING || phase === PHASE.REVEALED;
  const isIdle     = phase === PHASE.IDLE;

  return (
    <div className="gift-scene flex items-center justify-center" style={{ height: 200 }}>
      <div
        className={`gift-box-3d ${isSpinning ? 'spinning' : ''} ${isIdle ? 'wobble' : ''}`}
        style={{ cursor: isIdle ? 'pointer' : 'default' }}
        onClick={isIdle ? onClick : undefined}
      >
        <div className="gift-face gift-face-front">
          <span className="text-4xl select-none z-10 relative" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>🎁</span>
        </div>
        <div className="gift-face gift-face-back" />
        <div className="gift-face gift-face-right" />
        <div className="gift-face gift-face-left" />
        <div className="gift-face gift-face-top">
          <div className={`gift-lid ${isOpening ? 'lid-open' : ''}`}>
            {isOpening && <div className="gift-inner-glow" />}
          </div>
        </div>
        <div className="gift-face gift-face-bottom" />
        {isOpening && <MagicParticles />}
      </div>
    </div>
  );
}

// ─── Estrellas de fondo en el modal ──────────────────────────
function ModalStars() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-3xl sm:rounded-3xl">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: ['#f1b72e','#fff','#34d399','#c084fc'][i % 4],
            left: `${5 + (i * 6) % 90}%`,
            top: `${5 + (i * 11) % 85}%`,
            animationDelay: `${(i * 0.25) % 3}s`,
            animationDuration: `${1.5 + (i % 3) * 0.5}s`,
            opacity: 0.5,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 6px currentColor',
          }}
        />
      ))}
    </div>
  );
}

// ─── Rayos de luz desde el centro (salen en REVEALED) ────────
function LightRays() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center rounded-t-3xl sm:rounded-3xl">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute origin-bottom"
          style={{
            width: '2px',
            height: '60%',
            background: 'linear-gradient(to top, rgba(241,183,46,0.4), transparent)',
            transform: `rotate(${i * 45}deg) translateY(-50%)`,
            animation: `lightRay 2s ${i * 0.1}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function GiftBoxModal({ isOpen, onClose, secretData }) {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const timerRef = useRef(null);

  const { displayed: typedName, done: typingDone } = useTypewriter(
    phase === PHASE.REVEALED ? (secretData?.receiverName || '') : '',
    85,
    350
  );

  useEffect(() => {
    if (isOpen) setPhase(PHASE.IDLE);
    return () => clearTimeout(timerRef.current);
  }, [isOpen]);

  // Confeti extra cuando termina el typewriter
  useEffect(() => {
    if (typingDone && phase === PHASE.REVEALED) {
      try {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 }, gravity: 0.5, scalar: 0.9, colors: ['#f1b72e','#c41e3a','#fff','#34d399'] });
      } catch {}
    }
  }, [typingDone, phase]);

  if (!isOpen || !secretData) return null;

  const handleBoxClick = () => {
    if (phase !== PHASE.IDLE) return;
    sound.playJingleSnippet();
    setPhase(PHASE.SPINNING);
    timerRef.current = setTimeout(() => {
      setPhase(PHASE.OPENING);
      sound.playGiftOpen();
      try {
        confetti({ particleCount: 160, spread: 110, origin: { y: 0.5 }, colors: ['#c41e3a','#165b33','#f1b72e','#ffffff','#c084fc'] });
        setTimeout(() => {
          confetti({ particleCount: 80, angle: 60,  spread: 65, origin: { x: 0 } });
          confetti({ particleCount: 80, angle: 120, spread: 65, origin: { x: 1 } });
        }, 300);
      } catch {}
      timerRef.current = setTimeout(() => setPhase(PHASE.REVEALED), 1200);
    }, 2100);
  };

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setPhase(PHASE.IDLE);
    onClose();
  };

  return (
    /* Overlay full-screen, más oscuro para drama */
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn">

      {/* Resplandores de fondo globales */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 animate-pulse"
          style={{ background: 'radial-gradient(circle, #f1b72e 0%, #c41e3a 50%, transparent 70%)' }}
        />
      </div>

      {/* Panel — sube desde abajo en móvil, centrado en desktop */}
      <div className="relative w-full sm:max-w-md z-10">
        <div
          className="relative overflow-hidden rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-christmas-gold/60"
          style={{
            background: 'linear-gradient(170deg, #132820 0%, #0d1a14 50%, #140a12 100%)',
            boxShadow: '0 -20px 80px rgba(0,0,0,0.8), 0 0 60px rgba(241,183,46,0.1)',
          }}
        >
          <ModalStars />

          {/* Raya superior de colores */}
          <div className="h-1.5 w-full bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-red" />

          {/* Handle móvil */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all text-base font-bold touch-ripple"
          >✕</button>

          <div className="px-5 sm:px-8 pb-8 sm:pb-8 pt-3 sm:pt-5 text-center">

            {/* ══ FASE: IDLE ══════════════════════════════════ */}
            {phase === PHASE.IDLE && (
              <div className="animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-christmas-red/30 border border-christmas-red/50 text-red-200 text-[11px] font-bold uppercase tracking-wide mb-3">
                  <Sparkles className="w-3 h-3 text-christmas-gold animate-spin" />
                  Sorteo Confidencial
                </div>

                <h3 className="font-serif font-black text-gold-gradient mb-1" style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)' }}>
                  ¡Hola, {secretData.giverName}! 🎄
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Asegúrate de que nadie mire.
                  <br />
                  <strong className="text-white">Toca la caja para abrirla.</strong>
                </p>

                <GiftBox3D phase={phase} onClick={handleBoxClick} />

                <p className="text-xs text-christmas-gold animate-pulse mt-1 mb-4">
                  👆 Toca la caja o el botón
                </p>

                {/* Botón grande — fácil de tocar en móvil */}
                <button
                  onClick={handleBoxClick}
                  className="w-full py-4 rounded-2xl font-black text-lg text-slate-950 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 touch-ripple animate-pulse-glow"
                  style={{ background: 'linear-gradient(135deg, #fff3b0, #f1b72e, #d4af37)' }}
                >
                  🎁 Girar y abrir mi regalo
                </button>
              </div>
            )}

            {/* ══ FASE: SPINNING ══════════════════════════════ */}
            {phase === PHASE.SPINNING && (
              <div className="animate-fadeIn">
                <h3 className="font-serif font-black text-gold-gradient mb-2" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>
                  ✨ Mezclando la magia...
                </h3>
                <p className="text-slate-400 text-sm mb-4">La magia navideña está trabajando 🎅</p>

                <GiftBox3D phase={phase} onClick={null} />

                <div className="flex items-center justify-center gap-2 text-christmas-gold text-sm font-semibold mt-3">
                  <span className="animate-spin">✨</span>
                  Preparando tu sorpresa...
                  <span className="animate-spin" style={{ animationDirection: 'reverse' }}>⭐</span>
                </div>
              </div>
            )}

            {/* ══ FASE: OPENING ════════════════════════════════ */}
            {phase === PHASE.OPENING && (
              <div className="animate-fadeIn">
                <div className="text-5xl animate-bounce mb-2">🎉</div>
                <h3 className="font-serif font-black text-gold-gradient mb-3" style={{ fontSize: 'clamp(1.3rem, 5vw, 2rem)' }}>
                  ¡Abriendo tu regalo secreto!
                </h3>
                <GiftBox3D phase={phase} onClick={null} />
                <p className="text-christmas-gold font-semibold text-sm mt-3 animate-pulse">
                  ✨ ¡Preparando la revelación!
                </p>
              </div>
            )}

            {/* ══ FASE: REVEALED ═══════════════════════════════ */}
            {phase === PHASE.REVEALED && (
              <div className="animate-fadeIn">
                {/* Rayos de luz */}
                {typingDone && <LightRays />}

                <div className="text-4xl sm:text-5xl mb-3 animate-bounce relative z-10">🎉🎊🎉</div>

                <span className="relative z-10 text-[11px] uppercase tracking-widest text-emerald-400 font-black block mb-3">
                  Tu Amigo Secreto es...
                </span>

                {/* Nombre con typewriter — el momento más importante */}
                <div
                  className="relative z-10 w-full px-4 py-5 my-2 rounded-3xl border-2 border-christmas-gold animate-result"
                  style={{
                    background: 'linear-gradient(135deg, rgba(196,30,58,0.3) 0%, rgba(22,91,51,0.3) 50%, rgba(196,30,58,0.3) 100%)',
                    boxShadow: typingDone
                      ? '0 0 60px rgba(241,183,46,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : '0 0 30px rgba(241,183,46,0.2)',
                    transition: 'box-shadow 0.5s ease',
                  }}
                >
                  <h2
                    className={`font-serif font-extrabold text-gold-gradient tracking-wide ${typingDone ? 'name-glow' : 'typewriter-cursor'}`}
                    style={{ fontSize: 'clamp(1.8rem, 8vw, 3rem)', minHeight: '3.5rem', lineHeight: 1.2 }}
                  >
                    {typedName}
                  </h2>
                  {!typingDone && (
                    <p className="text-[11px] text-christmas-gold/60 mt-1 animate-pulse">✨ Revelando...</p>
                  )}
                </div>

                {/* Wishlist — aparece después del typewriter */}
                {typingDone && secretData.receiverWishlist && (
                  <div className="relative z-10 mt-3 text-left p-4 rounded-2xl bg-white/5 border border-white/10 animate-fadeIn">
                    <div className="flex items-center gap-2 text-christmas-gold font-bold text-xs mb-2">
                      <Heart className="w-3.5 h-3.5 fill-christmas-red text-christmas-red" />
                      Ideas de regalo:
                    </div>
                    <p className="text-slate-200 text-sm italic leading-relaxed">
                      {secretData.receiverWishlist}
                    </p>
                  </div>
                )}

                {/* Info del evento */}
                {typingDone && (secretData.budget || secretData.date) && (
                  <div className="relative z-10 grid grid-cols-2 gap-2 mt-3 animate-fadeIn">
                    {secretData.budget && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-christmas-gold shrink-0" />
                        <div>
                          <span className="text-slate-500 block text-[9px]">Presupuesto</span>
                          <span className="font-bold text-emerald-300 text-xs">{secretData.budget}</span>
                        </div>
                      </div>
                    )}
                    {secretData.date && (
                      <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-800/50 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-christmas-gold shrink-0" />
                        <div>
                          <span className="text-slate-500 block text-[9px]">Entrega</span>
                          <span className="font-bold text-red-200 text-xs">{secretData.date}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón cerrar — grande y táctil */}
                {typingDone && (
                  <button
                    onClick={handleClose}
                    className="relative z-10 mt-5 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 font-black text-white text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 touch-ripple animate-fadeIn"
                  >
                    <EyeOff className="w-5 h-5" /> ¡Listo! Ocultar 🤫
                  </button>
                )}

                <p className="relative z-10 text-[10px] text-slate-600 mt-3">
                  Vuelve cuando quieras e ingresa tu PIN para verlo de nuevo.
                </p>
              </div>
            )}

          </div>
          {/* Raya inferior */}
          <div className="h-1.5 w-full bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-red" />
        </div>
      </div>
    </div>
  );
}
