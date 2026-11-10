import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, RefreshCw, RotateCcw, Unlock, Users,
  CheckCircle2, XCircle, AlertTriangle, Lock, Copy, Check,
  Eye, EyeOff, Sparkles, ArrowLeft, ExternalLink,
} from 'lucide-react';
import { sound } from '../utils/sound';

export default function AdminPanel({
  publishedEvent,     // { slug, adminToken }
  adminData,          // { eventTitle, members[] } | null
  isAdminLoading,
  adminError,
  onLoadStatus,       // () => void
  onResetPin,         // (memberId) => Promise
  onUnlock,           // (memberId) => Promise
  onClose,            // () => void
  getEventUrl,        // (slug) => string
}) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink]   = useState(false);
  const [showToken, setShowToken]     = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // memberId en proceso

  // Cargar estado al montar
  useEffect(() => {
    if (publishedEvent) onLoadStatus();
  }, [publishedEvent]);

  if (!publishedEvent) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p>No hay ningún evento publicado aún.</p>
      </div>
    );
  }

  const eventUrl = getEventUrl(publishedEvent.slug);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(publishedEvent.adminToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleReset = async (memberId, name) => {
    if (!window.confirm(`¿Resetear el PIN de "${name}"? Podrá crear uno nuevo la próxima vez que entre.`)) return;
    sound.playClick();
    setActionLoading(memberId + '-reset');
    await onResetPin(memberId);
    setActionLoading(null);
  };

  const handleUnlock = async (memberId, name) => {
    sound.playClick();
    setActionLoading(memberId + '-unlock');
    await onUnlock(memberId);
    setActionLoading(null);
  };

  const claimed  = adminData?.members?.filter(m => m.isClaimed)?.length  ?? 0;
  const total    = adminData?.members?.length ?? 0;
  const locked   = adminData?.members?.filter(m => m.isLocked)?.length   ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-fadeIn">

      {/* ── Header mejorado con glassmorphism ──────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 glass-card border-2 border-purple-500/40 shadow-2xl glow-emerald">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel de Administrador
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-gold-gradient text-glow-pulse mb-1">
            {adminData?.eventTitle ?? 'Sorteo de Aguinaldo'}
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Solo tú (el organizador) puedes ver esta pantalla. Gestiona los accesos de tu familia.
          </p>

          {/* Stats rápidas con animación staggered */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Participantes', value: total,   color: 'text-slate-200', icon: <Users className="w-4 h-4" /> },
              { label: 'Con PIN listo', value: claimed, color: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4" /> },
              { label: 'Bloqueados',   value: locked,   color: locked > 0 ? 'text-red-400' : 'text-slate-500', icon: <Lock className="w-4 h-4" /> },
            ].map((s, idx) => (
              <div key={s.label} className="glass-card rounded-2xl border border-white/10 p-3 text-center stagger-in hover:scale-105 transition-transform" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={`flex items-center justify-center gap-1 ${s.color} mb-1`}>{s.icon}</div>
                <div className={`text-2xl font-black font-serif ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Link del evento */}
          <div className="p-3 rounded-2xl bg-black/40 border border-emerald-800/50">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-1.5">
              🔗 Link público del evento:
            </span>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs text-slate-300 font-mono truncate">{eventUrl}</span>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-all ${
                  copiedLink ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {copiedLink ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
              </button>
            </div>
          </div>

          {/* Token admin (oculto por defecto) */}
          <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-amber-800/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                🗝️ Tu token de administrador (guárdalo):
              </span>
              <button
                onClick={() => setShowToken(s => !s)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {showToken ? <><EyeOff className="w-3 h-3" /> Ocultar</> : <><Eye className="w-3 h-3" /> Mostrar</>}
              </button>
            </div>
            {showToken && (
              <div className="flex items-center gap-2">
                <span className="flex-1 text-[10px] text-amber-200 font-mono break-all leading-relaxed">
                  {publishedEvent.adminToken}
                </span>
                <button
                  onClick={handleCopyToken}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-all ${
                    copiedToken ? 'bg-amber-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                >
                  {copiedToken ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-1">
              ⚠️ Solo se mostró una vez al publicar. Guárdalo en un lugar seguro.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabla de participantes con glassmorphism ───────────────── */}
      <div className="rounded-3xl glass-card border border-purple-900/40 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30 bg-gradient-to-r from-purple-950/30 to-transparent">
          <h3 className="font-serif text-lg font-bold text-gold-gradient flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-300" />
            Estado de Participantes
          </h3>
          <button
            onClick={onLoadStatus}
            disabled={isAdminLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refrescar"
          >
            <RefreshCw className={`w-4 h-4 ${isAdminLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {adminError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {adminError}
          </div>
        )}

        {isAdminLoading && !adminData ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-sm">Cargando estado del sorteo...</span>
          </div>
        ) : (
          <div className="divide-y divide-purple-900/20">
            {(adminData?.members ?? []).map((member) => {
              const isResetting = actionLoading === member.id + '-reset';
              const isUnlocking = actionLoading === member.id + '-unlock';

              return (
                <div
                  key={member.id}
                  className={`px-6 py-4 flex items-center justify-between gap-3 transition-colors ${
                    member.isLocked ? 'bg-red-950/20' : member.isClaimed ? 'bg-emerald-950/10' : ''
                  }`}
                >
                  {/* Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border shrink-0 ${
                      member.isLocked
                        ? 'bg-red-900/40 border-red-700/50 text-red-300'
                        : member.isClaimed
                        ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                    }`}>
                      {member.isLocked ? '🔒' : member.isClaimed ? '✅' : '⏳'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-100 text-sm truncate">{member.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {member.isClaimed ? (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> PIN creado
                            {member.claimedAt && (
                              <span className="text-slate-500 ml-1">
                                · {new Date(member.claimedAt).toLocaleDateString('es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Sin PIN aún
                          </span>
                        )}
                        {member.isLocked && (
                          <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Bloqueado
                            {member.failedAttempts > 0 && ` (${member.failedAttempts} intentos)`}
                          </span>
                        )}
                        {!member.isLocked && member.failedAttempts > 0 && (
                          <span className="text-[10px] text-orange-400">
                            {member.failedAttempts} intento(s) fallido(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    {member.isLocked && (
                      <button
                        onClick={() => handleUnlock(member.id, member.name)}
                        disabled={isUnlocking}
                        title="Desbloquear sin resetear PIN"
                        className="px-3 py-1.5 rounded-xl bg-orange-900/40 hover:bg-orange-800/60 border border-orange-700/50 text-orange-200 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {isUnlocking
                          ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          : <Unlock className="w-3.5 h-3.5" />}
                        Desbloquear
                      </button>
                    )}
                    {member.isClaimed && (
                      <button
                        onClick={() => handleReset(member.id, member.name)}
                        disabled={isResetting}
                        title="Resetear PIN (podrá crear uno nuevo)"
                        className="px-3 py-1.5 rounded-xl bg-red-900/30 hover:bg-red-800/50 border border-red-700/40 text-red-300 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {isResetting
                          ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          : <RotateCcw className="w-3.5 h-3.5" />}
                        Reset PIN
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer con leyenda */}
        <div className="px-6 py-3 border-t border-purple-900/20 flex flex-wrap gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span>✅</span> PIN creado</span>
          <span className="flex items-center gap-1"><span>⏳</span> Esperando que entre</span>
          <span className="flex items-center gap-1"><span>🔒</span> Bloqueado por intentos</span>
        </div>
      </div>

      {/* ── Volver ──────────────────────────────────────────── */}
      <div className="text-center pt-2">
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 mx-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al panel principal
        </button>
      </div>
    </div>
  );
}
