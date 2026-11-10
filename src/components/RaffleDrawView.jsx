import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Gift, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { sound } from '../utils/sound';

export default function RaffleDrawView({
  participants,
  raffleResults,
  onPerformRaffle,
  onGoToDelivery,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const canDraw = participants && participants.length >= 2;

  const handleRunRaffle = () => {
    sound.playClick();
    if (!canDraw) return;

    if (raffleResults && raffleResults.length > 0) {
      if (!window.confirm('Ya existe un sorteo realizado. ¿Deseas sortear de nuevo? Los resultados anteriores se reemplazarán.')) {
        return;
      }
    }

    setIsDrawing(true);
    setErrorMessage(null);
    sound.playJingleSnippet();

    // Dramatic festive lottery delay
    setTimeout(() => {
      try {
        const results = onPerformRaffle();
        setIsDrawing(false);
        sound.playSparkle();

        // Confetti burst
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#c41e3a', '#165b33', '#f1b72e', '#ffffff'],
        });
      } catch (err) {
        setIsDrawing(false);
        setErrorMessage(err.message || 'Error al realizar el sorteo.');
      }
    }, 1800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Central Festive Stage */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center bg-gradient-to-b from-[#132d23] via-[#0e2119] to-[#1c0c11] border-2 border-christmas-gold/40 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-christmas-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-christmas-red/20 rounded-full blur-2xl pointer-events-none" />

        {/* Tree / Gift Icon Graphic */}
        <div className="relative z-10 flex justify-center mb-6">
          <div className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-emerald-900 to-emerald-700 border-4 border-christmas-gold/60 shadow-[0_0_35px_rgba(241,183,46,0.35)] flex items-center justify-center ${isDrawing ? 'animate-bounce' : 'animate-float'}`}>
            <span className="text-5xl md:text-6xl select-none">
              {isDrawing ? '🎰' : raffleResults ? '🎉' : '🎄'}
            </span>
            {/* Twinkling sparkles */}
            <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-300 animate-spin" />
            <Sparkles className="absolute bottom-2 left-2 w-5 h-5 text-red-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="relative z-10 font-serif text-3xl md:text-5xl font-extrabold text-gold-gradient mb-3">
          {isDrawing
            ? '¡Mezclando los Regalos Mágicos!...'
            : raffleResults
            ? '¡Sorteo Navideño Completado!'
            : 'Gran Sorteo de Aguinaldo'}
        </h2>

        <p className="relative z-10 text-slate-300 text-sm md:text-base max-w-lg mx-auto mb-8">
          {isDrawing
            ? 'Garantizando que nadie se saque a sí mismo y respetando las exclusiones familiares...'
            : raffleResults
            ? 'Todos los participantes ya tienen su Amigo Secreto asignado en secreto. ¡Ahora puedes repartir los resultados!'
            : 'Nuestro duende navideño asignará un amigo secreto a cada participante de forma matemática y 100% confidencial.'}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="relative z-10 mb-6 max-w-md mx-auto p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs md:text-sm flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">No se pudo completar el sorteo:</strong>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!raffleResults ? (
            <button
              onClick={handleRunRaffle}
              disabled={!canDraw || isDrawing}
              className={`px-8 py-4 rounded-2xl font-bold text-lg md:text-xl shadow-2xl transition-all transform flex items-center gap-3 ${
                !canDraw
                  ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-slate-600/30'
                  : 'bg-gradient-to-r from-christmas-red via-red-600 to-christmas-red-dark hover:from-red-500 hover:to-red-700 text-white hover:scale-105 active:scale-95 shadow-red-900/60 border border-christmas-gold/40 animate-pulse-glow'
              }`}
            >
              <Gift className="w-6 h-6" />
              {isDrawing ? 'Sorteando...' : 'Iniciar Sorteo Navideño 🎁'}
            </button>
          ) : (
            <>
              <button
                onClick={onGoToDelivery}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-950/60 flex items-center gap-3 transform hover:scale-105 transition-all"
              >
                <span>Repartir Amigos Secretos</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleRunRaffle}
                disabled={isDrawing}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-christmas-gold" />
                Sortear de Nuevo
              </button>
            </>
          )}
        </div>

        {!canDraw && (
          <p className="relative z-10 mt-4 text-xs text-amber-400">
            * Agrega al menos 2 personas en la pestaña de Participantes para poder sortear.
          </p>
        )}
      </div>

      {/* Security & Fairness Guarantee Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e2118]/80 border border-emerald-800/40 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-900/50 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-christmas-gold" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">Sin Auto-Regalos</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              El algoritmo matemático asegura que nadie se toque a sí mismo.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e2118]/80 border border-emerald-800/40 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-900/50 text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-christmas-gold" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">Exclusiones Respetadas</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Si configuraste que parejas o familiares no se regalen, se respeta estrictamente.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e2118]/80 border border-emerald-800/40 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-900/50 text-emerald-300">
            <HeartHandshake className="w-5 h-5 text-christmas-gold" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">100% Confidencial</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Incluso quien organiza el sorteo puede jugar sin enterarse de las combinaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

