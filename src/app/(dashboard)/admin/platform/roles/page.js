'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Plus, Save, Trash2, Lock, 
  CheckCircle2, Loader2, Sliders, ShieldAlert
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import EmptyState from '@/components/ui/EmptyState';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/roles/permissions')
      ]);
      setRoles(rolesRes.data.data.roles);
      setPermissions(permsRes.data.data.permissions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (role = null) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissionIds: role.Permissions?.map(p => p.id) || []
      });
    } else {
      setSelectedRole(null);
      setFormData({ name: '', description: '', permissionIds: [] });
    }
    setIsModalOpen(true);
  };

  const togglePermission = (id) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter(pid => pid !== id)
        : [...prev.permissionIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedRole) {
        await api.patch(`/admin/roles/${selectedRole.id}`, formData);
      } else {
        await api.post('/admin/roles', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar cargo');
    } finally {
      setSubmitting(false);
    }
  };

  // Agrupar permissões por 'group'
  const groupedPermissions = permissions.reduce((acc, p) => {
    const group = p.group || 'Geral';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Roles y Permisos</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Defina os níveis de acesso dinâmicos para a equipe SaaS.</p>
          </div>
          <Button onClick={() => handleEdit()} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold">
            <Plus size={18} /> Crear Nuevo Cargo
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[#df0024]" size={48} />
          </div>
        ) : roles.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Sin cargos definidos"
            subtitle="Defina roles y permisos para controlar el acceso de su equipo a los módulos de la plataforma."
            ctaLabel="Crear Primer Cargo"
            onCtaClick={() => handleEdit()}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <div key={role.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] p-8 flex flex-col group hover:shadow-red-500/10 transition-all duration-300">
                 <div className="flex justify-between items-start mb-6">
                    <div className="size-12 bg-[#df0024]/10 rounded-2xl flex items-center justify-center text-[#df0024]">
                       <ShieldCheck size={24} />
                    </div>
                    {role.isSystem && (
                       <Lock size={16} className="text-muted-foreground opacity-30" />
                    )}
                 </div>
                 
                 <h3 className="text-xl font-black mb-1">{role.name}</h3>
                 <p className="text-sm font-medium opacity-50 mb-6 line-clamp-2">{role.description || 'Sem descrição.'}</p>
                 
                 <div className="flex flex-wrap gap-2 mb-8 flex-1">
                    {role.Permissions?.slice(0, 5).map(p => (
                      <Badge key={p.id} className="bg-gray-50 dark:bg-white/5 border-none text-[10px] uppercase text-foreground/70">{p.name}</Badge>
                    ))}
                    {role.Permissions?.length > 5 && (
                      <Badge className="bg-gray-50 dark:bg-white/5 border-none text-[10px] uppercase text-foreground/70">+{role.Permissions.length - 5} mais</Badge>
                    )}
                 </div>
 
                 <Button variant="ghost" className="w-full rounded-2xl font-black bg-gray-50 dark:bg-zinc-800 hover:bg-[#df0024] hover:text-white transition-all h-12" onClick={() => handleEdit(role)}>
                    GESTIONAR ACCESO
                 </Button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL CONFIG */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[3rem] p-10 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black">{selectedRole ? 'Configurar Acceso' : 'Nuevo Cargo'}</DialogTitle>
              <p className="text-muted-foreground font-medium italic">Marque quais módulos e ações este cargo poderá realizar.</p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-10">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase ml-1 opacity-60 tracking-widest">Nombre del Cargo</label>
                     <Input placeholder="Ex: Suporte Nível 1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase ml-1 opacity-60 tracking-widest">Descrição</label>
                     <Input placeholder="Breve descrição das responsabilidades" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" />
                  </div>
               </div>

               <div className="space-y-8">
                  <h3 className="text-sm font-black flex items-center gap-2 text-[#df0024]">
                    <ShieldAlert size={18} />
                    MATRIZ DE PERMISSÕES
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                     {Object.entries(groupedPermissions).map(([group, perms]) => (
                       <div key={group} className="space-y-4">
                          <h4 className="text-xs font-black uppercase text-muted-foreground border-b border-white/10 pb-2">{group}</h4>
                          <div className="space-y-3">
                             {perms.map(p => (
                               <div key={p.id} className="flex items-center justify-between group/item">
                                  <div className="space-y-0.5">
                                     <p className="text-sm font-bold">{p.name}</p>
                                     <p className="text-[10px] opacity-40 uppercase font-bold tracking-tight">{p.slug}</p>
                                  </div>
                                  <Checkbox 
                                    checked={formData.permissionIds.includes(p.id)} 
                                    onCheckedChange={() => togglePermission(p.id)}
                                    className="rounded-lg size-6 border-2 border-white/20 data-[state=checked]:bg-[#df0024] data-[state=checked]:border-[#df0024]"
                                  />
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

                <DialogFooter className="pt-8 border-t border-gray-100 dark:border-white/10">
                   <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                   <Button type="submit" className="bg-[#df0024] hover:bg-red-700 h-14 px-12 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                     {submitting ? <Loader2 className="animate-spin" /> : 'GUARDAR CONFIGURACIÓN'}
                   </Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
    </AdminLayout>
  );
}
