// src/app/admin/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Store, 
  CreditCard, 
  Activity 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';

// Cores para o gráfico de Pizza
const COLORS = ['#df0024', '#1f1c1d', '#9ca3af'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await api.get('/dashboard/superadmin');
        setStats(response.data.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Helper para formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados formatados para o gráfico (transforma objeto plans em array)
  const planData = stats ? [
    { name: 'Básico', value: stats.plans.basic || 0 },
    { name: 'Premium', value: stats.plans.premium || 0 },
    { name: 'Enterprise', value: stats.plans.enterprise || 0 },
  ] : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#df0024]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header da Página */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral do SaaS</h1>
          <p className="text-gray-500 mt-1">Acompanhe o desempenho global da plataforma OrdenGo.</p>
        </div>

        {/* Grid de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Restaurantes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Restaurantes</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.tenants.total}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Store size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <TrendingUp size={16} className="mr-1" />
                +{stats?.tenants.newLast30Days}
              </span>
              <span className="text-gray-400 ml-2">nos últimos 30 dias</span>
            </div>
          </div>

          {/* Card 2: Ativos vs Inativos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Restaurantes Ativos</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.tenants.active}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <Activity size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium text-red-500">{stats?.tenants.inactive}</span> bloqueados/inativos
            </div>
          </div>

          {/* Card 3: Volume Transacionado */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Volume Global (GMV)</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.financial.globalGMV)}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <CreditCard size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Total transacionado na plataforma
            </div>
          </div>

          {/* Card 4: Planos Totais */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Assinaturas Ativas</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.tenants.active}</h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-orange-500 h-1.5 rounded-full" 
                style={{ width: `${(stats?.tenants.active / stats?.tenants.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Seção de Gráficos e Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráfico de Distribuição de Planos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Planos</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'Restaurantes']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card de Ações Rápidas ou Lista Recente (Placeholder) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Status do Sistema</h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Todos os sistemas operacionais
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-gray-700">API Server</span>
                </div>
                <span className="text-sm text-gray-500">Online (v1.0)</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-gray-700">Banco de Dados (PostgreSQL)</span>
                </div>
                <span className="text-sm text-gray-500">Conectado</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-gray-700">Socket.io (Real-time)</span>
                </div>
                <span className="text-sm text-gray-500">Ativo</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ações Rápidas</h4>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.location.href = '/admin/tenants'}
                  className="px-4 py-2 bg-[#df0024] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Adicionar Restaurante
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/ads'}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Criar Publicidade
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}