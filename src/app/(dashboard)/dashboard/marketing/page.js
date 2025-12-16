'use client';

import { useState, useEffect } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { Plus, Trash2, MonitorPlay } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';

export default function MarketingPage() {
  const { restaurant } = useRestaurant();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (restaurant?.id) {
      loadAds();
    }
  }, [restaurant]);

  const loadAds = async () => {
    try {
      const response = await api.get(`/screensaver/client/${restaurant.id}`);
      setAds(response.data);
    } catch (error) {
      console.error('Erro ao carregar ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    if (!newImageUrl) return;

    setUploading(true);
    try {
      await api.post('/screensaver/client', {
        restaurantId: restaurant.id,
        imageUrl: newImageUrl,
        order: ads.length // Auto order
      });
      setNewImageUrl('');
      loadAds();
    } catch (error) {
      alert('Erro ao adicionar banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await api.delete(`/screensaver/client/${id}`);
      loadAds();
    } catch (error) {
      alert('Erro ao deletar');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MonitorPlay className="text-primary" />
          Descanso de Tela (Screensaver)
        </h1>
        <p className="text-gray-400 mt-2">
          Adicione imagens para aparecerem quando o tablet estiver ocioso.
          Seus banners serão intercalados com publicidade global conforme a configuração do plano.
        </p>
      </div>

      {/* Upload Simples (URL por enquanto mudaremos pra file dps se der tempo) */}
      <div className="bg-[#1f1c1d] p-6 rounded-xl border border-white/5 mb-8">
        <h2 className="text-lg font-semibold mb-4">Adicionar Novo Banner</h2>
        <form onSubmit={handleAddAd} className="flex gap-4">
          <input
            type="text"
            placeholder="URL da Imagem (Ex: https://...)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            required
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      </div>

      {/* Lista de Ads */}
      {loading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="group relative aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/10">
              <Image
                src={ad.imageUrl}
                alt="Banner"
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-transform hover:scale-110"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {ads.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white/5 rounded-xl border-dashed border-2 border-white/10">
              <MonitorPlay className="mx-auto text-gray-600 mb-2" size={48} />
              <p className="text-gray-400">Nenhum banner cadastrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}