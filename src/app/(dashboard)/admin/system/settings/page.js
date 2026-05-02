'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, Key, Users, Globe, Save, Loader2, Trash2,
  Sliders, Server, Database, Clock, ToggleLeft, Bell
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState({
    maintenance_mode: false,
    session_timeout: '30',
    max_tables_per_restaurant: '50',
    max_products_per_restaurant: '500',
    default_currency: 'EUR',
    default_timezone: 'Europe/Madrid',
    enable_notifications: true,
    auto_backup: true,
    backup_frequency: 'daily',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get('/admin/settings?group=system');
        const obj = {};
        res.data.data.settings?.forEach(s => { 
          obj[s.key] = s.value === 'true' ? true : s.value === 'false' ? false : s.value;
        });
        setConfigs(prev => ({ ...prev, ...obj }));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings/batch', {
        settings: Object.entries(configs).map(([key, value]) => ({ key, value: String(value), group: 'system' }))
      });
      alert('Configuración guardada con éxito!');
    } catch (e) { alert('Error al guardar.'); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></AdminLayout>;

  const SettingRow = ({ label, description, children }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 border-b border-white/10 last:border-none">
      <div className="space-y-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Configuración General</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">
              Parámetros globales del sistema, límites y preferencias de la plataforma.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20 rounded-xl px-8 h-12 font-bold">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Todo
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="bg-gray-100 dark:bg-white/5 p-1 rounded-2xl h-14 w-full max-w-lg border border-gray-200 dark:border-white/10 shadow-sm">
            <TabsTrigger value="general" className="flex-1 rounded-xl font-bold h-12 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-lg">
              <Sliders size={18} className="mr-2" /> General
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex-1 rounded-xl font-bold h-12 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-lg">
              <Server size={18} className="mr-2" /> Límites
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex-1 rounded-xl font-bold h-12 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-lg">
              <Database size={18} className="mr-2" /> Automatización
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Sliders size={24} />
                </div>
                <CardTitle className="text-xl font-black">Preferencias Generales</CardTitle>
                <CardDescription>Configuraciones básicas de la plataforma.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <SettingRow label="Modo Mantenimiento" description="Desactiva el acceso público a la plataforma temporalmente.">
                  <div className="flex items-center gap-3">
                    <Badge className={cn("border-none font-bold text-[10px]", configs.maintenance_mode ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                      {configs.maintenance_mode ? "ACTIVADO" : "DESACTIVADO"}
                    </Badge>
                    <Switch checked={configs.maintenance_mode} onCheckedChange={v => setConfigs({...configs, maintenance_mode: v})} />
                  </div>
                </SettingRow>

                <SettingRow label="Moneda Predeterminada" description="Moneda utilizada en facturación y reportes.">
                  <Input className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 h-10 rounded-xl w-28 font-bold text-center" value={configs.default_currency} onChange={e => setConfigs({...configs, default_currency: e.target.value})} />
                </SettingRow>
 
                <SettingRow label="Zona Horaria" description="Zona horaria del servidor para reportes y logs.">
                  <Input className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 h-10 rounded-xl w-48 font-mono text-sm" value={configs.default_timezone} onChange={e => setConfigs({...configs, default_timezone: e.target.value})} />
                </SettingRow>
 
                <SettingRow label="Timeout de Sesión (min)" description="Tiempo de inactividad antes de cerrar la sesión.">
                  <Input type="number" className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 h-10 rounded-xl w-24 font-bold text-center" value={configs.session_timeout} onChange={e => setConfigs({...configs, session_timeout: e.target.value})} />
                </SettingRow>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-zinc-900 px-8 pt-8">
                <div className="size-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
                  <Server size={24} />
                </div>
                <CardTitle className="text-xl font-black">Límites del Sistema</CardTitle>
                <CardDescription>Restricciones globales aplicadas a todos los restaurantes.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <SettingRow label="Mesas por Restaurante" description="Número máximo de mesas que un restaurante puede registrar.">
                  <Input type="number" className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 h-10 rounded-xl w-24 font-bold text-center" value={configs.max_tables_per_restaurant} onChange={e => setConfigs({...configs, max_tables_per_restaurant: e.target.value})} />
                </SettingRow>
 
                <SettingRow label="Productos por Restaurante" description="Límite de ítems del menú por estabelecimento.">
                  <Input type="number" className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 h-10 rounded-xl w-24 font-bold text-center" value={configs.max_products_per_restaurant} onChange={e => setConfigs({...configs, max_products_per_restaurant: e.target.value})} />
                </SettingRow>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
                <div className="size-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-4">
                  <Database size={24} />
                </div>
                <CardTitle className="text-xl font-black">Automatización & Backups</CardTitle>
                <CardDescription>Configuración de tareas automáticas del servidor.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <SettingRow label="Notificaciones Push" description="Enviar alertas automáticas para eventos críticos.">
                  <Switch checked={configs.enable_notifications} onCheckedChange={v => setConfigs({...configs, enable_notifications: v})} />
                </SettingRow>

                <SettingRow label="Backup Automático" description="Realizar copias de seguridad de la base de datos.">
                  <div className="flex items-center gap-3">
                    <Switch checked={configs.auto_backup} onCheckedChange={v => setConfigs({...configs, auto_backup: v})} />
                    {configs.auto_backup && (
                      <Badge className="bg-green-500/10 text-green-500 border-none font-bold text-[10px]">
                        {configs.backup_frequency.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </SettingRow>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AdminLayout>
  );
}
