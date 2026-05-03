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
  const [uploading, setUploading] = useState({ logo: false, favicon: false });
  
  const [settings, setSettings] = useState({
    brand_name: 'OrdenGO',
    brand_logo_url: '/logocerta1.png',
    brand_primary_color: 'var(--primary)',
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

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [key]: true }));
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/admin/settings/upload', formData);
      setSettings(prev => ({ 
        ...prev, 
        [key === 'logo' ? 'brand_logo_url' : 'brand_favicon_url']: response.data.data.url 
      }));
    } catch (error) {
      alert('Erro ao fazer upload do arquivo.');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/settings/batch', {
        settings: Object.entries(settings).map(([key, value]) => ({ key, value, group: 'branding' }))
      });
      alert('¡Identidad visual actualizada!');
      // Recarregar para aplicar mudanças se necessário
      window.location.reload();
    } catch (error) {
      alert('Erro ao salvar branding.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AdminLayout><div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[var(--primary)]" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Branding Global</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Personalice la identidad visual de toda la plataforma de forma centralizada.</p>
          </div>
          <Button onClick={handleSave} disabled={submitting} className="bg-[var(--primary)] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-8 h-12 font-bold">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} GUARDAR IDENTIDAD
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-white/10 px-8 pt-8">
                 <div className="size-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)] mb-4">
                    <Layout size={24} />
                 </div>
                 <CardTitle className="text-xl font-black">Nombres y Logotipos</CardTitle>
                 <CardDescription>Cómo se presenta su marca en los sistemas.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre del SaaS / Marca</label>
                    <Input className="glass h-12 rounded-2xl font-bold" value={settings.brand_name} onChange={e => setSettings({...settings, brand_name: e.target.value})} />
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Logotipo Principal</label>
                    <div className="flex flex-col gap-4">
                       <div className="h-32 w-full glass rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group relative">
                          {settings.brand_logo_url ? (
                             <img src={settings.brand_logo_url} className="max-w-[80%] max-h-[80%] object-contain" alt="Logo Preview" />
                          ) : (
                             <ImageIcon className="opacity-20" size={48} />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                <Upload size={14} /> {uploading.logo ? 'Subiendo...' : 'Cambiar Logo'}
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                             </label>
                          </div>
                       </div>
                       <Input className="glass h-10 rounded-xl text-xs opacity-50" value={settings.brand_logo_url} readOnly />
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Favicon (Ícono del Navegador)</label>
                    <div className="flex items-center gap-6">
                       <div className="size-16 glass rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group relative shrink-0">
                          {settings.brand_favicon_url ? (
                             <img src={settings.brand_favicon_url} className="size-8 object-contain" alt="Favicon Preview" />
                          ) : (
                             <ImageIcon className="opacity-20" size={24} />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <label className="cursor-pointer p-2 bg-white text-black rounded-lg">
                                <Upload size={14} />
                                <input type="file" className="hidden" accept="image/x-icon,image/png" onChange={e => handleFileUpload(e, 'favicon')} />
                             </label>
                          </div>
                       </div>
                       <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold">Icono del Navegador</p>
                          <p className="text-[10px] opacity-40">Recomendado: 32x32px (.ico ou .png)</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-white/10 px-8 pt-8">
                 <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                    <Palette size={24} />
                 </div>
                 <CardTitle className="text-xl font-black">Sistema de Colores</CardTitle>
                 <CardDescription>Colores que se aplicarán a todos los botones y acentos.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-xs font-bold uppercase ml-1 opacity-60">Color Primario</label>
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                             <div 
                               className="size-16 rounded-2xl border-2 border-white/20 shadow-xl cursor-pointer hover:scale-105 transition-transform" 
                               style={{ backgroundColor: settings.brand_primary_color }}
                               onClick={() => document.getElementById('primary-picker').click()}
                             ></div>
                             <div className="flex-1 space-y-2">
                                <Input className="glass h-12 rounded-2xl font-mono font-bold" value={settings.brand_primary_color} onChange={e => setSettings({...settings, brand_primary_color: e.target.value})} />
                                <input id="primary-picker" type="color" className="sr-only" value={settings.brand_primary_color} onChange={e => setSettings({...settings, brand_primary_color: e.target.value})} />
                             </div>
                          </div>
                          {/* Presets */}
                          <div className="flex flex-wrap gap-2">
                             {['var(--primary)', '#0070f3', '#0070f3', '#7928ca', '#ff0080', '#f5a623'].map(c => (
                               <button key={c} type="button" onClick={() => setSettings({...settings, brand_primary_color: c})} className="size-6 rounded-full border border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-xs font-bold uppercase ml-1 opacity-60">Color Secundario</label>
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                             <div 
                               className="size-16 rounded-2xl border-2 border-white/20 shadow-xl cursor-pointer hover:scale-105 transition-transform" 
                               style={{ backgroundColor: settings.brand_secondary_color }}
                               onClick={() => document.getElementById('secondary-picker').click()}
                             ></div>
                             <div className="flex-1 space-y-2">
                                <Input className="glass h-12 rounded-2xl font-mono font-bold" value={settings.brand_secondary_color} onChange={e => setSettings({...settings, brand_secondary_color: e.target.value})} />
                                <input id="secondary-picker" type="color" className="sr-only" value={settings.brand_secondary_color} onChange={e => setSettings({...settings, brand_secondary_color: e.target.value})} />
                             </div>
                          </div>
                          {/* Presets */}
                          <div className="flex flex-wrap gap-2">
                             {['#1f1c1d', '#000000', '#333333', '#4b5563', '#1e293b', '#0f172a'].map(c => (
                               <button key={c} type="button" onClick={() => setSettings({...settings, brand_secondary_color: c})} className="size-6 rounded-full border border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Preview Section */}
                 <div className="mt-8 p-8 glass rounded-[2rem] border-white/5 space-y-6">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest text-center">Vista Previa de Componentes</p>
                    <div className="flex flex-col gap-4">
                       <Button style={{ backgroundColor: settings.brand_primary_color }} className="text-white rounded-2xl h-14 font-black shadow-lg shadow-red-500/20">
                          BOTÓN PRIMARIO
                       </Button>
                       <Button style={{ backgroundColor: settings.brand_secondary_color }} className="text-white rounded-2xl h-12 font-bold opacity-80">
                          Botón Secundario
                       </Button>
                    </div>
                    <div className="flex justify-center gap-4">
                       <div className="size-3 rounded-full animate-pulse" style={{ backgroundColor: settings.brand_primary_color }}></div>
                       <div className="size-3 rounded-full animate-pulse delay-75" style={{ backgroundColor: settings.brand_primary_color }}></div>
                       <div className="size-3 rounded-full animate-pulse delay-150" style={{ backgroundColor: settings.brand_primary_color }}></div>
                    </div>
                 </div>
              </CardContent>
           </Card>

        </div>

      </div>
    </AdminLayout>
  );
}
