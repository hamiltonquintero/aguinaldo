import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Sparkles, X, FileText, Check } from 'lucide-react';

export default function EventSettingsModal({ isOpen, onClose, config, onSave }) {
  const [formData, setFormData] = useState(config);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#142921] to-[#0c1813] border-2 border-christmas-gold/40 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-christmas-red flex items-center justify-center text-xl shadow-lg border border-christmas-gold/50">
            🎄
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-gold-gradient">
              Configurar Evento Navideño
            </h3>
            <p className="text-xs text-slate-300">
              Personaliza los detalles del Aguinaldo para toda la familia
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-christmas-gold mb-1 uppercase tracking-wider">
              Nombre de la Celebración
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100 placeholder-slate-500"
              placeholder="Ej: Gran Aguinaldo Familiar 2026"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                <Calendar className="w-3.5 h-3.5 text-christmas-gold" />
                Fecha del Intercambio
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100"
                placeholder="Ej: 24 de Diciembre"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                <Clock className="w-3.5 h-3.5 text-christmas-gold" />
                Hora
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100"
                placeholder="Ej: 8:00 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-christmas-gold" />
                Presupuesto Sugerido
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100"
                placeholder="Ej: $50.000 COP / $20 USD"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                <MapPin className="w-3.5 h-3.5 text-christmas-gold" />
                Lugar de Reunión
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100"
                placeholder="Ej: Casa de los Abuelos"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
              <FileText className="w-3.5 h-3.5 text-christmas-gold" />
              Reglas Especiales / Dinámica de Entrega
            </label>
            <textarea
              rows={2}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-700/60 focus:border-christmas-gold focus:outline-none text-sm text-slate-100 resize-none"
              placeholder="Ej: Traer el regalo empacado con una adivinanza en la tarjeta..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-christmas-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold text-sm shadow-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

