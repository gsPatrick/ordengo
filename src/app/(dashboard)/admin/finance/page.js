'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, FileText, TrendingUp, TrendingDown, 
  Download, CheckCircle, AlertCircle, Loader2,
  Landmark, Filter, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Search, Calendar, X, Ban
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FinancePage() {
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Dados da API
  const [invoices, setInvoices] = useState([]);
  const [ledgerBalance, setLedgerBalance] = useState({ totalRevenue: 0, totalExpenses: 0, balance: 0 });
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Monta Query Params Reais
      const params = {};
      if(statusFilter !== 'all') params.status = statusFilter;
      if(dateRange.start) params.startDate = dateRange.start;
      if(dateRange.end) params.endDate = dateRange.end;
      
      // Chamadas para a API (Endpoints Corrigidos com /admin/)
      const [invRes, ledRes] = await Promise.all([
        api.get('/admin/finance/invoices', { params }),
        api.get('/admin/finance/ledger/balance') // Balance geralmente é acumulado total, mas carregamos aqui
      ]);

      setInvoices(invRes.data.data.invoices || []);
      setLedgerBalance(ledRes.data.data || { totalRevenue: 0, totalExpenses: 0, balance: 0 });

    } catch (error) {
      console.error("Erro ao carregar finanças:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega ao mudar filtros críticos
  useEffect(() => { fetchData(); }, [statusFilter, dateRange.start, dateRange.end]);

  // --- PROCESSAMENTO DE DADOS (FRONTEND) ---

  // 1. Gráfico Real: Agrupa faturas por mês/ano para o gráfico
  const chartData = useMemo(() => {
    if (invoices.length === 0) return [];

    const grouped = {};
    // Ordena cronologicamente para o gráfico fazer sentido
    const sorted = [...invoices].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sorted.forEach(inv => {
      const date = new Date(inv.createdAt);
      const key = date.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' }); // ex: "nov/24"
      
      if (!grouped[key]) grouped[key] = { name: key, paid: 0, pending: 0 };
      
      const amount = Number(inv.total);
      
      if (inv.status === 'paid') {
        grouped[key].paid += amount;
      } else if (inv.status !== 'cancelled') {
        grouped[key].pending += amount;
      }
    });

    return Object.values(grouped);
  }, [invoices]);

  // 2. Filtro de Texto (Client-side para rapidez na UX)
  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    const clientName = inv.Restaurant?.name || inv.Advertiser?.companyName || 'Desconhecido';
    const invoiceId = inv.id || '';
    return clientName.toLowerCase().includes(term) || invoiceId.toLowerCase().includes(term);
  });

  // 3. KPIs Calculados do Período Filtrado (Dinâmicos)
  const kpis = useMemo(() => {
    let receitaPeriodo = 0;
    let aReceber = 0;
    let inadimplencia = 0;

    invoices.forEach(inv => {
      const val = Number(inv.total);
      if (inv.status === 'paid') receitaPeriodo += val;
      else if (inv.status === 'overdue') {
        inadimplencia += val;
        aReceber += val;
      }
      else if (inv.status === 'sent' || inv.status === 'draft') {
        aReceber += val;
      }
    });

    return { receitaPeriodo, aReceber, inadimplencia };
  }, [invoices]);

  // --- AÇÕES ---

  const handleGenerateInvoices = async () => {
    if(!confirm("ATENÇÃO: Isso irá gerar faturas para TODOS os restaurantes ativos com base no plano atual. Continuar?")) return;
    setGenerating(true);
    try {
      const res = await api.post('/admin/finance/invoices/generate-monthly');
      alert(`Processo concluído!\n✅ Geradas: ${res.data.data.generated}\n❌ Erros: ${res.data.data.errors}`);
      fetchData();
    } catch (error) {
      alert("Erro ao processar faturamento em massa. Verifique se há restaurantes ativos com planos configurados.");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    if(!confirm("Confirmar recebimento do pagamento? Isso criará um lançamento no Livro Razão.")) return;
    try {
      await api.patch(`/admin/finance/invoices/${id}/pay`);
      fetchData(); // Recarrega para atualizar status e gráfico
    } catch (error) {
      alert("Erro ao atualizar fatura.");
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
  };

  const formatCurrency = (val, currency = 'EUR') => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(Number(val || 0));
  };

  // --- COMPONENTES VISUAIS ---

  const EmptyState = ({ title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30 h-full">
      <div className="bg-white p-4 rounded-full shadow-sm mb-3">
        <Ban className="text-gray-300" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1">{subtitle}</p>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER + DATE FILTER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-xl border shadow-sm sticky top-4 z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão Financeira</h1>
            <p className="text-sm text-gray-500">
              {dateRange.start 
                ? `Filtrando de ${new Date(dateRange.start).toLocaleDateString()} até ${dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'hoje'}`
                : 'Visualizando histórico completo'}
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
            
            <div className="h-8 w-px bg-gray-200 mx-2 hidden xl:block"></div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 flex-1 xl:flex-none">
                <Download size={16} /> Relatório
              </Button>
              <Button 
                onClick={handleGenerateInvoices} 
                disabled={generating}
                className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-md shadow-red-100 flex-1 xl:flex-none"
              >
                {generating ? <Loader2 className="animate-spin h-4 w-4" /> : <FileText size={16} />}
                Gerar Faturas
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs FINANCEIROS (DADOS REAIS) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Saldo Total (Ledger Geral) */}
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Saldo em Caixa (Total)</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin"/> : formatCurrency(ledgerBalance.balance)}
                  </h3>
                </div>
                <div className="bg-green-50 p-2 rounded-lg text-green-600"><Landmark size={20}/></div>
              </div>
              <div className="mt-3 text-xs text-gray-400">Acumulado histórico</div>
            </CardContent>
          </Card>

          {/* Receita no Período */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Receita (Período)</p>
                  <h3 className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight size={20}/> 
                    {loading ? '...' : formatCurrency(kpis.receitaPeriodo)}
                  </h3>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">Entradas confirmadas</div>
            </CardContent>
          </Card>

          {/* A Receber */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">A Receber (Pendente)</p>
                  <h3 className="text-2xl font-bold text-blue-600 mt-1 flex items-center gap-1">
                    <DollarSign size={20}/> 
                    {loading ? '...' : formatCurrency(kpis.aReceber)}
                  </h3>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${(kpis.aReceber / ((kpis.receitaPeriodo + kpis.aReceber) || 1)) * 100}%`}}></div>
              </div>
            </CardContent>
          </Card>

          {/* Inadimplência */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Inadimplência</p>
                  <h3 className="text-2xl font-bold text-red-600 mt-1">
                    {loading ? '...' : formatCurrency(kpis.inadimplencia)}
                  </h3>
                </div>
                <div className="bg-red-50 p-2 rounded-lg text-red-600"><AlertCircle size={20}/></div>
              </div>
              <div className="mt-3 text-xs text-red-600 font-medium">Faturas vencidas</div>
            </CardContent>
          </Card>
        </div>

        {/* GRÁFICO DE FLUXO DE CAIXA (DADOS REAIS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Fluxo de Faturamento</CardTitle>
              <CardDescription>Evolução temporal de Receitas (Pagos) e Previsão (Pendentes).</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#df0024]" size={32}/></div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb'}}
                      formatter={(value) => `€ ${Number(value).toFixed(2)}`}
                    />
                    <Legend />
                    <Bar dataKey="paid" name="Recebido" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="pending" name="Pendente" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState 
                  title="Sem dados no período" 
                  subtitle="Gere faturas ou ajuste o filtro de datas para visualizar o gráfico." 
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* TABELAS E LISTAGEM */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="invoices" className="gap-2"><FileText size={16}/> Gestão de Faturas</TabsTrigger>
            <TabsTrigger value="ledger" className="gap-2"><Landmark size={16}/> Livro Razão (Pagamentos)</TabsTrigger>
          </TabsList>

          {/* ABA 1: FATURAS */}
          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col xl:flex-row justify-between gap-4">
                  <div>
                    <CardTitle>Listagem de Faturas</CardTitle>
                    <CardDescription>Histórico completo de cobranças.</CardDescription>
                  </div>
                  
                  {/* FILTROS AVANÇADOS */}
                  <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    {/* Busca */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input 
                        placeholder="Buscar cliente..." 
                        className="pl-9 w-[200px] h-9 bg-white text-sm" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                      />
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

                    {/* Status */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] h-9 bg-white text-xs">
                        <Filter className="mr-2 h-3 w-3 text-gray-500" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="paid">Pagos</SelectItem>
                        <SelectItem value="sent">Em Aberto</SelectItem>
                        <SelectItem value="overdue">Atrasados</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Limpar */}
                    {(statusFilter !== 'all' || searchTerm) && (
                      <Button variant="ghost" size="icon" onClick={clearFilters} className="h-9 w-9 text-red-500 hover:bg-red-50" title="Limpar">
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#df0024]"/></div>
                ) : filteredInvoices.length === 0 ? (
                  <EmptyState title="Nenhum registro encontrado" subtitle="Tente ajustar os filtros de busca." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Emissão</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs text-gray-500">
                            #{inv.id.substring(0, 6).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{inv.Restaurant?.name || inv.Advertiser?.companyName || 'Desconhecido'}</div>
                            <div className="text-xs text-gray-500 capitalize">{inv.type === 'saas_subscription' ? 'SaaS' : 'Ads'}</div>
                          </TableCell>
                          <TableCell className="text-xs">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs">
                            <span className={new Date(inv.dueDate) < new Date() && inv.status !== 'paid' ? 'text-red-600 font-bold' : ''}>
                              {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(inv.total, inv.currency)}
                          </TableCell>
                          <TableCell>
                            {inv.status === 'paid' && <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Pago</Badge>}
                            {inv.status === 'sent' && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Aberto</Badge>}
                            {inv.status === 'overdue' && <Badge variant="destructive">Atrasado</Badge>}
                            {inv.status === 'draft' && <Badge variant="secondary">Rascunho</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {inv.status !== 'paid' && (
                                  <DropdownMenuItem onClick={() => handleMarkAsPaid(inv.id)} className="text-green-600 cursor-pointer">
                                    <CheckCircle size={14} className="mr-2"/> Baixar Pagamento
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="cursor-pointer"><Download size={14} className="mr-2"/> Download PDF</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: LEDGER (Derivado de Pagamentos Confirmados) */}
          <TabsContent value="ledger" className="mt-6">
            <Card className="border-t-4 border-t-blue-600">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Livro Razão (Pagamentos)</CardTitle>
                    <CardDescription>Lançamentos contábeis de entradas confirmadas.</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {filteredInvoices.filter(i => i.status === 'paid').length} lançamentos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredInvoices.filter(i => i.status === 'paid').length === 0 ? (
                  <EmptyState title="Livro Razão Vazio" subtitle="Nenhum pagamento registrado neste filtro." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Baixa</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right text-green-600">Crédito</TableHead>
                        <TableHead className="text-right text-red-600">Débito</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices
                        .filter(i => i.status === 'paid')
                        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
                        .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs">
                            {new Date(entry.paidAt).toLocaleDateString()} <span className="text-gray-400">{new Date(entry.paidAt).toLocaleTimeString()}</span>
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            Pagamento Fatura #{entry.id.substring(0,6).toUpperCase()} - {entry.Restaurant?.name || entry.Advertiser?.companyName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-50 text-green-700">Receita</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {formatCurrency(entry.total, entry.currency)}
                          </TableCell>
                          <TableCell className="text-right text-gray-400">-</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AdminLayout>
  );
}