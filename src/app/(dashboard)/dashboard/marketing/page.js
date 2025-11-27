'use client';

import { useState, useEffect } from 'react';
import ManagerLayout from '../../../../components/ManagerLayout.js/ManagerLayout';
import { 
  Megaphone, 
  Image as ImageIcon, 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  Loader2, 
  Power,
  UploadCloud,
  Percent,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';
import PromotionForm from '../../../../components/marketing/PromotionForm';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('promotions'); // 'promotions' | 'screensavers'
  const [loading, setLoading] = useState(true);
  
  // Dados
  const [promotions, setPromotions] = useState([]);
  const [screensavers, setScreensavers] = useState([]);

  // Estados de Modal/Upload
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promoRes, screenRes] = await Promise.all([
        api.get('/marketing/promotions'),
        api.get('/marketing/screensavers') // Rota interna do gerente
      ]);
      setPromotions(promoRes.data.data.promotions);
      setScreensavers(screenRes.data.data.banners);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- AÇÕES DE PROMOÇÃO ---
  const handleTogglePromotion = async (id) => {
    try {
      // Atualização otimista na UI
      setPromotions(prev => prev.map(p => 
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ));
      await api.patch(`/marketing/promotions/${id}/toggle`);
    } catch (error) {
      alert('Erro ao alterar status da promoção.');
      fetchData(); // Reverte
    }
  };

  const handleClosePromoModal = (shouldRefresh) => {
    setIsPromoModalOpen(false);
    if (shouldRefresh) fetchData();
  };

  // --- AÇÕES DE SCREENSAVER ---
  const handleUploadScreensaver = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', 'Banner Interno'); // Opcional

    try {
      await api.post('/marketing/screensavers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
    } catch (error) {
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteScreensaver = async (id) => {
    if (!confirm('Tem certeza que deseja remover este banner?')) return;
    try {
      await api.delete(`/marketing/screensavers/${id}`);
      setScreensavers(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      alert('Erro ao deletar banner.');
    }
  };

  // Helper para dias da semana
  const formatDays = (daysArray) => {
    if (daysArray.length === 7) return 'Todos os dias';
    const map = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return daysArray.map(d => map[d]).join(', ');
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing e Promoções</h1>
          <p className="text-gray-500">Gerencie ofertas especiais e o que aparece nas telas ociosas.</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'promotions' 
                  ? 'border-[#df0024] text-[#df0024]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Megaphone size={18} /> Ofertas (Promoções)
            </button>
            <button
              onClick={() => setActiveTab('screensavers')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'screensavers' 
                  ? 'border-[#df0024] text-[#df0024]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ImageIcon size={18} /> Proteção de Tela
            </button>
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-[#df0024]" size={40} />
            </div>
          ) : (
            <>
              {/* --- ABA PROMOÇÕES --- */}
              {activeTab === 'promotions' && (
                <div className="space-y-6">
                  
                  {/* Botão Criar */}
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setIsPromoModalOpen(true)}
                      className="flex items-center gap-2 bg-[#df0024] text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-shadow shadow-md shadow-red-100"
                    >
                      <Plus size={20} /> Criar Nova Oferta
                    </button>
                  </div>

                  {promotions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                      <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">Nenhuma promoção ativa.</p>
                      <p className="text-sm text-gray-400">Crie ofertas como "Happy Hour" para atrair clientes.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {promotions.map((promo) => (
                        <div key={promo.id} className={`group bg-white rounded-xl border transition-all duration-300 overflow-hidden flex flex-col ${promo.isActive ? 'border-gray-200 shadow-sm hover:shadow-md' : 'border-gray-100 opacity-75 grayscale'}`}>
                          
                          {/* Imagem do Banner da Promoção */}
                          <div className="relative h-40 bg-gray-100 overflow-hidden">
                            {promo.imageUrl ? (
                              <img 
                                src={`https://geral-ordengoapi.r954jc.easypanel.host${promo.imageUrl}`} 
                                alt={promo.title.pt} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-red-50">
                                <Megaphone size={32} className="text-red-200" />
                              </div>
                            )}
                            
                            {/* Badge de Desconto */}
                            <div className="absolute top-3 right-3 bg-[#df0024] text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                              {promo.discountType === 'percentage' ? <Percent size={12} /> : <DollarSign size={12} />}
                              {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `- R$ ${promo.discountValue}`}
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{promo.title.pt || 'Sem Título'}</h3>
                              <button 
                                onClick={() => handleTogglePromotion(promo.id)}
                                className={`p-1 rounded-full transition-colors ${promo.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={promo.isActive ? "Pausar Promoção" : "Ativar Promoção"}
                              >
                                <Power size={20} />
                              </button>
                            </div>

                            <div className="space-y-3 mt-2">
                              <div className="flex items-start gap-2 text-sm text-gray-600">
                                <Calendar size={16} className="text-[#df0024] mt-0.5" />
                                <span className="line-clamp-2 leading-tight">{formatDays(promo.activeDays)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock size={16} className="text-[#df0024]" />
                                <span>{promo.startTime.slice(0,5)} às {promo.endTime.slice(0,5)}</span>
                              </div>
                            </div>

                            <div className="mt-auto pt-4 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${promo.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                {promo.isActive ? 'Ativa Agora' : 'Pausada'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- ABA SCREENSAVERS --- */}
              {activeTab === 'screensavers' && (
                <div className="space-y-6">
                  
                  {/* Upload Area */}
                  <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 hover:border-[#df0024] transition-colors group cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadScreensaver}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      {uploading ? (
                        <Loader2 className="animate-spin text-[#df0024] mb-2" size={32} />
                      ) : (
                        <UploadCloud className="text-gray-400 group-hover:text-[#df0024] mb-2 transition-colors" size={32} />
                      )}
                      <h3 className="text-sm font-bold text-gray-900">Clique para adicionar um Banner</h3>
                      <p className="text-xs text-gray-500 mt-1">Recomendado: 1920x1080px (Landscape)</p>
                    </div>
                  </div>

                  {/* Grid de Imagens */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {screensavers.map((banner) => (
                      <div key={banner.id} className="group relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img 
                          src={`https://geral-ordengoapi.r954jc.easypanel.host${banner.imageUrl}`} 
                          alt="Screensaver"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay de Ação */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => handleDeleteScreensaver(banner.id)}
                            className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-transform hover:scale-110"
                            title="Remover Banner"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        {/* Badge Interno vs Ad */}
                        <div className="absolute top-2 left-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${banner.isAd ? 'bg-blue-500 text-white' : 'bg-[#df0024] text-white'}`}>
                            {banner.isAd ? 'AD (Sistema)' : 'Restaurante'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {screensavers.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">Nenhum banner cadastrado. O tablet mostrará apenas o logo.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Promoção */}
      {isPromoModalOpen && (
        <PromotionForm onClose={handleClosePromoModal} />
      )}

    </ManagerLayout>
  );
}