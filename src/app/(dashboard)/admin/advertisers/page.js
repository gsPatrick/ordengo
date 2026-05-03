'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Building2, Mail, Phone, 
  MoreVertical, Trash2, Edit, Loader2, ExternalLink
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import EmptyState from '@/components/ui/EmptyState';

export default function AdvertisersPage() {
  const [loading, setLoading] = useState(true);
  const [advertisers, setAdvertisers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const initialForm = { companyName: '', contactName: '', email: '', phone: '', taxId: '' };
  const [formData, setFormData] = useState(initialForm);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/advertisers');
      setAdvertisers(res.data.data.advertisers);
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
      await api.post('/admin/advertisers', formData);
      setIsCreateOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Erro ao criar anunciante.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/advertisers/${editingId}`, formData);
      setIsEditOpen(false);
      setFormData(initialForm);
      setEditingId(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Erro ao atualizar anunciante.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/advertisers/${deletingId}`);
      setIsDeleteOpen(false);
      setDeletingId(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Erro ao deletar anunciante.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (adv) => {
    setFormData({
      companyName: adv.companyName,
      contactName: adv.contactName || '',
      email: adv.email || '',
      phone: adv.phone || '',
      taxId: adv.taxId || ''
    });
    setEditingId(adv.id);
    setIsEditOpen(true);
  };

  const openDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Anunciantes</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Gestione as marcas e parceiros que anunciam na rede.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[var(--primary)] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95">
            <Plus size={18} /> Nuevo Anunciante
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors" size={20} />
            <Input
              placeholder="Buscar anunciante..."
              className="pl-12 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 h-12 rounded-2xl shadow-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
              <p className="text-muted-foreground font-medium animate-pulse">Carregando anunciantes...</p>
            </div>
          ) : advertisers.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Sin anunciantes registrados"
              subtitle="Agregue el primer anunciante para comenzar a gestionar campañas publicitarias en la red de tablets."
              ctaLabel="Nuevo Anunciante"
              onCtaClick={() => setIsCreateOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="px-6 py-4 font-bold text-foreground">Nombre</TableHead>
                  <TableHead className="py-4 font-bold text-foreground">Contacto</TableHead>
                  <TableHead className="py-4 font-bold text-foreground">Tax ID</TableHead>
                  <TableHead className="text-right px-6 py-4 font-bold text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisers.map(adv => (
                  <TableRow key={adv.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                            <Building2 size={20} />
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold">{adv.companyName}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{adv.campaignsCount} campañas activas</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{adv.contactName || 'Sin contacto'}</p>
                          <div className="flex flex-col gap-0.5 opacity-60">
                            {adv.email && <p className="text-[10px] flex items-center gap-1.5"><Mail size={10} className="text-[var(--primary)]" /> {adv.email}</p>}
                            {adv.phone && <p className="text-[10px] flex items-center gap-1.5"><Phone size={10} className="text-[var(--primary)]" /> {adv.phone}</p>}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <span className="font-mono text-xs bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-2 py-1 rounded">{adv.taxId || 'N/A'}</span>
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                       <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => openEdit(adv)}
                            className="rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => openDelete(adv.id)}
                            className="rounded-xl hover:bg-red-500/10 text-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* CREATE/EDIT MODAL */}
        <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(val) => {
          if(!val) {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            setEditingId(null);
            setFormData(initialForm);
          }
        }}>
          <DialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 max-w-md">
             <DialogHeader>
               <DialogTitle className="text-2xl font-black">{isEditOpen ? "Editar Anunciante" : "Nuevo Anunciante"}</DialogTitle>
             </DialogHeader>
             <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-6 mt-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre de la Empresa</label>
                   <Input 
                      className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" 
                      value={formData.companyName} 
                      onChange={e => setFormData({...formData, companyName: e.target.value})} 
                      required 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre del Contacto</label>
                   <Input 
                      className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" 
                      value={formData.contactName} 
                      onChange={e => setFormData({...formData, contactName: e.target.value})} 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase ml-1 opacity-60">Email Comercial</label>
                   <Input 
                      type="email" 
                      className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      required 
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase ml-1 opacity-60">Teléfono</label>
                      <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase ml-1 opacity-60">Tax ID</label>
                      <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
                   </div>
                </div>
                <DialogFooter>
                   <Button type="button" variant="ghost" onClick={() => {
                      setIsCreateOpen(false);
                      setIsEditOpen(false);
                      setFormData(initialForm);
                   }} className="rounded-xl font-bold">Cancelar</Button>
                   <Button type="submit" className="bg-[var(--primary)] hover:bg-red-700 h-12 px-8 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                     {submitting ? <Loader2 className="animate-spin" size={20} /> : (isEditOpen ? "GUARDAR CAMBIOS" : "CREAR ANUNCIANTE")}
                   </Button>
                </DialogFooter>
             </form>
          </DialogContent>
        </Dialog>

        {/* DELETE MODAL */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 max-w-sm">
             <DialogHeader className="flex flex-col items-center">
               <div className="size-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} />
               </div>
               <DialogTitle className="text-2xl font-black text-center">¿Eliminar Anunciante?</DialogTitle>
               <p className="text-center text-muted-foreground mt-2">Esta acción no se pode deshacer. El anunciante será removido de la red.</p>
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
