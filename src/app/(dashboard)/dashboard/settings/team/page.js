'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Lock, 
  Trash2, Edit3, CheckCircle2, XCircle,
  Mail, Phone, Briefcase, ChevronRight,
  ShieldCheck, Search, Filter, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ManagerLayout from '@/components/ManagerLayout.js/ManagerLayout';
import api from '@/lib/api';

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

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
          <Button className="bg-[#df0024] hover:bg-red-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase shadow-lg shadow-red-50">
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
                  {employees.length > 0 ? employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 leading-tight">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-gray-100 text-gray-500 border-none rounded-md px-2 py-0.5 text-[8px] font-black uppercase">
                          {emp.userRole?.name || emp.role}
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
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-gray-100">
                            <Edit3 size={14} className="text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50 hover:text-red-600">
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
                          <Button className="mt-6 bg-gray-900 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase">Vincular mi primer empleado</Button>
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
                      {role.permissions?.length || 0} Permisos
                    </Badge>
                  </div>
                  <h3 className="font-black text-gray-900 mb-1">{role.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium mb-4 uppercase tracking-tighter">Panel Operativo</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {role.permissions?.map((perm, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[8px] font-black uppercase border border-gray-100">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Activo</span>
                  <Button variant="ghost" size="icon" className="size-7 rounded-lg">
                    <Edit3 size={14} className="text-gray-300" />
                  </Button>
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
    </div>
    </ManagerLayout>
  );
}
