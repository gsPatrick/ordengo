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
      // Intentamos obtener el historial de caja
      const res = await api.get('/finance/cash-sessions').catch(() => ({ data: { data: [] } }));
      setSessions(res.data.data || []);
      
      // Datos mock para la demo si no hay datos reales
      if (!res.data.data || res.data.data.length === 0) {
        setSessions([
          { id: 1, openingDate: '2026-05-01', closingDate: '2026-05-01', initialBalance: 150.00, totalSales: 1450.50, totalWithdrawals: 200.00, finalBalance: 1400.50, status: 'closed', user: 'Admin' },
          { id: 2, openingDate: '2026-05-02', closingDate: null, initialBalance: 200.00, totalSales: 890.20, totalWithdrawals: 50.00, finalBalance: 1040.20, status: 'open', user: 'Camarero' },
        ]);
        setStats({
          totalSales: 2340.70,
          totalWithdrawals: 250.00,
          currentBalance: 1040.20
        });
      }
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Historial de Caja</h1>
          <p className="text-gray-500">Control total de tus flujos de efectivo y ventas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl gap-2 border-gray-200">
            <Download size={18} />
            Exportar Reporte
          </Button>
          <Button className="bg-[#df0024] hover:bg-red-700 text-white rounded-xl gap-2 shadow-lg shadow-red-200">
            <TrendingDown size={18} />
            Registrar Retirada
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Ventas (Mes)</p>
                <h3 className="text-2xl font-black text-gray-900">{formatCurrency(stats.totalSales)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Retiradas/Sangrías</p>
                <h3 className="text-2xl font-black text-gray-900">{formatCurrency(stats.totalWithdrawals)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-[#1a1a1a] text-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Caja Actual (Efectivo)</p>
                <h3 className="text-2xl font-black">{formatCurrency(stats.currentBalance)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-[#df0024]" />
            Sesiones Recientes
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Buscar por fecha..." className="pl-10 h-10 w-64 rounded-xl border-gray-100 bg-gray-50/50" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Estado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Apertura / Cierre</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Saldo Inicial</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Ventas</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Retiradas</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Saldo Final</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {session.status === 'open' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tight border border-green-100">
                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Abierto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-tight">
                        Cerrado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">{session.openingDate}</span>
                      {session.closingDate && (
                        <span className="text-xs text-gray-400 mt-1 italic">Cerrado el {session.closingDate}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-500">{formatCurrency(session.initialBalance)}</td>
                  <td className="px-6 py-4 text-right font-black text-green-600">{formatCurrency(session.totalSales)}</td>
                  <td className="px-6 py-4 text-right font-black text-red-500">-{formatCurrency(session.totalWithdrawals)}</td>
                  <td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(session.finalBalance)}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="rounded-lg text-[#df0024] font-bold hover:bg-red-50">
                      Ver Ticket Z
                      <ChevronRight size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desglose de Metodos de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Receipt size={20} className="text-[#df0024]" />
              Consolidado por Método (Hoy)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <DollarSign className="text-green-600" size={18} />
                </div>
                <span className="font-bold text-gray-600">Efectivo (Cash)</span>
              </div>
              <span className="font-black text-gray-900">{formatCurrency(450.20)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <CreditCard className="text-blue-600" size={18} />
                </div>
                <span className="font-bold text-gray-600">Tarjetas / Débito</span>
              </div>
              <span className="font-black text-gray-900">{formatCurrency(380.00)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <ArrowUpRight className="text-purple-600" size={18} />
                </div>
                <span className="font-bold text-gray-600">Digital / App</span>
              </div>
              <span className="font-black text-gray-900">{formatCurrency(60.00)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-black text-gray-900">Flujo en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-2 justify-between pt-4">
              {[40, 70, 45, 90, 65, 80, 50, 100, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-lg relative group overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#df0024] transition-all duration-1000" 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>00:00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
