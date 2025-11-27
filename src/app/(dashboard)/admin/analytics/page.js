'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart as PieIcon, TrendingUp, AlertTriangle, 
  Download, Loader2, Ban, Calendar, X, Filter, DollarSign, Users, Smartphone, Target
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const COLORS = ['#df0024', '#1f1c1d', '#9ca3af', '#ef4444'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  
  // Dados da API
  const [saasStats, setSaasStats] = useState(null);
  const [adReport, setAdReport] = useState([]);
  const [financeReport, setFinanceReport] = useState([]);

  // Filtros de Data
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // --- FETCH DATA ---
  const fetchReports = async () => {
    setLoading(true);
    try {
      // Prepara parâmetros query string
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      // Dispara as 3 requisições em paralelo para os endpoints corretos (/admin/...)
      const [dashRes, adRes, finRes] = await Promise.all([
        api.get('/admin/analytics/dashboard', { params }),
        api.get('/admin/analytics/reports/ads', { params }),
        api.get('/admin/analytics/reports/finance', { params })
      ]);

      setSaasStats(dashRes.data.data);
      setAdReport(adRes.data.data.report || []);
      setFinanceReport(finRes.data.data.report || []);

    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega sempre que as datas mudarem
  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  // --- HELPERS ---
  const clearDates = () => setDateRange({ start: '', end: '' });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(val || 0));
  };

  // --- COMPONENTE DE ESTADO VAZIO ---
  const EmptyState = ({ title, subtitle, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30 h-full">
      <div className="bg-white p-4 rounded-full shadow-sm mb-3">
        <Icon className="text-gray-300" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1">{subtitle}</p>
    </div>
  );

  // Preparar dados para o Gráfico de Distribuição de Receita (SaaS vs Ads)
  const revenueDistributionData = saasStats ? [
    { name: 'SaaS (Assinaturas)', value: Number(saasStats.financial.revenueSaaS) },
    { name: 'Ads (Publicidade)', value: Number(saasStats.financial.revenueAds) }
  ].filter(d => d.value > 0) : [];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER COM FILTRO GLOBAL */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-xl border shadow-sm sticky top-4 z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inteligência de Negócio</h1>
            <p className="text-sm text-gray-500">
              {dateRange.start 
                ? `Analisando período de ${new Date(dateRange.start).toLocaleDateString()} até ${dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'hoje'}`
                : 'Visualizando dados acumulados (Todo o período)'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Seletor de Data */}
            <div className="flex items-center bg-gray-50 border rounded-lg p-1 w-full sm:w-auto">
              <div className="bg-white border rounded px-2 py-1 flex items-center gap-2 mr-2">
                <Filter size={14} className="text-gray-500"/>
                <span className="text-xs font-bold text-gray-700">FILTRO</span>
              </div>
              
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute left-2 top-2 text-[9px] font-bold text-gray-400 uppercase">De</span>
                <Input 
                  type="date" 
                  className="border-none bg-transparent h-8 text-xs pl-6 w-full sm:w-[120px] focus-visible:ring-0" 
                  value={dateRange.start} 
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              
              <span className="text-gray-300 mx-1">|</span>
              
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute left-2 top-2 text-[9px] font-bold text-gray-400 uppercase">Até</span>
                <Input 
                  type="date" 
                  className="border-none bg-transparent h-8 text-xs pl-7 w-full sm:w-[120px] focus-visible:ring-0" 
                  value={dateRange.end} 
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>

              {(dateRange.start || dateRange.end) && (
                <Button variant="ghost" size="icon" onClick={clearDates} className="h-8 w-8 text-red-500 hover:bg-red-50 ml-1" title="Limpar Datas">
                  <X size={16}/>
                </Button>
              )}
            </div>
            
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Download size={16} /> PDF
            </Button>
          </div>
        </div>

        {/* TABS */}
        <Tabs defaultValue="saas" className="w-full">
          <TabsList className="bg-gray-100 p-1 w-full md:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="saas" className="gap-2"><BarChart3 size={16}/> Performance SaaS</TabsTrigger>
            <TabsTrigger value="ads" className="gap-2"><PieIcon size={16}/> Rede de Ads</TabsTrigger>
            <TabsTrigger value="finance" className="gap-2"><AlertTriangle size={16}/> Risco & Inadimplência</TabsTrigger>
          </TabsList>

          {/* === ABA 1: SAAS PERFORMANCE === */}
          <TabsContent value="saas" className="mt-6 space-y-6">
            
            {/* KPIs Operacionais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-t-4 border-t-[#df0024]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                    MRR (Recorrente) <DollarSign size={14}/>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {loading ? <Loader2 className="animate-spin h-6 w-6"/> : formatCurrency(saasStats?.financial.mrr)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Previsão mensal atual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                    Faturamento Real <TrendingUp size={14}/>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? '...' : formatCurrency(saasStats?.financial.revenueSaaS)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Recebido no período</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                    Total Tenants <Users size={14}/>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : saasStats?.operational.activeRestaurants}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Restaurantes ativos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                    Tablets Online <Smartphone size={14}/>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : saasStats?.operational.activeTablets}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Dispositivos conectados</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Distribuição de Receita (Dados Reais) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Composição da Receita</CardTitle>
                  <CardDescription>Proporção entre Assinaturas (SaaS) e Publicidade (Ads).</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {loading ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#df0024]" size={32}/></div>
                  ) : revenueDistributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {revenueDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => formatCurrency(val)} />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState 
                      icon={Ban} 
                      title="Sem dados financeiros" 
                      subtitle="Não há faturas pagas registradas neste período para gerar o gráfico."
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === ABA 2: ADS PERFORMANCE === */}
          <TabsContent value="ads" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              
              {/* Tabela de Campanhas */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>Performance por Campanha</CardTitle>
                    <Badge variant="outline">{adReport.length} campanhas</Badge>
                  </div>
                  <CardDescription>Impressões e alcance registrados no período filtrado.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#df0024]"/></div>
                  ) : adReport.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campanha</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Impressões</TableHead>
                          <TableHead className="text-right">Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adReport.map((camp, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{camp.title}</TableCell>
                            <TableCell>
                              <Badge variant={camp.status === 'active' ? 'default' : 'secondary'} className={camp.status === 'active' ? 'bg-green-500' : ''}>
                                {camp.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">{Number(camp.impressions).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              {/* Simulação visual de barra de progresso baseada nas impressões relativas */}
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${Math.min(100, (camp.impressions / (adReport[0]?.impressions || 1)) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState 
                      icon={Target} 
                      title="Sem dados de publicidade" 
                      subtitle="Nenhuma impressão registrada no período selecionado. Verifique se há campanhas ativas." 
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === ABA 3: FINANCEIRO === */}
          <TabsContent value="finance" className="mt-6 space-y-6">
            <Card className="border-l-4 border-l-red-500 bg-red-50/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertTriangle size={20}/> Inadimplência Crítica
                    </CardTitle>
                    <CardDescription>Faturas vencidas dentro do período selecionado.</CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    Total: {loading ? '...' : formatCurrency(financeReport.reduce((acc, i) => acc + Number(i.amount), 0))}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-red-600"/></div>
                ) : financeReport.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente / Restaurante</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Atraso</TableHead>
                        <TableHead className="text-right">Valor em Aberto</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financeReport.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-bold text-gray-800">{item.restaurant}</TableCell>
                          <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                              {item.daysLate} dias
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-red-600">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="text-xs hover:bg-red-100 text-red-700">
                              Notificar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState 
                    icon={TrendingUp} 
                    title="Saúde Financeira Excelente!" 
                    subtitle="Nenhuma fatura vencida encontrada neste período. Todos os clientes estão em dia." 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AdminLayout>
  );
}