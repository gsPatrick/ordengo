'use client';

import { useState, useEffect } from 'react';
import ManagerLayout from '../../../../components/ManagerLayout.js/ManagerLayout';
import {
  Palette,
  Info,
  UploadCloud,
  Wifi,
  Save,
  Loader2,
  Image as ImageIcon,
  Type,
  Check,
  Images,
  Trash2,
  Plus,
  X,
  Link as LinkIcon,
  AlignLeft,
  ShoppingBag
} from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

// URL base para exibir imagens vindas da API
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function AppearancePage() {
  const [activeTab, setActiveTab] = useState('brand'); // 'brand' | 'content' | 'banners'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- ESTADOS DE BANNER (NOVO) ---
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]); // Para o dropdown de vínculo
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    description: '',
    linkedProductId: '',
    imageFile: null
  });

  // --- ESTADOS GERAIS (ANTIGO) ---
  const [config, setConfig] = useState({
    // Marca
    logoUrl: '',
    logoFile: null,
    primaryColor: '#df0024',
    backgroundColor: '#1f1c1d',

    // Conteúdo de Texto
    aboutTitle: '',
    aboutText: '',
    publicTitle: '',
    ourHistory: '',

    // Wifi
    wifiSsid: '',
    wifiPassword: '',

    // Imagens Institucionais (Arrays de URLs para preview)
    institutionalBanners: [],
    highlightImagesLarge: [],
    highlightImagesSmall: []
  });

  // Estado separado para NOVOS arquivos (Uploads Institucionais)
  const [files, setFiles] = useState({
    institutionalBanners: [],
    highlightImagesLarge: [],
    highlightImagesSmall: []
  });

  const [logoPreview, setLogoPreview] = useState(null);

  // 1. Carregar Configurações, Banners e Produtos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, bannersRes, menuRes] = await Promise.all([
          api.get('/settings'),
          api.get('/marketing/screensavers'),
          api.get('/menu') // Necessário para listar produtos no select
        ]);

        // A. Processa Configurações Gerais
        const data = settingsRes.data.data.config;
        if (data) {
          const getText = (field) => (typeof field === 'object' ? field?.pt : field) || '';

          setConfig(prev => ({
            ...prev,
            logoUrl: data.logoUrl,
            primaryColor: data.primaryColor || '#df0024',
            backgroundColor: data.backgroundColor || '#1f1c1d',
            aboutTitle: getText(data.aboutTitle),
            aboutText: getText(data.aboutText),
            publicTitle: getText(data.publicTitle),
            ourHistory: getText(data.ourHistory),
            wifiSsid: data.wifiSsid || '',
            wifiPassword: data.wifiPassword || '',
            institutionalBanners: data.institutionalBanners || [],
            highlightImagesLarge: data.highlightImagesLarge || [],
            highlightImagesSmall: data.highlightImagesSmall || []
          }));

          if (data.logoUrl) {
            setLogoPreview(`${BASE_IMG_URL}${data.logoUrl}`);
          }
        }

        // B. Processa Banners
        setBanners(bannersRes.data.data.banners);

        // C. Processa Produtos (Flatten Menu para Dropdown)
        const flatProducts = [];
        const traverse = (categories) => {
          categories.forEach(cat => {
            if (cat.Products) {
              cat.Products.forEach(p => {
                const name = p.name?.pt || Object.values(p.name)[0] || 'Sem Nome';
                flatProducts.push({ id: p.id, name: name });
              });
            }
            if (cat.subcategories) traverse(cat.subcategories);
          });
        };
        traverse(menuRes.data.data.menu);
        setProducts(flatProducts);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- HANDLERS GERAIS (MARCA/CONTEÚDO) ---

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setConfig({ ...config, logoFile: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFileAdd = (e, fieldKey) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    if (fieldKey === 'highlightImagesSmall') {
      const currentCount = (config[fieldKey]?.length || 0) + (files[fieldKey]?.length || 0);
      if (currentCount + selectedFiles.length > 2) {
        alert('Você só pode ter 2 imagens pequenas de destaque.');
        return;
      }
    }
    if (fieldKey === 'highlightImagesLarge') {
      const currentCount = (config[fieldKey]?.length || 0) + (files[fieldKey]?.length || 0);
      if (currentCount + selectedFiles.length > 1) {
        alert('Você só pode ter 1 imagem grande de destaque.');
        return;
      }
    }

    setFiles(prev => ({
      ...prev,
      [fieldKey]: [...prev[fieldKey], ...selectedFiles]
    }));
  };

  const removeNewFile = (fieldKey, index) => {
    setFiles(prev => ({
      ...prev,
      [fieldKey]: prev[fieldKey].filter((_, i) => i !== index)
    }));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('primaryColor', config.primaryColor);
      formData.append('backgroundColor', config.backgroundColor);
      formData.append('wifiSsid', config.wifiSsid);
      formData.append('wifiPassword', config.wifiPassword);
      formData.append('aboutTitle', JSON.stringify({ pt: config.aboutTitle }));
      formData.append('aboutText', JSON.stringify({ pt: config.aboutText }));
      formData.append('publicTitle', JSON.stringify({ pt: config.publicTitle }));
      formData.append('ourHistory', JSON.stringify({ pt: config.ourHistory }));

      if (config.logoFile) formData.append('logo', config.logoFile);
    } finally {
      setSaving(false);
    }
  };

  // --- HANDLERS DE BANNERS RICOS (NOVO) ---

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFormData({ ...bannerFormData, imageFile: file });
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!bannerFormData.imageFile) return alert('Imagem obrigatória.');

    // Limite de 5 banners
    const myBanners = banners.filter(b => !b.isAd);
    if (myBanners.length >= 5) return alert("Limite de 5 banners atingido.");

    setUploadingBanner(true);
    try {
      const payload = new FormData();
      // Envia campos JSON (i18n)
      payload.append('title', JSON.stringify({ pt: bannerFormData.title }));
      payload.append('description', JSON.stringify({ pt: bannerFormData.description }));

      if (bannerFormData.linkedProductId) {
        payload.append('linkedProductId', bannerFormData.linkedProductId);
      }
      payload.append('image', bannerFormData.imageFile);

      await api.post('/marketing/screensavers', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refresh local
      const res = await api.get('/marketing/screensavers');
      setBanners(res.data.data.banners);

      // Reset Modal
      setIsBannerModalOpen(false);
      setBannerFormData({ title: '', description: '', linkedProductId: '', imageFile: null });
      setBannerPreview(null);

    } catch (error) {
      console.error(error);
      alert('Erro ao criar banner.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Remover este banner?')) return;
    try {
      await api.delete(`/marketing/screensavers/${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      alert('Erro ao deletar banner.');
    }
  };

  // Helper visual
  const getText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj.pt || Object.values(obj)[0] || '';
  };

  // --- COMPONENTES INTERNOS ---

  const ImageUploadSection = ({ title, fieldKey, currentImages, newFiles, max = null }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-gray-700">{title}</label>
        <span className="text-xs text-gray-400">
          {currentImages.length + newFiles.length} {max ? `/ ${max}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {currentImages.map((url, idx) => (
          <div key={`curr-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
            <img src={`${BASE_IMG_URL}${url}`} className="w-full h-full object-cover" alt="Existente" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">Salvo</span>
            </div>
          </div>
        ))}
        {newFiles.map((file, idx) => (
          <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-200">
            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" alt="Novo" />
            <button onClick={() => removeNewFile(fieldKey, idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600"><X size={12} /></button>
            <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[10px] text-center py-0.5">Novo</div>
          </div>
        ))}
        {(!max || (currentImages.length + newFiles.length) < max) && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#df0024] hover:bg-red-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-[#df0024]">
            <Plus size={24} />
            <span className="text-[10px] font-medium mt-1">Adicionar</span>
            <input type="file" multiple={!max || max > 1} accept="image/*" className="hidden" onChange={(e) => handleFileAdd(e, fieldKey)} />
          </label>
        )}
      </div>
    </div>
  );

  const TabletPreview = () => {
    const [bannerIndex, setBannerIndex] = useState(0);
    const myBanners = banners.filter(b => !b.isAd);
    const bannerToShow = myBanners.length > 0 ? myBanners[bannerIndex] : null;

    useEffect(() => {
      if (activeTab === 'banners' && myBanners.length > 0) {
        const interval = setInterval(() => {
          setBannerIndex(prev => (prev + 1) % myBanners.length);
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [activeTab, myBanners.length]);

    return (
      <div className="hidden xl:block w-80 flex-shrink-0 sticky top-6">
        <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Preview do Tablet</h3>
        <div className="border-8 border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl h-[500px] bg-white flex flex-col relative">
          <div className="h-6 bg-black flex justify-between items-center px-4 z-20">
            <span className="text-[10px] text-white">12:30</span>
            <div className="flex gap-1"><div className="w-3 h-3 bg-white rounded-full"></div></div>
          </div>
          <div style={{ backgroundColor: config.backgroundColor }} className="h-16 flex items-center justify-center z-20 shadow-md relative">
            {logoPreview ? <img src={logoPreview} className="h-10 object-contain" /> : <span className="text-white font-bold opacity-50">LOGO</span>}
          </div>
          <div className="flex-1 bg-gray-50 relative overflow-hidden">
            {activeTab === 'banners' && bannerToShow ? (
              <div className="absolute inset-0">
                <img src={`${BASE_IMG_URL}${bannerToShow.imageUrl}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                  <h4 className="text-white font-bold text-lg line-clamp-1">{getText(bannerToShow.title)}</h4>
                  <p className="text-white/80 text-xs line-clamp-2 mt-1">{getText(bannerToShow.description)}</p>
                  {bannerToShow.linkedProduct && (
                    <span className="inline-flex items-center gap-1 mt-2 bg-[#df0024] text-white text-[10px] font-bold px-2 py-1 rounded-full w-fit">
                      <ShoppingBag size={10} /> Comprar Agora
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="h-24 bg-white rounded-xl border border-gray-100 p-2 flex gap-2">
                  <div className="w-16 bg-gray-200 rounded-lg h-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-gray-200 w-3/4 rounded"></div>
                    <div className="h-2 bg-gray-100 w-1/2 rounded"></div>
                    <div style={{ backgroundColor: config.primaryColor }} className="w-12 h-5 rounded flex items-center justify-center text-[8px] text-white font-bold mt-auto">Ver</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div style={{ backgroundColor: config.backgroundColor }} className="h-12 flex justify-around items-center z-20 relative">
            <div className="w-6 h-6 bg-white/20 rounded-full"></div>
            <div style={{ backgroundColor: config.primaryColor }} className="w-10 h-10 rounded-full flex items-center justify-center -mt-4 border-4 border-white"><Check size={16} className="text-white" /></div>
            <div className="w-6 h-6 bg-white/20 rounded-full"></div>
          </div>
        </div>
        <p className="text-xs text-center mt-4 text-gray-400">{activeTab === 'banners' ? 'Modo Ocioso (Screensaver)' : 'Modo Cardápio'}</p>
      </div>
    );
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <ManagerLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personalização</h1>
            <p className="text-gray-500">Identidade visual e conteúdo do tablet.</p>
          </div>
          {/* Botão de Salvar Geral (Só aparece se não estiver na aba Banners) */}
          {activeTab !== 'banners' && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || saving}
              className="flex items-center gap-2 bg-[#df0024] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100 disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Alterações
            </button>
          )}
          {/* Botão Novo Banner (Só aparece na aba Banners) */}
          {activeTab === 'banners' && (
            <button
              onClick={() => setIsBannerModalOpen(true)}
              className="flex items-center gap-2 bg-[#df0024] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100"
            >
              <Plus size={20} /> Novo Banner
            </button>
          )}
        </div>

        <div className="flex gap-8 items-start">
          <div className="flex-1 w-full">

            {/* --- LOGO PERSISTENTE (FORA DAS TABS) --- */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon size={20} className="text-[#df0024]" /> Logotipo</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#df0024] transition-colors">
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                  {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain p-2" /> : <UploadCloud size={32} className="text-gray-400" />}
                </div>
                <div className="flex-1 text-sm text-gray-500"><p>Logotipo do restaurante (PNG Transparente). Exibido no topo do tablet e em materiais impressos.</p></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 inline-flex mb-6 w-full md:w-auto overflow-x-auto">
              <button onClick={() => setActiveTab('brand')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'brand' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Palette size={16} /> Identidade Visual
              </button>
              <button onClick={() => setActiveTab('content')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'content' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Info size={16} /> Conteúdo Institucional
              </button>
              <button onClick={() => setActiveTab('banners')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'banners' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Images size={16} /> Banners de Destaque
              </button>
            </div>

            {loading ? <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-[#df0024]" size={40} /></div> : (
              <div className="space-y-6">

                {/* --- ABA 1: MARCA --- */}
                {activeTab === 'brand' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Cores */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Palette size={20} className="text-[#df0024]" /> Cores</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cor Principal</label>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200"><input type="color" value={config.primaryColor} onChange={e => setConfig({ ...config, primaryColor: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" /></div>
                            <input type="text" value={config.primaryColor} onChange={e => setConfig({ ...config, primaryColor: e.target.value })} className="w-28 px-3 py-2 border rounded-lg uppercase font-mono text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200"><input type="color" value={config.backgroundColor} onChange={e => setConfig({ ...config, backgroundColor: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" /></div>
                            <input type="text" value={config.backgroundColor} onChange={e => setConfig({ ...config, backgroundColor: e.target.value })} className="w-28 px-3 py-2 border rounded-lg uppercase font-mono text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- ABA 2: CONTEÚDO --- */}
                {activeTab === 'content' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Textos */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Type size={20} className="text-[#df0024]" /> Textos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label className="block text-sm font-medium mb-1">Nome Comercial</label><input className="w-full px-4 py-2 border rounded-lg" value={config.publicTitle} onChange={e => setConfig({ ...config, publicTitle: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium mb-1">Título &quot;Sobre&quot;</label><input className="w-full px-4 py-2 border rounded-lg" value={config.aboutTitle} onChange={e => setConfig({ ...config, aboutTitle: e.target.value })} /></div>
                      </div>
                      <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Resumo</label><textarea className="w-full px-4 py-2 border rounded-lg h-20" value={config.aboutText} onChange={e => setConfig({ ...config, aboutText: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium mb-1">Nossa História</label><textarea className="w-full px-4 py-2 border rounded-lg h-28" value={config.ourHistory} onChange={e => setConfig({ ...config, ourHistory: e.target.value })} /></div>
                      </div>
                    </div>
                    {/* Uploads Institucionais */}
                    <div className="space-y-4">
                      <ImageUploadSection title="Banners Institucionais (Galeria)" fieldKey="institutionalBanners" currentImages={config.institutionalBanners} newFiles={files.institutionalBanners} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageUploadSection title="Imagem Grande (Sobre)" fieldKey="highlightImagesLarge" currentImages={config.highlightImagesLarge} newFiles={files.highlightImagesLarge} max={1} />
                        <ImageUploadSection title="Destaques Pequenos" fieldKey="highlightImagesSmall" currentImages={config.highlightImagesSmall} newFiles={files.highlightImagesSmall} max={2} />
                      </div>
                    </div>
                    {/* Wifi */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Wifi size={20} className="text-[#df0024]" /> Wi-Fi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input className="w-full px-4 py-2 border rounded-lg" placeholder="SSID" value={config.wifiSsid} onChange={e => setConfig({ ...config, wifiSsid: e.target.value })} />
                        <input className="w-full px-4 py-2 border rounded-lg" placeholder="Senha" value={config.wifiPassword} onChange={e => setConfig({ ...config, wifiPassword: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- ABA 3: BANNERS (NOVA VERSÃO COM CARDS RICOS) --- */}
                {activeTab === 'banners' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Banners de Destaque</h2>
                        <p className="text-sm text-gray-500">Screensavers com títulos, links e produtos.</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${banners.filter(b => !b.isAd).length >= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        {banners.filter(b => !b.isAd).length} / 5
                      </span>
                    </div>

                    {/* Lista de Banners (Estilo Card Rico) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {banners.filter(b => !b.isAd).map(banner => (
                        <div key={banner.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">

                          {/* Imagem */}
                          <div className="relative h-40 bg-gray-100 overflow-hidden">
                            <img src={`${BASE_IMG_URL}${banner.imageUrl}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {banner.isAd && (
                              <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                AD DO SISTEMA
                              </span>
                            )}
                            {!banner.isAd && (
                              <button
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                title="Excluir Banner"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>

                          {/* Detalhes */}
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 line-clamp-1">{getText(banner.title) || 'Sem Título'}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 flex-1">
                              {getText(banner.description) || 'Sem descrição...'}
                            </p>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                              {banner.linkedProduct ? (
                                <div className="flex items-center gap-2 text-xs font-medium text-[#df0024] bg-red-50 px-2 py-1.5 rounded">
                                  <LinkIcon size={14} />
                                  <span className="truncate max-w-[150px]">{getText(banner.linkedProduct.name)}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Sem link de produto</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Card Placeholder Vazio se não houver banners */}
                      {banners.length === 0 && (
                        <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">Nenhum banner configurado.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          <TabletPreview />

        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE SALVAMENTO */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Save className="text-[#df0024]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Salvar Alterações?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Isso atualizará a aparência do tablet e do cardápio digital imediatamente.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleSaveConfig();
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-[#df0024] rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-100"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO DE BANNER */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="bg-[#1f1c1d] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Images size={20} /> Novo Banner Destaque
              </h2>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBanner} className="p-6 space-y-5">

              {/* Upload Area */}
              <div className="relative h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-[#df0024] transition-colors group cursor-pointer flex flex-col items-center justify-center overflow-hidden">
                <input
                  type="file"
                  onChange={handleBannerImageChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                />
                {bannerPreview ? (
                  <img src={bannerPreview} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400 group-hover:text-[#df0024]">
                    <ImageIcon size={32} className="mx-auto mb-2" />
                    <span className="text-xs font-bold">CLIQUE PARA ENVIAR IMAGEM</span>
                    <p className="text-[10px] mt-1">Recomendado: 1920x1080px (Landscape)</p>
                  </div>
                )}
              </div>

              {/* Campos de Texto */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Type size={16} className="text-gray-400" /> Título do Banner
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Festival de Hambúrguer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#df0024] focus:border-[#df0024] outline-none"
                    value={bannerFormData.title}
                    onChange={e => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <AlignLeft size={16} className="text-gray-400" /> Descrição Curta
                  </label>
                  <textarea
                    placeholder="Ex: Aproveite 30% de desconto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#df0024] focus:border-[#df0024] outline-none h-20 resize-none"
                    value={bannerFormData.description}
                    onChange={e => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <LinkIcon size={16} className="text-gray-400" />
                    Associar Produto (Opcional)
                  </label>
                  <div className="relative">
                    <ShoppingBag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#df0024] focus:border-[#df0024] outline-none bg-white"
                      value={bannerFormData.linkedProductId}
                      onChange={e => setBannerFormData({ ...bannerFormData, linkedProductId: e.target.value })}
                    >
                      <option value="">Sem vínculo (Apenas Imagem)</option>
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          🔗 {prod.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingBanner}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#df0024] rounded-lg hover:bg-red-700 disabled:opacity-70"
                >
                  {uploadingBanner ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Salvar Banner
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </ManagerLayout>
  );
}