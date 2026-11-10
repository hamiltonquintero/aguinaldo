import React, { useState } from 'react';
import {
  Share2, Copy, Check, MessageSquare, Printer,
  Sparkles, Gift, AlertTriangle, RefreshCw, ExternalLink,
  CheckCircle2, Lock, Info, Eye,
} from 'lucide-react';
import { sound } from '../utils/sound';

export default function SecretDeliveryView({
  raffleResults,
  eventConfig,
  publishedEvent,     // { slug, adminToken } | null
  isPublishing,
  publishError,
  onPublishRaffle,    // () => Promise
  getEventUrl,        // (slug) => string
  onGoToAdmin,        // () => void  — abre el panel de admin
  onPreviewGroup,     // () => void  — preview en el mismo browser
}) {
  const [activeTab, setActiveTab] = useState('share'); // 'share' | 'print'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const eventUrl = publishedEvent ? getEventUrl(publishedEvent.slug) : '';

  // ── Mensaje WhatsApp ──────────────────────────────────────
  const getWhatsAppMessage = () => {
    let msg = `🎄 *¡Hola a todos! Ya está listo nuestro sorteo de ${eventConfig.title}* 🎅✨\n\n`;
    msg += `Hicimos un sistema interactivo para que cada uno descubra su amigo secreto desde su celular:\n\n`;
    msg += `👉 Entren a este enlace:\n${eventUrl}\n\n`;
    msg += `1️⃣ Busca tu nombre en la lista.\n`;
    msg += `2️⃣ Si es tu primera vez, crea tu PIN secreto de 4 a 6 dígitos (¡solo tú lo sabes!).\n`;
    msg += `3️⃣ ¡Se abre la animación con tu Amigo Secreto!\n\n`;
    msg += `🔒 *Sistema privado:* El servidor solo te muestra tu resultado. Nadie puede ver el de otro.\n\n`;
    if (eventConfig.date) msg += `📅 *Fecha:* ${eventConfig.date} ${eventConfig.time || ''}\n`;
    if (eventConfig.budget) msg += `💰 *Presupuesto:* ${eventConfig.budget}\n`;
    if (eventConfig.rules) msg += `✨ *Regla:* ${eventConfig.rules}\n`;
    msg += `\n🤫 _¡Recuerden que el PIN es personal e intransferible!_ 🎁`;
    return msg;
  };

  const handleCopyLink = () => {
    sound.playSparkle();
    navigator.clipboard.writeText(eventUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyMessage = () => {
    sound.playSparkle();
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  const handleShareWhatsApp = () => {
    sound.playSparkle();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(getWhatsAppMessage())}`, '_blank');
  };

  // ── Sin sorteo todavía ────────────────────────────────────
  if (!raffleResults || raffleResults.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-black/30 border border-emerald-800/60 max-w-lg mx-auto">
        <div className="text-5xl mb-4">🎁</div>
        <h3 className="font-serif text-2xl font-bold text-gold-gradient mb-2">
          Primero debes realizar el sorteo
        </h3>
        <p className="text-slate-400 text-sm">
          Ve a la pestaña "Sorteo Mágico" y presiona el botón para emparejar a los amigos secretos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-emerald-800/50">
        <button
          onClick={() => { sound.playClick(); setActiveTab('share'); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'share'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Share2 className="w-4 h-4 text-christmas-gold" />
          Compartir por WhatsApp
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('print'); }}
          className={`py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'print'
              ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
      </div>

      {/* ════════════════════════════════════════════════════
          TAB: SHARE
          ════════════════════════════════════════════════════ */}
      {activeTab === 'share' && (
        <div className="space-y-5">

          {/* ── PASO 1: Publicar en el servidor ────────────── */}
          <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border-2 shadow-2xl transition-all ${
            publishedEvent
              ? 'bg-gradient-to-b from-emerald-950/80 to-[#0e2118] border-emerald-500/50'
              : 'bg-gradient-to-b from-[#153427] via-[#0e2118] to-[#1a0a0f] border-christmas-gold/40'
          }`}>

            {/* Paso badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${
                publishedEvent ? 'bg-emerald-500 text-white' : 'bg-christmas-gold text-slate-900'
              }`}>
                {publishedEvent ? <CheckCircle2 className="w-5 h-5" /> : '1'}
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-extrabold text-gold-gradient">
                {publishedEvent ? '¡Sorteo publicado en el servidor!' : 'Publicar sorteo de forma segura'}
              </h3>
            </div>

            {!publishedEvent ? (
              <>
                <p className="text-sm text-slate-300 mb-5 max-w-xl">
                  Al publicar, los resultados se guardan en el servidor de forma privada.
                  Cada familiar solo verá su resultado después de crear su propio PIN secreto.
                  <strong className="text-christmas-gold"> Ni siquiera tú verás los resultados de los demás una vez publicado.</strong>
                </p>

                {/* Garantías */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: '🔐', title: 'PIN personal', desc: 'Cada quien crea su propio PIN la primera vez que entra.' },
                    { icon: '🛡️', title: 'Sin trampa', desc: 'El servidor bloquea tras 5 intentos fallidos (30 min).' },
                    { icon: '🤫', title: 'Solo tu resultado', desc: 'El servidor nunca envía los resultados de otros.' },
                  ].map((g) => (
                    <div key={g.title} className="p-3 rounded-2xl bg-black/30 border border-white/10 text-xs text-left">
                      <span className="text-xl block mb-1">{g.icon}</span>
                      <strong className="text-christmas-gold block mb-0.5">{g.title}</strong>
                      <span className="text-slate-400">{g.desc}</span>
                    </div>
                  ))}
                </div>

                {publishError && (
                  <div className="mb-4 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <div>
                      <strong className="block">Error al publicar:</strong>
                      {publishError}
                    </div>
                  </div>
                )}

                <button
                  onClick={onPublishRaffle}
                  disabled={isPublishing}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-christmas-red via-red-600 to-christmas-red hover:from-red-500 hover:to-red-700 text-white font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isPublishing ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Publicando...</>
                  ) : (
                    <><Gift className="w-5 h-5" /> Publicar Sorteo de Forma Segura 🔒</>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Estado: ya publicado */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
                  <div className="flex-1 p-3 rounded-xl bg-black/40 border border-emerald-700/50 font-mono text-xs text-emerald-300 break-all">
                    {eventUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                    }`}
                  >
                    {copiedLink ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar link</>}
                  </button>
                </div>

                {/* Botones de compartir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={handleCopyMessage}
                    className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-christmas-gold via-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    {copiedMsg ? <><Check className="w-4 h-4" /> ¡Mensaje copiado!</> : <><Copy className="w-4 h-4" /> Copiar mensaje WhatsApp</>}
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" /> Enviar a WhatsApp
                  </button>
                </div>

                {/* Vista previa del mensaje */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 mb-4">
                  <span className="text-[11px] font-semibold text-christmas-gold uppercase tracking-wider block mb-2">
                    Vista previa del mensaje:
                  </span>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-black/40 p-3 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                    {getWhatsAppMessage()}
                  </pre>
                </div>

                {/* Acciones adicionales */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-emerald-800/40">
                  <button
                    onClick={onPreviewGroup}
                    className="text-xs text-christmas-gold hover:text-yellow-300 font-semibold flex items-center gap-1.5 underline underline-offset-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> Probar vista de familiar
                  </button>
                  <button
                    onClick={onGoToAdmin}
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1.5 underline underline-offset-2"
                  >
                    <Lock className="w-3.5 h-3.5" /> Panel de administrador
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── PASO 2: indicaciones (siempre visibles) ──── */}
          <div className="p-4 rounded-2xl bg-black/30 border border-emerald-800/40 flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-5 h-5 text-christmas-gold shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p><strong className="text-slate-200">¿Cómo funciona para tu familia?</strong></p>
              <p>1. Comparte el link en el grupo de WhatsApp.</p>
              <p>2. Cada familiar entra, busca su nombre y <strong>crea su PIN único</strong> (el primero en crearlo es el dueño de ese nombre).</p>
              <p>3. El servidor verifica el PIN y revela <strong>solo su resultado</strong>.</p>
              <p>4. Las veces siguientes, ingresan su PIN para volver a ver su amigo secreto.</p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: PRINT
          ════════════════════════════════════════════════════ */}
      {activeTab === 'print' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto no-print">
            <h3 className="font-serif text-2xl font-bold text-gold-gradient mb-1">
              Tarjetitas Navideñas Imprimibles 🖨️
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Para reuniones presenciales donde prefieras repartir papelitos físicos.
            </p>
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 text-white font-bold text-sm shadow-xl flex items-center gap-2 mx-auto"
            >
              <Printer className="w-4 h-4" />
              Imprimir Tarjetas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {raffleResults.map((ticket, idx) => (
              <div
                key={ticket.giverId}
                className="rounded-3xl border-2 border-dashed border-christmas-gold/70 bg-[#0c1a14] p-5 text-slate-100"
              >
                <div className="border-b border-dashed border-christmas-gold/40 pb-3 mb-3">
                  <span className="text-xs text-christmas-gold uppercase">Tarjeta #{idx + 1}</span>
                  <h4 className="font-serif text-xl font-bold text-white mt-1">Para: {ticket.giverName}</h4>
                </div>
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">Tu Amigo Secreto:</span>
                  <h3 className="text-2xl font-black text-gold-gradient my-1">{ticket.receiverName}</h3>
                  <p className="text-xs text-slate-300 italic">
                    {ticket.receiverWishlist || '¡Sorpréndele con mucho cariño navideño!'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
