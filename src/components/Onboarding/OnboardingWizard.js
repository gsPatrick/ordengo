'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, ArrowLeft, Check, Palette, 
  UploadCloud, Loader2, Store, Image as ImageIcon, 
  Megaphone, Wifi, Info, X, LayoutTemplate // <--- ADICIONADO AQUI
} from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

// --- COMPONENTES AUXILIARES ---

// Componente de Dica (Hand-holding)
const Tip = ({ text }) => (
  <div className="flex items-start gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs mt-1 border border-blue-100">
    <Info size={14} className="mt-0.5 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

// Componente de Upload Bonito
const FileUpload = ({ label, onChange, preview, multiple = false, helperText }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-gray-700">{label}</label>
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-white hover:border-[#df0024] transition-all cursor-pointer relative group min-h-[120px] flex flex-col items-center justify-center text-center">
      <input 
        type="file" 
        accept="image/*" 
        multiple={multiple} 
        onChange={onChange} 
        className="absolute inset-0 opacity-0 z-20 cursor-pointer" 
      />
      
      {preview ? (
        <div className="relative w-full h-32">
           {/* Se for array de previews ou string unica */}
           {Array.isArray(preview) ? (
             <div className="flex gap-2 overflow-x-auto h-full items-center justify-center px-2">
                {preview.map((src, i) => (
                  <img key={i} src={src} className="h-full w-auto object-cover rounded-lg shadow-sm" />
                ))}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs rounded-xl z-10 pointer-events-none">
                  Alterar Imagens
                </div>
             </div>
           ) : (
             <>
                <img src={preview} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs rounded-xl z-10 pointer-events-none">
                  Alterar Imagem
                </div>
             </>
           )}
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-400 group-hover:text-[#df0024] transition-colors">
          <UploadCloud size={32} className="mb-2" />
          <span className="text-sm font-medium">Clique ou arraste</span>
          {helperText && <span className="text-[10px] mt-1 text-gray-400">{helperText}</span>}
        </div>
      )}
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function OnboardingWizard({ onComplete }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estado Completo dos Dados
  const [formData, setFormData] = useState({
    // Passo 1: Aparência
    logoFile: null,
    logoPreview: null,
    primaryColor: '#df0024',
    backgroundColor: '#1f1c1d',
    
    // Passo 2: Institucional
    publicTitle: '',      // Nome Comercial
    aboutTitle: 'Sobre Nós',
    aboutText: '',        // Resumo
    ourHistory: '',       // Nossa História Completa
    wifiSsid: '',
    wifiPassword: '',
    
    // Imagens Institucionais
    institutionalBanners: [], // Galeria (Array de Files)
    institutionalPreviews: [],
    highlightImageLarge: null, // Imagem Grande (Sobre)
    highlightLargePreview: null,
    highlightImagesSmall: [], // Destaques Pequenos (Array)
    highlightSmallPreviews: [],

    // Passo 3: Marketing
    promoBanners: [] // Array de objetos { title, description, file, preview }
  });

  // --- HANDLERS DE ARQUIVO ---
  
  const handleSingleFile = (e, field) => {
    const file = e.target.files[0];
    if(file) {
      setFormData(prev => ({
        ...prev,
        [field]: file,
        [`${field === 'highlightImageLarge' ? 'highlightLargePreview' : field === 'logoFile' ? 'logoPreview' : 'preview'}`]: URL.createObjectURL(file)
      }));
      // Ajuste fino para nomes de preview
      if(field === 'logoFile') setFormData(prev => ({...prev, logoPreview: URL.createObjectURL(file)}));
      if(field === 'highlightImageLarge') setFormData(prev => ({...prev, highlightLargePreview: URL.createObjectURL(file)}));
    }
  };

  const handleMultipleFiles = (e, fieldName, previewName) => {
    const files = Array.from(e.target.files);
    if(files.length > 0) {
      const previews = files.map(f => URL.createObjectURL(f));
      setFormData(prev => ({
        ...prev,
        [fieldName]: files,
        [previewName]: previews
      }));
    }
  };

  // --- MARKETING HANDLERS ---
  const [tempBanner, setTempBanner] = useState({ title: '', description: '', file: null, preview: null });

  const addPromoBanner = () => {
    if(!tempBanner.file || !tempBanner.title) return alert("Imagem e Título são obrigatórios.");
    
    setFormData(prev => ({
      ...prev,
      promoBanners: [...prev.promoBanners, tempBanner]
    }));
    setTempBanner({ title: '', description: '', file: null, preview: null });
  };

  const removePromoBanner = (idx) => {
    setFormData(prev => ({
      ...prev,
      promoBanners: prev.promoBanners.filter((_, i) => i !== idx)
    }));
  };

  // --- SUBMISSÃO ---
  const handleNext = async () => {
    if (step === 3) await submitAll();
    else setStep(prev => prev + 1);
  };

  const submitAll = async () => {
    if(formData.promoBanners.length === 0) return alert("Adicione pelo menos 1 Banner de Destaque.");
    
    setLoading(true);
    try {
      // 1. Atualizar Geral (Moeda)
      // (Esta rota aceita JSON normal)
      await api.patch('/settings/general', { currency: 'BRL' }); // Assumindo padrão ou pegando do state se tivesse select

      // 2. Upload Logo (CORREÇÃO AQUI: Adicionado header multipart)
      if(formData.logoFile) {
        const ld = new FormData();
        ld.append('logo', formData.logoFile);
        await api.post('/settings/logo', ld, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Aparência e Institucional
      const ad = new FormData();
      ad.append('primaryColor', formData.primaryColor);
      ad.append('backgroundColor', formData.backgroundColor);
      
      // Textos (JSON Stringified)
      ad.append('publicTitle', JSON.stringify({ pt: formData.publicTitle }));
      ad.append('aboutTitle', JSON.stringify({ pt: formData.aboutTitle }));
      ad.append('aboutText', JSON.stringify({ pt: formData.aboutText }));
      ad.append('ourHistory', JSON.stringify({ pt: formData.ourHistory }));
      
      // Wifi
      if(formData.wifiSsid) ad.append('wifiSsid', formData.wifiSsid);
      if(formData.wifiPassword) ad.append('wifiPassword', formData.wifiPassword);

      // Imagens Institucionais
      if(formData.institutionalBanners.length) {
        formData.institutionalBanners.forEach(f => ad.append('institutionalBanners', f));
      }
      if(formData.highlightImageLarge) {
        ad.append('highlightImagesLarge', formData.highlightImageLarge); // Campo 'upload.fields' espera esse nome
      }
      if(formData.highlightImagesSmall.length) {
        formData.highlightImagesSmall.forEach(f => ad.append('highlightImagesSmall', f));
      }

      await api.patch('/settings/appearance', ad, { headers: {'Content-Type': 'multipart/form-data'} });

      // 4. Banners Marketing
      const promises = formData.promoBanners.map(b => {
        const bd = new FormData();
        bd.append('image', b.file);
        bd.append('title', JSON.stringify({ pt: b.title }));
        bd.append('description', JSON.stringify({ pt: b.description }));
        return api.post('/marketing/screensavers', bd, { headers: {'Content-Type': 'multipart/form-data'} });
      });
      await Promise.all(promises);

      // 5. Finalizar
      await api.post('/settings/onboarding/complete');

      // Cookie Update
      const userCookie = Cookies.get('ordengo_user');
      if(userCookie) {
        const u = JSON.parse(userCookie);
        u.Restaurant.isOnboardingCompleted = true;
        Cookies.set('ordengo_user', JSON.stringify(u), { expires: 1 });
      }

      onComplete();
      router.push('/dashboard/menu');

    } catch (error) {
      console.error("Erro completo no onboarding:", error);
      const msg = error.response?.data?.message || "Erro ao salvar. Verifique os dados.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 transition-all duration-500">
      
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex h-[90vh] relative">
        
        {/* --- SIDEBAR STEPS --- */}
        <div className="w-72 bg-gray-50 border-r border-gray-100 p-8 flex flex-col hidden md:flex">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-[#df0024] font-bold text-xl mb-2">
              <Store size={24} /> OrdenGo
            </div>
            <p className="text-gray-400 text-xs">Setup Inicial</p>
          </div>

          <div className="space-y-1 relative">
            {/* Linha conectora */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>
            
            {[
              { id: 1, label: 'Aparência', icon: Palette, desc: 'Cores e Logo' },
              { id: 2, label: 'Institucional', icon: Store, desc: 'História e Infos' },
              { id: 3, label: 'Destaques', icon: Megaphone, desc: 'Banners Promocionais' }
            ].map((s) => (
              <div key={s.id} className="relative z-10 flex items-start gap-4 py-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step === s.id ? 'bg-[#df0024] border-[#df0024] text-white shadow-lg scale-110' : step > s.id ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <div>
                  <p className={`font-bold text-sm transition-colors ${step === s.id ? 'text-gray-900' : 'text-gray-500'}`}>{s.label}</p>
                  <p className="text-[10px] text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="flex-1 flex flex-col h-full relative">
          
          {/* Header Mobile/Content */}
          <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-20">
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 && "Identidade Visual"}
              {step === 2 && "Conteúdo Institucional"}
              {step === 3 && "Banners de Destaque"}
            </h1>
            <div className="text-sm text-gray-400">Passo {step} de 3</div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 bg-white">
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode='wait'>
                
                {/* ===== PASSO 1: APARÊNCIA ===== */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                    
                    {/* Seção Logo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="col-span-1">
                        <FileUpload 
                          label="Logotipo do Restaurante" 
                          onChange={e => handleSingleFile(e, 'logoFile')} 
                          preview={formData.logoPreview}
                          helperText="PNG com fundo transparente"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 mb-2">Por que a logo é importante?</h3>
                        <p className="text-gray-500 text-sm mb-4">Ela aparecerá no cabeçalho de todos os tablets e na tela de bloqueio. Use uma imagem de alta qualidade.</p>
                        <Tip text="Recomendamos formato quadrado ou horizontal (3:2)." />
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Seção Cores */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Palette size={20} className="text-[#df0024]" /> Cores do Sistema
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Cor Principal (Destaques e Botões)</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="w-12 h-12 rounded-xl border-0 cursor-pointer shadow-sm" />
                            <span className="font-mono text-gray-500 bg-gray-50 px-3 py-1 rounded border">{formData.primaryColor}</span>
                          </div>
                          <Tip text="Escolha uma cor vibrante que contraste com o fundo." />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Cor de Fundo (Tema)</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={formData.backgroundColor} onChange={e => setFormData({...formData, backgroundColor: e.target.value})} className="w-12 h-12 rounded-xl border-0 cursor-pointer shadow-sm" />
                            <span className="font-mono text-gray-500 bg-gray-50 px-3 py-1 rounded border">{formData.backgroundColor}</span>
                          </div>
                          <Tip text="Cores escuras (#1f1c1d) economizam bateria e são modernas." />
                        </div>
                      </div>

                      {/* Live Preview */}
                      <div className="mt-8 p-6 rounded-2xl border border-gray-200 shadow-sm transition-colors duration-300" style={{ backgroundColor: formData.backgroundColor }}>
                        <p className="text-xs font-bold uppercase mb-4" style={{ color: formData.backgroundColor === '#ffffff' ? '#333' : '#888' }}>Preview em Tempo Real</p>
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
                          <button 
                            className="px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-all"
                            style={{ backgroundColor: formData.primaryColor }}
                          >
                            Adicionar ao Pedido
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ===== PASSO 2: INSTITUCIONAL ===== */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    
                    {/* Dados Básicos */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Comercial</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-[#df0024]" placeholder="Ex: Pizzaria do Luigi" value={formData.publicTitle} onChange={e => setFormData({...formData, publicTitle: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título da Aba "Sobre"</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-[#df0024]" value={formData.aboutTitle} onChange={e => setFormData({...formData, aboutTitle: e.target.value})} />
                      </div>
                    </div>

                    {/* Textos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Resumo Curto</label>
                        <textarea className="w-full px-4 py-2 border rounded-lg h-32 resize-none focus:ring-[#df0024]" placeholder="Texto introdutório curto..." value={formData.aboutText} onChange={e => setFormData({...formData, aboutText: e.target.value})} />
                        <Tip text="Aparece logo abaixo do título na aba Sobre." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nossa História (Completa)</label>
                        <textarea className="w-full px-4 py-2 border rounded-lg h-32 resize-none focus:ring-[#df0024]" placeholder="Conte toda a trajetória..." value={formData.ourHistory} onChange={e => setFormData({...formData, ourHistory: e.target.value})} />
                      </div>
                    </div>

                    {/* Imagens */}
                    <div className="space-y-6 border-t border-gray-100 pt-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2"><ImageIcon size={20} /> Galeria Institucional</h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FileUpload 
                          label="Banner Institucional (Galeria)" 
                          multiple={true}
                          onChange={e => handleMultipleFiles(e, 'institutionalBanners', 'institutionalPreviews')} 
                          preview={formData.institutionalPreviews}
                          helperText="Fotos do ambiente (Carrossel)"
                        />
                        <FileUpload 
                          label="Imagem Grande (Corpo)" 
                          onChange={e => handleSingleFile(e, 'highlightImageLarge')} 
                          preview={formData.highlightLargePreview}
                          helperText="Foto vertical ou destaque"
                        />
                        <FileUpload 
                          label="Destaques Pequenos (2 un)" 
                          multiple={true}
                          onChange={e => handleMultipleFiles(e, 'highlightImagesSmall', 'highlightSmallPreviews')} 
                          preview={formData.highlightSmallPreviews}
                          helperText="Detalhes ou pratos"
                        />
                      </div>
                    </div>

                    {/* WiFi */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
                      <div className="bg-white p-3 rounded-full shadow-sm"><Wifi size={20} className="text-blue-500" /></div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Nome do Wi-Fi (SSID)" className="bg-white border px-3 py-2 rounded-lg text-sm" value={formData.wifiSsid} onChange={e => setFormData({...formData, wifiSsid: e.target.value})} />
                        <input type="text" placeholder="Senha do Wi-Fi" className="bg-white border px-3 py-2 rounded-lg text-sm" value={formData.wifiPassword} onChange={e => setFormData({...formData, wifiPassword: e.target.value})} />
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* ===== PASSO 3: MARKETING (BANNERS) ===== */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 h-full flex flex-col">
                    
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3">
                      <Megaphone className="text-yellow-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-yellow-800 text-sm">Screensaver / Proteção de Tela</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                          Esses banners ficam rodando na tela quando o tablet não está em uso. Adicione pelo menos 1 banner impactante. Você pode adicionar até 5.
                        </p>
                      </div>
                    </div>

                    {/* Form de Adição */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="grid grid-cols-[120px_1fr] gap-6">
                        {/* Upload Único para o Banner Atual */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-[#df0024] relative bg-gray-50 group">
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => {
                             if(e.target.files[0]) setTempBanner({...tempBanner, file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0])})
                          }} />
                          {tempBanner.preview ? (
                            <img src={tempBanner.preview} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-xs text-gray-400 text-center px-2">Img (1920x1080)</span>
                          )}
                        </div>

                        <div className="space-y-3">
                          <input 
                            type="text" 
                            placeholder="Título do Banner (Ex: Happy Hour)" 
                            className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-[#df0024]"
                            value={tempBanner.title}
                            onChange={e => setTempBanner({...tempBanner, title: e.target.value})}
                          />
                          <input 
                            type="text" 
                            placeholder="Descrição curta (Opcional)" 
                            className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-[#df0024]"
                            value={tempBanner.description}
                            onChange={e => setTempBanner({...tempBanner, description: e.target.value})}
                          />
                          <div className="flex justify-end">
                            <button 
                              onClick={addPromoBanner}
                              disabled={!tempBanner.file || !tempBanner.title}
                              className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50"
                            >
                              + Adicionar à Lista
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Banners Adicionados */}
                    <div className="flex-1 overflow-y-auto">
                      <h4 className="font-bold text-sm text-gray-500 uppercase mb-3">Banners Prontos para Salvar ({formData.promoBanners.length}/5)</h4>
                      
                      {formData.promoBanners.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
                          <LayoutTemplate className="mx-auto text-gray-200 mb-2" size={40} />
                          <p className="text-gray-400 text-sm">Nenhum banner adicionado ainda.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formData.promoBanners.map((banner, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                              <img src={banner.preview} className="w-16 h-10 object-cover rounded-lg bg-gray-100" />
                              <div className="flex-1">
                                <p className="font-bold text-sm text-gray-900">{banner.title}</p>
                                <p className="text-xs text-gray-500">{banner.description || 'Sem descrição'}</p>
                              </div>
                              <button onClick={() => removePromoBanner(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* --- FOOTER --- */}
          <div className="bg-white border-t border-gray-200 px-10 py-6 flex justify-between items-center z-20">
            <button 
              onClick={() => setStep(step - 1)} 
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium px-4 py-2 ${step === 1 ? 'opacity-0 cursor-default' : ''}`}
            >
              <ArrowLeft size={18} /> Voltar
            </button>

            <button 
              onClick={handleNext}
              disabled={loading}
              className="bg-[#df0024] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-3 shadow-lg shadow-red-100 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {step === 3 ? 'Finalizar Setup' : 'Próximo Passo'} 
                  {step < 3 && <ArrowRight size={18} />}
                  {step === 3 && <Check size={18} />}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}