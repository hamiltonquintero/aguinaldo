import React, { useState } from 'react';
import { Trophy, Plus, Minus, Sparkles, Award, HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

export default function AguinaldosGamesTab({ participants }) {
  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem('aguinaldo_game_scores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeGameInfo, setActiveGameInfo] = useState(null);

  const traditionalGames = [
    {
      id: 'dar_no_recibir',
      title: 'Dar y no recibir 🤲',
      description: 'Nadie puede recibir nada directamente de la mano de otro. Para dar algo, debes dejarlo sobre la mesa o suelo. Si alguien lo toma de tu mano, gritas: "¡Mis Aguinaldos!" y ganas un punto.',
    },
    {
      id: 'pajita_boca',
      title: 'Pajita en boca 🌾',
      description: 'Todos deben tener siempre una pajita, palillo o rama pequeña en la boca. En cualquier momento alguien puede pedirte: "¡Pajita en boca!". Si no la tienes puesta, ¡pierdes el punto!',
    },
    {
      id: 'al_si_al_no',
      title: 'Al Sí y al No 🗣️',
      description: 'Se elige una palabra prohibida (por ejemplo, nadie puede decir "Sí" o nadie puede decir "No"). El objetivo es hacerle preguntas capciosas al otro para que responda con la palabra prohibida.',
    },
    {
      id: 'beso_robado',
      title: 'Beso robado 💋',
      description: 'El clásico juego donde debes intentar darle un beso inocente en la mejilla a tu contrincante cuando esté distraído. Si lo logras sin que lo esquive: "¡Mis Aguinaldos!".',
    },
    {
      id: 'estatua',
      title: 'Estatua 🗿',
      description: 'Cuando alguien grita "¡Estatua!", todos deben congelarse en la posición exacta en que se encontraban. El primero en parpadear, reírse o moverse pierde.',
    },
  ];

  const updateScore = (participantId, delta) => {
    sound.playClick();
    const current = scores[participantId] || 0;
    const next = Math.max(0, current + delta);
    const updated = { ...scores, [participantId]: next };
    setScores(updated);
    try {
      localStorage.setItem('aguinaldo_game_scores', JSON.stringify(updated));
    } catch (e) {}
    if (delta > 0) sound.playSparkle();
  };

  const resetScores = () => {
    if (window.confirm('¿Deseas reiniciar los puntajes de los juegos de aguinaldos?')) {
      setScores({});
      localStorage.removeItem('aguinaldo_game_scores');
    }
  };

  // Rank participants
  const ranked = [...participants].sort((a, b) => {
    const scoreA = scores[a.id] || 0;
    const scoreB = scores[b.id] || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#17382c] via-[#10271f] to-[#2c0e14] border border-christmas-gold/30 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-christmas-red flex items-center justify-center text-2xl shadow-lg shrink-0">
            🎲
          </div>
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-gold-gradient">
              Juegos Tradicionales de Aguinaldos 🎅
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Durante las novenas y reuniones de diciembre, la familia juega a tenderse trampas cotidianas. ¡Lleva el marcador oficial aquí de quién va ganando más puntos de aguinaldos!
            </p>
          </div>
        </div>
      </div>

      {/* Traditional Games Catalog Cards */}
      <div>
        <h3 className="font-serif text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-christmas-gold" />
          Reglas de los Juegos Clásicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {traditionalGames.map((game) => (
            <div
              key={game.id}
              className="p-5 rounded-2xl bg-[#0e2118]/80 border border-emerald-800/40 hover:border-christmas-gold/40 transition-all shadow-md"
            >
              <h4 className="font-bold text-christmas-gold text-base mb-2">
                {game.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {game.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scoreboard / Marcador */}
      <div className="rounded-3xl bg-[#0e2118]/90 border-2 border-christmas-gold/40 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-gold-gradient">
                Marcador Familiar de Aguinaldos
              </h3>
              <p className="text-xs text-slate-400">
                Suma un punto cada vez que alguien grite "¡Mis Aguinaldos!" exitosamente
              </p>
            </div>
          </div>

          <button
            onClick={resetScores}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors"
          >
            Reiniciar Puntajes
          </button>
        </div>

        {participants.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">
            Agrega participantes en la primera pestaña para habilitar el marcador.
          </p>
        ) : (
          <div className="space-y-3">
            {ranked.map((p, index) => {
              const score = scores[p.id] || 0;
              const isLeader = index === 0 && score > 0;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isLeader
                      ? 'bg-gradient-to-r from-yellow-950/40 via-emerald-950/60 to-yellow-950/40 border-christmas-gold shadow-lg shadow-yellow-500/10'
                      : 'bg-black/30 border-emerald-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald-900/80 flex items-center justify-center text-xs font-bold text-slate-300">
                      {isLeader ? '👑' : `#${index + 1}`}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm md:text-base flex items-center gap-2">
                        {p.name}
                        {isLeader && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-christmas-gold/20 text-yellow-300 font-semibold uppercase">
                            Líder
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score display */}
                    <div className="text-right mr-2">
                      <span className="text-2xl font-black font-serif text-christmas-gold">
                        {score}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1">
                        {score === 1 ? 'punto' : 'puntos'}
                      </span>
                    </div>

                    {/* Plus / Minus Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateScore(p.id, -1)}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                        title="Restar 1 punto"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateScore(p.id, 1)}
                        className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold flex items-center justify-center shadow transition-all active:scale-95"
                        title="¡Sumar 1 punto de Aguinaldo!"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

