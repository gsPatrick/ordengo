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
      // Nota: Aquí asumo que existe un endpoint /reservations o similar
      // Si no existe, simulamos datos para que la UI funcione
      const res = await api.get('/manager/reservations').catch(() => ({ data: { data: [] } }));
      setReservations(res.data.data || []);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/manager/reservations', formData);
      setIsModalOpen(false);
      fetchReservations();
      setFormData({ customerName: '', date: '', time: '', people: 2, observations: '', status: 'confirmed' });
    } catch (error) {
      alert("Error al guardar reserva. (Endpoint en desarrollo)");
      // Mock para demo
      setReservations([...reservations, { ...formData, id: Date.now() }]);
      setIsModalOpen(false);
    }
  };

  const filteredReservations = reservations.filter(r => 
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Reservas</h1>
          <p className="text-gray-500">Gestiona las mesas y bookings de tu restaurante</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-200">
              <Plus size={18} />
              Nueva Reserva Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="text-[#df0024]" />
                Registrar Reserva
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nombre del Cliente</label>
                <Input 
                  required
                  placeholder="Ej: Juan Pérez" 
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  className="rounded-xl border-gray-200 focus:ring-[#df0024]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Fecha</label>
                  <Input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Hora</label>
                  <Input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Número de Personas</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    min="1"
                    value={formData.people}
                    onChange={e => setFormData({...formData, people: e.target.value})}
                    className="rounded-xl border-gray-200"
                  />
                  <Users className="text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Observaciones (Opcional)</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-xl border border-gray-200 p-3 text-sm focus:ring-[#df0024] outline-none"
                  placeholder="Ej: Alergia al gluten, mesa cerca de la ventana..."
                  value={formData.observations}
                  onChange={e => setFormData({...formData, observations: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-[#df0024] hover:bg-red-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-red-100">
                Guardar Reserva
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Hoy</p>
                <h3 className="text-3xl font-black mt-1">{reservations.length}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Calendar className="text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Filtros y Buscador */}
        <Card className="md:col-span-3 border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Buscar por nombre de cliente..." 
                className="pl-12 border-none h-12 bg-transparent focus-visible:ring-0 text-gray-700"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" className="rounded-2xl gap-2 text-gray-500">
              <Filter size={18} />
              Filtros
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Cliente</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Fecha y Hora</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Personas</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Estado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReservations.length > 0 ? filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-[#df0024] font-bold">
                        {res.customerName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{res.customerName}</p>
                        <p className="text-xs text-gray-400">{res.observations || 'Sin notas'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {res.date}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock size={14} />
                        {res.time} hs
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold">
                      <Users size={14} />
                      {res.people}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-green-100">
                      <CheckCircle2 size={12} />
                      Confirmada
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-gray-100">
                        <MoreVertical size={16} className="text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar size={32} className="opacity-20" />
                      </div>
                      <p className="font-bold text-gray-900">No hay reservas registradas</p>
                      <p className="text-sm">Las nuevas reservas aparecerán aquí</p>
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
