import React, { useState } from 'react';
import { 
  Gift, Share2, Copy, Check, MessageSquare, Printer, 
  Smartphone, Lock, Unlock, Eye, Sparkles, ExternalLink, HelpCircle
} from 'lucide-react';
import { encodeGroupPackage, encodeSecretTicket } from '../utils/raffle';
import { sound } from '../utils/sound';

export default function SecretDeliveryView({
  raffleResults,
  eventConfig,
  onOpenGiftModal,
  onOpenGroupPreview,
}) {
  const [activeTab, setActiveTab] = useState('groupLink'); // 'groupLink' | 'individual' | 'print'
  const [requirePin, setRequirePin] = useState(false);
  const [copiedGroup, setCopiedGroup] = useState(false);
  const [copiedIndividualId, setCopiedIndividualId] = useState(null);

  // Generate the Single Group Link (Self-contained in the URL hash!)
  const getGroupLink = () => {
    const hash = encodeGroupPackage(raffleResults, eventConfig, requirePin);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#group=${hash}`;
  };

  const getGroupWhatsAppMessage = () => {
    const link = getGroupLink();
    let msg = `🎄 *¡Hola a todos! Ya está listo nuestro sorteo de ${eventConfig.title}* 🎅✨\n\n`;
    msg += `Como estamos lejos, hicimos este sistema interactivo para que cada uno pueda destapar su regalo desde su celular:\n\n`;
    msg += `👉 Entren a este enlace único:\n${link}\n\n`;
    msg += `1️⃣ Busca tu nombre en la lista.\n`;
    if (requirePin) {
      msg += `2️⃣ Ingresa tu PIN de 4 dígitos (los últimos 4 dígitos de tu número de celular).\n`;
    } else {
      msg += `2️⃣ Confirma que eres tú y toca la caja de regalo.\n`;
    }
    msg += `3️⃣ ¡Se abrirá la animación con tu Amigo Secreto y sus sugerencias!\n\n`;
    if (eventConfig.date) msg += `📅 *Fecha de entrega:* ${eventConfig.date} ${eventConfig.time}\n`;
    if (eventConfig.budget) msg += `💰 *Presupuesto:* ${eventConfig.budget}\n`;
    if (eventConfig.rules) msg += `✨ *Regla:* ${eventConfig.rules}\n`;
    msg += `\n🤫 _¡Recuerden destapar únicamente el suyo y guardar el secreto hasta Navidad!_ 🎁`;
    return msg;
  };

  const handleCopyGroupMessage = () => {
    sound.playSparkle();
    const msg = getGroupWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopiedGroup(true);
    setTimeout(() => setCopiedGroup(false), 3000);
  };

  const handleShareGroupWhatsApp = () => {
    sound.playSparkle();
    const msg = encodeURIComponent(getGroupWhatsAppMessage());
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  // Individual ticket link
  const getIndividualLink = (ticket) => {
    const payload = {
      giverName: ticket.giverName,
      receiverName: ticket.receiverName,
      receiverWishlist: ticket.receiverWishlist,
      budget: eventConfig.budget,
      date: `${eventConfig.date} - ${eventConfig.time}`,
      eventTitle: eventConfig.title,
    };
    const hash = encodeSecretTicket(payload);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#reveal=${hash}`;
  };

  const handleCopyIndividual = (ticket) => {
    sound.playSparkle();
    const link = getIndividualLink(ticket);
    const text = `🎄 ¡Hola ${ticket.giverName}! Descubre quién te tocó en el sorteo de ${eventConfig.title} abriendo tu regalo aquí: ${link}`;
    navigator.clipboard.writeText(text);
    setCopiedIndividualId(ticket.giverId);
    setTimeout(() => setCopiedIndividualId(null), 2500);
  };

  if (!raffleResults || raffleResults.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-black/30 border border-emerald-800/60 max-w-lg mx-auto">
        <div className="text-5xl mb-4">🎁</div>
        <h3 className="font-serif text-2xl font-bold text-gold-gradient mb-2">
          Primero debes realizar el sorteo
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Dirígete a la pestaña "Sorteo Mágico" y presiona el botón para emparejar a los amigos secretos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modes Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-emerald-800/50 max-w-2xl mx-auto">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('groupLink');
          }}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'groupLink'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Share2 className="w-4 h-4 text-christmas-gold" />
          Enlace Único de Grupo (WhatsApp)
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('individual');
          }}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'individual'
              ? 'bg-gradient-to-r from-christmas-red to-red-700 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Enlaces Individuales
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('print');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'print'
              ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
      </div>

      {/* TAB 1: SINGLE GROUP LINK (THE USER'S PRIMARY GOAL!) */}
      {activeTab === 'groupLink' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-b from-[#153427] via-[#0e2118] to-[#1a0a0f] border-2 border-christmas-gold/40 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-christmas-gold/20 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  La solución perfecta para familias a distancia
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-gold-gradient">
                  Un Solo Enlace para Todo el Grupo 📲
                </h3>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
                  Comparte este único enlace en el grupo de WhatsApp. Cada familiar entrará desde su teléfono, seleccionará su nombre y destapará su regalo animado con música y confeti.
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-800 border-2 border-christmas-gold/50 flex items-center justify-center text-3xl shadow-xl shrink-0">
                🎁
              </div>
            </div>

            {/* PIN Security Toggle */}
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-800/60 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-christmas-gold">
                  {requirePin ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5 text-slate-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    Protección con PIN de 4 dígitos
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                      requirePin ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {requirePin ? 'Activado' : 'Opcional (Confianza)'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {requirePin 
                      ? 'Cada persona debe ingresar los últimos 4 dígitos de su teléfono para abrirlo.' 
                      : 'Modo confianza: cada quien confirma "Soy yo" para abrir su regalo.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRequirePin(!requirePin)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shrink-0 ${
                  requirePin
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                }`}
              >
                {requirePin ? 'Desactivar PIN' : 'Activar PIN de Seguridad'}
              </button>
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleCopyGroupMessage}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-christmas-gold via-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-sm md:text-base shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                {copiedGroup ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Mensaje con Enlace Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Mensaje para WhatsApp
                  </>
                )}
              </button>

              <button
                onClick={handleShareGroupWhatsApp}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm md:text-base shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <MessageSquare className="w-5 h-5" />
                Enviar Directo a WhatsApp
              </button>
            </div>

            {/* Message Preview Box */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[11px] font-semibold text-christmas-gold uppercase tracking-wider block mb-2">
                Vista Previa del Mensaje que recibirán:
              </span>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-black/40 p-3 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                {getGroupWhatsAppMessage()}
              </pre>
            </div>

            {/* Test Link Button */}
            <div className="mt-4 pt-4 border-t border-emerald-800/40 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                ¿Quieres probar cómo lo verán ellos?
              </span>
              <button
                onClick={onOpenGroupPreview}
                className="text-christmas-gold hover:text-yellow-300 font-semibold flex items-center gap-1 underline"
              >
                <Eye className="w-4 h-4" /> Probar vista de familiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL LINKS (ALTERNATIVE) */}
      {activeTab === 'individual' && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="text-center">
            <h3 className="font-serif text-2xl font-bold text-gold-gradient mb-1">
              Enlaces Individuales por Persona 👤
            </h3>
            <p className="text-xs md:text-sm text-slate-300">
              Si prefieres enviar un mensaje privado a cada familiar por separado, aquí tienes el botón de cada uno:
            </p>
          </div>

          <div className="space-y-2.5">
            {raffleResults.map((ticket) => {
              const isCopied = copiedIndividualId === ticket.giverId;
              return (
                <div
                  key={ticket.giverId}
                  className="rounded-2xl bg-[#0e2118]/80 border border-emerald-800/50 p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎁</span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">
                        {ticket.giverName}
                      </h4>
                      {ticket.giverPhone && (
                        <span className="text-xs text-emerald-400">{ticket.giverPhone}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyIndividual(ticket)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? '¡Copiado!' : 'Copiar Enlace'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRINTABLE CARDS */}
      {activeTab === 'print' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto no-print">
            <h3 className="font-serif text-2xl font-bold text-gold-gradient mb-1">
              Tarjetitas Navideñas Imprimibles 🖨️
            </h3>
            <button
              onClick={() => window.print()}
              className="mt-3 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 text-white font-bold text-sm shadow-xl flex items-center gap-2 mx-auto"
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
                  <h4 className="font-serif text-xl font-bold text-white mt-1">
                    Para: {ticket.giverName}
                  </h4>
                </div>
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">Tu Amigo Secreto:</span>
                  <h3 className="text-2xl font-black text-gold-gradient my-1">
                    {ticket.receiverName}
                  </h3>
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
