// src/app/admin/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Store, 
  CreditCard, 
  Activity,
  DollarSign,
  Ticket,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const COLORS = ['#df0024', '#7c3aed', '#3b82f6', '#10b981', '#f59e0b'];

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const planData = (stats && stats.plans) ? Object.entries(stats.plans).map(([name, value]) => ({
    name, value
  })) : [];

  // Mock data para o gráfico de tendência (MRR)
  const mrrTrend = [
    { month: 'Jan', value: (stats?.financial?.mrr || 0) * 0.8 },
    { month: 'Feb', value: (stats?.financial?.mrr || 0) * 0.85 },
    { month: 'Mar', value: (stats?.financial?.mrr || 0) * 0.9 },
    { month: 'Apr', value: stats?.financial?.mrr || 0 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Visión General</h1>
            <p className="text-muted-foreground mt-1 text-sm">Monitoramento em tempo real do ecossistema OrdenGO.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass rounded-xl font-bold">Exportar PDF</Button>
            <Button size="sm" className="bg-[#df0024] hover:bg-red-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-red-500/20">Novo Cliente</Button>
          </div>
        </div>

        {/* Grid de KPIs (Métricas Principais) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <MetricCard 
            title="Clientes Activos" 
            value={stats?.tenants?.active || 0} 
            icon={Users} 
            color="text-red-500" 
            bg="bg-red-500/10"
            sub={`+${stats?.tenants?.newLast30Days || 0} nos últimos 30 dias`}
            trend="+12%"
          />

          <MetricCard 
            title="Receita Mensal (MRR)" 
            value={formatCurrency(stats?.financial?.mrr || 0)} 
            icon={TrendingUp} 
            color="text-green-500" 
            bg="bg-green-500/10"
            sub="Faturamento recorrente bruto"
            trend="+8.4%"
          />

          <MetricCard 
            title="Volume Geral (GMV)" 
            value={formatCurrency(stats?.financial?.globalGMV || 0)} 
            icon={DollarSign} 
            color="text-purple-500" 
            bg="bg-purple-500/10"
            sub="Total transacionado na rede"
            trend="+15.2%"
          />

          <MetricCard 
            title="Tickets Pendentes" 
            value={stats?.tickets?.open || 0} 
            icon={Ticket} 
            color="text-orange-500" 
            bg="bg-orange-500/10"
            sub={`${stats?.tickets?.closed || 0} fechados hoje`}
            trend="-2"
          />
        </div>

        {/* Dashboards Detalhados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gráfico de Tendência MRR */}
          <Card className="lg:col-span-2 glass border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
              <CardTitle className="text-lg font-bold">Crescimento Financeiro (MRR)</CardTitle>
              <div className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">Alvo Atingido</div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mrrTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#df0024" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#df0024" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#df0024" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Planos */}
          <Card className="glass border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-lg font-bold">Distribuição de Planos</CardTitle>
            </CardHeader>
            <CardContent>
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
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status de Saúde e Clientes Suspensos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="px-6 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Saúde do Sistema</CardTitle>
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                  100% OPERATIONAL
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                <StatusRow label="API Services" status="Online" latency="24ms" />
                <StatusRow label="Database Cloud" status="Online" latency="8ms" />
                <StatusRow label="Payment Gateway" status="Online" latency="156ms" />
                <StatusRow label="Socket Real-time" status="Online" latency="12ms" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-lg font-bold">Clientes Suspensos</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="size-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                  <AlertCircle size={24} />
                </div>
                <h4 className="text-xl font-bold">{stats?.tenants.inactive || 0} Clientes</h4>
                <p className="text-sm text-muted-foreground mt-1">Inativos por impago ou suspensão manual.</p>
                <Button variant="link" className="text-[#df0024] mt-4 font-bold">Ver lista completa</Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AdminLayout>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg, sub, trend }) {
  return (
    <Card className="glass border-none shadow-lg rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2.5 rounded-xl", bg, color)}>
            <Icon size={20} />
          </div>
          {trend && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              trend.startsWith('+') ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-foreground mt-1">{value}</h3>
          <p className="text-[10px] text-muted-foreground/80 mt-2 font-medium">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, status, latency }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-white/20 dark:bg-white/5 rounded-xl border border-white/10 group hover:bg-white/40 transition-all">
      <div className="flex items-center gap-3">
        <CheckCircle2 size={16} className="text-green-500" />
        <span className="text-sm font-bold text-foreground/80">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-muted-foreground">{latency}</span>
        <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">{status}</span>
      </div>
    </div>
  );
}
