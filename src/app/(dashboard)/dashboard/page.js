'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  Users, 
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '@/lib/api';
import ManagerLayout from '../../../components/ManagerLayout.js/ManagerLayout';
import DateRangeFilter from '../../../components/DateRangeFilter'; // Componente criado anteriormente

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função central de carregamento
  // Se receber datas, filtra estatísticas. Mesas são sempre "Ao Vivo".
  const fetchData = async ({ startDate, endDate } = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // 1. Carregar Estatísticas de Vendas (Com Filtro)
      const statsRes = await api.get('/dashboard/manager', { params });
      setStats(statsRes.data.data);

      // 2. Carregar Status das Mesas (Sempre Atual/Live)
      const tablesRes = await api.get('/tables');
      setTables(tablesRes.data.data.tables);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega inicial (sem filtros = padrão do backend, geralmente Hoje)
  useEffect(() => {
    fetchData();
    
    // Polling apenas para as mesas (Live Status) a cada 30s
    // Nota: Para ser perfeito, deveria separar a chamada das mesas em um useEffect separado
    // mas aqui simplificamos mantendo a estrutura.
  }, []);

  // Helper de Moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Processamento dos dados das mesas para o "Raio-X"
  const tableStats = {
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    calling: tables.filter(t => t.status === 'calling' || t.status === 'closing').length, 
    total: tables.length
  };

  // Formatação do gráfico de horas
  const chartData = stats?.charts?.salesByHour?.map(item => ({
    hour: new Date(item.hour).getHours() + 'h',
    vendas: item.total
  })) || [];

  return (
    <ManagerLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER + FILTRO */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
            <p className="text-gray-500">Acompanhamento de vendas e operação.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status da Loja */}
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-2 h-9">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              LOJA ABERTA
            </span>
            
            {/* Filtro de Data */}
            <DateRangeFilter onFilterChange={(f) => fetchData({ startDate: f.start, endDate: f.end })} />
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-[#df0024]">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p className="text-sm font-medium text-gray-500">Atualizando indicadores...</p>
          </div>
        ) : (
          <>
            {/* 1. Métricas do Período */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Faturamento */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Faturamento</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {formatCurrency(stats?.summary.totalSales)}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              {/* Pedidos */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pedidos Realizados</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stats?.summary.totalOrders}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <ShoppingBag size={24} />
                  </div>
                </div>
              </div>

              {/* Ticket Médio */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Ticket Médio</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {formatCurrency(stats?.summary.averageTicket)}
                    </h3>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                    <Receipt size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 2. Gráfico de Vendas por Hora */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={20} className="text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">Volume de Vendas</h3>
                </div>
                
                <div className="h-72">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#df0024" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#df0024" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="hour" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#9ca3af', fontSize: 12}}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#9ca3af', fontSize: 12}}
                          tickFormatter={(value) => `R$${value}`}
                        />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="vendas" 
                          stroke="#df0024" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorVendas)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <Clock size={40} className="mb-2 opacity-20" />
                      <p>Sem vendas registradas neste período.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Status e Ranking */}
              <div className="space-y-6">
                
                {/* Status Mesas (Sempre Ao Vivo) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users size={20} className="text-gray-400" />
                    Ocupação (Agora)
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                      <span className="text-green-700 font-medium">Mesas Livres</span>
                      <span className="text-2xl font-bold text-green-700">{tableStats.free}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="text-blue-700 font-medium">Ocupadas</span>
                      <span className="text-2xl font-bold text-blue-700">{tableStats.occupied}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 animate-pulse">
                      <span className="text-red-700 font-medium">Chamando / Conta</span>
                      <span className="text-2xl font-bold text-red-700">{tableStats.calling}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
                    Total de {tableStats.total} mesas cadastradas
                  </div>
                </div>

                {/* 4. Ranking Top Produtos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Mais Vendidos</h3>
                  <div className="space-y-3">
                    {stats?.ranking?.length > 0 ? (
                      stats.ranking.map((prod, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className={`
                              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                              ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                index === 1 ? 'bg-gray-100 text-gray-700' : 
                                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-500 border border-gray-200'}
                            `}>
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-700 truncate max-w-[120px]" title={prod.name}>
                              {typeof prod.name === 'object' ? prod.name.pt : prod.name}
                            </span>
                          </div>
                          <span className="text-gray-500 font-mono">{prod.quantity} un.</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">Sem vendas neste período</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </ManagerLayout>
  );
}