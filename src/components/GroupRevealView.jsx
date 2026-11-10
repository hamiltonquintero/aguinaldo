import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Gift, Lock, Sparkles, Heart, Calendar, DollarSign,
  MapPin, AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck,
  RefreshCw, KeyRound, UserCheck,
} from 'lucide-react';
import { sound } from '../utils/sound';

// ─── Avatares navideños por índice ───────────────────────────
const AVATARS = ['🎅', '🤶', '🦌', '⛄', '🎄', '🧝', '🎁', '⭐', '🔔', '🕯️', '🧦', '🍪'];

// ─── Grid de miembros — mobile first, cards táctiles ─────────
function MemberGrid({ members, onSelect, loadingGroup }) {
  if (loadingGroup) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
        <div className="text-5xl animate-bounce">🎄</div>
        <p className="text-sm font-semibold text-christmas-gold animate-pulse">Cargando participantes...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {members.map((member, idx) => {
        const avatar = AVATARS[idx % AVATARS.length];
        const isLocked = member.isLocked;
        const hasClaimed = member.isClaimed;

        return (
          <button
            key={member.id}
            onClick={() => !isLocked && onSelect(member)}
            disabled={isLocked}
            className={`
              relative group flex flex-col items-center gap-2 p-4 rounded-3xl text-center
              border-2 transition-all duration-300 touch-ripple
              active:scale-95 disabled:cursor-not-allowed
              ${isLocked
                ? 'bg-red-950/30 border-red-900/50 opacity-60'
                : hasClaimed
                  ? 'bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 border-christmas-gold/60 shadow-[0_0_20px_rgba(241,183,46,0.15)] hover:shadow-[0_0_30px_rgba(241,183,46,0.3)] hover:-translate-y-1'
                  : 'bg-gradient-to-b from-[#132d23] to-[#0c1a16] border-emerald-800/50 hover:border-christmas-gold/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
              }
            `}
          >
            {/* Avatar grande */}
            <div className={`
              text-4xl sm:text-5xl transition-transform duration-300
              ${!isLocked ? 'group-hover:scale-110 group-hover:rotate-6' : ''}
            `}>
              {isLocked ? '🔒' : avatar}
            </div>

            {/* Nombre */}
            <h4 className={`font-bold text-sm sm:text-base leading-tight ${
              isLocked ? 'text-red-300' : 'text-slate-100'
            }`}>
              {member.name}
            </h4>

            {/* Badge de estado */}
            {hasClaimed && !isLocked && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/50 text-emerald-200 font-semibold">
                🔑 PIN listo
              </span>
            )}
            {!hasClaimed && !isLocked && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-christmas-gold/20 border border-christmas-gold/40 text-yellow-300 font-semibold">
                ✨ Primera vez
              </span>
            )}
            {isLocked && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/60 border border-red-700/50 text-red-300 font-semibold">
                🔐 Bloqueado
              </span>
            )}

            {/* Brillo en hover */}
            {!isLocked && (
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(241,183,46,0.05) 0%, transparent 100%)' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Input de PIN con puntos visuales ────────────────────────
function PinInput({ value, onChange, placeholder = '••••••', maxLength = 6, autoFocus = true }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        inputMode="numeric"
        maxLength={maxLength}
        autoFocus={autoFocus}
        required
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        placeholder={placeholder}
        className="w-full text-center text-3xl sm:text-4xl tracking-[0.5em] font-mono py-4 px-10 rounded-2xl bg-black/60 border-2 border-emerald-700/80 focus:border-christmas-gold focus:outline-none focus:shadow-[0_0_20px_rgba(241,183,46,0.3)] text-white placeholder-slate-700 transition-all"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 touch-ripple"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

// ─── Modal de fondo para los pasos de PIN ────────────────────
function PinModal({ children, onBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-lg animate-fadeIn">
      {/* Sheet en móvil (sube desde abajo), centrado en desktop */}
      <div className="relative w-full sm:max-w-sm bg-gradient-to-b from-[#0f2a20] via-[#0c1e17] to-[#0a1612] border-t-2 sm:border-2 border-christmas-gold/50 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 pb-10 sm:pb-6 text-center text-slate-100 overflow-hidden">
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-red rounded-t-3xl" />

        {/* Glows de fondo */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-christmas-red/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-christmas-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Handle de drag en móvil */}
        <div className="sm:hidden w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="relative z-10">{children}</div>
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

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    setPin('');
    setConfirmPin('');
  }, [step, member?.id]);

  // Confeti al revelar
  useEffect(() => {
    if (step === 'revealed') {
      sound.playGiftOpen();
      try {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#c41e3a', '#165b33', '#f1b72e', '#ffffff', '#c084fc'] });
        setTimeout(() => {
          confetti({ particleCount: 80, angle: 60, spread: 65, origin: { x: 0 }, colors: ['#f1b72e', '#ff4d4d'] });
          confetti({ particleCount: 80, angle: 120, spread: 65, origin: { x: 1 }, colors: ['#165b33', '#f1b72e'] });
        }, 350);
      } catch {}
    }
  }, [step]);

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) return;
    onClaimPin(pin, confirmPin);
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) return;
    onVerifyPin(pin);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-2 px-1">

      {/* ══════════════════════════════════════════════════════
          BANNER DEL EVENTO — atractivo y festivo
          ══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl text-center"
        style={{
          background: 'linear-gradient(160deg, #1b4030 0%, #0d2018 40%, #2a0d14 100%)',
          border: '2px solid rgba(241,183,46,0.35)',
          boxShadow: '0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Resplandores de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-christmas-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-christmas-red/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-christmas-gold/20 border border-christmas-gold/40 text-yellow-300 text-[11px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3 animate-spin" />
            Sorteo de Aguinaldo Navideño
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>

          {/* Emoji principal */}
          <div className="text-5xl sm:text-6xl mb-3 animate-float" style={{ filter: 'drop-shadow(0 0 20px rgba(241,183,46,0.5))' }}>
            🎄
          </div>

          {/* Título del evento */}
          <h1 className="font-serif font-black text-gold-gradient leading-tight mb-2"
            style={{ fontSize: 'clamp(1.6rem, 6vw, 2.8rem)' }}
          >
            {event?.title || 'Aguinaldo Navideño'}
          </h1>

          <p className="text-slate-300 text-sm max-w-sm mx-auto mb-4 leading-relaxed">
            Busca <strong className="text-white">tu nombre</strong>, crea tu PIN secreto y descubre quién es tu amigo secreto. ✨
          </p>

          {/* Info del evento en pills */}
          {(event?.date || event?.budget || event?.location) && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs mb-3">
              {event?.date && (
                <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3 h-3 text-christmas-gold" />
                  {event.date} {event.time}
                </span>
              )}
              {event?.budget && (
                <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5 text-slate-300">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <strong className="text-emerald-300">{event.budget}</strong>
                </span>
              )}
              {event?.location && (
                <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3 h-3 text-christmas-red-light" />
                  {event.location}
                </span>
              )}
            </div>
          )}
          {event?.rules && (
            <p className="text-xs text-slate-400 italic px-4 py-2 rounded-xl bg-black/30 border border-white/5 inline-block">
              ✨ {event.rules}
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          INSTRUCCIÓN GRANDE Y CLARA
          ══════════════════════════════════════════════════════ */}
      <div className="text-center px-2">
        <h2 className="font-serif font-black text-white mb-1"
          style={{ fontSize: 'clamp(1.3rem, 5vw, 2rem)' }}
        >
          👇 ¿Cuál es tu nombre?
        </h2>
        <p className="text-slate-400 text-sm">
          Toca <strong className="text-christmas-gold">solo tu nombre</strong> — nadie más puede ver tu resultado
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          GRID DE PARTICIPANTES
          ══════════════════════════════════════════════════════ */}
      <MemberGrid
        members={members}
        onSelect={onSelectMember}
        loadingGroup={isLoadingGroup}
      />

      {/* Aviso de privacidad — pequeño, abajo del grid */}
      <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Sistema privado — solo tú ves tu resultado
      </div>


      {/* ══════════════════════════════════════════════════════
          MODALES DE FLUJO PIN
          ══════════════════════════════════════════════════════ */}

      {/* ── Primera vez: crear PIN ─────────────────────────── */}
      {step === 'create' && member && (
        <PinModal onBack={onResetFlow}>
          {/* Avatar del miembro */}
          <div className="text-5xl mb-1 animate-bounce">
            {AVATARS[(members.findIndex(m => m.id === member.id)) % AVATARS.length] || '🎁'}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-christmas-gold/20 border border-christmas-gold/40 text-yellow-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            ✨ Primera vez
          </div>

          <h3 className="font-serif text-2xl font-black text-gold-gradient mb-1">
            ¡Hola, {member.name}!
          </h3>
          <p className="text-sm text-slate-300 mb-1 leading-relaxed">
            Crea tu <strong className="text-white">PIN secreto</strong> de 4 a 6 dígitos.
          </p>
          <p className="text-xs text-amber-300 font-semibold mb-5">
            🔒 Solo tú lo sabrás — ¡guárdalo bien!
          </p>

          <form onSubmit={handleClaimSubmit} className="space-y-3 text-left">
            <div>
              <label className="text-xs text-christmas-gold font-bold mb-1.5 block flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Tu PIN secreto:
              </label>
              <PinInput value={pin} onChange={setPin} placeholder="····" />
            </div>
            <div>
              <label className="text-xs text-christmas-gold font-bold mb-1.5 block flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Confirma tu PIN:
              </label>
              <PinInput value={confirmPin} onChange={setConfirmPin} placeholder="····" autoFocus={false} />
            </div>

            {pin.length >= 4 && confirmPin.length >= 4 && pin !== confirmPin && (
              <p className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Los PINs no coinciden.
              </p>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-xl flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onResetFlow}
                className="px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 text-sm font-semibold transition-colors flex items-center gap-1 touch-ripple"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
              <button
                type="submit"
                disabled={pin.length < 4 || pin !== confirmPin || isLoading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-christmas-gold via-yellow-500 to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 touch-ripple"
              >
                {isLoading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creando...</>
                  : <><Gift className="w-4 h-4" /> Crear PIN y abrir 🎁</>
                }
              </button>
            </div>
          </form>
        </PinModal>
      )}

      {/* ── Visitas siguientes: ingresar PIN ──────────────── */}
      {step === 'enter' && member && (
        <PinModal onBack={onResetFlow}>
          <div className="text-5xl mb-1 animate-bounce">
            {AVATARS[(members.findIndex(m => m.id === member.id)) % AVATARS.length] || '🔒'}
          </div>

          <h3 className="font-serif text-2xl font-black text-gold-gradient mb-1">
            {member.name}
          </h3>
          <p className="text-sm text-slate-300 mb-5">
            Ingresa tu <strong className="text-white">PIN secreto</strong> para ver tu regalo 🎁
          </p>

          <form onSubmit={handleVerifySubmit} className="space-y-3 text-left">
            <PinInput value={pin} onChange={setPin} placeholder="····" />

            {error && (
              <div className="text-xs text-red-400 bg-red-950/60 p-3 rounded-xl flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  {error}
                  {attemptsLeft !== undefined && attemptsLeft > 0 && !isLocked && (
                    <span className="block mt-0.5 font-bold text-orange-400">
                      {attemptsLeft} intentos restantes
                    </span>
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 text-center">
              ¿Olvidaste tu PIN? Pídele al organizador que lo resetee.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onResetFlow}
                className="px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 text-sm font-semibold transition-colors flex items-center gap-1 touch-ripple"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
              <button
                type="submit"
                disabled={pin.length < 4 || isLoading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-christmas-red to-red-700 hover:from-red-500 hover:to-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 touch-ripple"
              >
                {isLoading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verificando...</>
                  : <><Gift className="w-4 h-4" /> Ver mi regalo 🎁</>
                }
              </button>
            </div>
          </form>
        </PinModal>
      )}

      {/* ── Cuenta bloqueada ──────────────────────────────── */}
      {step === 'locked' && member && (
        <PinModal onBack={onResetFlow}>
          <div className="text-6xl mb-3">🔐</div>
          <h3 className="font-serif text-xl font-black text-red-400 mb-2">
            Cuenta bloqueada
          </h3>
          <p className="text-sm text-slate-300 mb-2 leading-relaxed">
            {error || 'Demasiados intentos fallidos.'}
          </p>
          <p className="text-xs text-slate-500 mb-5">
            Espera unos minutos o contacta al organizador del sorteo para que lo desbloquee.
          </p>
          <button
            onClick={onResetFlow}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 touch-ripple"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la lista
          </button>
        </PinModal>
      )}

      {/* ── REVEAL — experiencia cinematográfica ──────────── */}
      {step === 'revealed' && result && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn overflow-hidden">

          {/* Partículas de fondo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="absolute animate-twinkle rounded-full"
                style={{
                  width: `${3 + (i % 3)}px`,
                  height: `${3 + (i % 3)}px`,
                  background: ['#f1b72e','#c41e3a','#fff','#34d399'][i % 4],
                  left: `${5 + (i * 6) % 92}%`,
                  top: `${5 + (i * 11) % 85}%`,
                  animationDelay: `${(i * 0.2) % 2}s`,
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 8px currentColor',
                }}
              />
            ))}
          </div>

          {/* Resplandores centrales */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 animate-pulse"
              style={{ background: 'radial-gradient(circle, #f1b72e 0%, #c41e3a 40%, transparent 70%)' }}
            />
          </div>

          {/* Contenido del reveal */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
            {/* Emojis festivos */}
            <div className="text-5xl mb-4 animate-bounce">🎉</div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
              <UserCheck className="w-3.5 h-3.5" />
              Tu Amigo Secreto es...
            </div>

            {/* El nombre — tarjeta principal */}
            <div
              className="w-full px-6 py-6 rounded-3xl mb-4 animate-result"
              style={{
                background: 'linear-gradient(135deg, rgba(196,30,58,0.3) 0%, rgba(22,91,51,0.3) 50%, rgba(196,30,58,0.3) 100%)',
                border: '2px solid rgba(241,183,46,0.7)',
                boxShadow: '0 0 50px rgba(241,183,46,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <h2
                className="font-serif font-extrabold text-gold-gradient name-glow leading-tight"
                style={{ fontSize: 'clamp(2rem, 10vw, 3.5rem)' }}
              >
                {result.matchName}
              </h2>
            </div>

            {/* Wishlist */}
            {result.matchWishlist && (
              <div className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 animate-fadeIn" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-2 text-christmas-gold font-bold text-xs mb-2">
                  <Heart className="w-3.5 h-3.5 fill-christmas-red text-christmas-red" />
                  Ideas de regalo:
                </div>
                <p className="text-slate-200 text-sm italic leading-relaxed">
                  {result.matchWishlist}
                </p>
              </div>
            )}

            {/* Info del evento */}
            {(result.budget || result.date) && (
              <div className="grid grid-cols-2 gap-2 w-full mb-4 animate-fadeIn" style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}>
                {result.date && (
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-christmas-gold shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-[9px]">Entrega:</span>
                      <span className="font-semibold text-red-200 text-xs">{result.date}</span>
                    </div>
                  </div>
                )}
                {result.budget && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-christmas-gold shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-[9px]">Presupuesto:</span>
                      <span className="font-semibold text-emerald-300 text-xs">{result.budget}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón cerrar */}
            <button
              onClick={onResetFlow}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 font-black text-white text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 touch-ripple animate-fadeIn"
              style={{ animationDelay: '0.9s', opacity: 0, animationFillMode: 'forwards' }}
            >
              <EyeOff className="w-5 h-5" /> ¡Listo! Ocultar 🤫
            </button>

            <p className="text-[10px] text-slate-600 mt-3">
              Vuelve cuando quieras e ingresa tu PIN para verlo de nuevo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
