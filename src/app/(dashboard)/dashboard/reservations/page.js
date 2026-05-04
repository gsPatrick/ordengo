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

  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTab, setActiveTab] = useState('panorama');
  const [isTableDetailOpen, setIsTableDetailOpen] = useState(false);

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
      const combinedDateTime = new Date(`${formData.date}T${formData.time}`);
      await api.post('/reservations', {
        ...formData,
        dateTime: combinedDateTime,
        paxCount: parseInt(formData.people)
      });
      setIsModalOpen(false);
      setIsTableDetailOpen(false);
      fetchReservations();
      fetchTables();
      setFormData({ customerName: '', date: '', time: '', people: 2, tableId: '', observations: '', status: 'confirmed' });
    } catch (error) {
      console.error(error);
      alert("Error al guardar reserva.");
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setActiveTab('panorama');
    setIsTableDetailOpen(true);
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

  // Lógica de Calendário para a Mesa
  const getTableCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = -3; i <= 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getDayStatus = (date, tableUuid) => {
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const tableRes = reservations.filter(r => 
      r.tableId === tableUuid && 
      new Date(r.date).toISOString().split('T')[0] === dateStr &&
      r.status !== 'cancelled'
    );

    if (tableRes.length > 0) {
      if (dateStr < todayStr) return 'past';
      return 'reserved';
    }
    return 'free';
  };

  return (
    <ManagerLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Control de Salón</h1>
          <p className="text-sm text-gray-500 font-medium">Gestiona tu restaurante con inteligencia visual</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="size-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-black text-xs">
                {tables.filter(t => t.status === 'free').length}
              </div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Mesas Disponibles</span>
           </div>
        </div>
      </div>

      {/* MODAL DETALLE DE MESA (TABS) */}
      <Dialog open={isTableDetailOpen} onOpenChange={setIsTableDetailOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
          {selectedTable && (
            <div className="bg-white">
              <div className={`p-8 text-white flex flex-col items-center relative overflow-hidden ${getStatusColor(selectedTable.status)}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="size-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-4 backdrop-blur-md shadow-xl border border-white/20">
                  <Users size={38} className="text-white" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Mesa #{selectedTable.number}</h3>
                <div className="mt-2 bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  {getStatusLabel(selectedTable.status)}
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex bg-gray-50 p-1 mx-8 -mt-6 rounded-2xl shadow-lg relative z-20">
                <button 
                  onClick={() => setActiveTab('panorama')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'panorama' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Panorama
                </button>
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Agenda
                </button>
              </div>

              <div className="p-8">
                {activeTab === 'panorama' ? (
                  <div className="space-y-6">
                    {selectedTable.status === 'free' ? (
                      <div className="text-center py-6 space-y-4">
                        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                          <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
                          <p className="text-xs font-bold text-gray-600">Esta mesa está lista para recibir comensales.</p>
                        </div>
                        <Button 
                          onClick={() => {
                            setFormData({...formData, tableId: selectedTable.uuid});
                            setIsModalOpen(true);
                          }}
                          className="w-full bg-[#df0024] hover:bg-black text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest"
                        >
                          Reservar Mesa Ahora
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reservations.find(r => r.tableId === selectedTable.uuid && r.status !== 'cancelled') ? (
                          <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 relative">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-lg">
                                   {reservations.find(r => r.tableId === selectedTable.uuid)?.customerName?.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-gray-400 uppercase">Cliente Actual</p>
                                   <h4 className="font-black text-gray-900 text-lg leading-none">
                                      {reservations.find(r => r.tableId === selectedTable.uuid)?.customerName}
                                   </h4>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                   <p className="text-[9px] font-black text-gray-400 uppercase">Horario</p>
                                   <p className="font-black text-gray-800">{reservations.find(r => r.tableId === selectedTable.uuid)?.time} hs</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                   <p className="text-[9px] font-black text-gray-400 uppercase">Personas</p>
                                   <p className="font-black text-gray-800">{reservations.find(r => r.tableId === selectedTable.uuid)?.people} pax</p>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                             <p className="text-xs font-bold text-gray-400">Ocupada por cliente de paso.</p>
                          </div>
                        )}
                        <Button className="w-full bg-gray-900 hover:bg-black text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest">
                           Controlar Mesa
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disponibilidad Próximos 14 días</h4>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                       {getTableCalendarDays().map((day, idx) => {
                          const status = getDayStatus(day, selectedTable.uuid);
                          return (
                             <div 
                                key={idx} 
                                className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                                   status === 'reserved' ? 'bg-amber-50 border-amber-200' : 
                                   status === 'past' ? 'bg-gray-50 border-gray-100 grayscale' : 
                                   'bg-white border-gray-50'
                                }`}
                             >
                                <span className="text-[8px] font-black text-gray-400 uppercase">{day.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0)}</span>
                                <span className={`text-[11px] font-black ${status === 'reserved' ? 'text-amber-600' : 'text-gray-900'}`}>{day.getDate()}</span>
                                <div className={`size-1.5 rounded-full mt-1 ${
                                   status === 'reserved' ? 'bg-amber-500 animate-pulse' : 
                                   status === 'past' ? 'bg-gray-300' : 
                                   'bg-emerald-500'
                                }`} />
                             </div>
                          );
                       })}
                    </div>

                    <div className="space-y-3 mt-4 overflow-y-auto max-h-[150px] pr-2">
                       {reservations.filter(r => r.tableId === selectedTable.uuid).map((res, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                             <div className="flex items-center gap-3">
                                <div className={`size-2 rounded-full ${new Date(res.date) < new Date() ? 'bg-gray-300' : 'bg-amber-500'}`} />
                                <p className="text-[10px] font-black text-gray-800">{res.customerName}</p>
                             </div>
                             <p className="text-[9px] font-bold text-gray-400">{new Date(res.date).toLocaleDateString()} - {res.time}hs</p>
                          </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL DE CREACIÓN (PASO A PASO) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-[#df0024] p-6 text-white">
              <DialogTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                <Calendar className="text-white" size={20} />
                Nueva Reserva
              </DialogTitle>
              <p className="text-xs text-red-100 mt-1 font-medium opacity-80">Configurando Mesa #{tables.find(t => t.uuid === formData.tableId)?.number}</p>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.map((table) => {
            const tableReservations = reservations.filter(r => r.tableId === table.uuid && r.status !== 'cancelled');
            return (
              <div 
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative group p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer overflow-hidden h-[180px] flex flex-col justify-center
                  ${table.status === 'free' ? 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1' : 
                    table.status === 'occupied' ? 'bg-red-50/40 border-red-100 hover:border-red-300 hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1' : 
                    'bg-amber-50/40 border-amber-100 hover:border-amber-300 shadow-lg hover:-translate-y-1'}`}
              >
                {/* Efeito Visual de Status */}
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-[2.5] ${getStatusColor(table.status)}`} />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <div className={`size-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:rotate-6 ${
                    table.status === 'free' ? 'bg-emerald-50 text-emerald-600' : 
                    table.status === 'occupied' ? 'bg-red-100 text-red-600' : 
                    'bg-amber-500 text-white shadow-xl'
                  }`}>
                    <Users size={24} />
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter">#{table.number}</h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                      table.status === 'free' ? 'text-emerald-500' : 
                      table.status === 'occupied' ? 'text-red-500' : 
                      'text-amber-600'
                    }`}>
                      {getStatusLabel(table.status)}
                    </p>
                  </div>

                  {/* Botão Flutuante no Hover */}
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[2.5rem]">
                     <div className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        Ver Detalles
                     </div>
                  </div>

                  {table.status === 'reserved' && tableReservations.length > 0 && (
                    <div className="pt-2 border-t border-amber-200/50 w-full group-hover:opacity-0 transition-opacity">
                      <p className="text-[10px] font-black text-amber-900 truncate">{tableReservations[0].customerName}</p>
                      <p className="text-[9px] text-amber-700 font-bold">{tableReservations[0].time} hs</p>
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
