import React, { useState, useEffect } from 'react';
import SnowEffect from './components/SnowEffect';
import ChristmasLights from './components/ChristmasLights';
import AmbientParticles from './components/AmbientParticles';
import ParticipantsView from './components/ParticipantsView';
import RaffleDrawView from './components/RaffleDrawView';
import SecretDeliveryView from './components/SecretDeliveryView';
import AguinaldosGamesTab from './components/AguinaldosGamesTab';
import GroupRevealView from './components/GroupRevealView';
import GiftBoxModal from './components/GiftBoxModal';
import EventSettingsModal from './components/EventSettingsModal';
import AdminPanel from './components/AdminPanel';
import WelcomeScreen from './components/WelcomeScreen';
import {
  DEMO_PARTICIPANTS, DEMO_EVENT_CONFIG,
  generateRaffle, decodeSecretTicket,
} from './utils/raffle';
import { sound } from './utils/sound';
import { useRaffle } from './hooks/useRaffle';
import {
  Users, Gift, Dice5, Volume2, VolumeX, Snowflake,
  Award, Settings, ShieldCheck, Music, MusicIcon,
} from 'lucide-react';

// Icono de música (lucide no tiene MusicOff, lo hacemos inline)
const MusicOff = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);
const MusicOn = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

export default function App() {
  // ── Pantalla de bienvenida ────────────────────────────────
  const [showWelcome, setShowWelcome] = useState(() => {
    // No mostrar si viene de un link #event=
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#event=')) return false;
    return !sessionStorage.getItem('aguinaldo_welcomed');
  });

  // ── Navegación ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('participants');

  // ── Toggles ───────────────────────────────────────────────
  const [snowActive,  setSnowActive]  = useState(true);
  const [audioActive, setAudioActive] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── Datos del organizador ─────────────────────────────────
  const [eventConfig, setEventConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aguinaldo_config')) ?? DEMO_EVENT_CONFIG; }
    catch { return DEMO_EVENT_CONFIG; }
  });
  const [participants, setParticipants] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aguinaldo_participants')) ?? DEMO_PARTICIPANTS; }
    catch { return DEMO_PARTICIPANTS; }
  });
  const [raffleResults, setRaffleResults] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aguinaldo_raffle_results')) ?? null; }
    catch { return null; }
  });

  const [giftModalData, setGiftModalData] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const raffle = useRaffle();
  const [groupSlug, setGroupSlug] = useState(null);

  // ── Sync localStorage ─────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('aguinaldo_config', JSON.stringify(eventConfig)); } catch {}
  }, [eventConfig]);
  useEffect(() => {
    try { localStorage.setItem('aguinaldo_participants', JSON.stringify(participants)); } catch {}
  }, [participants]);
  useEffect(() => {
    try {
      if (raffleResults) localStorage.setItem('aguinaldo_raffle_results', JSON.stringify(raffleResults));
      else localStorage.removeItem('aguinaldo_raffle_results');
    } catch {}
  }, [raffleResults]);

  // ── Hash URL ──────────────────────────────────────────────
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#event=')) {
        const slug = hash.replace('#event=', '');
        setGroupSlug(slug);
        raffle.loadGroupBySlug(slug);
      } else if (hash.startsWith('#reveal=')) {
        const data = decodeSecretTicket(hash.replace('#reveal=', ''));
        if (data) { setGiftModalData(data); setIsGiftModalOpen(true); }
      } else {
        setGroupSlug(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ── Handlers ──────────────────────────────────────────────
  const handleEnterApp = () => {
    sessionStorage.setItem('aguinaldo_welcomed', '1');
    setShowWelcome(false);
    sound.playSparkle();
  };

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
    raffle.clearPublishedEvent();
  };

  const handleToggleSound = () => {
    const next = sound.toggle();
    setAudioActive(next);
    if (!next && musicPlaying) {
      sound.stopMusic();
      setMusicPlaying(false);
    }
  };

  const handleToggleMusic = () => {
    if (!audioActive) return; // música requiere audio activo
    const playing = sound.toggleMusic();
    setMusicPlaying(playing);
  };

  const handlePublishRaffle = async () => {
    if (!raffleResults) return;
    const result = await raffle.publishRaffle(eventConfig, raffleResults);
    if (result?.slug) sound.playSparkle();
  };

  const handlePreviewGroup = () => {
    if (!raffle.publishedEvent?.slug) return;
    raffle.loadGroupBySlug(raffle.publishedEvent.slug);
    setGroupSlug(raffle.publishedEvent.slug);
    window.location.hash = `event=${raffle.publishedEvent.slug}`;
  };

  const handleExitGroupView = () => {
    setGroupSlug(null);
    raffle.resetPinFlow();
    window.location.hash = '';
  };

  const handleGoToAdmin = () => {
    setActiveTab('admin');
    if (raffle.publishedEvent)
      raffle.loadAdminStatus(raffle.publishedEvent.slug, raffle.publishedEvent.adminToken);
  };

  const isGroupView = !!groupSlug && !!raffle.groupEventData;

  // ── Tabs config ───────────────────────────────────────────
  const tabs = [
    { id:'participants', label:'Familia',   shortLabel:'Familia',  icon:'👨‍👩‍👧‍👦', activeClass:'bg-emerald-700 text-white' },
    { id:'raffle',       label:'Sorteo',    shortLabel:'Sorteo',   icon:'🎰', activeClass:'bg-christmas-red text-white' },
    { id:'delivery',     label:'Repartir',  shortLabel:'Enviar',   icon:'📲', dot:!!raffleResults, activeClass:'bg-christmas-gold text-slate-950 font-bold' },
    { id:'games',        label:'Juegos',    shortLabel:'Juegos',   icon:'🎲', activeClass:'bg-amber-600 text-white' },
  ];

  return (
    <>
      {/* ── Pantalla de bienvenida ────────────────────────── */}
      {showWelcome && <WelcomeScreen onEnter={handleEnterApp} />}

      <div
        className="min-h-screen relative overflow-x-hidden flex flex-col"
        style={{ background: '#060d14' }}
      >
        {/* Capas de fondo */}
        <div className="night-sky" />
        <div className="stars-layer" />
        <SnowEffect active={snowActive} />
        <AmbientParticles active={!isGroupView} count={12} />
        <ChristmasLights />

        {/* ══════════════════════════════════════════════════
            HEADER — responsive y mobile-first con glassmorphism
            ══════════════════════════════════════════════════ */}
        <header className="relative z-20 border-b border-emerald-900/50 glass-panel backdrop-blur-md safe-bottom">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">

            {/* Fila superior: logo + controles */}
            <div className="flex items-center justify-between gap-2">
              {/* Logo */}
              <div
                onClick={() => { sound.playClick(); handleExitGroupView(); setActiveTab('participants'); }}
                className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-christmas-red to-red-600 flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 border-christmas-gold/60 group-hover:scale-105 transition-transform animate-float glow-red">
                  🎁
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-black text-lg tracking-wide text-gold-gradient">Aguinaldo Navideño</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-christmas-red/40 text-red-200 border border-christmas-red/50">Familiar</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Amigo Secreto & Juegos</p>
                </div>
                {/* Móvil: solo título corto */}
                <span className="sm:hidden font-serif font-black text-sm text-gold-gradient">Aguinaldo 🎄</span>
              </div>

              {/* Badge vista familiar (móvil) */}
              {isGroupView && (
                <span className="text-[10px] text-emerald-300 font-semibold px-2 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 flex-1 text-center mx-2">
                  📲 Vista Familiar
                </span>
              )}

              {/* Controles rápidos */}
              <div className="flex items-center gap-1.5">
                {/* Música */}
                <button
                  onClick={handleToggleMusic}
                  disabled={!audioActive}
                  className={`p-2 rounded-xl border transition-all touch-ripple ${
                    musicPlaying
                      ? 'bg-christmas-red/30 border-christmas-red/50 text-red-300'
                      : 'bg-black/40 border-white/10 text-slate-500'
                  } disabled:opacity-30`}
                  title={musicPlaying ? 'Parar música' : 'Tocar villancico'}
                >
                  {musicPlaying ? <MusicOn className="w-4 h-4" /> : <MusicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleToggleSound}
                  className={`p-2 rounded-xl border transition-all touch-ripple ${
                    audioActive
                      ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300'
                      : 'bg-black/40 border-white/10 text-slate-500'
                  }`}
                >
                  {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setSnowActive(s => !s)}
                  className={`p-2 rounded-xl border transition-all touch-ripple hidden sm:flex ${
                    snowActive
                      ? 'bg-blue-950/80 border-blue-600/50 text-blue-300'
                      : 'bg-black/40 border-white/10 text-slate-500'
                  }`}
                >
                  <Snowflake className="w-4 h-4" />
                </button>

                {!isGroupView && (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors touch-ripple"
                  >
                    <Settings className="w-4 h-4 text-christmas-gold" />
                  </button>
                )}

                {isGroupView && (
                  <button
                    onClick={handleExitGroupView}
                    className="text-[11px] text-slate-300 hover:text-white px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors touch-ripple"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>

            {/* Fila inferior: tabs (solo en modo organizador) */}
            {!isGroupView && (
              <nav className="tabs-scroll mt-2 flex items-center gap-1 pb-0.5">
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-emerald-800/40 text-xs font-semibold w-full sm:w-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
                      className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl transition-all flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 touch-ripple whitespace-nowrap ${
                        activeTab === tab.id
                          ? tab.activeClass + ' shadow'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base sm:text-sm">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden text-[10px] font-bold">{tab.shortLabel}</span>
                      {tab.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    </button>
                  ))}

                  {/* Admin tab */}
                  {raffle.publishedEvent && (
                    <button
                      onClick={() => { sound.playClick(); handleGoToAdmin(); }}
                      className={`flex-none px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 sm:gap-1.5 touch-ripple ${
                        activeTab === 'admin'
                          ? 'bg-purple-700 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base sm:text-sm">🛡️</span>
                      <span className="hidden sm:inline text-xs">Admin</span>
                    </button>
                  )}
                </div>
              </nav>
            )}
          </div>
        </header>

        {/* ══════════════════════════════════════════════════
            CONTENIDO PRINCIPAL
            ══════════════════════════════════════════════════ */}
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">

          {isGroupView ? (
            <GroupRevealView
              groupEventData={raffle.groupEventData}
              pinFlowState={raffle.pinFlowState}
              isLoadingGroup={raffle.isLoadingGroup}
              onSelectMember={raffle.selectMember}
              onClaimPin={raffle.claimPin}
              onVerifyPin={raffle.verifyPin}
              onResetFlow={raffle.resetPinFlow}
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
                  publishedEvent={raffle.publishedEvent}
                  isPublishing={raffle.isPublishing}
                  publishError={raffle.publishError}
                  onPublishRaffle={handlePublishRaffle}
                  getEventUrl={raffle.getEventUrl}
                  onGoToAdmin={handleGoToAdmin}
                  onPreviewGroup={handlePreviewGroup}
                />
              )}
              {activeTab === 'games' && (
                <AguinaldosGamesTab participants={participants} />
              )}
              {activeTab === 'admin' && (
                <AdminPanel
                  publishedEvent={raffle.publishedEvent}
                  adminData={raffle.adminData}
                  isAdminLoading={raffle.isAdminLoading}
                  adminError={raffle.adminError}
                  onLoadStatus={() => raffle.loadAdminStatus(
                    raffle.publishedEvent.slug, raffle.publishedEvent.adminToken
                  )}
                  onResetPin={raffle.adminResetPin}
                  onUnlock={raffle.adminUnlock}
                  onClose={() => setActiveTab('delivery')}
                  getEventUrl={raffle.getEventUrl}
                />
              )}
            </>
          )}
        </main>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="relative z-10 border-t border-emerald-950/60 bg-[#040a10]/90 py-4 text-center safe-bottom">
          <p className="font-festive text-sm sm:text-base text-yellow-200/80 flex items-center justify-center gap-1.5">
            ✨ ¡Que la magia de la Navidad llene sus hogares! 🎄
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-christmas-gold/40" />
            <p className="text-[11px] text-slate-500">
              Desarrollado por{' '}
              <span className="font-bold text-gold-gradient bg-clip-text">
                Hamilton Q
              </span>
              {' '}✦{' '}
              <span className="text-slate-600">2026</span>
            </p>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-christmas-gold/40" />
          </div>
        </footer>

        {/* ── Modales ───────────────────────────────────────── */}
        <GiftBoxModal
          isOpen={isGiftModalOpen}
          onClose={() => { setIsGiftModalOpen(false); if (window.location.hash.startsWith('#reveal=')) window.location.hash = ''; }}
          secretData={giftModalData}
        />
        <EventSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={eventConfig}
          onSave={setEventConfig}
        />
      </div>
    </>
  );
}
