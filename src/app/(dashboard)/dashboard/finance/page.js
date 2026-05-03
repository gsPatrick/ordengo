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
import ManagerLayout from '@/components/ManagerLayout.js/ManagerLayout';

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
    <ManagerLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Control Financiero</h1>
          <p className="text-sm text-gray-500 font-medium">Monitoreo de ingresos y flujo de caja diario</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase border-gray-200 hover:bg-gray-50">
            <Download size={14} className="mr-2" />
            Exportar XLS
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase shadow-lg shadow-emerald-50">
            <TrendingUp size={14} className="mr-2" />
            Cierre de Caja
          </Button>
        </div>
      </div>

      {/* KPIs Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ventas Brutas</p>
          <h3 className="text-xl font-black text-emerald-600">{formatCurrency(stats.totalSales)}</h3>
          <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-500">
            <ArrowUpRight size={10} /> +12%
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Retiradas</p>
          <h3 className="text-xl font-black text-rose-500">{formatCurrency(stats.totalWithdrawals)}</h3>
          <div className="mt-1 text-[9px] font-bold text-rose-400 uppercase">3 Movimientos</div>
        </div>

        <div className="md:col-span-2 bg-gray-900 p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Landmark size={60} className="text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Disponible</p>
          <h3 className="text-3xl font-black text-white">{formatCurrency(stats.currentBalance)}</h3>
          <p className="text-[9px] text-gray-500 mt-1 font-bold uppercase tracking-tight">Sesión abierta: Administrador</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Sesiones Refinada */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Historial de Sesiones</h2>
            <Button variant="ghost" className="h-8 text-[9px] font-black uppercase text-red-600">Ver Todo</Button>
          </div>
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden border border-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-3 text-[9px] font-black uppercase text-gray-400 tracking-tighter">Estado</th>
                    <th className="px-6 py-3 text-[9px] font-black uppercase text-gray-400 tracking-tighter">Apertura</th>
                    <th className="px-6 py-3 text-[9px] font-black uppercase text-gray-400 tracking-tighter text-right">Ventas</th>
                    <th className="px-6 py-3 text-[9px] font-black uppercase text-gray-400 tracking-tighter text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.length > 0 ? sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Badge className={`rounded-lg px-2 py-0.5 text-[8px] font-black uppercase ${session.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {session.status === 'open' ? 'Activo' : 'Cerrado'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-800">{new Date(session.openingTime).toLocaleDateString()}</p>
                        <p className="text-[9px] text-gray-400 font-bold">{new Date(session.openingTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-sm text-gray-900">{formatCurrency(session.totalSales || 0)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all">
                          <ChevronRight size={14} />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="4" className="px-6 py-12 text-center text-xs text-gray-400 font-medium">No se han registrado sesiones de caja aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Métodos de Pago Compactos */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest px-1">Métodos de Pago</h2>
          <Card className="border-none shadow-sm bg-white rounded-2xl p-5 space-y-5 border border-gray-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
                    <DollarSign size={16} />
                  </div>
                  <span className="text-xs font-black text-gray-600">Efectivo</span>
                </div>
                <span className="text-sm font-black text-gray-900">{formatCurrency(sessions.find(s => s.status === 'open')?.totalCash || 0)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xs font-black text-gray-600">Tarjetas</span>
                </div>
                <span className="text-sm font-black text-gray-900">{formatCurrency(sessions.find(s => s.status === 'open')?.totalCard || 0)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Hoy</span>
                <span className="text-lg font-black text-gray-900">{formatCurrency(sessions.find(s => s.status === 'open')?.totalSales || 0)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Flujo Horario</p>
               <div className="flex items-end gap-1 h-16">
                  {[30, 50, 40, 80, 100, 70, 90, 60, 45, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-gray-100 rounded-full relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-1000" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </ManagerLayout>
  );
}
