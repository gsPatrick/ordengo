'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, Play, Pause, BarChart3, 
  Image as ImageIcon, MoreVertical, Trash2, Edit,
  Loader2, Filter, CheckCircle2, AlertCircle, Clock, Sliders, Globe
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
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const FILE_BASE_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';
  
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
      await api.patch(`/admin/campaigns/${camp.id}/status`, { status: newStatus });
      fetchData();
    } catch (e) {
      alert('Erro ao alterar status da campanha.');
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/campaigns/${deletingId}`);
      setIsDeleteOpen(false);
      setDeletingId(null);
      fetchData();
    } catch (e) {
      alert('Erro ao deletar campanha.');
    } finally {
      setSubmitting(false);
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
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[var(--primary)] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95">
            <Plus size={18} /> Nueva Campaña
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors" size={20} />
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
            <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
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
                    {camp.creatives?.[0]?.mediaUrl ? (
                      camp.creatives[0].type === 'video' ? (
                        <video 
                          src={`${FILE_BASE_URL}${camp.creatives[0].mediaUrl}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          muted 
                          loop 
                          onMouseOver={e => e.target.play()}
                          onMouseOut={e => e.target.pause()}
                        />
                      ) : (
                        <img src={`${FILE_BASE_URL}${camp.creatives[0].mediaUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={camp.title} />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-xs font-mono uppercase tracking-widest">Sin Creatividad</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(camp.status)}
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                       <Button onClick={() => { setDeletingId(camp.id); setIsDeleteOpen(true); }} size="icon" className="bg-red-500/80 hover:bg-red-600 text-white rounded-full"><Trash2 size={16} /></Button>
                    </div>
                 </div>

                 {/* Info */}
                 <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-lg text-foreground tracking-tight leading-tight">{camp.title}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-black border-white/20">{camp.priority}</Badge>
                      </div>
                      <p className="text-xs text-[var(--primary)] font-bold mt-1 uppercase tracking-tighter">{camp.Advertiser?.companyName || 'Anunciante Directo'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                          <p className="text-[10px] uppercase font-black opacity-40">Impresiones</p>
                          <p className="text-lg font-black text-foreground">{camp.creatives?.reduce((acc, c) => acc + (c.viewsCount || 0), 0) || 0}</p>
                       </div>
                       <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                          <p className="text-[10px] uppercase font-black opacity-40">Clicks</p>
                          <p className="text-lg font-black text-foreground">{camp.creatives?.reduce((acc, c) => acc + (c.clicksCount || 0), 0) || 0}</p>
                       </div>
                    </div>

                    <div className="space-y-2 mt-auto">
                       <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar size={12} className="text-[var(--primary)]" />
                          <span>{new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Clock size={12} className="text-[var(--primary)]" />
                          <span>Frecuencia: Cada {camp.frequency} min</span>
                       </div>
                    </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-2">
                    <Button 
                      onClick={() => { setSelectedCampaign(camp); setIsReportOpen(true); }}
                      variant="ghost" 
                      className="flex-1 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <BarChart3 size={14} className="mr-2" /> Reporte
                    </Button>
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
                <Button type="submit" className="bg-[var(--primary)] hover:bg-red-700 h-12 px-10 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "CREAR CAMPAÑA"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* REPORT MODAL */}
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
             <DialogHeader>
               <div className="flex justify-between items-center pr-8">
                  <div>
                    <DialogTitle className="text-3xl font-black">{selectedCampaign?.title}</DialogTitle>
                    <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-tighter mt-1">{selectedCampaign?.Advertiser?.companyName}</p>
                  </div>
                  {selectedCampaign && getStatusBadge(selectedCampaign.status)}
               </div>
             </DialogHeader>

             {selectedCampaign && (
               <div className="space-y-8 mt-8">
                  {/* METRICS GRID */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
                      <p className="text-[10px] uppercase font-black opacity-40 mb-1">Impresiones</p>
                      <p className="text-2xl font-black">{selectedCampaign.creatives?.reduce((acc, c) => acc + (c.viewsCount || 0), 0) || 0}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
                      <p className="text-[10px] uppercase font-black opacity-40 mb-1">Clicks</p>
                      <p className="text-2xl font-black">{selectedCampaign.creatives?.reduce((acc, c) => acc + (c.clicksCount || 0), 0) || 0}</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-3xl border border-primary/10 text-center">
                      <p className="text-[10px] uppercase font-black text-primary mb-1">CTR (%)</p>
                      <p className="text-2xl font-black text-primary">
                        {(() => {
                          const views = selectedCampaign.creatives?.reduce((acc, c) => acc + (c.viewsCount || 0), 0) || 0;
                          const clicks = selectedCampaign.creatives?.reduce((acc, c) => acc + (c.clicksCount || 0), 0) || 0;
                          return views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';
                        })()}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* DETAILS */}
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
                             <Sliders size={14} /> Configuración Técnica
                          </h4>
                          <div className="space-y-3">
                             <div className="flex justify-between text-sm">
                                <span className="opacity-60">Prioridad:</span>
                                <span className="font-bold uppercase">{selectedCampaign.priority}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="opacity-60">Frecuencia:</span>
                                <span className="font-bold">Cada {selectedCampaign.frequency} min</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="opacity-60">Duración:</span>
                                <span className="font-bold">{selectedCampaign.duration} seg</span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                          <h4 className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
                             <Globe size={14} /> Segmentación
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {selectedCampaign.Regions?.length > 0 ? (
                               selectedCampaign.Regions.map(r => (
                                 <Badge key={r.id} variant="secondary" className="rounded-lg">{r.name}</Badge>
                               ))
                             ) : (
                               <span className="text-xs italic opacity-50">Global (Todas las regiones)</span>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* CREATIVE PREVIEW */}
                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest opacity-30">Creatividad Principal</h4>
                       <div className="aspect-[9/16] bg-gray-100 dark:bg-zinc-800 rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-white/5">
                          {selectedCampaign.creatives?.[0]?.mediaUrl ? (
                            selectedCampaign.creatives[0].type === 'video' ? (
                              <video src={`${FILE_BASE_URL}${selectedCampaign.creatives[0].mediaUrl}`} className="w-full h-full object-cover" controls />
                            ) : (
                              <img src={`${FILE_BASE_URL}${selectedCampaign.creatives[0].mediaUrl}`} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><ImageIcon size={48} /></div>
                          )}
                       </div>
                    </div>
                  </div>
               </div>
             )}

             <DialogFooter className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                <Button onClick={() => setIsReportOpen(false)} className="w-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-foreground font-black h-12 rounded-2xl">
                  CERRAR REPORTE
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* DELETE MODAL */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 max-w-sm">
             <DialogHeader className="flex flex-col items-center">
               <div className="size-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} />
               </div>
               <DialogTitle className="text-2xl font-black text-center">¿Eliminar Campaña?</DialogTitle>
               <p className="text-center text-muted-foreground mt-2">Esta acción removerá permanentemente la campaña y sus creatividades de la red.</p>
             </DialogHeader>
             <div className="flex gap-4 mt-8">
                <Button variant="ghost" className="flex-1 rounded-xl font-bold h-12" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black h-12 shadow-lg shadow-red-500/20" 
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "SÍ, ELIMINAR"}
                </Button>
             </div>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
