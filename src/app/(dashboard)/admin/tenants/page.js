'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Search, CheckCircle, XCircle, Store, Mail, Loader2, ShieldCheck, Globe, LogIn, Edit, Trash2, MapPin, CreditCard, ExternalLink, KeyRound
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import EmptyState from '@/components/ui/EmptyState';

export default function TenantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [regions, setRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Impersonate State
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonateTarget, setImpersonateTarget] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [currentTenant, setCurrentTenant] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Form State
  const initialForm = {
    restaurantName: '', slug: '', taxId: '', billingAddress: '', fullAddress: '',
    contactPerson: '', timezone: 'Europe/Madrid', country: 'ES', currency: 'EUR',
    planId: '', regionId: '',
    managerName: '', managerEmail: '', managerPassword: '',
    screensaverAdminBatchSize: 3, screensaverClientBatchSize: 1, screensaverIdleTime: 120
  };
  const [formData, setFormData] = useState(initialForm);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tenRes, planRes, regRes] = await Promise.all([
        api.get('/admin/tenants'),
        api.get('/admin/plans'),
        api.get('/admin/regions')
      ]);
      setTenants(tenRes.data.data.restaurants);
      setPlans(planRes.data.data.plans);
      setRegions(regRes.data.data.regions);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/tenants', formData);
      setIsCreateOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao criar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (tenant) => {
    setCurrentTenant(tenant);
    setFormData({
      restaurantName: tenant.name,
      slug: tenant.slug,
      taxId: tenant.taxId || '',
      billingAddress: tenant.billingAddress || '',
      fullAddress: tenant.fullAddress || '',
      contactPerson: tenant.contactPerson || '',
      timezone: tenant.timezone,
      country: tenant.country,
      currency: tenant.currency,
      planId: tenant.planId || '',
      regionId: tenant.regionId || '',
      managerName: tenant.Users?.[0]?.name || '',
      managerEmail: tenant.Users?.[0]?.email || '',
      managerPassword: '',
      screensaverAdminBatchSize: tenant.config?.screensaverAdminBatchSize || 3,
      screensaverClientBatchSize: tenant.config?.screensaverClientBatchSize || 1,
      screensaverIdleTime: tenant.config?.screensaverIdleTime || 120
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/tenants/${currentTenant.id}`, formData);
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/admin/tenants/${currentTenant.id}/update-password`, { password: newPassword });
      setIsPasswordOpen(false);
      setNewPassword('');
      alert('Contraseña actualizada con éxito');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar senha.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ATENÇÃO: Isso excluirá permanentemente o cliente e todos os seus dados. Continuar?')) return;
    try {
      await api.delete(`/admin/tenants/${id}`);
      fetchData();
    } catch (error) {
      alert('Erro ao excluir cliente.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!confirm(`Deseja realmente ${currentStatus ? 'bloquear' : 'ativar'} este cliente?`)) return;
    try {
      await api.patch(`/admin/tenants/${id}/toggle-status`);
      fetchData();
    } catch (e) { alert('Erro ao alterar status.'); }
  };

  const handleImpersonate = async (restaurantId, restaurantName) => {
    setImpersonateTarget(restaurantName);
    setIsImpersonating(true);

    try {
      const res = await api.post(`/admin/tenants/${restaurantId}/impersonate`);
      const { token, data } = res.data;
      const user = data.user;

      const currentToken = Cookies.get('ordengo_token');
      const currentUser = Cookies.get('ordengo_user');
      if (currentToken) Cookies.set('ordengo_admin_token', currentToken, { expires: 1 });
      if (currentUser) Cookies.set('ordengo_admin_user', currentUser, { expires: 1 });

      Cookies.remove('ordengo_token');
      Cookies.remove('ordengo_user');

      Cookies.set('ordengo_token', token, { expires: 30 });
      Cookies.set('ordengo_user', JSON.stringify(user), { expires: 30 });
      Cookies.set('admin_impersonating', 'true', { expires: 1 });

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error) {
      console.error(error);
      alert('Falha ao acessar painel do cliente. Verifique se existe um gerente ativo.');
      setIsImpersonating(false);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* IMPERSONATE OVERLAY */}
      {isImpersonating && (
        <div className="fixed inset-0 z-[9999] bg-[#1f1c1d] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/50 animate-bounce">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Acessando Painel do Cliente</h2>
              <p className="text-gray-400 text-sm">Autenticando como gerente de <span className="text-[var(--primary)] font-bold">{impersonateTarget}</span>...</p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <Loader2 className="text-[var(--primary)] animate-spin" size={18} />
              <span className="text-xs text-gray-300 font-mono">Redirecionando ambiente seguro...</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 animate-in fade-in duration-500 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Gestão completa de restaurantes, contratos e acessos.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[var(--primary)] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95">
            <Plus size={18} /> Nuevo Cliente
          </Button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors" size={20} />
            <Input
              placeholder="Buscar por nombre, ciudad o región..."
              className="pl-12 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 h-12 rounded-2xl shadow-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-xl font-bold">{tenants.filter(t => t.isActive).length} Activos</Badge>
             <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold">{tenants.filter(t => !t.isActive).length} Bloqueados</Badge>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-muted-foreground font-medium animate-pulse">Carregando carteira de clientes...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
              <EmptyState
                icon={Store}
                title="Ningún cliente registrado"
                subtitle="Aún no hay restaurantes en la plataforma. Cree el primer cliente para comenzar a gestionar su cartera."
                ctaLabel="Crear Primer Cliente"
                onCtaClick={() => setIsCreateOpen(true)}
              />
            ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <Table className="min-w-[1000px] md:min-w-full">
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="px-6 py-4 font-bold text-foreground">Establecimiento</TableHead>
                    <TableHead className="py-4 font-bold text-foreground hidden sm:table-cell">Contrato</TableHead>
                    <TableHead className="py-4 font-bold text-foreground hidden lg:table-cell">Gerente</TableHead>
                    <TableHead className="py-4 font-bold text-foreground">Estado</TableHead>
                    <TableHead className="text-right px-6 py-4 font-bold text-foreground">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} className="border-b border-white/5 hover:bg-white/40 dark:hover:bg-white/5 transition-all group">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "size-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner overflow-hidden",
                            tenant.isActive ? "bg-gradient-to-br from-gray-800 to-black" : "bg-gray-400"
                          )}>
                            {tenant.config?.logoUrl ? (
                              <img src={tenant.config.logoUrl} className="size-full object-cover" alt={tenant.name} />
                            ) : (
                              tenant.name.charAt(0)
                            )}
                          </div>
                          <div className="max-w-[200px] overflow-hidden">
                            <p className="font-extrabold text-foreground text-lg leading-tight group-hover:text-primary transition-colors truncate">{tenant.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Globe size={10} className="text-primary" /> {tenant.slug}
                              <span className="opacity-20 hidden sm:inline">|</span>
                              <span className="font-mono bg-muted/50 px-1.5 rounded uppercase hidden sm:inline">{tenant.taxId || 'S/NIF'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 hidden sm:table-cell">
                        <div className="space-y-1.5">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-none flex w-fit items-center gap-1.5 font-bold">
                            <CreditCard size={12} /> {tenant.Plan?.name || 'Sin Plan'}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <MapPin size={12} className="text-primary" /> {tenant.Region?.name || 'Global'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 hidden lg:table-cell">
                        <div className="space-y-1">
                          <p className="font-bold text-foreground/80">{tenant.Users?.[0]?.name || '---'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Mail size={12} className="text-primary" /> {tenant.Users?.[0]?.email || '---'}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        {tenant.isActive ? (
                          <div className="flex items-center gap-2 text-green-500">
                             <div className="size-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                             <span className="text-xs font-black uppercase hidden sm:inline">Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500">
                             <div className="size-2 bg-red-500 rounded-full"></div>
                             <span className="text-xs font-black uppercase hidden sm:inline">Bloqueado</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all hidden md:flex"
                            onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
                            title="Ver Detalhes"
                          >
                            <ExternalLink size={18} />
                          </Button>

                          <Button
                             size="sm"
                             className="h-10 gap-2 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-sm active:scale-95"
                             onClick={() => handleImpersonate(tenant.id, tenant.name)}
                           >
                             <LogIn size={16} /> <span className="hidden xl:inline">Acceder</span>
                           </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl font-black text-xl">⋮</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl rounded-2xl p-2 min-w-[180px]">
                              <DropdownMenuItem className="rounded-xl font-bold cursor-pointer" onClick={() => router.push(`/admin/tenants/${tenant.id}`)}>
                                <ExternalLink size={16} className="mr-3 text-primary" /> Detalles y Docs
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-bold cursor-pointer" onClick={() => handleEditOpen(tenant)}>
                                <Edit size={16} className="mr-3 text-primary" /> Editar Datos
                              </DropdownMenuItem>
                               <DropdownMenuItem className="rounded-xl font-bold cursor-pointer" onClick={() => { setCurrentTenant(tenant); setIsPasswordOpen(true); }}>
                                <KeyRound size={16} className="mr-3 text-primary" /> Alterar Senha
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-bold cursor-pointer" onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}>
                                {tenant.isActive ? <><XCircle size={16} className="mr-3 text-red-500" /> Bloquear</> : <><CheckCircle size={16} className="mr-3 text-green-500" /> Reactivar</>}
                              </DropdownMenuItem>
                              <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1"></div>
                              <DropdownMenuItem className="rounded-xl font-bold cursor-pointer text-red-600 hover:bg-red-50" onClick={() => handleDelete(tenant.id)}>
                                <Trash2 size={16} className="mr-3" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* CREATE MODAL */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-4xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black">Nuevo Cliente</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">Configura el entorno del nuevo restaurante en el sistema.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-8 mt-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lado A: Establecimiento */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-[var(--primary)]">
                      <Store size={20} />
                      <h4 className="font-black uppercase tracking-tighter text-sm">Información Comercial</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre Comercial</label>
                        <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" placeholder="Ej: Luigi's Pizza" value={formData.restaurantName} onChange={e => setFormData({ ...formData, restaurantName: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Dirección Completa (Publica)</label>
                        <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" placeholder="Calle, Número, Ciudad, CP" value={formData.fullAddress} onChange={e => setFormData({ ...formData, fullAddress: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">NIF / Tax ID</label>
                            <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" placeholder="B12345678" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">Slug (URL)</label>
                            <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" placeholder="luigis-pizza" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Lado B: Contrato y Acceso */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-[var(--primary)]">
                      <ShieldCheck size={20} />
                      <h4 className="font-black uppercase tracking-tighter text-sm">Contrato y Acceso</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">Plan</label>
                            <Select value={formData.planId} onValueChange={v => setFormData({ ...formData, planId: v })} required>
                              <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold"><SelectValue placeholder="Elegir..." /></SelectTrigger>
                              <SelectContent className="bg-white dark:bg-zinc-900">{plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase ml-1 opacity-60">Región</label>
                            <Select value={formData.regionId} onValueChange={v => setFormData({ ...formData, regionId: v })} required>
                              <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold"><SelectValue placeholder="Elegir..." /></SelectTrigger>
                              <SelectContent className="bg-white dark:bg-zinc-900">{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Gerente (Email)</label>
                        <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" type="email" placeholder="gerente@email.com" value={formData.managerEmail} onChange={e => setFormData({ ...formData, managerEmail: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Contraseña Inicial</label>
                        <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" type="password" placeholder="••••••••" value={formData.managerPassword} onChange={e => setFormData({ ...formData, managerPassword: e.target.value })} required />
                      </div>
                   </div>
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                <Button type="submit" className="bg-[var(--primary)] hover:bg-red-700 h-12 px-10 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "CREAR CLIENTE"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* EDIT MODAL */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black">Editar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-8 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[var(--primary)]"><Store size={20} /><h4 className="font-black uppercase tracking-tighter text-sm">Información Comercial</h4></div>
                    <div className="space-y-4">
                       <div className="space-y-2">
                         <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre Comercial</label>
                         <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" value={formData.restaurantName} onChange={e => setFormData({ ...formData, restaurantName: e.target.value })} required />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-bold uppercase ml-1 opacity-60">Dirección Completa</label>
                         <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" value={formData.fullAddress} onChange={e => setFormData({ ...formData, fullAddress: e.target.value })} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase ml-1 opacity-60">NIF / Tax ID</label>
                             <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase ml-1 opacity-60">Slug (URL)</label>
                             <Input className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[var(--primary)]"><ShieldCheck size={20} /><h4 className="font-black uppercase tracking-tighter text-sm">Configuración Técnica</h4></div>
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase ml-1 opacity-60">Plan</label>
                           <Select value={formData.planId} onValueChange={v => setFormData({ ...formData, planId: v })} required>
                             <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-white dark:bg-zinc-900">{plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                           </Select>
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase ml-1 opacity-60">Región</label>
                           <Select value={formData.regionId} onValueChange={v => setFormData({ ...formData, regionId: v })} required>
                             <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-white dark:bg-zinc-900">{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                           </Select>
                         </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase ml-1 opacity-60">Timezone</label>
                          <Select value={formData.timezone} onValueChange={v => setFormData({ ...formData, timezone: v })}>
                             <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-white dark:bg-zinc-900">
                                <SelectItem value="Europe/Madrid">Madrid (ES)</SelectItem>
                                <SelectItem value="Europe/Paris">Paris (FR)</SelectItem>
                                <SelectItem value="Europe/Berlin">Berlin (DE)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                 </div>
              </div>

              <DialogFooter className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                <Button type="submit" className="bg-[var(--primary)] hover:bg-red-700 h-12 px-10 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "GUARDAR CAMBIOS"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* PASSWORD MODAL */}
        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-[2rem] p-8 max-w-md">
            <DialogHeader>
              <div className="size-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)] mb-4">
                 <KeyRound size={28} />
              </div>
              <DialogTitle className="text-2xl font-black">Alterar Senha</DialogTitle>
              <DialogDescription className="font-medium">Defina uma nova senha de acesso para o gerente de <b>{currentTenant?.name}</b>.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordUpdate} className="space-y-6 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase ml-1 opacity-60">Nova Senha</label>
                <Input
                  className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold"
                  type="password"
                  placeholder="Min. 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsPasswordOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                <Button type="submit" className="bg-[var(--primary)] hover:bg-red-700 h-12 px-8 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "ATUALIZAR SENHA"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
