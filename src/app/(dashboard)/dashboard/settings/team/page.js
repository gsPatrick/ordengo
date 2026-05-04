'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Lock, 
  Trash2, Edit3, Mail, ChevronRight,
  ShieldCheck, Search, Filter, Plus, Loader2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ManagerLayout from '@/components/ManagerLayout.js/ManagerLayout';
import api from '@/lib/api';

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modal de Usuario del Panel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'manager',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Modal de Rol
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissionIds: []
  });
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamRes, rolesRes, permsRes] = await Promise.all([
        api.get('/team'),
        api.get('/roles'),
        api.get('/roles/permissions')
      ]);
      // Filtrar solo usuarios que tienen acceso al panel (manager, admin, superadmin, etc)
      const dashboardUsers = (teamRes.data.data.users || []).filter(u => 
        !['waiter', 'kitchen'].includes(u.role)
      );
      setUsers(dashboardUsers);
      setRoles(rolesRes.data.data.roles || []);
      setAvailablePermissions(permsRes.data.data.permissions || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'manager',
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'manager',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!formData.email) {
        alert('Los usuarios del panel necesitan un email de acceso.');
        setIsSubmitting(false);
        return;
      }

      if (editingUser) {
        await api.patch(`/team/${editingUser.id}`, formData);
      } else {
        await api.post('/team', formData);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Estás seguro de eliminar a este usuario? Perderá el acceso al panel de control de inmediato.')) return;
    try {
      await api.delete(`/team/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setIsRoleSubmitting(true);
    try {
      if (!roleFormData.name) {
        alert('El rol necesita un nombre.');
        setIsRoleSubmitting(false);
        return;
      }
      await api.post('/roles', roleFormData);
      setIsRoleModalOpen(false);
      setRoleFormData({ name: '', description: '', permissionIds: [] });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear rol');
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  const togglePermission = (permId) => {
    setRoleFormData(prev => {
      const isSelected = prev.permissionIds.includes(permId);
      if (isSelected) {
        return { ...prev, permissionIds: prev.permissionIds.filter(id => id !== permId) };
      } else {
        return { ...prev, permissionIds: [...prev.permissionIds, permId] };
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Usuarios y Permisos</h1>
          <p className="text-sm text-gray-500 font-medium">Administra quién tiene acceso al panel de control</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase border-gray-200 hover:bg-gray-50">
            <ShieldCheck size={14} className="mr-2" />
            Auditoría
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-[#df0024] hover:bg-red-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase shadow-lg shadow-red-50">
            <UserPlus size={14} className="mr-2" />
            Añadir Usuario
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="users" className="rounded-lg text-[10px] font-black uppercase px-6">Usuarios del Panel</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg text-[10px] font-black uppercase px-6">Roles y Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 outline-none">
          {/* Buscador Compacto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center px-4 relative">
            <Search className="text-gray-300 absolute left-6" size={18} />
            <Input 
              placeholder="Buscar por nombre o email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none h-12 bg-transparent focus-visible:ring-0 text-sm font-medium text-gray-700 placeholder:text-gray-300 pl-10 w-full"
            />
            <Button variant="ghost" className="size-9 p-0 text-gray-400"><Filter size={18} /></Button>
          </div>

          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden border border-gray-50 min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Rol de Acceso</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-gray-300" size={32} />
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-gray-900 flex items-center justify-center text-white font-black text-xs uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 leading-tight">{user.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-gray-100 text-gray-500 border-none rounded-md px-2 py-0.5 text-[8px] font-black uppercase">
                          {user.userRole?.name || (user.role === 'manager' ? 'Gerente (Sistema)' : user.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-tighter border border-emerald-100">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button onClick={() => handleOpenModal(user)} variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-gray-100">
                            <Edit3 size={14} className="text-gray-400" />
                          </Button>
                          <Button onClick={() => handleDeleteUser(user.id)} variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center max-w-xs mx-auto">
                          <div className="size-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                            <Shield size={32} className="text-gray-200" />
                          </div>
                          <h4 className="text-md font-black text-gray-900">Sin usuarios adicionales</h4>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">Crea accesos para que otros administradores o gerentes puedan gestionar el restaurante.</p>
                          <Button onClick={() => handleOpenModal()} className="mt-6 bg-gray-900 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase">Crear nuevo acceso</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="border-none shadow-sm bg-white rounded-2xl border border-gray-50 flex flex-col h-full hover:shadow-md transition-all">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black">
                      {role.name.charAt(0)}
                    </div>
                    <Badge className="bg-red-50 text-[#df0024] border-none text-[8px] font-black uppercase">
                      Sistema
                    </Badge>
                  </div>
                  <h3 className="font-black text-gray-900 mb-1">{role.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium mb-4 uppercase tracking-tighter">Acceso al Panel</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(role.Permissions || role.permissions || []).map((perm, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[8px] font-black uppercase border border-gray-100">
                        {perm.slug || perm}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Inmutable</span>
                  <Lock size={14} className="text-gray-300" />
                </div>
              </Card>
            ))}

            <Card 
              onClick={() => setIsRoleModalOpen(true)}
              className="border-2 border-dashed border-gray-100 shadow-none bg-transparent rounded-2xl flex flex-col items-center justify-center p-8 text-center group hover:border-[#df0024] hover:bg-red-50/30 transition-colors cursor-pointer min-h-[220px]"
            >
              <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-[#df0024] transition-all">
                <Plus size={24} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-[#df0024]">Crear Rol de Acceso</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[150px] font-medium group-hover:text-red-900/60">Define permisos personalizados para tus administradores</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
        <div className="flex gap-4">
          <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-amber-600 shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="font-black text-amber-900 uppercase text-[10px] tracking-widest mb-1">Seguridad del Panel</h4>
            <p className="text-xs text-amber-700 leading-relaxed max-w-3xl font-medium">
              Esta sección es exclusiva para dar acceso al panel administrativo de OrdenGO. Para gestionar el personal de sala y cocina (Camareros), dirígete a la configuración general del restaurante. Los usuarios aquí creados tendrán acceso al Dashboard según su rol.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Añadir/Editar Usuario */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gray-900 p-6 text-white">
            <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <DialogTitle className="text-xl font-black">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario de Panel'}</DialogTitle>
            <p className="text-xs text-gray-400 mt-1">Configura el acceso administrativo al Dashboard.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-white">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Completo</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Juan Pérez" 
                    className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Rol de Acceso</label>
                <Select 
                  value={formData.userRoleId || 'manager'} 
                  onValueChange={(val) => {
                    if (val === 'manager') {
                      setFormData({...formData, role: 'manager', userRoleId: null});
                    } else {
                      setFormData({...formData, role: 'manager', userRoleId: val});
                    }
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs uppercase">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100">
                    <SelectItem value="manager">Gerente Total (Sistema)</SelectItem>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email de Acceso</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <Input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@restaurante.com" 
                    className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <Input 
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                    className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12 font-bold text-gray-400">
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#df0024] hover:bg-red-700 text-white rounded-xl h-12 font-black shadow-lg shadow-red-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : (editingUser ? 'Actualizar' : 'Crear Usuario')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Crear Rol */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-[#df0024] p-6 text-white">
            <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <DialogTitle className="text-xl font-black">Nuevo Rol de Acceso</DialogTitle>
            <p className="text-xs text-red-100 mt-1">Selecciona qué pantallas y acciones podrá realizar este cargo.</p>
          </div>
          
          <form onSubmit={handleCreateRole} className="p-8 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre del Cargo</label>
                <Input 
                  required
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                  placeholder="Ej: Gerente Financiero" 
                  className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Descripción</label>
                <Input 
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                  placeholder="Acceso exclusivo a métricas y reportes..." 
                  className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Permisos Disponibles</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availablePermissions.map(perm => {
                    const isChecked = roleFormData.permissionIds.includes(perm.id);
                    return (
                      <div 
                        key={perm.id} 
                        onClick={() => togglePermission(perm.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`mt-0.5 size-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-[#df0024] border-[#df0024]' : 'bg-white border-gray-300'
                        }`}>
                          {isChecked && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${isChecked ? 'text-red-900' : 'text-gray-700'}`}>
                            {perm.name}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{perm.description || perm.slug}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50">
              <Button type="button" variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="flex-1 rounded-xl h-12 font-bold text-gray-400 hover:bg-gray-100">
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isRoleSubmitting}
                className="flex-1 bg-[#df0024] hover:bg-red-700 text-white rounded-xl h-12 font-black shadow-lg shadow-red-50"
              >
                {isRoleSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : 'Guardar Cargo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
    </ManagerLayout>
  );
}
