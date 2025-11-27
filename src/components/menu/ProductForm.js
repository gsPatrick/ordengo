'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Tag, Star, Globe, Check, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

// URL base para exibir imagens vindas da API
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function ProductForm({ product, categories, modifierGroups, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [activeLang, setActiveLang] = useState('pt'); // Idioma sendo editado agora
  const [loading, setLoading] = useState(false);
  
  // Estado Unificado Multi-idioma
  const [formData, setFormData] = useState({
    name: { pt: '', en: '', es: '', de: '', it: '', fr: '' },
    description: { pt: '', en: '', es: '', de: '', it: '', fr: '' },
    price: '',
    categoryId: '',
    interfaceType: 'standard',
    imageFile: null,
    previewUrl: null,
    isOffer: false,
    isHighlight: false,
    hasVariants: false,
    variants: [], 
    modifierGroupIds: []
  });

  useEffect(() => {
    if (product) {
      const pName = product.name || {};
      const pDesc = product.description || {};
      
      setFormData({
        id: product.id,
        name: { pt: pName.pt||'', en: pName.en||'', es: pName.es||'', de: pName.de||'', it: pName.it||'', fr: pName.fr||'' },
        description: { pt: pDesc.pt||'', en: pDesc.en||'', es: pDesc.es||'', de: pDesc.de||'', it: pDesc.it||'', fr: pDesc.fr||'' },
        price: product.price,
        categoryId: product.categoryId,
        interfaceType: product.details?.interfaceType || 'standard',
        previewUrl: product.imageUrl ? `${BASE_IMG_URL}${product.imageUrl}` : null,
        isOffer: product.isOffer || false,
        isHighlight: product.isHighlight || false,
        hasVariants: product.hasVariants || false,
        variants: product.variants?.map(v => ({ 
          ...v, 
          name: { pt: v.name?.pt||'', en: v.name?.en||'', es: v.name?.es||'', de: v.name?.de||'', it: v.name?.it||'', fr: v.name?.fr||'' } 
        })) || [],
        modifierGroupIds: product.modifierGroups?.map(g => g.id) || []
      });
    }
  }, [product]);

  // --- HELPER CORRIGIDO ---
  const getText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    // Prioriza PT, depois EN, depois o primeiro valor encontrado
    return obj.pt || obj.en || Object.values(obj)[0] || '';
  };

  // --- HANDLERS DE TEXTO MULTI-IDIOMA ---
  const handleTextChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [activeLang]: value }
    }));
  };

  const handleVariantNameChange = (index, value) => {
    const newVariants = [...formData.variants];
    if (!newVariants[index].name) newVariants[index].name = {};
    newVariants[index].name[activeLang] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  // --- HANDLERS GERAIS ---
  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: { pt: '', en: '' }, price: '' }]
    }));
  };

  const handleRemoveVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantPriceChange = (index, value) => {
    const newVariants = [...formData.variants];
    newVariants[index].price = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const toggleModifierGroup = (groupId) => {
    const current = formData.modifierGroupIds;
    setFormData({ 
      ...formData, 
      modifierGroupIds: current.includes(groupId) ? current.filter(id => id !== groupId) : [...current, groupId] 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('name', JSON.stringify(formData.name));
      payload.append('description', JSON.stringify(formData.description));
      
      payload.append('price', formData.price);
      payload.append('categoryId', formData.categoryId);
      payload.append('details', JSON.stringify({ interfaceType: formData.interfaceType }));
      payload.append('isOffer', formData.isOffer);
      payload.append('isHighlight', formData.isHighlight);

      if (formData.imageFile) payload.append('image', formData.imageFile);

      if (formData.hasVariants && formData.variants.length > 0) {
        payload.append('variants', JSON.stringify(formData.variants));
      }

      payload.append('modifierGroupIds', JSON.stringify(formData.modifierGroupIds));

      await api.post('/menu/products', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

      onClose(true); 
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-900">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={() => onClose(false)}><X size={24} className="text-gray-400" /></button>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex border-b border-gray-200 px-6 bg-gray-50">
          {['general', 'variants', 'modifiers'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`py-3 px-4 text-sm font-medium border-b-2 capitalize ${activeTab === tab ? 'border-[#df0024] text-[#df0024]' : 'border-transparent text-gray-500'}`}
            >
              {tab === 'general' ? 'Geral & Tradução' : (tab === 'variants' ? 'Tamanhos/Variações' : 'Complementos')}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex gap-6">
                {/* Coluna Esquerda: Upload + Flags */}
                <div className="w-1/3 space-y-4">
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:border-[#df0024]">
                    <input type="file" onChange={e => {
                      const file = e.target.files[0];
                      setFormData({ ...formData, imageFile: file, previewUrl: URL.createObjectURL(file) });
                    }} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                    {formData.previewUrl ? <img src={formData.previewUrl} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400"><Upload size={32} className="mx-auto mb-2"/>Upload Foto</div>}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isOffer} onChange={e => setFormData({...formData, isOffer: e.target.checked})} className="text-[#df0024] rounded" />
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><Tag size={14}/> Marcar como Oferta</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isHighlight} onChange={e => setFormData({...formData, isHighlight: e.target.checked})} className="text-[#df0024] rounded" />
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><Star size={14}/> Marcar como Destaque</span>
                    </label>
                  </div>
                </div>

                {/* Coluna Direita: Dados + Tradução */}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${activeLang === lang.code ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        <span>{lang.flag}</span> {lang.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                    <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-gray-400">{LANGUAGES.find(l=>l.code===activeLang).label}</span>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Produto</label>
                        <input 
                          className="w-full px-3 py-2 border rounded-lg text-sm" 
                          value={formData.name[activeLang] || ''}
                          onChange={e => handleTextChange('name', e.target.value)}
                          placeholder={`Nome em ${LANGUAGES.find(l=>l.code===activeLang).label}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                        <textarea 
                          className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" 
                          value={formData.description[activeLang] || ''}
                          onChange={e => handleTextChange('description', e.target.value)}
                          placeholder={`Descrição em ${LANGUAGES.find(l=>l.code===activeLang).label}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Base (R$)</label>
                      <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select className="w-full px-3 py-2 border rounded-lg" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                        <option value="">Selecione...</option>
                        {categories.map(cat => (
                          <>
                            <option key={cat.id} value={cat.id}>{getText(cat.name)}</option>
                            {cat.subcategories?.map(sub => <option key={sub.id} value={sub.id}>&nbsp;&nbsp;↳ {getText(sub.name)}</option>)}
                          </>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                 <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={formData.hasVariants} onChange={e => setFormData({...formData, hasVariants: e.target.checked})} className="text-[#df0024] rounded" /> Habilitar Variações</label>
                 
                 <div className="flex gap-1">
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} type="button" onClick={() => setActiveLang(lang.code)} className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center ${activeLang === lang.code ? 'bg-gray-900 text-white' : 'bg-white border'}`}>
                        {lang.code.toUpperCase()}
                      </button>
                    ))}
                 </div>
              </div>

              {formData.hasVariants && (
                <div className="space-y-2">
                  <div className="flex justify-end mb-2"><button onClick={handleAddVariant} className="text-xs font-bold text-[#df0024]">+ Adicionar Opção</button></div>
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Nome ({activeLang.toUpperCase()})</label>
                        <input className="w-full px-2 py-1 border rounded text-sm" placeholder="Ex: Grande" value={v.name[activeLang] || ''} onChange={e => handleVariantNameChange(i, e.target.value)} />
                      </div>
                      <div className="w-32">
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Preço (R$)</label>
                        <input type="number" className="w-full px-2 py-1 border rounded text-sm" value={v.price} onChange={e => handleVariantPriceChange(i, e.target.value)} />
                      </div>
                      <button onClick={() => handleRemoveVariant(i)} className="p-2 text-red-400 hover:text-red-600 mt-4"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'modifiers' && (
            <div className="grid grid-cols-1 gap-3">
              {modifierGroups.map(group => (
                <div key={group.id} onClick={() => toggleModifierGroup(group.id)} className={`cursor-pointer border rounded-xl p-4 flex items-center justify-between transition-all ${formData.modifierGroupIds.includes(group.id) ? 'border-[#df0024] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div>
                    <h4 className="font-bold text-gray-900">{getText(group.name)}</h4>
                    <p className="text-xs text-gray-500">{group.options?.length || 0} opções</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.modifierGroupIds.includes(group.id) ? 'border-[#df0024] bg-[#df0024]' : 'border-gray-300'}`}>
                    {formData.modifierGroupIds.includes(group.id) && <Check size={12} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button onClick={() => onClose(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-[#df0024] text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-70">
            {loading && <Loader2 className="animate-spin" size={18} />} Salvar
          </button>
        </div>

      </div>
    </div>
  );
}