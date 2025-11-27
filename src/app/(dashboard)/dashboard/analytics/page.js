'use client';

import { useState, useEffect } from 'react';
import ManagerLayout from '../../../../components/ManagerLayout.js/ManagerLayout';
import DateRangeFilter from '../../../../components/DateRangeFilter';
import api from '@/lib/api';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Star, TrendingUp, TrendingDown, Users, ShoppingBag } from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Default: Mês atual
  const [filter, setFilter] = useState({
    period: 'month',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    end: new Date().toISOString()
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/analytics', {
        params: { startDate: filter.start, endDate: filter.end, period: filter.period }
      });
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  // Helper de porcentagem
  const getGrowth = (curr, prev) => {
    if (!prev) return 100;
    return (((curr - prev) / prev) * 100).toFixed(1);
  };

  return (
    <ManagerLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Avançado</h1>
            <p className="text-gray-500">Análise profunda de vendas e comportamento.</p>
          </div>
          <DateRangeFilter onFilterChange={setFilter} />
        </div>

        {loading || !data ? (
          <div className="h-96 flex items-center justify-center text-gray-400">Carregando dados...</div>
        ) : (
          <>
            {/* LINHA 1: CARDS COMPARATIVOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total de Pedidos</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{data.cards.orders.current}</h3>
                    </div>
                    <div className="text-right">
                      <BadgeGrowth val={getGrowth(data.cards.orders.current, data.cards.orders.previous)} />
                      <p className="text-xs text-gray-400 mt-1">vs anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Faturamento</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(data.cards.sales.current)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <BadgeGrowth val={getGrowth(data.cards.sales.current, data.cards.sales.previous)} />
                      <p className="text-xs text-gray-400 mt-1">vs anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Ticket Médio</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">
                        {new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(data.cards.ticket.current)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <BadgeGrowth val={getGrowth(data.cards.ticket.current, data.cards.ticket.previous)} />
                      <p className="text-xs text-gray-400 mt-1">vs anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LINHA 2: FEEDBACK E GRÁFICO DE VENDAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Feedback Score (Esquerda da imagem) */}
              <Card className="flex flex-col justify-center items-center text-center p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Feedback dos Clientes</h3>
                <div className="text-6xl font-bold text-yellow-500 mb-2">{data.feedback.average}</div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={24} className={s <= Math.round(data.feedback.average) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-500">Baseado em {data.feedback.total} avaliações</p>
                <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 w-full">
                  Ver Comentários
                </button>
              </Card>

              {/* Gráfico de Área (Direita da imagem) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Evolução de Pedidos</CardTitle>
                  <CardDescription>Comparativo de volume no período selecionado.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.charts.salesOverTime}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" name="Pedidos" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* LINHA 3: HEATMAP E RANKING */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* "Heatmap" Simulado com Barras por Dia da Semana (Simulando a densidade da imagem) */}
              <Card>
                <CardHeader>
                  <CardTitle>Densidade de Pedidos</CardTitle>
                  <CardDescription>Volume por dia no período.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts.salesOverTime}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip cursor={{fill: '#f3f4f6'}} />
                      <Bar dataKey="count" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Mais Vendidos */}
              <Card>
                <CardHeader><CardTitle>Produtos Mais Vendidos</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.ranking.map((prod, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>{i+1}</span>
                          <span className="text-sm font-medium text-gray-700 truncate w-48">{typeof prod.name === 'object' ? prod.name.pt : prod.name}</span>
                        </div>
                        
                        {/* Barra de Progresso Visual */}
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-blue-500" style={{width: `${(prod.quantity / data.ranking[0].quantity) * 100}%`}}></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 w-12 text-right">{prod.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ManagerLayout>
  );
}

const BadgeGrowth = ({ val }) => {
  const isPos = val >= 0;
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit ml-auto ${isPos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isPos ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
      {val}%
    </span>
  );
};