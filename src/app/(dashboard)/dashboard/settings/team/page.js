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

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState([
    { id: 1, name: 'Pedro Sánchez', email: 'pedro@restaurante.com', role: 'Camarero', status: 'active', phone: '+34 600 000 000' },
    { id: 2, name: 'Lucía López', email: 'lucia@restaurante.com', role: 'Gerente de Turno', status: 'active', phone: '+34 600 111 222' },
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: 'Camarero', permissions: ['Menu', 'Mesas', 'Reservas'], color: 'bg-blue-100 text-blue-600' },
    { id: 2, name: 'Gerente de Turno', permissions: ['Menu', 'Mesas', 'Reservas', 'Ofertas', 'Finanzas'], color: 'bg-[#df0024] text-white' },
    { id: 3, name: 'Cocinero', permissions: ['Menu'], color: 'bg-green-100 text-green-600' },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Equipo y Permisos</h1>
          <p className="text-gray-500">Administra tus empleados y define sus niveles de acceso</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200">
            <Lock size={18} className="mr-2" />
            Auditoría de Logs
          </Button>
          <Button className="bg-[#df0024] hover:bg-red-700 text-white rounded-xl gap-2 shadow-lg shadow-red-200 h-12 px-8">
            <UserPlus size={18} />
            Añadir Miembro
          </Button>
        </div>
      </div>

      <Tabs defaultValue="employees" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-2xl mb-8">
          <TabsTrigger value="employees" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-[#df0024] data-[state=active]:shadow-sm">
            <Users size={16} className="mr-2" />
            Empleados
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-[#df0024] data-[state=active]:shadow-sm">
            <Shield size={16} className="mr-2" />
            Cargos y Permisos
          </TabsTrigger>
        </TabsList>

        {/* Tab Empleados */}
        <TabsContent value="employees" className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input placeholder="Buscar por nombre o email..." className="pl-12 border-none h-12 bg-transparent focus-visible:ring-0 text-gray-700 font-medium" />
              </div>
              <Button variant="ghost" className="rounded-xl">
                <Filter size={18} />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Miembro</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Cargo</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Contacto</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-gray-100 text-gray-600 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase">
                          {emp.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <Phone size={14} className="text-gray-300" />
                          {emp.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-green-100">
                          <CheckCircle2 size={12} />
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                            <Edit3 size={16} className="text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Cargos */}
        <TabsContent value="roles" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
              <CardHeader className={`${role.color} p-6 flex flex-row items-center justify-between`}>
                <CardTitle className="text-lg font-black">{role.name}</CardTitle>
                <ShieldCheck size={24} className="opacity-40" />
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Acceso permitido a:</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {role.permissions.map((perm) => (
                    <span key={perm} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold border border-gray-100">
                      {perm}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-xs text-gray-400 font-medium">5 empleados con este cargo</span>
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <Edit3 size={16} className="text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-2 border-dashed border-gray-100 shadow-none bg-transparent rounded-3xl flex flex-col items-center justify-center p-8 text-center group hover:border-[#df0024] transition-colors cursor-pointer">
            <div className="size-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-[#df0024] transition-all">
              <Plus size={32} />
            </div>
            <h4 className="font-bold text-gray-900">Crear Nuevo Cargo</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-[150px]">Define permisos personalizados para tu equipo</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
        <div className="flex gap-4">
          <div className="size-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-600">
            <Lock size={24} />
          </div>
          <div>
            <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest mb-1">Seguridad de la Plataforma</h4>
            <p className="text-sm text-amber-700 leading-relaxed max-w-2xl">
              Recuerda que solo el Administrador principal tiene acceso a la configuración de pasarelas de pago y eliminación total del restaurante. Los roles creados aquí solo limitan el uso del panel operativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
