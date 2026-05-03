'use client';

import { useState, useEffect } from 'react';
import { 
  Landmark, TrendingUp, TrendingDown, Clock, 
  ChevronRight, Calendar, Filter, ArrowUpRight, 
  ArrowDownRight, DollarSign, CreditCard, Receipt,
  Plus, Search, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function FinanceHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalWithdrawals: 0,
    currentBalance: 0
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/cash-reports');
      const reports = res.data.data.reports || [];
      setSessions(reports);
      
      // Calcular stats básicos desde los reportes
      const totalSales = reports.reduce((acc, curr) => acc + (parseFloat(curr.totalSales) || 0), 0);
      const totalWithdrawals = reports.reduce((acc, curr) => acc + (parseFloat(curr.totalWithdrawals) || 0), 0);
      const activeSession = reports.find(s => s.status === 'open');
      
      setStats({
        totalSales,
        totalWithdrawals,
        currentBalance: activeSession ? parseFloat(activeSession.finalBalance) : 0
      });
    } catch (error) {
      console.error("Error al cargar datos financieros:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Control Financiero</h1>
          <p className="text-gray-500">Monitorea tus ingresos por métodos de pago y sesiones de caja</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl gap-2 border-gray-200 h-12 px-6">
            <Download size={18} />
            Exportar XLS
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl gap-2 shadow-lg shadow-emerald-100 h-12 px-8">
            <TrendingUp size={18} />
            Cierre de Caja
          </Button>
        </div>
      </div>

      {/* KPIs con Estilo Diferenciado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ventas Brutas</p>
          <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalSales)}</h3>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
            <ArrowUpRight size={12} /> +12.5% vs ayer
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Retiros/Sangrías</p>
          <h3 className="text-2xl font-black text-rose-500">{formatCurrency(stats.totalWithdrawals)}</h3>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-400">
            <ArrowDownRight size={12} /> 3 movimientos
          </div>
        </div>

        <div className="md:col-span-2 bg-gray-900 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Landmark size={80} className="text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Actual en Caja</p>
          <h3 className="text-4xl font-black text-white">{formatCurrency(stats.currentBalance)}</h3>
          <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase">Sesión abierta por: Administrador</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla de Sesiones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-gray-900">Historial de Sesiones</h2>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-[#df0024]">Ver Todo</Button>
          </div>
          <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Apertura</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Ventas</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Cierre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Badge className={`rounded-full px-3 text-[9px] font-black uppercase ${session.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {session.status === 'open' ? 'Activo' : 'Cerrado'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-800">{new Date(session.openingTime).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{new Date(session.openingTime).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(session.totalSales || 0)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-red-50 hover:text-[#df0024]">
                          <ChevronRight size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Desglose Lateral Real */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 px-2">Métodos de Pago</h2>
          <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-600">Efectivo</span>
                </div>
                <span className="font-black text-gray-900">{formatCurrency(sessions.find(s => s.status === 'open')?.totalCash || 0)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-600">Tarjetas</span>
                </div>
                <span className="font-black text-gray-900">{formatCurrency(sessions.find(s => s.status === 'open')?.totalCard || 0)}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-xs font-black text-gray-400 uppercase">Total Recaudado</span>
                <span className="text-xl font-black text-gray-900">{formatCurrency(sessions.find(s => s.status === 'open')?.totalSales || 0)}</span>
              </div>
            </div>

            <div className="pt-4">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Rendimiento Horario</p>
               <div className="flex items-end gap-1.5 h-24">
                  {[30, 50, 40, 80, 100, 70, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-gray-100 rounded-full relative overflow-hidden group">
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-full transition-all" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
