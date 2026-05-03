'use client';

import { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, User as UserIcon, 
  Store, Loader2, Filter, Inbox, Send, Paperclip, X, Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import EmptyState from '@/components/ui/EmptyState';

export default function TicketsPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/admin/tickets');
      setTickets(res.data.data.tickets);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const res = await api.get(`/admin/tickets/${id}`);
      setSelectedTicket(res.data.data.ticket);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() && attachments.length === 0) return;
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', reply);
      attachments.forEach(file => formData.append('attachments', file));

      await api.post(`/admin/tickets/${selectedTicket.id}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setReply('');
      setAttachments([]);
      await fetchTicketDetails(selectedTicket.id);
      fetchTickets();
    } catch (e) {
      alert('Erro ao enviar resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.Restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (p) => {
    switch(p) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col gap-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Centro de Soporte</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Atenda as solicitações dos seus clientes em tempo real.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl border border-gray-100 dark:border-white/10">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Todos" count={tickets.length} />
                <FilterButton active={filter === 'open'} onClick={() => setFilter('open')} label="Abiertos" color="text-red-500" count={tickets.filter(t => t.status === 'open').length} />
                <FilterButton active={filter === 'closed'} onClick={() => setFilter('closed')} label="Cerrados" color="text-gray-500" count={tickets.filter(t => t.status === 'closed').length} />
             </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* List */}
          <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                <Input 
                  placeholder="Buscar ticket o restaurante..." 
                  className="pl-12 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 h-12 rounded-2xl shadow-lg"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>

             {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
                   <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
                </div>
             ) : filteredTickets.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    icon={Inbox}
                    title="Sin tickets de soporte"
                    subtitle="No hay solicitudes de ayuda pendientes. Todos los clientes están satisfechos."
                  />
                </div>
             ) : (
                filteredTickets.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => fetchTicketDetails(t.id)}
                    className={cn(
                      "p-5 rounded-[1.5rem] border border-transparent transition-all cursor-pointer group relative",
                      selectedTicket?.id === t.id ? "bg-white dark:bg-zinc-800 border-gray-200 dark:border-white/10 shadow-xl" : "hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <Badge className={cn("text-[8px] font-black uppercase px-2 py-0", getPriorityColor(t.priority))}>{t.priority}</Badge>
                       <span className="text-[10px] font-medium opacity-40">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-sm line-clamp-1 mb-1 group-hover:text-[var(--primary)] transition-colors">{t.subject}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--primary)]/80 uppercase">
                       <Store size={10} /> {t.Restaurant?.name}
                    </div>
                  </div>
                ))
             )}
          </div>

          {/* Detail */}
          <div className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden">
             {selectedTicket ? (
                <>
                  <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-start bg-gray-50 dark:bg-zinc-800">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <Badge className={cn("border-none font-bold text-[10px] uppercase", selectedTicket.status === 'open' ? 'bg-red-500' : 'bg-green-500')}>{selectedTicket.status}</Badge>
                           <h2 className="text-2xl font-black tracking-tight">{selectedTicket.subject}</h2>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                           <div className="flex items-center gap-2"><Store size={14} className="text-[var(--primary)]" /> <span className="font-bold">{selectedTicket.Restaurant?.name}</span></div>
                           <div className="flex items-center gap-2"><UserIcon size={14} /> <span>{selectedTicket.creator?.name}</span></div>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto space-y-8">
                     {/* Mensagem Inicial */}
                     <div className="flex gap-4">
                        <div className="size-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center border border-gray-100 dark:border-white/10 shrink-0">
                           <UserIcon size={20} />
                        </div>
                        <div className="space-y-2 max-w-[80%]">
                           <div className="bg-gray-50 dark:bg-zinc-800 p-5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/10 text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedTicket.description}
                           </div>
                           <p className="text-[10px] opacity-40 font-bold ml-2 uppercase">Ticket Iniciado</p>
                        </div>
                     </div>

                     {/* Thread de Mensagens */}
                     {selectedTicket.messages?.map(msg => (
                        <div key={msg.id} className={cn("flex gap-4", msg.isAdminReply ? "flex-row-reverse" : "")}>
                           <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg", msg.isAdminReply ? "bg-[var(--primary)] text-white" : "bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-white/10")}>
                              {msg.isAdminReply ? <Store size={20} /> : <UserIcon size={20} />}
                           </div>
                           <div className={cn("space-y-2 max-w-[80%]", msg.isAdminReply ? "text-right" : "")}>
                              <div className={cn(
                                "p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                                msg.isAdminReply ? "bg-[var(--primary)]/10 rounded-tr-none border border-[var(--primary)]/20" : "bg-gray-50 dark:bg-zinc-800 rounded-tl-none border border-gray-100 dark:border-white/10"
                              )}>
                                 {msg.content}
                                 
                                 {msg.attachments?.length > 0 && (
                                   <div className="mt-4 flex flex-wrap gap-2">
                                      {msg.attachments.map((url, i) => (
                                        <a key={i} href={url} target="_blank" className="size-20 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 hover:opacity-80 transition-opacity">
                                           <img src={url} alt="attachment" className="size-full object-cover" />
                                        </a>
                                      ))}
                                   </div>
                                 )}
                              </div>
                              <p className="text-[10px] opacity-40 font-bold uppercase mx-2">{msg.sender?.name} • {new Date(msg.createdAt).toLocaleString()}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Reply Input */}
                  <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                     {attachments.length > 0 && (
                       <div className="flex gap-2 mb-4">
                          {attachments.map((file, i) => (
                            <div key={i} className="relative size-16 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                               <img src={URL.createObjectURL(file)} className="size-full object-cover" />
                               <button onClick={() => removeAttachment(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={10} /></button>
                            </div>
                          ))}
                       </div>
                     )}
                     
                     <form onSubmit={handleReply} className="relative">
                        <textarea 
                           className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 pr-20 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 min-h-[100px] resize-none"
                           placeholder="Escriba su resposta..."
                           value={reply}
                           onChange={(e) => setReply(e.target.value)}
                         />
                         <div className="absolute right-4 bottom-4 flex items-center gap-2">
                            <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                               <Paperclip size={20} className="text-muted-foreground" />
                               <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                            <Button type="submit" disabled={submitting || (!reply.trim() && attachments.length === 0)} className="bg-[var(--primary)] hover:bg-red-700 text-white rounded-2xl size-12 shadow-lg shadow-red-500/20 p-0">
                               {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </Button>
                         </div>
                     </form>
                  </div>
                </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 gap-4">
                   <MessageSquare size={80} strokeWidth={1} />
                   <p className="text-xl font-black uppercase tracking-widest">Seleccione un Ticket</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function FilterButton({ active, onClick, label, count, color = "" }) {
  return (
    <button onClick={onClick} className={cn("px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2", active ? "bg-white dark:bg-zinc-700 text-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>
      <span className={cn(active ? "" : color)}>{label}</span>
      <span className="opacity-40">{count}</span>
    </button>
  );
}
