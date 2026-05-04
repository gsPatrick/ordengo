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
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    time: '',
    people: 2,
    tableId: '',
    observations: '',
    status: 'confirmed'
  });

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchTables();
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

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data.tables || []);
    } catch (error) {
      console.error("Error al cargar mesas:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Formatar data/hora para o backend
      const combinedDateTime = new Date(`${formData.date}T${formData.time}`);
      
      await api.post('/reservations', {
        ...formData,
        dateTime: combinedDateTime,
        paxCount: parseInt(formData.people)
      });
      
      setIsModalOpen(false);
      fetchReservations();
      fetchTables(); // Recarregar mesas para ver o novo status
      setFormData({ customerName: '', date: '', time: '', people: 2, tableId: '', observations: '', status: 'confirmed' });
    } catch (error) {
      console.error(error);
      alert("Error al guardar reserva.");
    }
  };

  const handleTableClick = (table) => {
    if (table.status === 'free') {
      setFormData({...formData, tableId: table.uuid});
      setIsModalOpen(true);
    } else if (table.status === 'reserved') {
      const res = reservations.find(r => r.tableId === table.uuid && r.status !== 'cancelled');
      if (res) {
        setSelectedReservation(res);
        setIsDetailModalOpen(true);
      }
    }
  };

  const filteredReservations = reservations.filter(r => 
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.Table?.number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-amber-500';
      case 'free': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'free': return 'Libre';
      default: return 'Desconocido';
    }
  };

  return (
    <ManagerLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Control de Salón</h1>
          <p className="text-sm text-gray-500 font-medium">Pulsa sobre una mesa libre para iniciar una reserva</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="size-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-black text-xs">
                {tables.filter(t => t.status === 'free').length}
              </div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Mesas Libres</span>
           </div>
        </div>
      </div>

      {/* MODAL DE CREACIÓN (PASO A PASO) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-[#df0024] p-6 text-white">
              <DialogTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                <Calendar className="text-white" size={20} />
                Nueva Reserva
              </DialogTitle>
              <p className="text-xs text-red-100 mt-1 font-medium opacity-80">Mesa #{tables.find(t => t.uuid === formData.tableId)?.number} seleccionada</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">¿A nombre de quién?</label>
                <Input 
                  required
                  placeholder="Ej: Alessandro Volpi" 
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  className="rounded-xl border-gray-100 h-11 bg-gray-50/50 focus:ring-red-500 font-bold"
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
                    className="rounded-xl border-gray-100 h-11 bg-gray-50/50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</label>
                  <Input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="rounded-xl border-gray-100 h-11 bg-gray-50/50 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cantidad de Personas</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={formData.people}
                    onChange={e => setFormData({...formData, people: e.target.value})}
                    className="rounded-xl border-gray-100 h-11 bg-gray-50/50 font-bold"
                  />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observaciones</label>
                <textarea 
                  className="w-full min-h-[80px] rounded-xl border border-gray-100 p-4 text-xs bg-gray-50/50 outline-none focus:ring-2 ring-red-50 font-medium"
                  placeholder="Ej: Alergias, cumpleaños, etc..."
                  value={formData.observations}
                  onChange={e => setFormData({...formData, observations: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-[#df0024] hover:bg-black text-white rounded-xl h-14 font-black shadow-lg mt-2 uppercase tracking-widest text-xs transition-all">
                Finalizar Reserva
              </Button>
            </form>
          </DialogContent>
      </Dialog>

      {/* MODAL DE DETALLES (MESA RESERVADA) */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
            {selectedReservation && (
              <div className="bg-white">
                <div className="bg-amber-500 p-8 text-white flex flex-col items-center text-center">
                  <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Mesa #{selectedReservation.Table?.number}</h3>
                  <p className="text-xs font-bold text-amber-100 uppercase tracking-widest mt-1 opacity-80">Reserva Confirmada</p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                    <div className="size-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-xl">
                      {selectedReservation.customerName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Huésped</p>
                      <h4 className="text-lg font-black text-gray-900 leading-tight">{selectedReservation.customerName}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Horario</p>
                      <div className="flex items-center gap-2 text-gray-900 font-black">
                        <Clock size={16} className="text-amber-500" />
                        {selectedReservation.time} hs
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personas</p>
                      <div className="flex items-center gap-2 text-gray-900 font-black">
                        <Users size={16} className="text-amber-500" />
                        {selectedReservation.people} pax
                      </div>
                    </div>
                  </div>

                  {selectedReservation.observations && (
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Notas</p>
                      <p className="text-xs text-gray-600 font-medium italic">"{selectedReservation.observations}"</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsDetailModalOpen(false)}
                      className="flex-1 bg-gray-900 hover:bg-black text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest shadow-lg"
                    >
                      Cerrar
                    </Button>
                    <Button 
                      variant="outline"
                      className="size-12 rounded-2xl border-red-100 text-[#df0024] hover:bg-red-50 flex items-center justify-center p-0"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
      </Dialog>

      {/* --- SECCIÓN 1: MAPA DE MESAS --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Mapa de Mesas en Vivo</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Libre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Reservada</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => {
            const tableReservations = reservations.filter(r => r.tableId === table.uuid && r.status !== 'cancelled');
            return (
              <div 
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative group p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden
                  ${table.status === 'free' ? 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5' : 
                    table.status === 'occupied' ? 'bg-red-50/30 border-red-100 shadow-sm' : 
                    'bg-amber-50/30 border-amber-100 shadow-lg shadow-amber-900/5 hover:scale-105 active:scale-95'}`}
              >
                {/* Indicador de Status */}
                <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-10 transition-transform group-hover:scale-150 ${getStatusColor(table.status)}`} />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <div className={`size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:-translate-y-1 ${
                    table.status === 'free' ? 'bg-emerald-50 text-emerald-600' : 
                    table.status === 'occupied' ? 'bg-red-100 text-red-600' : 
                    'bg-amber-500 text-white shadow-lg'
                  }`}>
                    <Users size={20} />
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-black text-gray-900 leading-none">#{table.number}</h4>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${
                      table.status === 'free' ? 'text-emerald-600' : 
                      table.status === 'occupied' ? 'text-red-600' : 
                      'text-amber-600'
                    }`}>
                      {getStatusLabel(table.status)}
                    </p>
                  </div>

                  {table.status === 'reserved' && tableReservations.length > 0 && (
                    <div className="pt-2 border-t border-amber-200/50 w-full">
                      <p className="text-[10px] font-black text-amber-900 truncate">{tableReservations[0].customerName}</p>
                      <p className="text-[9px] text-amber-700 font-bold">{tableReservations[0].time} hs</p>
                    </div>
                  )}

                  {table.status === 'free' && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                       <span className="text-[9px] font-black text-[#df0024] uppercase border-b border-[#df0024]/20 pb-0.5">Reservar Ahora</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SECCIÓN 2: LISTA DE PRÓXIMAS RESERVAS --- */}
      <div className="space-y-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Próximas Reservas</h2>
          
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 items-center px-4 relative w-full md:w-96">
            <Search className="text-gray-300 absolute left-4" size={16} />
            <Input 
              placeholder="Buscar huésped o mesa..." 
              className="border-none h-11 bg-transparent focus-visible:ring-0 text-xs font-bold text-gray-700 placeholder:text-gray-300 pl-8 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha y Hora</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Pax</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Mesa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReservations.length > 0 ? filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-gray-200">
                          {res.customerName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 leading-tight">{res.customerName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                            {res.observations || 'Sin observaciones'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 text-[#df0024] px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 border border-red-100">
                          <Clock size={14} />
                          {res.time} hs
                        </div>
                        <p className="text-xs font-bold text-gray-500">
                          {new Date(res.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-xs font-black text-gray-700">{res.people}</span>
                        <Users size={12} className="text-gray-400" />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {res.status === 'confirmed' ? 'Confirmado' : res.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {res.Table ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-gray-200">
                          Mesa {res.Table.number}
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-9 rounded-xl border border-gray-100 text-[10px] font-black uppercase hover:bg-gray-50 text-gray-400 px-4">
                          Asignar
                        </Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-32 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center grayscale opacity-50">
                        <Calendar size={48} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No hay reservas para mostrar</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </ManagerLayout>
  );
}
