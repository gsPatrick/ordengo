'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, Users, Clock, 
  Trash2, ChevronRight, User, Filter,
  CheckCircle2, XCircle, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import api from '@/lib/api';
import ManagerLayout from '@/components/ManagerLayout.js/ManagerLayout';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    time: '',
    people: 2,
    observations: '',
    status: 'confirmed'
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations');
      setReservations(res.data.data.reservations || []);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      setIsModalOpen(false);
      fetchReservations();
      setFormData({ customerName: '', date: '', time: '', people: 2, observations: '', status: 'confirmed' });
    } catch (error) {
      console.error(error);
      alert("Error al guardar reserva.");
    }
  };

  const filteredReservations = reservations.filter(r => 
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Agenda de Reservas</h1>
          <p className="text-sm text-gray-500 font-medium">Gestión inteligente de mesas y disponibilidad</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-xl shadow-red-100 h-11 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
              <Plus size={18} />
              Crear Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-gray-900 p-6 text-white">
              <DialogTitle className="text-xl font-black flex items-center gap-2">
                <Calendar className="text-red-500" size={20} />
                Nueva Reserva Manual
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-1">Completa los datos para bloquear la mesa.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Cliente</label>
                <Input 
                  required
                  placeholder="Ej: Alessandro Volpi" 
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  className="rounded-xl border-gray-100 h-11 bg-gray-50/50 focus:ring-red-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</label>
                  <Input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="rounded-xl border-gray-100 h-11 bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</label>
                  <Input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="rounded-xl border-gray-100 h-11 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comensales</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={formData.people}
                    onChange={e => setFormData({...formData, people: e.target.value})}
                    className="rounded-xl border-gray-100 h-11 bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zona</label>
                  <select className="w-full h-11 rounded-xl border border-gray-100 bg-gray-50/50 px-4 text-xs font-bold outline-none focus:ring-2 ring-red-50">
                    <option>Interior</option>
                    <option>Terraza</option>
                    <option>VIP</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observaciones</label>
                <textarea 
                  className="w-full min-h-[80px] rounded-xl border border-gray-100 p-4 text-xs bg-gray-50/50 outline-none focus:ring-2 ring-red-50"
                  placeholder="Ej: Cumpleaños, alergias..."
                  value={formData.observations}
                  onChange={e => setFormData({...formData, observations: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-12 font-black shadow-lg mt-2">
                Confirmar Reserva
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats y Buscador Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="size-10 bg-red-50 rounded-xl flex items-center justify-center text-[#df0024] mb-2">
            <Calendar size={20} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hoy</p>
          <h3 className="text-2xl font-black text-gray-900">{reservations.length}</h3>
        </div>
        
        <div className="md:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center px-4 relative">
          <Search className="text-gray-300 absolute left-6" size={20} />
          <Input 
            placeholder="Buscar por nombre, mesa o fecha..." 
            className="border-none h-14 bg-transparent focus-visible:ring-0 text-sm font-medium text-gray-700 placeholder:text-gray-300 pl-10 w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
             <Button variant="ghost" className="rounded-lg h-10 px-3 text-gray-400 hover:bg-gray-50 flex items-center gap-2">
                <Filter size={16} />
                <span className="text-[10px] font-black uppercase">Filtros</span>
             </Button>
          </div>
        </div>
      </div>

      {/* Tabla Estilizada */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Huésped</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Horario</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Grupo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Mesa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReservations.length > 0 ? filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gray-900 flex items-center justify-center text-white font-black text-sm">
                        {res.customerName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 leading-tight">{res.customerName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[150px]">
                          {res.observations || 'Sin preferencias'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-gray-700">
                        <Clock size={12} className="text-[#df0024]" />
                        {res.time} hs
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        {new Date(res.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                        {res.people}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase">pax</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      Confirmado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg border border-gray-100 text-[10px] font-black uppercase hover:bg-gray-50 text-gray-400">
                      Asignar
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="size-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <Calendar size={32} className="text-gray-200" />
                      </div>
                      <h4 className="text-md font-black text-gray-900">Agenda libre</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">No hay reservas registradas para hoy. Las nuevas aparecerán aquí automáticamente.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ManagerLayout>
  );
}
