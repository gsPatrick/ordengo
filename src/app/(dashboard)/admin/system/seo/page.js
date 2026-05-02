'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Save, Loader2, Globe, Image as ImageIcon, 
  FileText, Tag, Link2, Eye
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    seo_title: 'OrdenGO - Menú digital en tableta para restaurantes',
    seo_description: 'La plataforma de autoatendimento en mesa que revoluciona la hostelería. Digitalice su carta, aumente ventas y optimice operaciones.',
    seo_keywords: 'menu digital, tablet restaurante, carta digital, QR code restaurante, autoservicio mesa',
    seo_og_image: '',
    seo_canonical_url: 'https://ordengo.com',
    seo_robots: 'index, follow',
    seo_google_verification: '',
    seo_bing_verification: '',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get('/admin/settings?group=seo');
        const obj = {};
        res.data.data.settings?.forEach(s => { obj[s.key] = s.value; });
        setSettings(prev => ({ ...prev, ...obj }));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings/batch', {
        settings: Object.entries(settings).map(([key, value]) => ({ key, value, group: 'seo' }))
      });
      alert('Configuración SEO guardada con éxito!');
    } catch (e) { alert('Error al guardar.'); }
    finally { setSaving(false); }
  };

  const Field = ({ label, icon: Icon, children }) => (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase ml-1 opacity-60 flex items-center gap-2">
        <Icon size={12} /> {label}
      </Label>
      {children}
    </div>
  );

  if (loading) return <AdminLayout><div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">SEO Global</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">
              Configuración de metadatos para la Landing Page y presencia en buscadores.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20 rounded-xl px-8 h-12 font-bold">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main SEO Settings */}
          <Card className="lg:col-span-2 glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-white/10 px-8 pt-8">
              <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                <Search size={24} />
              </div>
              <CardTitle className="text-xl font-black">Metadatos Principales</CardTitle>
              <CardDescription>Estos datos aparecen en Google, redes sociales y navegadores.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Field label="Meta Title (Título de la Página)" icon={FileText}>
                <Input 
                  className="glass h-12 rounded-2xl font-bold" 
                  value={settings.seo_title} 
                  onChange={e => setSettings({...settings, seo_title: e.target.value})}
                  maxLength={70}
                />
                <p className="text-[10px] text-muted-foreground ml-2">{settings.seo_title.length}/70 caracteres</p>
              </Field>

              <Field label="Meta Description" icon={FileText}>
                <textarea 
                  className="w-full glass rounded-2xl p-4 font-medium text-sm min-h-[100px] outline-none border-2 border-transparent focus:border-primary/30 transition-all resize-none"
                  value={settings.seo_description}
                  onChange={e => setSettings({...settings, seo_description: e.target.value})}
                  maxLength={160}
                />
                <p className="text-[10px] text-muted-foreground ml-2">{settings.seo_description.length}/160 caracteres</p>
              </Field>

              <Field label="Keywords (separadas por coma)" icon={Tag}>
                <Input 
                  className="glass h-12 rounded-2xl font-medium text-sm" 
                  value={settings.seo_keywords} 
                  onChange={e => setSettings({...settings, seo_keywords: e.target.value})}
                />
              </Field>

              <Field label="URL Canónica" icon={Link2}>
                <Input 
                  className="glass h-12 rounded-2xl font-mono text-sm" 
                  value={settings.seo_canonical_url} 
                  onChange={e => setSettings({...settings, seo_canonical_url: e.target.value})}
                />
              </Field>

              <Field label="Imagen OpenGraph (URL)" icon={ImageIcon}>
                <Input 
                  className="glass h-12 rounded-2xl font-mono text-sm" 
                  placeholder="https://ordengo.com/og-image.jpg"
                  value={settings.seo_og_image} 
                  onChange={e => setSettings({...settings, seo_og_image: e.target.value})}
                />
              </Field>
            </CardContent>
          </Card>

          {/* Preview + Verification */}
          <div className="space-y-8">
            {/* Google Preview */}
            <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-white/10 px-8 pt-8">
                <div className="flex justify-between items-start">
                  <div className="size-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-4">
                    <Eye size={24} />
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-none font-bold">PREVIEW</Badge>
                </div>
                <CardTitle className="text-xl font-black">Vista en Google</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-white rounded-2xl p-5 shadow-inner border border-gray-100 space-y-2">
                  <p className="text-xs text-green-700 font-medium truncate">{settings.seo_canonical_url}</p>
                  <h4 className="text-lg font-bold text-[#1a0dab] leading-tight line-clamp-1">{settings.seo_title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-snug">{settings.seo_description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Search Console Verification */}
            <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-white/10 px-8 pt-8">
                <div className="size-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
                  <Globe size={24} />
                </div>
                <CardTitle className="text-xl font-black">Verificación</CardTitle>
                <CardDescription>Códigos de verificación de buscadores.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <Field label="Google Search Console" icon={Globe}>
                  <Input 
                    className="glass h-12 rounded-2xl font-mono text-xs" 
                    placeholder="google-site-verification=..."
                    value={settings.seo_google_verification} 
                    onChange={e => setSettings({...settings, seo_google_verification: e.target.value})}
                  />
                </Field>
                <Field label="Bing Webmaster" icon={Globe}>
                  <Input 
                    className="glass h-12 rounded-2xl font-mono text-xs" 
                    placeholder="msvalidate.01=..."
                    value={settings.seo_bing_verification} 
                    onChange={e => setSettings({...settings, seo_bing_verification: e.target.value})}
                  />
                </Field>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
