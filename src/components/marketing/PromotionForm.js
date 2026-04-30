'use client';
import { useState } from 'react';
import { X, Loader2, Plus, DollarSign, Percent, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

export default function PromotionForm({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    discountType: 'percentage', // percentage | fixed
    discountValue: '',
    startTime: '18:00',
    endTime: '23:00',
    activeDays: [0, 1, 2, 3, 4, 5, 6], // Começa com todos selecionados
    imageFile: null
  });

  const daysOfWeek = [
    { id: 0, label: 'D' }, // Dom
    { id: 1, label: 'S' },
    { id: 2, label: 'T' },
    { id: 3, label: 'Q' },
    { id: 4, label: 'Q' },
    { id: 5, label: 'S' },
    { id: 6, label: 'S' },
  ];

  const toggleDay = (dayId) => {
    const current = formData.activeDays;
    if (current.includes(dayId)) {
      setFormData({ ...formData, activeDays: current.filter(d => d !== dayId) });
    } else {
      setFormData({ ...formData, activeDays: [...current, dayId].sort() });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.activeDays.length === 0) {
      return alert('Selecione pelo menos um dia da semana.');
    }

    setLoading(true);
    try {
      const payload = new FormData();
      // A API espera title como JSONB {pt: ...}
      payload.append('title', JSON.stringify({ pt: formData.title }));
      payload.append('discountType', formData.discountType);
      payload.append('discountValue', formData.discountValue);
      payload.append('startTime', formData.startTime);
      payload.append('endTime', formData.endTime);
      payload.append('activeDays', JSON.stringify(formData.activeDays));

      if (formData.imageFile) {
        payload.append('image', formData.imageFile);
      }

      await api.post('/marketing/promotions', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onClose(true); // Refresh
    } catch (error) {
      console.error(error);
      alert('Erro ao criar promoção.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="px-6 py-4 bg-[#1f1c1d] flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Nova Oferta Especial</h3>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Título e Imagem */}
          <div className="flex gap-4">
            <div className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:border-[#df0024]">
              <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-gray-400" size={24} />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Oferta</label>
              <input
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#df0024] focus:border-transparent outline-none"
                placeholder="Ex: Happy Hour de Chopp"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          {/* Configuração de Desconto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Desconto</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                  className={`flex-1 flex justify-center items-center py-1.5 rounded-md text-sm font-medium transition-all ${formData.discountType === 'percentage' ? 'bg-white text-[#df0024] shadow-sm' : 'text-gray-500'}`}
                >
                  <Percent size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                  className={`flex-1 flex justify-center items-center py-1.5 rounded-md text-sm font-medium transition-all ${formData.discountType === 'fixed' ? 'bg-white text-[#df0024] shadow-sm' : 'text-gray-500'}`}
                >
                  <DollarSign size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor {formData.discountType === 'percentage' ? '(%)' : ''}</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#df0024] outline-none font-bold text-gray-900"
                placeholder={formData.discountType === 'percentage' ? "10" : "5.00"}
                value={formData.discountValue}
                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Agendamento Automático</h4>

            {/* Dias da Semana */}
            <div className="flex justify-between gap-2 mb-4">
              {daysOfWeek.map(day => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`
                    w-9 h-9 rounded-full text-xs font-bold transition-all
                    ${formData.activeDays.includes(day.id)
                      ? 'bg-[#df0024] text-white shadow-md shadow-red-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                  `}
                >
                  {day.label}
                </button>
              ))}
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Início</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Término</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#df0024] rounded-xl hover:bg-red-700 disabled:opacity-70 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Salvar Oferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}