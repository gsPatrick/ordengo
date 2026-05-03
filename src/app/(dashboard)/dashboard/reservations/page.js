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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Agenda de Reservas</h1>
          <p className="text-gray-500">Organiza las mesas y la llegada de tus clientes</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-200 h-12 px-8 rounded-2xl font-bold">
              <Plus size={20} />
              Crear Reserva Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <div className="size-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Calendar className="text-[#df0024]" size={20} />
                </div>
                Nueva Reserva
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                <Input 
                  required
                  placeholder="Ej: Alessandro Volpi" 
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  className="rounded-2xl border-gray-100 h-12 bg-gray-50/50 focus:ring-[#df0024]"
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
                    className="rounded-2xl border-gray-100 h-12 bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</label>
                  <Input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="rounded-2xl border-gray-100 h-12 bg-gray-50/50"
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
                    className="rounded-2xl border-gray-100 h-12 bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación</label>
                  <select className="w-full h-12 rounded-2xl border border-gray-100 bg-gray-50/50 px-4 text-sm outline-none focus:ring-2 ring-red-50">
                    <option>Interior</option>
                    <option>Terraza</option>
                    <option>VIP</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notas del Chef</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-2xl border border-gray-100 p-4 text-sm bg-gray-50/50 outline-none focus:ring-2 ring-red-50"
                  placeholder="Ej: Cumpleaños, alergias..."
                  value={formData.observations}
                  onChange={e => setFormData({...formData, observations: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-[#df0024] hover:bg-red-700 text-white rounded-2xl h-14 font-black text-lg shadow-xl shadow-red-100 mt-2">
                Confirmar Reserva
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="size-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#df0024]">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hoy</p>
            <h3 className="text-3xl font-black text-gray-900">{reservations.length}</h3>
          </div>
        </div>
        
        <Card className="md:col-span-3 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden flex items-center px-6">
          <Search className="text-gray-300" size={24} />
          <Input 
            placeholder="Buscar por nombre, mesa o fecha..." 
            className="border-none h-16 bg-transparent focus-visible:ring-0 text-lg font-medium text-gray-700 placeholder:text-gray-300"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
             <Button variant="ghost" className="rounded-xl size-10 p-0 text-gray-400"><Filter size={20} /></Button>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Huésped</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Horario</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Grupo</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Mesa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReservations.length > 0 ? filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-black text-lg">
                        {res.customerName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{res.customerName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{res.observations || 'SIN PREFERENCIAS'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-black text-gray-700">
                        <Clock size={14} className="text-[#df0024]" />
                        {res.time} hs
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(res.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center -space-x-2">
                       {[...Array(Math.min(res.people, 3))].map((_, i) => (
                         <div key={i} className="size-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                            <User size={12} />
                         </div>
                       ))}
                       {res.people > 3 && (
                         <div className="size-8 rounded-full border-2 border-white bg-red-50 flex items-center justify-center text-[10px] font-black text-[#df0024]">
                           +{res.people - 3}
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-100">
                      Confirmado
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="outline" className="rounded-xl border-gray-100 font-black text-xs text-gray-400 hover:text-[#df0024] hover:bg-red-50 hover:border-red-100 transition-all">
                      ASIGNAR
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="size-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                        <Calendar size={40} className="text-gray-200" />
                      </div>
                      <h4 className="text-lg font-black text-gray-900">Sin Reservas Pendientes</h4>
                      <p className="text-sm text-gray-400 mt-2">Tu agenda está libre por ahora. Las nuevas reservas aparecerán aquí automáticamente.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
