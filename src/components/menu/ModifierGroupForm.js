'use client';
import { useState } from 'react';
import { X, Loader2, Plus, Trash2, Globe } from 'lucide-react';
import api from '@/lib/api';

const LANGUAGES = ['pt', 'en', 'es', 'de', 'it', 'fr'];

export default function ModifierGroupForm({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('pt');

  const [formData, setFormData] = useState({
    name: { pt: '', en: '', es: '', de: '', it: '', fr: '' },
    minSelection: 0,
    maxSelection: 1,
    options: [{ name: { pt: '', en: '', es: '', de: '', it: '', fr: '' }, price: 0 }]
  });

  const handleNameChange = (val) => {
      setFormData(prev => ({ ...prev, name: { ...prev.name, [activeLang]: val } }));
  };

  const handleOptionNameChange = (index, val) => {
    const newOptions = [...formData.options];
    newOptions[index].name[activeLang] = val;
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionPriceChange = (index, val) => {
    const newOptions = [...formData.options];
    newOptions[index].price = val;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    setFormData(prev => ({ 
        ...prev, 
        options: [...prev.options, { name: { pt: '', en: '', es: '', de: '', it: '', fr: '' }, price: 0 }] 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envia objeto JSON completo
      const payload = {
        name: formData.name,
        minSelection: parseInt(formData.minSelection),
        maxSelection: parseInt(formData.maxSelection),
        options: formData.options.map(o => ({ name: o.name, price: parseFloat(o.price) }))
      };
      await api.post('/menu/modifiers', payload);
      onClose(true);
    } catch (error) {
      alert('Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto flex flex-col">
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Novo Grupo de Modificadores</h3>
          <button onClick={() => onClose(false)}><X size={20} className="text-gray-400" /></button>
        </div>

        {/* Language Switcher */}
        <div className="flex gap-1 mb-4 justify-center bg-gray-50 p-2 rounded-lg">
            {LANGUAGES.map(l => (
                <button key={l} onClick={() => setActiveLang(l)} className={`w-8 h-8 text-xs font-bold rounded uppercase ${activeLang === l ? 'bg-black text-white' : 'bg-white text-gray-500 border'}`}>
                    {l}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-1">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Grupo ({activeLang})</label>
            <input required className="w-full px-3 py-2 border rounded-lg" value={formData.name[activeLang]} onChange={e => handleNameChange(e.target.value)} placeholder="Ex: Escolha o Molho" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mínimo</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.minSelection} onChange={e => setFormData({...formData, minSelection: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Máximo</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.maxSelection} onChange={e => setFormData({...formData, maxSelection: e.target.value})} />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">Opções</label>
              <button type="button" onClick={handleAddOption} className="text-xs text-[#df0024] font-bold">+ Opção</button>
            </div>
            <div className="space-y-2">
              {formData.options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input required placeholder={`Nome (${activeLang})`} className="flex-1 px-3 py-2 border rounded-lg text-sm" value={opt.name[activeLang]} onChange={e => handleOptionNameChange(i, e.target.value)} />
                  <input type="number" placeholder="R$" className="w-20 px-3 py-2 border rounded-lg text-sm" value={opt.price} onChange={e => handleOptionPriceChange(i, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t mt-4">
            <button type="button" onClick={() => onClose(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#df0024] text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
              {loading && <Loader2 className="animate-spin" size={16} />} Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}