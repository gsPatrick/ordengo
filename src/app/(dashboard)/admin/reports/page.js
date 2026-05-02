'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Download, Loader2, Calendar, 
  DollarSign, Users, Smartphone, Target, FileBarChart,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import EmptyState from '@/components/ui/EmptyState';

const COLORS = ['#df0024', '#1f1c1d', '#9ca3af', '#f97316'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const [dashRes] = await Promise.all([
        api.get('/admin/analytics/dashboard', { params }),
      ]);
      setStats(dashRes.data.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(val || 0));

  // MRR trend — only populated from real API data
  const mrrTrend = stats?.financial?.mrrHistory || [];

  const revenueData = stats ? [
    { name: 'Assinaturas', value: Number(stats.financial?.revenueSaaS || 0) },
    { name: 'Publicidade', value: Number(stats.financial?.revenueAds || 0) }
  ].filter(d => d.value > 0) : [];

  const KpiCard = ({ title, value, icon: Icon, trend, trendUp, color = "text-primary" }) => (
    <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2.5 rounded-xl", color === "text-primary" ? "bg-primary/10" : "bg-green-500/10")}>
            <Icon size={20} className={color} />
          </div>
          {trend && (
            <Badge className={cn("border-none font-bold text-[10px]", trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
              {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {trend}
            </Badge>
          )}
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-black text-foreground">
          {loading ? <Loader2 className="animate-spin size-6" /> : value}
        </h3>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Reportes Financieros</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">
              Análisis consolidado de MRR, GMV y suscripciones activas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-2xl h-12 px-4 gap-3 shadow-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <Input type="date" className="bg-transparent border-none h-8 text-xs w-28 focus-visible:ring-0" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
              <span className="text-muted-foreground text-xs">—</span>
              <Input type="date" className="bg-transparent border-none h-8 text-xs w-28 focus-visible:ring-0" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <Button variant="ghost" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl h-12 px-6 font-bold gap-2">
              <Download size={18} /> Exportar
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="MRR (Recurrente)" value={formatCurrency(stats?.financial?.mrr)} icon={DollarSign} color="text-primary" />
          <KpiCard title="GMV Global" value={formatCurrency(stats?.financial?.globalGMV)} icon={TrendingUp} color="text-green-500" />
          <KpiCard title="Clientes Activos" value={stats?.tenants?.active || 0} icon={Users} color="text-primary" />
          <KpiCard title="Tablets Online" value={stats?.operational?.activeTablets || 0} icon={Smartphone} color="text-green-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MRR Trend */}
          <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
              <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                <BarChart3 size={24} />
              </div>
              <CardTitle className="text-xl font-black">Evolución del MRR</CardTitle>
              <CardDescription>Tendencia de ingresos recurrentes mensuales.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 h-[350px]">
              {mrrTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrTrend}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#df0024" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#df0024" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={v => `€${v}`} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Area type="monotone" dataKey="value" stroke="#df0024" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                </AreaChart>
              </ResponsiveContainer>
              ) : (
                <EmptyState icon={BarChart3} title="Sin datos históricos" subtitle="Los datos de tendencia MRR aparecerán aquí cuando haya histórico de facturación." />
              )}
            </CardContent>
          </Card>

          {/* Revenue Distribution */}
          <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
              <div className="size-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
                <Target size={24} />
              </div>
              <CardTitle className="text-xl font-black">Composición</CardTitle>
              <CardDescription>SaaS vs Publicidad.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 h-[350px]">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {revenueData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatCurrency(v)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                  <FileBarChart size={48} strokeWidth={1} />
                  <p className="text-sm font-bold">Sin datos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </AdminLayout>
  );
}
