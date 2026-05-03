'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Plus, Search, Paperclip, 
  Send, Clock, CheckCircle2, AlertCircle,
  MoreVertical, Image as ImageIcon, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import api from '@/lib/api';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({ subject: '', message: '', priority: 'medium' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support');
      const ticketsList = res.data.data.tickets || [];
      setTickets(ticketsList);
      if (ticketsList.length > 0 && !selectedTicket) {
        fetchTicketDetails(ticketsList[0].id);
      }
    } catch (error) {
      console.error("Error al cargar tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const res = await api.get(`/support/${id}`);
      setSelectedTicket(res.data.data.ticket);
    } catch (error) {
      console.error("Error al cargar detalle del ticket:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    
    try {
      await api.post(`/support/${selectedTicket.id}/reply`, { content: newMessage });
      setNewMessage('');
      fetchTicketDetails(selectedTicket.id); // Recargar mensajes
    } catch (error) {
      console.error(error);
      alert("Error al enviar mensaje");
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/support', newTicketData);
      setIsModalOpen(false);
      setNewTicketData({ subject: '', message: '', priority: 'medium' });
      fetchTickets();
    } catch (error) {
      console.error(error);
      alert("Error al crear ticket");
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-4 animate-in fade-in duration-700">
      
      {/* Sidebar de Tickets Compacta */}
      <div className="w-[320px] flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-black text-gray-900">Soporte</h2>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Centro de Ayuda</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="size-9 rounded-xl bg-[#df0024] hover:bg-red-700 text-white p-0 shadow-lg shadow-red-100">
                <Plus size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
               <div className="bg-gray-900 p-6 text-white">
                 <DialogTitle className="text-xl font-black">Nuevo Ticket de Soporte</DialogTitle>
                 <p className="text-xs text-gray-400 mt-1">Explica tu problema y te ayudaremos pronto.</p>
               </div>
               <form onSubmit={handleCreateTicket} className="p-8 space-y-4 bg-white">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</label>
                   <Input 
                     required
                     placeholder="Ej: Problema con la impresora" 
                     value={newTicketData.subject}
                     onChange={e => setNewTicketData({...newTicketData, subject: e.target.value})}
                     className="rounded-xl border-gray-100 h-11 bg-gray-50/50"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prioridad</label>
                   <select 
                     className="w-full h-11 rounded-xl border border-gray-100 bg-gray-50/50 px-4 text-xs font-bold outline-none"
                     value={newTicketData.priority}
                     onChange={e => setNewTicketData({...newTicketData, priority: e.target.value})}
                   >
                     <option value="low">Baja</option>
                     <option value="medium">Media</option>
                     <option value="high">Urgente</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mensaje Inicial</label>
                   <textarea 
                     required
                     className="w-full min-h-[100px] rounded-xl border border-gray-100 p-4 text-xs bg-gray-50/50 outline-none"
                     placeholder="Describe los detalles aquí..."
                     value={newTicketData.message}
                     onChange={e => setNewTicketData({...newTicketData, message: e.target.value})}
                   />
                 </div>
                 <Button type="submit" className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-12 font-black">
                   Abrir Ticket
                 </Button>
               </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <Input placeholder="Buscar tickets..." className="pl-9 h-10 rounded-xl border-gray-100 bg-gray-50/50 text-xs font-medium" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar mt-2">
          {tickets.length > 0 ? tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => fetchTicketDetails(ticket.id)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                selectedTicket?.id === ticket.id 
                  ? 'bg-red-50 border-red-100 shadow-sm' 
                  : 'hover:bg-gray-50 border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight truncate max-w-[120px]">
                  #{ticket.id.split('-')[0]}
                </span>
                <Badge className={`text-[8px] font-black uppercase px-2 py-0 ${
                  ticket.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {ticket.status === 'open' ? 'Activo' : 'Cerrado'}
                </Badge>
              </div>
              <h4 className={`text-xs font-black truncate ${selectedTicket?.id === ticket.id ? 'text-[#df0024]' : 'text-gray-900'}`}>
                {ticket.subject}
              </h4>
              <p className="text-[10px] text-gray-400 font-medium mt-1">Hace 2 horas</p>
            </button>
          )) : (
            <div className="py-12 text-center">
              <MessageSquare className="size-8 text-gray-100 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-gray-300 uppercase">Sin tickets activos</p>
            </div>
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {selectedTicket ? (
          <>
            {/* Header del Chat */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                  {selectedTicket.subject.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Agente OrdenGo en línea</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl text-gray-400"><MoreVertical size={18} /></Button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
              {selectedTicket.messages?.map((msg, i) => {
                const isSystem = msg.senderRole === 'support' || msg.senderRole === 'admin';
                return (
                  <div key={i} className={`flex ${isSystem ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] flex flex-col ${isSystem ? 'items-start' : 'items-end'}`}>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isSystem 
                          ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                          : 'bg-gray-900 text-white rounded-tr-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase mt-2 px-1">
                        {isSystem ? 'Soporte OrdenGo' : 'Tú'} • 12:45
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input de Chat */}
            <div className="p-4 bg-white border-t border-gray-50">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                <Button type="button" variant="ghost" size="icon" className="rounded-xl text-gray-400 mb-1"><Paperclip size={20} /></Button>
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-2 flex items-center min-h-[50px]">
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none max-h-32"
                    rows={1}
                  />
                  <Button 
                    type="submit" 
                    className="size-10 rounded-xl bg-gray-900 hover:bg-black text-white p-0 shadow-lg shrink-0 ml-2"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
            <div className="size-20 bg-white rounded-[2rem] shadow-xl border border-gray-50 flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-gray-100" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Tu Centro de Soporte</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-sm leading-relaxed">
              Selecciona un ticket a la izquierda o abre uno nuevo para recibir ayuda de nuestro equipo experto. Estamos aquí para ti 24/7.
            </p>
            <Button 
               onClick={() => setIsModalOpen(true)}
               variant="outline" 
               className="mt-8 rounded-xl border-gray-200 text-[10px] font-black uppercase h-10 px-8 hover:bg-gray-900 hover:text-white transition-all"
            >
               Abrir mi primer ticket
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
