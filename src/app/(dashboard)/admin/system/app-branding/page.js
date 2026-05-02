'use client';

import { useState, useEffect } from 'react';
import { 
  Smartphone, Save, Loader2, Type, Layout, 
  Store, Info, Sparkles, MessageSquare
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AppBrandingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [settings, setSettings] = useState({
    app_journey_title: 'Nossa Jornada',
    app_journey_text: 'Tudo começou com a vontade de transformar a experiência gastronômica...',
    app_sidebar_logo: '',
    app_footer_text: 'OrdenGO - Elevating Dining Experiences',
    app_support_whatsapp: ''
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('/admin/settings?group=app_branding');
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
        settings: Object.entries(settings).map(([key, value]) => ({ key, value, group: 'app_branding' }))
      });
      alert('Configurações do App Tablet atualizadas!');
    } catch (error) {
      alert('Erro ao salvar branding do app.');
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
            <h1 className="text-3xl font-extrabold tracking-tight">Branding APP (Tablet)</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Personalize a interface do menu lateral e seção Sobre do Tablet.</p>
          </div>
          <Button onClick={handleSave} disabled={submitting} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-8 h-12 font-bold">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} GUARDAR CAMBIOS
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           
           {/* Seção Sobre / Journey */}
           <Card className="xl:col-span-2 glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-white/10 px-8 pt-8">
                 <div className="size-12 bg-[#df0024]/10 rounded-2xl flex items-center justify-center text-[#df0024] mb-4">
                    <Sparkles size={24} />
                 </div>
                 <CardTitle className="text-xl font-black">Sección "Nuestra Historia"</CardTitle>
                 <CardDescription>O texto que os clientes leem ao clicar em "Sobre" ou "Our Journey".</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Título da Seção</label>
                    <Input className="glass h-12 rounded-2xl font-bold" value={settings.app_journey_title} onChange={e => setSettings({...settings, app_journey_title: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase ml-1 opacity-60">Texto da Jornada (Storytelling)</label>
                    <Textarea className="glass rounded-2xl p-6 min-h-[250px] font-medium leading-relaxed" value={settings.app_journey_text} onChange={e => setSettings({...settings, app_journey_text: e.target.value})} />
                 </div>
              </CardContent>
           </Card>

           {/* Sidebar & Footer */}
           <div className="space-y-8">
              <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                 <CardHeader className="bg-white/10 px-8 pt-8">
                    <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                       <Layout size={24} />
                    </div>
                    <CardTitle className="text-xl font-black">Sidebar & Footer</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase ml-1 opacity-60">Logo Lateral (App)</label>
                       <Input className="glass h-12 rounded-2xl font-bold" placeholder="URL da Logo" value={settings.app_sidebar_logo} onChange={e => setSettings({...settings, app_sidebar_logo: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase ml-1 opacity-60">Rodapé Lateral</label>
                       <Input className="glass h-12 rounded-2xl font-bold" value={settings.app_footer_text} onChange={e => setSettings({...settings, app_footer_text: e.target.value})} />
                    </div>
                 </CardContent>
              </Card>

              <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                 <CardHeader className="bg-white/10 px-8 pt-8">
                    <div className="size-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-4">
                       <MessageSquare size={24} />
                    </div>
                    <CardTitle className="text-xl font-black">Soporte Directo</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase ml-1 opacity-60">WhatsApp de Suporte (Tablet)</label>
                       <Input className="glass h-12 rounded-2xl font-bold" placeholder="+34 000 000 000" value={settings.app_support_whatsapp} onChange={e => setSettings({...settings, app_support_whatsapp: e.target.value})} />
                    </div>
                 </CardContent>
              </Card>
           </div>

        </div>

      </div>
    </AdminLayout>
  );
}
