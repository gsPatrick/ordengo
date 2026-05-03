'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, User, Shield, Mail, 
  Trash2, Edit, Loader2, Key, CheckCircle2, XCircle
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import EmptyState from '@/components/ui/EmptyState';

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const initialForm = { name: '', email: '', password: '', role: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, rolesRes] = await Promise.all([
        api.get('/admin/settings/team'),
        api.get('/admin/roles')
      ]);
      setTeam(teamRes.data.data.team);
      setRoles(rolesRes.data.data.roles);
      
      // Set default role for form if roles exist
      if (rolesRes.data.data.roles.length > 0) {
        setFormData(prev => ({ ...prev, role: rolesRes.data.data.roles[0].name }));
      }
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
      await api.post('/admin/settings/team', formData);
      setIsCreateOpen(false);
      setFormData(initialForm);
      // Refresh...
      const res = await api.get('/admin/settings/team');
      setTeam(res.data.data.team);
    } catch (e) {
      alert('Erro ao adicionar membro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm('¿Desea eliminar este miembro del equipo?')) return;
    try {
      await api.delete(`/admin/settings/team/${id}`);
      setTeam(team.filter(m => m.id !== id));
    } catch (e) { alert('Erro ao excluir.'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
                {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Equipo SaaS</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Gestione el acceso de los administradores y soporte de la plataforma.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[var(--primary)] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95">
            <Plus size={18} /> Nuevo Miembro
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors" size={20} />
            <Input
              placeholder="Buscar por nombre o email..."
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
              <p className="text-muted-foreground font-medium animate-pulse">Cargando equipo...</p>
            </div>
          ) : team.length === 0 ? (
            <EmptyState
              icon={User}
              title="Equipo vacío"
              subtitle="Aún no hay miembros en el equipo administrativo. Agregue el primer miembro para comenzar."
              ctaLabel="Agregar Miembro"
              onCtaClick={() => setIsCreateOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="px-6 py-4 font-bold text-foreground">Nombre</TableHead>
                  <TableHead className="py-4 font-bold text-foreground">Email</TableHead>
                  <TableHead className="py-4 font-bold text-foreground">Cargo</TableHead>
                  <TableHead className="py-4 font-bold text-foreground">Estado</TableHead>
                  <TableHead className="text-right px-6 py-4 font-bold text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map(member => (
                  <TableRow key={member.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                             <User size={20} />
                          </div>
                         <span className="font-bold">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <span className="text-xs flex items-center gap-2"><Mail size={12} className="text-[var(--primary)]" /> {member.email}</span>
                    </TableCell>
                    <TableCell className="py-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-black border-gray-100 dark:border-white/20 bg-gray-50 dark:bg-white/5">
                           {member.role === 'superadmin' ? <Shield size={10} className="mr-1 text-red-500" /> : null}
                           {member.role}
                        </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] font-black uppercase">Activo</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                       <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all"><Edit size={16} /></Button>
                          <Button size="icon" variant="ghost" className="rounded-xl hover:bg-red-500/10 text-red-500 transition-all" onClick={() => handleDelete(member.id)}><Trash2 size={16} /></Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* CREATE MODAL */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 max-w-md">
             <DialogHeader>
               <DialogTitle className="text-2xl font-black">Nuevo Miembro</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleCreate} className="space-y-6 mt-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre Completo</label>
                    <Input className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Email</label>
                    <Input type="email" className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Contraseña</label>
                    <Input type="password" className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Cargo / Permisos</label>
                    <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                       <SelectTrigger className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900">
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>
                <DialogFooter>
                   <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                   <Button type="submit" className="bg-[var(--primary)] hover:bg-red-700 h-12 px-8 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                     {submitting ? <Loader2 className="animate-spin" size={20} /> : "CREAR MIEMBRO"}
                   </Button>
                </DialogFooter>
             </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
