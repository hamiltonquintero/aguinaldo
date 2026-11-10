import React, { useState, useEffect } from 'react';
import { Gift, Lock, Sparkles, Check, Heart, Calendar, DollarSign, MapPin, Eye, AlertCircle, ArrowLeft } from 'lucide-react';
import { sound } from '../utils/sound';

export default function GroupRevealView({ groupData, onOpenGiftModal, onGoToAdmin }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mySavedId, setMySavedId] = useState(() => {
    try {
      return localStorage.getItem('aguinaldo_my_identity_' + groupData.title) || null;
    } catch {
      return null;
    }
  });

  const handleSelectMember = (member) => {
    sound.playClick();
    setSelectedMember(member);
    setPinInput('');
    setPinError(false);

    if (groupData.requirePin && member.pin) {
      // Need PIN
    } else {
      // Simple confirmation
      setIsConfirmOpen(true);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    const expectedPin = (selectedMember.pin || '').trim();
    if (pinInput.trim() === expectedPin || expectedPin === '') {
      // Correct!
      revealForMember(selectedMember);
    } else {
      sound.playClick();
      setPinError(true);
    }
  };

  const revealForMember = (member) => {
    // Save my identity in this phone's localStorage
    try {
      localStorage.setItem('aguinaldo_my_identity_' + groupData.title, member.id);
      setMySavedId(member.id);
    } catch (e) {}

    setIsConfirmOpen(false);
    setSelectedMember(null);

    onOpenGiftModal({
      giverName: member.name,
      receiverName: member.match,
      receiverWishlist: member.wishlist,
      budget: groupData.budget,
      date: `${groupData.date} - ${groupData.time}`,
      eventTitle: groupData.title,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 px-2">
      {/* Event Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#1b3d30] via-[#122820] to-[#2e0e15] border-2 border-christmas-gold/40 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-christmas-gold/20 border border-christmas-gold/40 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Sorteo Oficial de Aguinaldo 🎅
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-black text-gold-gradient tracking-wide mb-3">
          {groupData.title}
        </h1>

        <p className="text-slate-300 text-sm max-w-lg mx-auto mb-5">
          ¡Hola, familia! El sorteo ya está listo. Busca tu nombre en la lista y destapa tu regalo para descubrir en secreto a quién te tocó regalarle.
        </p>

        {/* Quick event stats */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
          {groupData.date && (
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-christmas-gold" />
              {groupData.date} {groupData.time}
            </span>
          )}
          {groupData.budget && (
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Presupuesto: <strong className="text-emerald-300">{groupData.budget}</strong>
            </span>
          )}
          {groupData.location && (
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-christmas-red-light" />
              {groupData.location}
            </span>
          )}
        </div>

        {groupData.rules && (
          <div className="mt-4 text-xs text-slate-300/90 italic bg-black/30 p-2.5 rounded-xl border border-white/5 max-w-md mx-auto">
            ✨ {groupData.rules}
          </div>
        )}
      </div>

      {/* Quick shortcut if this phone already destapó su regalo */}
      {mySavedId && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                Acceso Rápido
              </p>
              <h4 className="font-bold text-white text-sm">
                Ya destapaste tu amigo secreto en este celular
              </h4>
            </div>
          </div>
          <button
            onClick={() => {
              const myMember = groupData.members.find(m => m.id === mySavedId);
              if (myMember) revealForMember(myMember);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            Recordar mi Amigo
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        <h3 className="font-serif text-xl md:text-2xl font-bold text-slate-200">
          ¿Quién eres tú? 👇
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Toca únicamente tu nombre para abrir tu regalo. ¡No hagas trampa abriendo el de los demás! 🤫
        </p>
      </div>

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {groupData.members.map((member) => {
          const isMe = member.id === mySavedId;
          return (
            <button
              key={member.id}
              onClick={() => handleSelectMember(member)}
              className={`p-4 rounded-2xl text-left transition-all duration-300 border flex items-center justify-between gap-3 group transform hover:scale-[1.02] active:scale-95 shadow-lg ${
                isMe
                  ? 'bg-gradient-to-r from-emerald-950/80 to-[#122e23] border-christmas-gold shadow-yellow-500/10'
                  : 'bg-[#0e2118]/80 hover:bg-[#132f22] border-emerald-800/50 hover:border-christmas-gold/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-christmas-red to-red-700 border border-christmas-gold/40 flex items-center justify-center text-xl shadow-md group-hover:rotate-6 transition-transform">
                  🎁
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-base flex items-center gap-1.5">
                    {member.name}
                    {isMe && (
                      <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-semibold">
                        Tú
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-christmas-gold flex items-center gap-1 mt-0.5">
                    {groupData.requirePin ? (
                      <>
                        <Lock className="w-3 h-3" /> Protegido con PIN
                      </>
                    ) : (
                      'Toca para destapar'
                    )}
                  </span>
                </div>
              </div>

              <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity">
                👉
              </span>
            </button>
          );
        })}
      </div>

      {/* PIN MODAL (If PIN is required) */}
      {selectedMember && groupData.requirePin && selectedMember.pin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#173026] to-[#0c1813] border-2 border-christmas-gold/50 rounded-3xl shadow-2xl p-6 text-center text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-christmas-gold/20 border border-christmas-gold/40 text-christmas-gold flex items-center justify-center mx-auto mb-3 text-2xl">
              🔒
            </div>

            <h3 className="font-serif text-xl font-bold text-gold-gradient mb-1">
              ¿Eres {selectedMember.name}?
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              Ingresa tu código PIN de 4 dígitos para destapar tu regalo de forma confidencial:
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                autoFocus
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN secreto (ej: 1234)"
                className="w-full text-center text-2xl tracking-widest font-mono py-3 px-4 rounded-xl bg-black/50 border border-emerald-700 focus:border-christmas-gold focus:outline-none text-white"
              />

              {pinError && (
                <p className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1 animate-wiggle">
                  <AlertCircle className="w-3.5 h-3.5" /> PIN incorrecto. Intenta de nuevo.
                </p>
              )}

              <p className="text-[11px] text-slate-400">
                *(Si no recuerdas tu PIN, consulta con quien organizó el sorteo).*
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setPinInput('');
                  }}
                  className="flex-1 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-christmas-red to-red-700 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  Abrir Regalo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL (If no PIN required) */}
      {isConfirmOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#173026] to-[#0c1813] border-2 border-christmas-gold/50 rounded-3xl shadow-2xl p-6 text-center text-slate-100">
            <div className="w-14 h-14 rounded-full bg-christmas-red/30 border border-christmas-gold/40 flex items-center justify-center mx-auto mb-3 text-3xl">
              🎅
            </div>

            <h3 className="font-serif text-xl font-bold text-gold-gradient mb-1">
              ¿Confirmas que eres {selectedMember.name}?
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Este sorteo se basa en el espíritu y la confianza navideña familiar. Recuerda que no debes ver el amigo secreto de nadie más. 🤫
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => revealForMember(selectedMember)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-christmas-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                ¡Sí, soy {selectedMember.name}! Destapar
              </button>

              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setSelectedMember(null);
                }}
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                No soy yo, volver a la lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Switch to Organizer Mode */}
      <div className="pt-8 text-center">
        <button
          onClick={onGoToAdmin}
          className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
        >
          ¿Eres el organizador? Ir al panel de administración
        </button>
      </div>
    </div>
  );
}

