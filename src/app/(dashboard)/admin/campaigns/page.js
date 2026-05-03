'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, Play, Pause, BarChart3, 
  Image as ImageIcon, MoreVertical, Trash2, Edit,
  Loader2, Filter, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import EmptyState from '@/components/ui/EmptyState';

export default function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const initialForm = {
    title: '', advertiserId: '', startDate: '', endDate: '',
    priority: 'medium', frequency: 10, duration: 10,
    mediaUrl: '', type: 'image'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, advRes] = await Promise.all([
        api.get('/admin/campaigns'),
        api.get('/admin/advertisers')
      ]);
      setCampaigns(campRes.data.data.campaigns);
      setAdvertisers(advRes.data.data.advertisers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/campaigns', formData);
      setIsCreateOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (e) {
      alert('Erro ao criar campanha.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (camp) => {
    try {
      const newStatus = camp.status === 'active' ? 'paused' : 'active';
      await api.put(`/admin/campaigns/${camp.id}`, { status: newStatus });
      fetchData();
    } catch (e) {
      alert('Erro ao alterar status da campanha.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <Badge className="bg-green-500/10 text-green-500 border-none font-bold">Activa</Badge>;
      case 'paused': return <Badge className="bg-yellow-500/10 text-yellow-500 border-none font-bold">Pausada</Badge>;
      case 'finished': return <Badge className="bg-gray-500/10 text-gray-500 border-none font-bold">Finalizada</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-500 border-none font-bold">Borrador</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Campañas Publicitarias</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Gestione o inventário de anúncios da rede OrdenGO.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95">
            <Plus size={18} /> Nueva Campaña
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#df0024] transition-colors" size={20} />
            <Input
              placeholder="Buscar campaña o anunciante..."
              className="pl-12 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 h-12 rounded-2xl shadow-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 gap-2 rounded-xl h-12 px-6 font-bold"><Filter size={18} /> Todos los Status</Button>
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[#df0024]" size={48} />
            <p className="text-muted-foreground font-medium animate-pulse">Sincronizando ad network...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="Sin campañas activas"
            subtitle="No hay campañas publicitarias registradas. Cree la primera campaña para comenzar a monetizar la red de tablets."
            ctaLabel="Crear Campaña"
            onCtaClick={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map(camp => (
              <div key={camp.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col group hover:scale-[1.02] transition-all duration-300">
                 {/* Creative Preview */}
                 <div className="relative aspect-[9/16] bg-black/20 overflow-hidden">
                    {camp.Creatives?.[0]?.mediaUrl ? (
                      <img src={camp.Creatives[0].mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={camp.title} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-xs font-mono uppercase tracking-widest">Sin Creatividad</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(camp.status)}
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" className="bg-black/40 hover:bg-black/60 text-white rounded-full"><MoreVertical size={16} /></Button>
                    </div>
                 </div>

                 {/* Info */}
                 <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-lg text-foreground tracking-tight leading-tight">{camp.title}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-black border-white/20">{camp.priority}</Badge>
                      </div>
                      <p className="text-xs text-[#df0024] font-bold mt-1 uppercase tracking-tighter">{camp.Advertiser?.companyName || 'Anunciante Directo'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                          <p className="text-[10px] uppercase font-black opacity-40">Impresiones</p>
                          <p className="text-lg font-black text-foreground">0</p>
                       </div>
                       <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                          <p className="text-[10px] uppercase font-black opacity-40">Clicks</p>
                          <p className="text-lg font-black text-foreground">0</p>
                       </div>
                    </div>

                    <div className="space-y-2 mt-auto">
                       <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar size={12} className="text-[#df0024]" />
                          <span>{new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Clock size={12} className="text-[#df0024]" />
                          <span>Frecuencia: Cada {camp.frequency} min</span>
                       </div>
                    </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-2">
                    <Button variant="ghost" className="flex-1 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/10"><BarChart3 size={14} className="mr-2" /> Reporte</Button>
                    {camp.status === 'active' ? (
                      <Button onClick={() => handleToggleStatus(camp)} variant="ghost" className="flex-1 rounded-xl text-xs font-bold hover:bg-yellow-500/10 text-yellow-500"><Pause size={14} className="mr-2" /> Pausar</Button>
                    ) : (
                      <Button onClick={() => handleToggleStatus(camp)} variant="ghost" className="flex-1 rounded-xl text-xs font-bold hover:bg-green-500/10 text-green-500"><Play size={14} className="mr-2" /> Activar</Button>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE MODAL */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-4xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black">Nueva Campaña</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-8 mt-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Lado A: Configuração */}
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase ml-1 opacity-60">Título da Campanha</label>
                          <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 h-12 rounded-2xl font-bold" placeholder="Ex: Promo Verão Coca-Cola" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase ml-1 opacity-60">Anunciante</label>
                          <Select value={formData.advertiserId} onValueChange={v => setFormData({...formData, advertiserId: v})} required>
                             <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 h-12 rounded-2xl font-bold"><SelectValue placeholder="Elegir..." /></SelectTrigger>
                             <SelectContent className="bg-white dark:bg-zinc-900">{advertisers.map(a => <SelectItem key={a.id} value={a.id}>{a.companyName}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">Data Início</label>
                            <Input type="date" className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 h-12 rounded-2xl font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">Data Fim</label>
                            <Input type="date" className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 h-12 rounded-2xl font-bold" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Lado B: Criativo */}
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase ml-1 opacity-60">URL da Imagem / Vídeo</label>
                          <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 h-12 rounded-2xl font-bold" placeholder="https://..." value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} required />
                       </div>
                       
                       {/* 9:16 PREVIEW BOX */}
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase ml-1 opacity-60">Prévia (9:16 Retrato)</label>
                          <div className="aspect-[9/16] max-w-[200px] mx-auto bg-gray-50 dark:bg-zinc-800 rounded-2xl border-dashed border-2 border-gray-200 dark:border-white/20 flex items-center justify-center overflow-hidden">
                             {formData.mediaUrl ? (
                               <img src={formData.mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                             ) : (
                               <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-30 text-center p-4">
                                  <ImageIcon size={40} />
                                  <span className="text-[10px] font-bold">CARGA LA URL PARA VER LA PREVIA</span>
                               </div>
                             )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-red-500/80 bg-red-500/5 p-2 rounded-lg">
                             <AlertCircle size={12} />
                             <span>REGLA: SOLO IMÁGENES RETRATO (9:16) SON PERMITIDAS PARA TABLETS.</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <DialogFooter className="pt-6 border-t border-gray-200 dark:border-white/10">
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                <Button type="submit" className="bg-[#df0024] hover:bg-red-700 h-12 px-10 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "CREAR CAMPAÑA"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
