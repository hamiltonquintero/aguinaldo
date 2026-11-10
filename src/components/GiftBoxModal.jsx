import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { Gift, Sparkles, X, Heart, EyeOff, Calendar, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';

export default function GiftBoxModal({ isOpen, onClose, secretData }) {
  const [isOpened, setIsOpened] = useState(false);

  if (!isOpen || !secretData) return null;

  const handleOpenGift = () => {
    sound.playGiftOpen();
    setIsOpened(true);

    // Festive confetti blast
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#c41e3a', '#165b33', '#f1b72e', '#ffffff', '#e0f2fe'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f1b72e', '#ff4d4d', '#ffffff'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#165b33', '#f1b72e', '#ffffff'],
        });
      }, 250);
    } catch (e) {
      // Fallback
    }
  };

  const handleClose = () => {
    setIsOpened(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1b2f28] to-[#0d1a15] border-2 border-christmas-gold/40 rounded-3xl shadow-2xl p-6 md:p-8 text-center text-slate-100 overflow-hidden">
        {/* Decorative corner ribbons */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-christmas-red/30 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-christmas-gold/20 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Cerrar y ocultar"
        >
          <X className="w-6 h-6" />
        </button>

        {!isOpened ? (
          // UNOPENED STATE
          <div className="py-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-christmas-red/30 border border-christmas-red/50 text-red-200 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4 text-christmas-gold animate-spin" />
              Sorteo Confidencial
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-bold text-gold-gradient mb-2">
              ¡Hola, {secretData.giverName}! 🎄
            </h3>
            <p className="text-slate-300 text-sm md:text-base max-w-xs mx-auto mb-8">
              Asegúrate de que nadie esté mirando la pantalla antes de abrir tu regalo secreto.
            </p>

            {/* Interactive Gift Box Graphic */}
            <div
              onClick={handleOpenGift}
              className="group relative cursor-pointer my-4 transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-christmas-red to-christmas-red-dark shadow-[0_0_35px_rgba(196,30,58,0.6)] flex items-center justify-center relative border-4 border-christmas-gold/80 overflow-hidden">
                {/* Ribbon horizontal & vertical */}
                <div className="absolute inset-x-0 h-8 bg-christmas-gold/90 shadow-md flex items-center justify-center">
                  <div className="w-full h-1 bg-yellow-200/50" />
                </div>
                <div className="absolute inset-y-0 w-8 bg-christmas-gold/90 shadow-md flex items-center justify-center">
                  <div className="h-full w-1 bg-yellow-200/50" />
                </div>

                {/* Bow on top */}
                <div className="absolute -top-3 text-4xl select-none group-hover:scale-110 transition-transform">
                  🎀
                </div>

                <div className="relative z-10 text-white font-festive text-2xl drop-shadow-md">
                  Toca aquí
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenGift}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-christmas-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-bold text-lg shadow-lg shadow-yellow-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Gift className="w-5 h-5" />
              Abrir mi Regalo Secreto
            </button>
          </div>
        ) : (
          // OPENED STATE - REVEALED
          <div className="py-3 flex flex-col items-center animate-fadeIn">
            <div className="text-5xl mb-2 animate-bounce">
              🎉
            </div>

            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">
              Tu Amigo Secreto es:
            </span>

            <div className="p-4 px-6 my-2 rounded-2xl bg-gradient-to-r from-red-950/80 via-emerald-950/90 to-red-950/80 border-2 border-christmas-gold shadow-[0_0_30px_rgba(241,183,46,0.3)]">
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-gold-gradient tracking-wide">
                {secretData.receiverName}
              </h2>
            </div>

            {/* Wishlist / Gustos */}
            <div className="w-full mt-4 text-left p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-christmas-gold font-semibold text-sm mb-1.5">
                <Heart className="w-4 h-4 fill-christmas-red text-christmas-red" />
                Ideas de Regalo / Qué le gustaría recibir:
              </div>
              <p className="text-slate-200 text-sm italic pl-6">
                {secretData.receiverWishlist || '¡Sorpréndele con algo con mucho cariño navideño!'}
              </p>
            </div>

            {/* Event Reminder Info */}
            {(secretData.budget || secretData.date) && (
              <div className="w-full grid grid-cols-2 gap-2 mt-3 text-xs text-slate-300">
                {secretData.budget && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-christmas-gold shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Presupuesto:</span>
                      <span className="font-medium text-emerald-300">{secretData.budget}</span>
                    </div>
                  </div>
                )}
                {secretData.date && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-christmas-gold shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Entrega:</span>
                      <span className="font-medium text-red-200">{secretData.date}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hide button */}
            <div className="mt-6 w-full flex flex-col gap-2">
              <button
                onClick={handleClose}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <EyeOff className="w-5 h-5" />
                ¡Listo, ocultar y no mostrar a nadie!
              </button>
              <p className="text-xs text-slate-400">
                Nadie sabrá a quién le regalas hasta el día de la entrega. 🤫
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

