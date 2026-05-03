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
    <div className="h-[calc(100vh-180px)] flex gap-6 animate-in fade-in duration-500">
      
      {/* Lista de Tickets */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Soporte</h1>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Chat de Ayuda OrdenGO</p>
          </div>
          <Button className="size-10 rounded-xl bg-[#df0024] hover:bg-red-700 text-white p-0">
            <Plus size={20} />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input placeholder="Buscar tickets..." className="pl-10 h-11 rounded-xl border-gray-200 bg-white" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {tickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className={`border-none shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
                selectedTicket?.id === ticket.id ? 'ring-2 ring-[#df0024] bg-red-50/30' : 'bg-white'
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {ticket.status === 'open' ? 'Activo' : 'Cerrado'}
                  </Badge>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{ticket.date}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{ticket.subject}</h3>
                <p className="text-xs text-gray-500 truncate">{ticket.lastMessage}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ventana de Chat */}
      <Card className="flex-1 border-none shadow-sm bg-white rounded-3xl flex flex-col overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Header Chat */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="size-1.5 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soporte OrdenGO en línea</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <MoreVertical size={18} className="text-gray-400" />
              </Button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar">
              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'manager' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] flex flex-col ${msg.sender === 'manager' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      msg.sender === 'manager' 
                        ? 'bg-[#df0024] text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold mt-1 px-1 uppercase tracking-tighter">
                      {msg.sender === 'manager' ? 'Tú' : 'Soporte'} • {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Chat */}
            <div className="p-4 border-t border-gray-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <Button type="button" variant="ghost" size="icon" className="size-10 rounded-xl hover:bg-white shrink-0">
                  <Paperclip size={18} className="text-gray-400" />
                </Button>
                <input 
                  type="text" 
                  placeholder="Escribe tu mensaje aquí..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 px-2"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="size-10 rounded-xl bg-[#df0024] hover:bg-red-700 text-white shrink-0 shadow-lg shadow-red-200">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Tu Centro de Soporte</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              Selecciona un ticket a la izquierda o abre uno nuevo para recibir ayuda de nuestro equipo.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
