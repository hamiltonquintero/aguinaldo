import React, { useState, useEffect } from 'react';
import SnowEffect from './components/SnowEffect';
import ChristmasLights from './components/ChristmasLights';
import ParticipantsView from './components/ParticipantsView';
import RaffleDrawView from './components/RaffleDrawView';
import SecretDeliveryView from './components/SecretDeliveryView';
import AguinaldosGamesTab from './components/AguinaldosGamesTab';
import GroupRevealView from './components/GroupRevealView';
import GiftBoxModal from './components/GiftBoxModal';
import EventSettingsModal from './components/EventSettingsModal';
import { 
  DEMO_PARTICIPANTS, 
  DEMO_EVENT_CONFIG, 
  generateRaffle, 
  decodeSecretTicket,
  decodeGroupPackage,
  encodeGroupPackage
} from './utils/raffle';
import { sound } from './utils/sound';
import { 
  Users, Gift, Dice5, Volume2, VolumeX, Snowflake, 
  Share2, Award, Sparkles, Settings 
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' | 'raffle' | 'delivery' | 'games'

  // Settings & Toggles
  const [snowActive, setSnowActive] = useState(true);
  const [audioActive, setAudioActive] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core Data with LocalStorage Persistence
  const [eventConfig, setEventConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('aguinaldo_config');
      return saved ? JSON.parse(saved) : DEMO_EVENT_CONFIG;
    } catch {
      return DEMO_EVENT_CONFIG;
    }
  });

  const [participants, setParticipants] = useState(() => {
    try {
      const saved = localStorage.getItem('aguinaldo_participants');
      return saved ? JSON.parse(saved) : DEMO_PARTICIPANTS;
    } catch {
      return DEMO_PARTICIPANTS;
    }
  });

  const [raffleResults, setRaffleResults] = useState(() => {
    try {
      const saved = localStorage.getItem('aguinaldo_raffle_results');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Group Mode State (When opened via #group=... WhatsApp link)
  const [groupPackageData, setGroupPackageData] = useState(null);

  // Modal State for Secret Gift Opening
  const [activeSecretData, setActiveSecretData] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aguinaldo_config', JSON.stringify(eventConfig));
    } catch (e) {}
  }, [eventConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('aguinaldo_participants', JSON.stringify(participants));
    } catch (e) {}
  }, [participants]);

  useEffect(() => {
    try {
      if (raffleResults) {
        localStorage.setItem('aguinaldo_raffle_results', JSON.stringify(raffleResults));
      } else {
        localStorage.removeItem('aguinaldo_raffle_results');
      }
    } catch (e) {}
  }, [raffleResults]);

  // Check URL Hash for #group= or #reveal=
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#group=')) {
        const encoded = hash.replace('#group=', '');
        const decoded = decodeGroupPackage(encoded);
        if (decoded) {
          setGroupPackageData(decoded);
        }
      } else if (hash && hash.startsWith('#reveal=')) {
        const encoded = hash.replace('#reveal=', '');
        const decoded = decodeSecretTicket(encoded);
        if (decoded) {
          setActiveSecretData(decoded);
          setIsGiftModalOpen(true);
        }
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  // Handlers
  const handlePerformRaffle = () => {
    const results = generateRaffle(participants);
    setRaffleResults(results);
    return results;
  };

  const handleLoadDemo = () => {
    sound.playSparkle();
    setParticipants(DEMO_PARTICIPANTS);
    setEventConfig(DEMO_EVENT_CONFIG);
    setRaffleResults(null);
  };

  const handleToggleSound = () => {
    const next = sound.toggle();
    setAudioActive(next);
  };

  const handleOpenGiftModal = (data) => {
    setActiveSecretData(data);
    setIsGiftModalOpen(true);
  };

  const handlePreviewGroupMode = () => {
    if (!raffleResults) return;
    const dummyPackage = {
      title: eventConfig.title,
      date: eventConfig.date,
      time: eventConfig.time,
      budget: eventConfig.budget,
      location: eventConfig.location,
      rules: eventConfig.rules,
      requirePin: false,
      members: raffleResults.map(r => ({
        id: r.giverId,
        name: r.giverName,
        phone: r.giverPhone,
        pin: r.giverPin || '',
        match: r.receiverName,
        wishlist: r.receiverWishlist,
      })),
    };
    setGroupPackageData(dummyPackage);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-radial-vignette">
      {/* Background Falling Snow Canvas */}
      <SnowEffect active={snowActive} />

      {/* Garland Christmas Lights along the top */}
      <ChristmasLights />

      {/* Main Header / Navigation */}
      <header className="relative z-20 border-b border-emerald-900/60 bg-[#091512]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand / Logo */}
          <div
            onClick={() => {
              sound.playClick();
              setGroupPackageData(null);
              setActiveTab('participants');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-christmas-red to-red-600 flex items-center justify-center text-xl shadow-lg border border-christmas-gold/40 group-hover:scale-105 transition-transform">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-xl tracking-wide text-gold-gradient">
                  Aguinaldo Navideño
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-christmas-red/40 text-red-200 border border-christmas-red/50">
                  Familiar
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Amigo Secreto & Juegos Navideños
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Only if not in Group Reveal mode) */}
          {!groupPackageData ? (
            <nav className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-emerald-800/40 text-xs font-semibold">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('participants');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'participants'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Participantes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                  {participants.length}
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('raffle');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'raffle'
                    ? 'bg-christmas-red text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Dice5 className="w-3.5 h-3.5 text-christmas-gold" />
                <span>Sorteo Mágico</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('delivery');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'delivery'
                    ? 'bg-christmas-gold text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Repartir (WhatsApp)</span>
                {raffleResults && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('games');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'games'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-yellow-300" />
                <span>Juegos</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-300 font-semibold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40">
                📲 Vista de WhatsApp Familiar
              </span>
              <button
                onClick={() => setGroupPackageData(null)}
                className="text-xs text-slate-300 hover:text-white px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                Panel Organizador
              </button>
            </div>
          )}

          {/* Quick Controls: Snow, Audio, Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-all ${
                audioActive
                  ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300'
                  : 'bg-black/40 border-white/10 text-slate-500'
              }`}
              title={audioActive ? 'Silenciar efectos navideños' : 'Activar efectos navideños'}
            >
              {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSnowActive(!snowActive)}
              className={`p-2 rounded-xl border transition-all ${
                snowActive
                  ? 'bg-blue-950/80 border-blue-600/50 text-blue-300'
                  : 'bg-black/40 border-white/10 text-slate-500'
              }`}
              title={snowActive ? 'Desactivar nieve' : 'Activar nieve'}
            >
              <Snowflake className="w-4 h-4" />
            </button>

            {!groupPackageData && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                title="Ajustes del evento"
              >
                <Settings className="w-4 h-4 text-christmas-gold" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        {/* If Group Reveal Mode is active (via #group= or preview) */}
        {groupPackageData ? (
          <GroupRevealView
            groupData={groupPackageData}
            onOpenGiftModal={handleOpenGiftModal}
            onGoToAdmin={() => setGroupPackageData(null)}
          />
        ) : (
          <>
            {activeTab === 'participants' && (
              <ParticipantsView
                participants={participants}
                onUpdateParticipants={setParticipants}
                eventConfig={eventConfig}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onLoadDemo={handleLoadDemo}
              />
            )}

            {activeTab === 'raffle' && (
              <RaffleDrawView
                participants={participants}
                raffleResults={raffleResults}
                onPerformRaffle={handlePerformRaffle}
                onGoToDelivery={() => setActiveTab('delivery')}
              />
            )}

            {activeTab === 'delivery' && (
              <SecretDeliveryView
                raffleResults={raffleResults}
                eventConfig={eventConfig}
                onOpenGiftModal={handleOpenGiftModal}
                onOpenGroupPreview={handlePreviewGroupMode}
              />
            )}

            {activeTab === 'games' && (
              <AguinaldosGamesTab participants={participants} />
            )}
          </>
        )}
      </main>

      {/* Festive Footer */}
      <footer className="relative z-10 border-t border-emerald-950/80 bg-[#07110e]/90 py-5 text-center text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1.5 font-festive text-base text-yellow-200/90">
          ✨ ¡Que la magia de la Navidad llene sus hogares de amor y alegría! 🎄
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Aguinaldo & Amigo Secreto Familiar • Creado con amor navideño
        </p>
      </footer>

      {/* Secret Gift Box Modal (When opened) */}
      <GiftBoxModal
        isOpen={isGiftModalOpen}
        onClose={() => {
          setIsGiftModalOpen(false);
          if (window.location.hash.startsWith('#reveal=')) {
            window.location.hash = '';
          }
        }}
        secretData={activeSecretData}
      />

      {/* Event Settings Modal */}
      <EventSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={eventConfig}
        onSave={setEventConfig}
      />
    </div>
  );
}
