'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Lock, 
  Trash2, Edit3, CheckCircle2, XCircle,
  Mail, Phone, Briefcase, ChevronRight,
  ShieldCheck, Search, Filter, Plus, Loader2, Key
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
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modal de Miembro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    pin: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const [teamRes, rolesRes] = await Promise.all([
        api.get('/team'),
        api.get('/roles')
      ]);
      setEmployees(teamRes.data.data.users || []);
      setRoles(rolesRes.data.data.roles || []);
    } catch (error) {
      console.error("Error al cargar datos del equipo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'waiter',
        pin: member.pin || '',
        password: '' // No cargar contraseña existente
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'waiter',
        pin: '',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validaciones básicas según el rol
      if (formData.role === 'waiter' && !formData.pin) {
        alert('Los camareros necesitan un PIN de 4 dígitos.');
        return;
      }
      if (formData.role === 'manager' && !formData.email) {
        alert('Los gerentes necesitan un email para acceder.');
        return;
      }

      if (editingMember) {
        await api.patch(`/team/${editingMember.id}`, formData);
      } else {
        await api.post('/team', formData);
      }
      
      setIsModalOpen(false);
      fetchTeamData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('¿Estás seguro de eliminar a este miembro del equipo? Perderá el acceso de inmediato.')) return;
    try {
      await api.delete(`/team/${id}`);
      fetchTeamData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Equipo y Permisos</h1>
          <p className="text-sm text-gray-500 font-medium">Administra tu personal y niveles de acceso</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase border-gray-200 hover:bg-gray-50">
            <ShieldCheck size={14} className="mr-2" />
            Auditoría
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-[#df0024] hover:bg-red-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase shadow-lg shadow-red-50">
            <UserPlus size={14} className="mr-2" />
            Añadir Miembro
          </Button>
        </div>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="employees" className="rounded-lg text-[10px] font-black uppercase px-6">Empleados</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg text-[10px] font-black uppercase px-6">Cargos y Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6 outline-none">
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

          {/* Tabla Estilizada */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden border border-gray-50 min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Miembro</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Cargo</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Contacto</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-gray-300" size={32} />
                      </td>
                    </tr>
                  ) : filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs uppercase">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 leading-tight">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{emp.email || 'Acceso por PIN'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-gray-100 text-gray-500 border-none rounded-md px-2 py-0.5 text-[8px] font-black uppercase">
                          {emp.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                          <Phone size={12} className="text-gray-300" />
                          {emp.phone || 'No asig.'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-tighter border border-emerald-100">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button onClick={() => handleOpenModal(emp)} variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-gray-100">
                            <Edit3 size={14} className="text-gray-400" />
                          </Button>
                          <Button onClick={() => handleDeleteMember(emp.id)} variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center max-w-xs mx-auto">
                          <div className="size-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                            <Users size={32} className="text-gray-100" />
                          </div>
                          <h4 className="text-md font-black text-gray-900">Sin equipo registrado</h4>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">Añade a tus empleados para que puedan acceder al panel operativo con sus propios roles.</p>
                          <Button onClick={() => handleOpenModal()} className="mt-6 bg-gray-900 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase">Vincular mi primer empleado</Button>
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
                  <p className="text-[10px] text-gray-400 font-medium mb-4 uppercase tracking-tighter">Panel Operativo</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {role.permissions?.map((perm, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[8px] font-black uppercase border border-gray-100">
                        {perm.slug}
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

            <Card className="border-2 border-dashed border-gray-100 shadow-none bg-transparent rounded-2xl flex flex-col items-center justify-center p-8 text-center group hover:border-[#df0024] transition-colors cursor-pointer min-h-[220px]">
              <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-[#df0024] transition-all">
                <Plus size={24} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Crear Cargo</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[150px] font-medium">Define permisos personalizados para tu equipo</p>
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
            <h4 className="font-black text-amber-900 uppercase text-[10px] tracking-widest mb-1">Seguridad de la Plataforma</h4>
            <p className="text-xs text-amber-700 leading-relaxed max-w-3xl font-medium">
              Recuerda que solo el Administrador principal tiene acceso a la configuración de pasarelas de pago y eliminación total del restaurante. Los roles creados aquí solo limitan el uso del panel operativo para evitar acciones accidentales en la configuración base.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Añadir/Editar Miembro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gray-900 p-6 text-white">
            <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              <UserPlus size={24} className="text-white" />
            </div>
            <DialogTitle className="text-xl font-black">{editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}</DialogTitle>
            <p className="text-xs text-gray-400 mt-1">Configura el acceso y perfil del empleado.</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Cargo / Rol</label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData({...formData, role: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs uppercase">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100">
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="waiter">Camarero</SelectItem>
                      <SelectItem value="kitchen">Cocina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Teléfono</label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+34..." 
                    className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium"
                  />
                </div>
              </div>

              {formData.role === 'manager' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email de Acceso</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <Input 
                        type="email"
                        required={formData.role === 'manager'}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="admin@restaurante.com" 
                        className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{editingMember ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <Input 
                        type="password"
                        required={!editingMember && formData.role === 'manager'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••" 
                        className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50 font-medium"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">PIN de Acceso (4 dígitos)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <Input 
                      required={formData.role === 'waiter'}
                      maxLength={4}
                      value={formData.pin}
                      onChange={(e) => setFormData({...formData, pin: e.target.value})}
                      placeholder="Ej: 1234" 
                      className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50 font-black text-lg tracking-[0.5em]"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium italic">Este código se usará en los dispositivos de mesa y comandas.</p>
                </div>
              )}
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
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : (editingMember ? 'Actualizar' : 'Guardar Miembro')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
    </ManagerLayout>
  );
}
