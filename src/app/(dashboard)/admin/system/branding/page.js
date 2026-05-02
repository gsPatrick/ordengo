'use client';

import { useState, useEffect } from 'react';
import { 
  Palette, Save, Loader2, Image as ImageIcon, 
  Upload, Type, Layout, Smartphone
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [settings, setSettings] = useState({
    brand_name: 'OrdenGO',
    brand_logo_url: '/logocerta1.png',
    brand_primary_color: '#df0024',
    brand_secondary_color: '#1f1c1d',
    brand_favicon_url: '/favicon.ico'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('/admin/settings?group=branding');
        const settingsObj = {};
        response.data.data.settings.forEach(s => {
          settingsObj[s.key] = s.value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/settings/batch', {
        settings: Object.entries(settings).map(([key, value]) => ({ key, value, group: 'branding' }))
      });
      alert('Identidade visual atualizada!');
    } catch (error) {
      alert('Erro ao salvar branding.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AdminLayout><div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#df0024]" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Branding Global</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Personalize a identidade visual de toda a plataforma OrdenGO.</p>
          </div>
          <Button onClick={handleSave} disabled={submitting} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-8 h-12 font-bold">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Identidad
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-white/10 px-8 pt-8">
                 <div className="size-12 bg-[#df0024]/10 rounded-2xl flex items-center justify-center text-[#df0024] mb-4">
                    <Type size={24} />
                 </div>
                 <CardTitle className="text-xl font-black">Nombres y Logotipos</CardTitle>
                 <CardDescription>Como sua marca é apresentada.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre del SaaS</label>
                    <Input className="glass h-12 rounded-2xl font-bold" value={settings.brand_name} onChange={e => setSettings({...settings, brand_name: e.target.value})} />
                 </div>
                 <div className="space-y-4">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">URL del Logotipo (PNG/SVG)</label>
                    <div className="flex gap-4">
                       <Input className="glass h-12 rounded-2xl font-bold flex-1" value={settings.brand_logo_url} onChange={e => setSettings({...settings, brand_logo_url: e.target.value})} />
                       <div className="size-12 glass rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                          <img src={settings.brand_logo_url} className="max-w-[80%] max-h-[80%] object-contain" alt="Logo" />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Favicon URL</label>
                    <Input className="glass h-12 rounded-2xl font-bold" value={settings.brand_favicon_url} onChange={e => setSettings({...settings, brand_favicon_url: e.target.value})} />
                 </div>
              </CardContent>
           </Card>

           <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-white/10 px-8 pt-8">
                 <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                    <Palette size={24} />
                 </div>
                 <CardTitle className="text-xl font-black">Sistema de Colores</CardTitle>
                 <CardDescription>Cores primárias e secundárias do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase ml-1 opacity-60">Color Primario</label>
                       <div className="flex gap-3">
                          <Input className="glass h-12 rounded-2xl font-bold" value={settings.brand_primary_color} onChange={e => setSettings({...settings, brand_primary_color: e.target.value})} />
                          <div className="size-12 rounded-xl border border-white/20 shadow-lg shrink-0" style={{ backgroundColor: settings.brand_primary_color }}></div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase ml-1 opacity-60">Color Secundario</label>
                       <div className="flex gap-3">
                          <Input className="glass h-12 rounded-2xl font-bold" value={settings.brand_secondary_color} onChange={e => setSettings({...settings, brand_secondary_color: e.target.value})} />
                          <div className="size-12 rounded-xl border border-white/20 shadow-lg shrink-0" style={{ backgroundColor: settings.brand_secondary_color }}></div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Preview Section */}
                 <div className="mt-8 p-6 glass rounded-3xl border-white/5 space-y-4">
                    <p className="text-[10px] font-black uppercase opacity-40">Vista Previa de Componentes</p>
                    <div className="flex gap-2">
                       <Button style={{ backgroundColor: settings.brand_primary_color }} className="text-white rounded-xl text-xs font-bold px-6">Boton Primario</Button>
                       <Button style={{ backgroundColor: settings.brand_secondary_color }} className="text-white rounded-xl text-xs font-bold px-6">Boton Secundario</Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

        </div>

      </div>
    </AdminLayout>
  );
}
