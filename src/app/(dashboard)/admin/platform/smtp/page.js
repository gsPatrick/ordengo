'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, Save, Loader2, Server, Key, Eye, EyeOff, Send, Code, Layout, Sparkles,
  Info
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Code Editor Imports
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup'; // HTML Support
import 'prismjs/themes/prism-tomorrow.css'; // Dark Theme

export default function SMTPPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: 'OrdenGO',
    email_template_html: '<html>\n  <body style="font-family: sans-serif; background: #f4f4f4; padding: 20px;">\n    <div style="max-width: 600px; margin: auto; background: #fff; padding: 40px; border-radius: 10px;">\n      <h1 style="color: var(--primary);">Hola, {{name}}!</h1>\n      <p>Bienvenido a OrdenGO.</p>\n      <hr/>\n      <p style="font-size: 12px; color: #888;">OrdenGO SaaS - Todos los derechos reservados.</p>\n    </div>\n  </body>\n</html>'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('/admin/settings?group=email');
        const settingsObj = {};
        if (response.data.data.settings) {
          response.data.data.settings.forEach(s => {
            settingsObj[s.key] = s.value;
          });
        }
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
        settings: Object.entries(settings).map(([key, value]) => ({ key, value, group: 'email' }))
      });
      alert('Configurações SMTP salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTest = async () => {
    try {
      await api.post('/admin/settings/test-email');
      alert('Email de teste enviado! Verifique sua caixa de entrada.');
    } catch (e) {
      alert('Falha no teste SMTP.');
    }
  };

  if (loading) return <AdminLayout><div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[var(--primary)]" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Email & SMTP</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Gestão central de comunicação transacional e marketing por email.</p>
          </div>
          <div className="flex gap-3">
             <Button onClick={handleTest} variant="ghost" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 gap-2 rounded-xl h-12 px-6 font-bold"><Send size={18} /> Probar Envío</Button>
             <Button onClick={handleSave} disabled={submitting} className="bg-[var(--primary)] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-8 h-12 font-bold">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
             </Button>
          </div>
        </div>

        <Tabs defaultValue="server" className="space-y-8">
          <TabsList className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl h-14 w-full max-w-md border-gray-200 dark:border-white/10">
            <TabsTrigger value="server" className="flex-1 rounded-xl font-bold h-12 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white">
              <Server size={18} className="mr-2" /> Servidor
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1 rounded-xl font-bold h-12 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white">
              <Code size={18} className="mr-2" /> Editor HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="server" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
                     <div className="size-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)] mb-4">
                        <Server size={24} />
                     </div>
                     <CardTitle className="text-xl font-black">Servidor de Salida (Outgoing)</CardTitle>
                     <CardDescription>Detalles técnicos para la entrega de correos.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-2">
                           <label className="text-xs font-bold uppercase ml-1 opacity-60">Host SMTP</label>
                           <Input className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" placeholder="smtp.gmail.com" value={settings.smtp_host} onChange={e => setSettings({...settings, smtp_host: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase ml-1 opacity-60">Puerto</label>
                           <Input className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" placeholder="587" value={settings.smtp_port} onChange={e => setSettings({...settings, smtp_port: e.target.value})} />
                        </div>
                     </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase ml-1 opacity-60">Usuario / Email</label>
                           <Input className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" value={settings.smtp_user} onChange={e => setSettings({...settings, smtp_user: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase ml-1 opacity-60">Contraseña</label>
                           <div className="relative">
                              <Input 
                                type={showPassword ? 'text' : 'password'} 
                                className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold pr-12" 
                                value={settings.smtp_password} 
                                onChange={e => setSettings({...settings, smtp_password: e.target.value})} 
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
                     <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                        <Mail size={24} />
                     </div>
                     <CardTitle className="text-xl font-black">Remitente</CardTitle>
                     <CardDescription>Identidad del correo enviado.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre del Remitente</label>
                        <Input className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" value={settings.smtp_from_name} onChange={e => setSettings({...settings, smtp_from_name: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase ml-1 opacity-60">Email de Respuesta</label>
                        <Input className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 h-12 rounded-2xl font-bold" value={settings.smtp_from_email} onChange={e => setSettings({...settings, smtp_from_email: e.target.value})} />
                     </div>
                     <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex gap-3">
                        <Info className="text-blue-500 shrink-0" size={18} />
                        <p className="text-[10px] font-bold text-blue-500 leading-tight">
                           Verifique que el email remitente coincida con el usuario SMTP para evitar que los correos lleguen a SPAM.
                        </p>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {/* --- HTML CODE EDITOR --- */}
               <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col">
                  <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="size-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
                             <Code size={24} />
                          </div>
                          <CardTitle className="text-xl font-black">Editor de Código</CardTitle>
                          <CardDescription>Soporte para HTML5 e Inline CSS.</CardDescription>
                        </div>
                        <Badge className="bg-purple-500/10 text-purple-500 border-none font-bold">SYNTAX HIGHLIGHTING</Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-1">
                     <div className="space-y-4">
                        <div className="rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-[#2d2d2d] min-h-[500px]">
                          <Editor
                            value={settings.email_template_html}
                            onValueChange={code => setSettings({...settings, email_template_html: code})}
                            highlight={code => highlight(code, languages.markup)}
                            padding={20}
                            style={{
                              fontFamily: '"Fira code", "Fira Mono", monospace',
                              fontSize: 12,
                              minHeight: '500px',
                              backgroundColor: '#2d2d2d',
                              color: '#ccc'
                            }}
                            className="no-scrollbar"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">{"{{name}}"}</Badge>
                           <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">{"{{message}}"}</Badge>
                           <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">{"{{link}}"}</Badge>
                           <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">{"{{restaurant}}"}</Badge>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* --- LIVE PREVIEW --- */}
               <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
                     <div className="size-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
                        <Layout size={24} />
                     </div>
                     <CardTitle className="text-xl font-black">Vista Previa</CardTitle>
                     <CardDescription>Representación visual del correo final.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                     <div className="w-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xl min-h-[500px] flex flex-col">
                        <div className="bg-gray-100/50 h-12 border-b flex items-center px-6 gap-2">
                           <div className="size-3 rounded-full bg-red-400" />
                           <div className="size-3 rounded-full bg-yellow-400" />
                           <div className="size-3 rounded-full bg-green-400" />
                           <div className="ml-6 flex-1 bg-white h-7 rounded-lg border border-gray-200 flex items-center px-3 text-[10px] text-gray-400">
                              https://mail.ordengo.com/preview/transactional
                           </div>
                        </div>
                        <div className="p-4 h-[500px] overflow-auto no-scrollbar bg-[#f8fafc]">
                           <div 
                              className="bg-white shadow-sm rounded-lg mx-auto overflow-hidden"
                              style={{ width: '100%', maxWidth: '600px' }}
                              dangerouslySetInnerHTML={{ 
                                __html: settings.email_template_html
                                  .replace('{{name}}', 'Juan Perez')
                                  .replace('{{message}}', 'Su cuenta ha sido activada con éxito.')
                                  .replace('{{link}}', '#')
                              }} 
                           />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </AdminLayout>
  );
}
