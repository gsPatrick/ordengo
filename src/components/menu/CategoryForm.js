'use client';
import { useState } from 'react';
import { X, Loader2, FolderPlus, Folder, Globe, UploadCloud, Trash2 } from 'lucide-react';
import api from '@/lib/api';

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

const LANGUAGES = ['pt', 'en', 'es', 'de', 'it', 'fr'];

export default function CategoryForm({ category, parentCategories, onClose }) {
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('pt');
  const isEditing = !!category?.id;
  const isSubCategoryMode = !category?.id && !!category?.parentId;
  const parentName = isSubCategoryMode ? category.parentName : null;

  // Estado: Nomes traduzidos
  const [names, setNames] = useState({
    pt: category?.name?.pt || '',
    en: category?.name?.en || '',
    es: category?.name?.es || '',
    de: category?.name?.de || '',
    it: category?.name?.it || '',
    fr: category?.name?.fr || ''
  });
  
  const [parentId, setParentId] = useState(isSubCategoryMode ? category.parentId : (category?.parentId || ''));
  
  // Estado: Banners
  const [existingBanners, setExistingBanners] = useState(category?.banners || []);
  const [newBanners, setNewBanners] = useState([]);

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) setNewBanners(prev => [...prev, ...files]);
  };

  const removeNewBanner = (index) => setNewBanners(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('name', JSON.stringify(names));
      if (parentId) payload.append('parentId', parentId);
      
      // Banners Novos
      newBanners.forEach(file => payload.append('banners', file));
      // Banners Antigos (Para o backend saber o que manter, se ele suportar replace)
      // Se a API apenas fizer append, isso não é necessário, mas se for substituir, precisa enviar os antigos ou uma flag.
      // Vamos assumir que o endpoint PATCH aceita 'banners' como novos arquivos e mantem os antigos se a lógica for essa,
      // ou substitui. Na v2, geralmente substitui ou appenda. Vamos enviar apenas novos por enquanto.

      if (isEditing) {
        await api.patch(`/menu/categories/${category.id}`, payload, { headers: {'Content-Type': 'multipart/form-data'} });
      } else {
        await api.post('/menu/categories', payload, { headers: {'Content-Type': 'multipart/form-data'} });
      }
      onClose(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh]">
        
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {isSubCategoryMode ? <FolderPlus className="text-[#df0024]" /> : <Folder className="text-[#df0024]" />}
            {isEditing ? 'Editar Categoria' : (isSubCategoryMode ? 'Nova Subcategoria' : 'Nova Categoria Principal')}
          </h3>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {isSubCategoryMode && (
            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Adicionando dentro de: <strong>{parentName}</strong>
            </div>
          )}

          {/* Tradução de Nome */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
                <div className="flex gap-1">
                    {LANGUAGES.map(l => (
                        <button key={l} type="button" onClick={() => setActiveLang(l)} className={`w-6 h-6 text-[10px] rounded uppercase font-bold ${activeLang === l ? 'bg-[#df0024] text-white' : 'bg-gray-100 text-gray-500'}`}>{l}</button>
                    ))}
                </div>
            </div>
            <div className="relative">
                <input 
                  required 
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#df0024] outline-none" 
                  placeholder={`Nome em ${activeLang.toUpperCase()}`}
                  value={names[activeLang]} 
                  onChange={e => setNames({...names, [activeLang]: e.target.value})} 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">{activeLang}</span>
            </div>
          </div>

          {/* Banners da Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banners Promocionais (Tablet)</label>
            <div className="grid grid-cols-3 gap-2">
                {existingBanners.map((url, i) => (
                    <div key={`old-${i}`} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"><img src={`${BASE_IMG_URL}${url}`} className="w-full h-full object-cover" /></div>
                ))}
                {newBanners.map((file, i) => (
                    <div key={`new-${i}`} className="relative aspect-video bg-blue-50 rounded-lg overflow-hidden border border-blue-200">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" />
                        <button type="button" onClick={() => removeNewBanner(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button>
                    </div>
                ))}
                <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#df0024] hover:bg-red-50 transition-colors text-gray-400 hover:text-[#df0024]">
                    <UploadCloud size={24} />
                    <span className="text-[10px] font-bold mt-1">ADD BANNER</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileAdd} className="hidden" />
                </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => onClose(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#df0024] rounded-xl hover:bg-red-700 disabled:opacity-70 shadow-md shadow-red-100">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}