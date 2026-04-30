'use client';

import { useState, useEffect } from 'react';
import ManagerLayout from '../../../../components/ManagerLayout.js/ManagerLayout';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Utensils, 
  User, 
  Music, 
  Armchair,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import api from '@/lib/api';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'comments'
  const [loading, setLoading] = useState(true);
  
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);

  // 1. Carregar Dados
  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, listRes] = await Promise.all([
        api.get('/feedback/summary'),
        api.get('/feedback')
      ]);
      setSummary(summaryRes.data.data.stats);
      setReviews(listRes.data.data.reviews);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper para renderizar estrelas
  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={size} 
            className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
          />
        ))}
      </div>
    );
  };

  // Ícones para categorias de avaliação
  const categoryIcons = {
    food: { icon: Utensils, label: 'Comida', color: 'text-orange-500', bg: 'bg-orange-50' },
    service: { icon: User, label: 'Atendimento', color: 'text-blue-500', bg: 'bg-blue-50' },
    ambience: { icon: Armchair, label: 'Ambiente', color: 'text-purple-500', bg: 'bg-purple-50' },
    music: { icon: Music, label: 'Música', color: 'text-pink-500', bg: 'bg-pink-50' }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-500">Monitore o feedback enviado pelos clientes via tablet.</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'summary' 
                  ? 'border-[#df0024] text-[#df0024]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp size={18} /> Resumo de Métricas
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'comments' 
                  ? 'border-[#df0024] text-[#df0024]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare size={18} /> Comentários ({reviews.length})
            </button>
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#df0024]"></div>
            </div>
          ) : (
            <>
              {/* --- ABA 1: RESUMO --- */}
              {activeTab === 'summary' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Card Principal: Nota Geral */}
                  <div className="bg-gradient-to-r from-[#1f1c1d] to-[#3a3637] rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <span className="text-5xl font-bold">{summary?.averageGlobal || '0.0'}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Média Geral</h3>
                        <p className="text-gray-400">Baseada em {summary?.totalReviews || 0} avaliações</p>
                        <div className="mt-2">
                          {renderStars(Math.round(summary?.averageGlobal || 0), 20)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-16 w-px bg-white/10 hidden md:block"></div>

                    {/* Mini Stats */}
                    <div className="flex gap-8 text-center">
                      <div>
                        <p className="text-3xl font-bold text-[#df0024]">
                          {summary?.totalReviews > 0 
                            ? Math.round((summary?.averageByCategory?.food / 5) * 100) 
                            : 0}%
                        </p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Aprovação</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-green-500">
                          {summary?.totalReviews}
                        </p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Feedbacks</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Categorias */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Desempenho por Categoria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {Object.keys(categoryIcons).map((key) => {
                        const config = categoryIcons[key];
                        const rating = parseFloat(summary?.averageByCategory?.[key] || 0);
                        
                        return (
                          <div key={key} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-lg ${config.bg} ${config.color}`}>
                                <config.icon size={24} />
                              </div>
                              <span className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</span>
                            </div>
                            <h4 className="font-bold text-gray-700 mb-2">{config.label}</h4>
                            
                            {/* Barra de Progresso Custom */}
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  rating >= 4.5 ? 'bg-green-500' : rating >= 3 ? 'bg-yellow-400' : 'bg-red-500'
                                }`} 
                                style={{ width: `${(rating / 5) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Ruim</span>
                              <span>Excelente</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* --- ABA 2: COMENTÁRIOS --- */}
              {activeTab === 'comments' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">Nenhum comentário recebido ainda.</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#df0024]/30 transition-colors">
                        
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                          {/* Cabeçalho do Card */}
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                              {review.clientName ? review.clientName.charAt(0).toUpperCase() : <User size={20} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {review.clientName || 'Cliente Anônimo'}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                                  <MapPin size={12} />
                                  Mesa {review.Table?.number || '?'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {new Date(review.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Nota Geral do Card */}
                          <div className="flex flex-col items-end">
                            <div className="bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100 flex items-center gap-2">
                              <span className="text-sm font-bold text-yellow-700">{review.ratingGlobal.toFixed(1)}</span>
                              {renderStars(review.ratingGlobal, 14)}
                            </div>
                          </div>
                        </div>

                        {/* Comentário Texto */}
                        {review.comment ? (
                          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm italic border-l-4 border-[#df0024]">
                            &quot;{review.comment}&quot;
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Sem comentário escrito.</p>
                        )}

                        {/* Detalhes das Notas Específicas (Mini Chips) */}
                        {review.ratings && Object.keys(review.ratings).length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {Object.entries(review.ratings).map(([key, val]) => {
                              const config = categoryIcons[key];
                              if (!config) return null;
                              return (
                                <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600">
                                  <config.icon size={12} className={config.color} />
                                  {config.label}: <strong>{val}</strong>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Contato (se houver) */}
                        {review.contactInfo && (review.contactInfo.email || review.contactInfo.phone) && (
                          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex gap-4">
                            {review.contactInfo.email && <span>Email: {review.contactInfo.email}</span>}
                            {review.contactInfo.phone && <span>Tel: {review.contactInfo.phone}</span>}
                          </div>
                        )}

                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}