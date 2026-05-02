'use client';

import { useState, useEffect } from 'react';
import { 
  Settings2, 
  Save, 
  Loader2, 
  Info,
  Tv,
  LayoutGrid,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdsConfigPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    ADS_BATCH_SIZE_ADMIN: '3',
    ADS_BATCH_SIZE_CLIENT: '1',
    ADS_IDLE_TIME_DEFAULT: '120',
    ADS_RATIO: '16:9'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('/admin/settings?group=ads');
        // Convert array to object
        const settingsObj = {};
        response.data.data.settings.forEach(s => {
          settingsObj[s.key] = s.value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
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
        settings: Object.entries(settings).map(([key, value]) => ({ key, value, group: 'ads' }))
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-[#df0024]" size={32} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Configuración de Publicidad</h1>
            <p className="text-muted-foreground mt-1 text-sm">Defina os parâmetros globais para a rede de anúncios.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={submitting}
            className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-8"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Guardar Cambios
          </Button>
        </div>

        <Alert className="glass border-none shadow-lg rounded-2xl bg-blue-500/10 text-blue-500">
          <Info className="h-4 w-4" />
          <AlertDescription className="font-medium text-xs">
            Essas configurações afetam o comportamento de todos os tablets da rede, a menos que o cliente tenha uma configuração personalizada.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="glass border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white/10 px-8 pt-8">
              <div className="size-12 bg-[#df0024]/10 rounded-2xl flex items-center justify-center text-[#df0024] mb-4">
                <LayoutGrid size={24} />
              </div>
              <CardTitle className="text-xl font-black">Lotes de Exibição (Batch)</CardTitle>
              <CardDescription>Quantos anúncios são baixados por vez.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase ml-1 opacity-60">Admin Batch Size</label>
                <Input 
                  type="number" 
                  className="glass h-12 rounded-2xl font-bold" 
                  value={settings.ADS_BATCH_SIZE_ADMIN}
                  onChange={e => setSettings({ ...settings, ADS_BATCH_SIZE_ADMIN: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground ml-1">Anúncios da OrdenGO exibidos no início do carrossel.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase ml-1 opacity-60">Client Batch Size</label>
                <Input 
                  type="number" 
                  className="glass h-12 rounded-2xl font-bold" 
                  value={settings.ADS_BATCH_SIZE_CLIENT}
                  onChange={e => setSettings({ ...settings, ADS_BATCH_SIZE_CLIENT: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground ml-1">Anúncios próprios do restaurante (Screensaver interno).</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white/10 px-8 pt-8">
               <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                <Clock size={24} />
              </div>
              <CardTitle className="text-xl font-black">Tempos e Prazos</CardTitle>
              <CardDescription>Configurações de duração e inatividade.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase ml-1 opacity-60">Tempo de Inatividade Padrão (segundos)</label>
                <Input 
                  type="number" 
                  className="glass h-12 rounded-2xl font-bold" 
                  value={settings.ADS_IDLE_TIME_DEFAULT}
                  onChange={e => setSettings({ ...settings, ADS_IDLE_TIME_DEFAULT: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground ml-1">Tempo de espera antes de iniciar o screensaver.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase ml-1 opacity-60">Proporção de Imagem (Ratio)</label>
                <Input 
                  className="glass h-12 rounded-2xl font-bold" 
                  value={settings.ADS_RATIO}
                  readOnly
                />
                <p className="text-[10px] text-red-500 ml-1 font-bold">Padronizado: 16:9 Landscape.</p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </AdminLayout>
  );
}
