'use client';
import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2, Globe, Edit, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

const LANGUAGES = ['pt', 'en', 'es', 'de', 'it', 'fr'];

export default function ModifierGroupForm({ onClose }) {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [activeLang, setActiveLang] = useState('pt');
  const [formData, setFormData] = useState({
    name: { pt: '', en: '', es: '', de: '', it: '', fr: '' },
    minSelection: 0,
    maxSelection: 1,
    options: [{ name: { pt: '', en: '', es: '', de: '', it: '', fr: '' }, price: 0 }]
  });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu/modifiers');
      setGroups(res.data.data.groups);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleEdit = (group) => {
    setEditingId(group.id);
    setFormData({
      name: {
        pt: group.name?.pt || '', en: group.name?.en || '', es: group.name?.es || '', de: group.name?.de || '', it: group.name?.it || '', fr: group.name?.fr || ''
      },
      minSelection: group.minSelection,
      maxSelection: group.maxSelection,
      options: group.options?.map(o => ({
        name: { pt: o.name?.pt || '', en: o.name?.en || '', es: o.name?.es || '', de: o.name?.de || '', it: o.name?.it || '', fr: o.name?.fr || '' },
        price: o.price
      })) || []
    });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;
    try {
      setLoading(true);
      await api.delete(`/menu/modifiers/${id}`);
      fetchGroups();
    } catch (error) {
      alert('Erro ao excluir grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: { pt: '', en: '', es: '', de: '', it: '', fr: '' },
      minSelection: 0,
      maxSelection: 1,
      options: [{ name: { pt: '', en: '', es: '', de: '', it: '', fr: '' }, price: 0 }]
    });
    setView('form');
  };

  // --- FORM HANDLERS ---
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

  const handleRemoveOption = (index) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        minSelection: parseInt(formData.minSelection),
        maxSelection: parseInt(formData.maxSelection),
        options: formData.options.map(o => ({ name: o.name, price: parseFloat(o.price) }))
      };

      if (editingId) {
        await api.patch(`/menu/modifiers/${editingId}`, payload);
      } else {
        await api.post('/menu/modifiers', payload);
      }

      await fetchGroups();
      setView('list');
    } catch (error) {
      alert('Erro ao salvar grupo');
    } finally {
      setLoading(false);
    }
  };

  const getText = (obj) => obj?.pt || obj?.en || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto flex flex-col">

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {view === 'form' && <button onClick={() => setView('list')}><ArrowLeft size={20} /></button>}
            <h3 className="text-lg font-bold text-gray-900">{view === 'list' ? 'Gerenciar Modificadores' : (editingId ? 'Editar Grupo' : 'Novo Grupo')}</h3>
          </div>
          <button onClick={() => onClose(true)}><X size={20} className="text-gray-400" /></button>
        </div>

        {view === 'list' ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {loading && groups.length === 0 ? <Loader2 className="animate-spin mx-auto" /> : groups.map(group => (
                <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-bold text-sm">{getText(group.name)}</h4>
                    <p className="text-xs text-gray-500">{group.options?.length} opções • Min: {group.minSelection} / Max: {group.maxSelection}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(group)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(group.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {!loading && groups.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum grupo cadastrado.</p>}
            </div>
            <button onClick={handleNew} className="w-full py-3 bg-[#df0024] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-700">
              <Plus size={20} /> Novo Grupo
            </button>
          </div>
        ) : (
          <>
            {/* Language Switcher */}
            <div className="flex gap-1 mb-4 justify-center bg-gray-50 p-2 rounded-lg">
              {LANGUAGES.map(l => (
                <button key={l} type="button" onClick={() => setActiveLang(l)} className={`w-8 h-8 text-xs font-bold rounded uppercase ${activeLang === l ? 'bg-black text-white' : 'bg-white text-gray-500 border'}`}>
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
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.minSelection} onChange={e => setFormData({ ...formData, minSelection: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Máximo</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.maxSelection} onChange={e => setFormData({ ...formData, maxSelection: e.target.value })} />
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
                      <button type="button" onClick={() => handleRemoveOption(i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setView('list')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#df0024] text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  {loading && <Loader2 className="animate-spin" size={16} />} Salvar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}