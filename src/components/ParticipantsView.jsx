import React, { useState } from 'react';
import { 
  Users, UserPlus, ClipboardList, Trash2, Edit2, Heart, Phone, 
  ShieldAlert, Settings, Sparkles, AlertCircle, Check
} from 'lucide-react';
import { sound } from '../utils/sound';

export default function ParticipantsView({
  participants,
  onUpdateParticipants,
  eventConfig,
  onOpenSettings,
  onLoadDemo,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [editingParticipant, setEditingParticipant] = useState(null);

  // Form state for single participant modal
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    wishlist: '',
    exclusions: [],
  });
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);

  const openAddModal = () => {
    sound.playClick();
    setFormData({
      id: 'p_' + Date.now(),
      name: '',
      phone: '',
      wishlist: '',
      exclusions: [],
    });
    setEditingParticipant(null);
    setIsSingleModalOpen(true);
  };

  const openEditModal = (p) => {
    sound.playClick();
    setFormData({
      id: p.id,
      name: p.name,
      phone: p.phone || '',
      wishlist: p.wishlist || '',
      exclusions: p.exclusions || [],
    });
    setEditingParticipant(p);
    setIsSingleModalOpen(true);
  };

  const handleSaveParticipant = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingParticipant) {
      onUpdateParticipants(
        participants.map((p) => (p.id === formData.id ? { ...formData } : p))
      );
    } else {
      onUpdateParticipants([...participants, { ...formData }]);
    }
    setIsSingleModalOpen(false);
    sound.playSparkle();
  };

  const handleDelete = (id) => {
    sound.playClick();
    if (window.confirm('¿Seguro que deseas eliminar este participante?')) {
      const updated = participants
        .filter((p) => p.id !== id)
        .map((p) => ({
          ...p,
          exclusions: p.exclusions.filter((eId) => eId !== id),
        }));
      onUpdateParticipants(updated);
    }
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const newParticipants = lines.map((name, idx) => ({
      id: 'p_' + (Date.now() + idx),
      name: name,
      phone: '',
      wishlist: '',
      exclusions: [],
    }));

    onUpdateParticipants([...participants, ...newParticipants]);
    setBulkText('');
    setIsBulkModalOpen(false);
    sound.playSparkle();
  };

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Event Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#17382c] via-[#10271f] to-[#2c0e14] border border-christmas-gold/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-christmas-gold/20 text-yellow-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Aguinaldo Navideño 2026
            </div>
            <h1 className="font-serif text-2xl md:text-4xl font-extrabold text-gold-gradient tracking-wide">
              {eventConfig.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs md:text-sm text-slate-300">
              <span>📅 {eventConfig.date} - {eventConfig.time}</span>
              <span>💰 Presupuesto: <strong className="text-emerald-400">{eventConfig.budget}</strong></span>
              <span>📍 {eventConfig.location}</span>
            </div>
            {eventConfig.rules && (
              <p className="mt-3 text-xs text-slate-300/90 italic bg-black/25 px-3 py-2 rounded-xl border border-white/5 inline-block">
                ✨ Regla: {eventConfig.rules}
              </p>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs md:text-sm flex items-center gap-2 transition-all shrink-0"
          >
            <Settings className="w-4 h-4 text-christmas-gold" />
            Editar Detalles
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-black/40 border border-emerald-800/60 focus:border-christmas-gold text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md"
            title="Pegar varios nombres de un solo golpe"
          >
            <ClipboardList className="w-4 h-4 text-christmas-gold" />
            Pegar Lista
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-christmas-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs md:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/40"
          >
            <UserPlus className="w-4 h-4" />
            Añadir Persona
          </button>

          {participants.length === 0 && (
            <button
              onClick={onLoadDemo}
              className="px-3.5 py-2.5 rounded-2xl bg-christmas-gold/20 hover:bg-christmas-gold/30 border border-christmas-gold/50 text-yellow-300 text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Cargar Ejemplo
            </button>
          )}
        </div>
      </div>

      {/* Participants Counter */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <span>
          Total de Participantes: <strong className="text-christmas-gold font-bold">{participants.length}</strong>
        </span>
        {participants.length < 2 && (
          <span className="text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Se necesitan al menos 2 personas para el sorteo
          </span>
        )}
      </div>

      {/* Participants Grid */}
      {participants.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-black/30 border border-dashed border-emerald-800/60">
          <div className="text-6xl mb-4">🎅🎁</div>
          <h3 className="font-serif text-xl font-bold text-gold-gradient mb-2">
            Aún no hay participantes en la lista
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Puedes pegar los nombres de tu familia directamente o cargar la familia de ejemplo para probar el sistema.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 shadow-lg"
            >
              <ClipboardList className="w-4 h-4" />
              Pegar Nombres de la Familia
            </button>
            <button
              onClick={onLoadDemo}
              className="px-5 py-2.5 rounded-2xl bg-christmas-gold/20 hover:bg-christmas-gold/30 border border-christmas-gold/40 text-yellow-300 font-medium text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Cargar Ejemplo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const exclusionsNames = p.exclusions
              ?.map((eId) => participants.find((x) => x.id === eId)?.name)
              .filter(Boolean);

            return (
              <div
                key={p.id}
                className="group relative rounded-2xl bg-[#0f241c]/80 hover:bg-[#133025] border border-emerald-800/50 hover:border-christmas-gold/40 p-5 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center text-sm shadow">
                        🎁
                      </span>
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                        title="Editar participante"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                        title="Eliminar participante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Phone / Whatsapp if set */}
                  {p.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-2">
                      <Phone className="w-3.5 h-3.5" />
                      {p.phone}
                    </div>
                  )}

                  {/* Wishlist */}
                  <div className="mt-3 p-3 rounded-xl bg-black/30 border border-white/5 text-xs">
                    <div className="flex items-center gap-1 text-christmas-gold font-semibold mb-1">
                      <Heart className="w-3 h-3 fill-christmas-red text-christmas-red" />
                      Gustos / Sugerencias:
                    </div>
                    <p className="text-slate-300 italic line-clamp-2">
                      {p.wishlist || 'Sin sugerencias aún (le gusta todo ✨)'}
                    </p>
                  </div>
                </div>

                {/* Exclusions badge */}
                {exclusionsNames && exclusionsNames.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-emerald-800/40 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>No regalar a: <strong>{exclusionsNames.join(', ')}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SINGLE PARTICIPANT MODAL */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#142921] to-[#0c1813] border-2 border-christmas-gold/40 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-gold-gradient mb-4">
              {editingParticipant ? 'Editar Participante' : 'Añadir Nuevo Participante'}
            </h3>

            <form onSubmit={handleSaveParticipant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100"
                  placeholder="Ej: Tío Carlos, Mamá, Sofía..."
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                  <Phone className="w-3.5 h-3.5 text-christmas-gold" />
                  WhatsApp / Celular (Opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100"
                  placeholder="Ej: +57 300 123 4567"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Permite enviar el link secreto de forma directa por WhatsApp.
                </span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                  <Heart className="w-3.5 h-3.5 text-christmas-red fill-christmas-red" />
                  Lista de Deseos / Gustos / Tallas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.wishlist}
                  onChange={(e) => setFormData({ ...formData, wishlist: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100 resize-none"
                  placeholder="Ej: Le gustan los chocolates oscuros, talla M, fan de Star Wars..."
                />
              </div>

              {/* Exclusions */}
              {participants.length > 1 && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Restricciones / No regalar a:
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Selecciona personas a las que esta persona NO debe regalarle (ej: esposos, hermanos):
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-black/30 rounded-xl border border-white/5">
                    {participants
                      .filter((p) => p.id !== formData.id)
                      .map((p) => {
                        const isExcluded = formData.exclusions.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={isExcluded}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    exclusions: [...formData.exclusions, p.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    exclusions: formData.exclusions.filter((id) => id !== p.id),
                                  });
                                }
                              }}
                              className="accent-christmas-red rounded"
                            />
                            <span>{p.name}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-christmas-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold text-sm shadow-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#142921] to-[#0c1813] border-2 border-christmas-gold/40 rounded-3xl shadow-2xl p-6 text-slate-100">
            <h3 className="font-serif text-xl font-bold text-gold-gradient mb-2 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-christmas-gold" />
              Pegar Lista Rápida de Nombres
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Copia y pega la lista de nombres desde WhatsApp o notas (un nombre por línea o separados por comas):
            </p>

            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"Mamá\nPapá\nAbuela Carmen\nTío Juan\nPrima Mariana"}
              className="w-full p-3 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100 placeholder-slate-500 font-mono"
            />

            <div className="pt-4 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Líneas detectadas: {bulkText.split(/[\n,]+/).filter((l) => l.trim()).length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Importar Participantes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

