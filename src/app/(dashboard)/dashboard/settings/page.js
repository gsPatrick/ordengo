'use client';

import { useState, useEffect } from 'react';
import ManagerLayout from '../../../../components/ManagerLayout.js/ManagerLayout';
import { 
  Settings, 
  QrCode, 
  Users, 
  Plug, 
  Save,
  Loader2,
  Store,
  Coins
} from 'lucide-react';
import api from '@/lib/api';

// IMPORTANTE: Certifique-se que o caminho desses componentes está correto no seu projeto
import TablesTab from '../../../../components/settings/TablesTab';
import TeamTab from '../../../../components/settings/TeamTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Estado para Configurações Gerais
  const [generalData, setGeneralData] = useState({
    name: '',
    currency: 'BRL'
  });

  // 1. Carregar Dados Iniciais (Apenas Configs Gerais)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/settings');
        // O endpoint retorna os dados do restaurante na raiz do objeto data
        const { name, currency } = response.data.data;
        
        setGeneralData({
          name: name || '',
          currency: currency || 'BRL'
        });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (activeTab === 'general') {
      fetchData();
    }
  }, [activeTab]);

  // 2. Salvar Alterações Gerais
  const handleSaveGeneral = async () => {
    if (!generalData.name) return alert("O nome do estabelecimento é obrigatório.");

    setLoading(true);
    try {
      await api.patch('/settings/general', {
        name: generalData.name,
        currency: generalData.currency
      });
      
      alert('Informações atualizadas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500">Gerencie os dados do estabelecimento e recursos do sistema.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'general' ? 'border-[#df0024] text-[#df0024]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={18} /> Geral
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'tables' ? 'border-[#df0024] text-[#df0024]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <QrCode size={18} /> Mesas e QR
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'team' ? 'border-[#df0024] text-[#df0024]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={18} /> Equipe
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'integrations' ? 'border-[#df0024] text-[#df0024]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plug size={18} /> Integrações
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        <div className="min-h-[400px]">
          
          {/* --- ABA GERAL --- */}
          {activeTab === 'general' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {dataLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#df0024]" /></div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                  
                  <div className="border-b border-gray-100 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Store size={20} className="text-gray-400" />
                      Dados do Estabelecimento
                    </h3>
                    <p className="text-sm text-gray-500">Informações básicas visíveis no sistema.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Restaurante</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#df0024] focus:border-transparent outline-none"
                        value={generalData.name}
                        onChange={(e) => setGeneralData({...generalData, name: e.target.value})}
                        placeholder="Ex: Pizzaria do Luigi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Coins size={16} /> Moeda do Sistema
                      </label>
                      <select 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#df0024] focus:border-transparent outline-none bg-white"
                        value={generalData.currency}
                        onChange={(e) => setGeneralData({...generalData, currency: e.target.value})}
                      >
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="USD">Dólar Americano ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleSaveGeneral}
                      disabled={loading}
                      className="flex items-center gap-2 bg-[#df0024] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100 disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                      Salvar Alterações
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* --- ABA MESAS --- */}
          {activeTab === 'tables' && <TablesTab />}

          {/* --- ABA EQUIPE --- */}
          {activeTab === 'team' && <TeamTab />}

          {/* --- ABA INTEGRAÇÕES --- */}
          {activeTab === 'integrations' && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                <Plug size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Recurso Premium</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">
                A integração direta com sistemas PDV (Toast, Square, Oracle) está disponível apenas no plano Enterprise.
              </p>
              <button className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
                Falar Com Suporte 
              </button>
            </div>
          )}

        </div>
      </div>
    </ManagerLayout>
  );
}