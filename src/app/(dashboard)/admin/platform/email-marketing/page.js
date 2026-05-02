'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, Plus, Save, Trash2, Code, Eye, 
  Variable, Info, Loader2, CheckCircle2, ChevronRight
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function EmailMarketingPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subject: '',
    htmlContent: '',
    variables: []
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/email-templates');
      setTemplates(res.data.data.templates);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleEdit = (template = null) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        htmlContent: template.htmlContent,
        variables: template.variables || []
      });
    } else {
      setSelectedTemplate(null);
      setFormData({ name: '', slug: '', subject: '', htmlContent: '', variables: [] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedTemplate) {
        await api.patch(`/admin/email-templates/${selectedTemplate.id}`, formData);
      } else {
        await api.post('/admin/email-templates', formData);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar template');
    } finally {
      setSubmitting(false);
    }
  };

  const injectVariable = (v) => {
    setFormData({ ...formData, htmlContent: formData.htmlContent + `{{${v}}}` });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Email Marketing & Templates</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Gestione as comunicações automáticas e campanhas da plataforma.</p>
          </div>
          <Button onClick={() => handleEdit()} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold">
            <Plus size={18} /> Crear Template
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[#df0024]" size={48} />
            <p className="text-muted-foreground font-medium">Carregando templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(tpl => (
              <div key={tpl.id} className="glass border-none shadow-xl rounded-[2.5rem] p-8 flex flex-col group hover:scale-[1.02] transition-all duration-300">
                 <div className="size-12 bg-[#df0024]/10 rounded-2xl flex items-center justify-center text-[#df0024] mb-6">
                    <Mail size={24} />
                 </div>
                 <h3 className="text-xl font-black mb-1 truncate">{tpl.name}</h3>
                 <p className="text-xs font-bold opacity-40 uppercase mb-4 tracking-widest">{tpl.slug}</p>
                 
                 <div className="space-y-2 mb-8 flex-1">
                    <p className="text-sm font-medium opacity-70 italic line-clamp-2">Assunto: {tpl.subject}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                       {tpl.variables?.map(v => (
                         <Badge key={v} variant="outline" className="text-[10px] bg-white/5 border-white/10 uppercase">{v}</Badge>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/10 flex gap-2">
                    <Button variant="ghost" className="flex-1 rounded-xl font-bold bg-[#df0024]/10 text-[#df0024] hover:bg-[#df0024]/20" onClick={() => handleEdit(tpl)}>
                       EDITAR
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/10" onClick={() => { setSelectedTemplate(tpl); setPreviewMode(true); }}>
                       <Eye size={18} />
                    </Button>
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL EDITOR */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-5xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[3rem] p-0 overflow-hidden">
            <div className="flex h-[80vh]">
              {/* Sidebar do Editor */}
              <div className="w-80 border-r border-white/10 p-8 flex flex-col gap-6">
                 <div>
                   <h2 className="text-2xl font-black">{selectedTemplate ? 'Editar' : 'Nuevo'} Template</h2>
                   <p className="text-xs font-medium opacity-50">Configurações globais do email.</p>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nombre Interno</label>
                      <Input placeholder="Ex: Boas Vindas" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="glass h-11 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase opacity-40 ml-1">Identificador (Slug)</label>
                      <Input placeholder="WELCOME_EMAIL" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="glass h-11 rounded-xl font-mono text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase opacity-40 ml-1">Assunto do Email</label>
                      <Input placeholder="Seja bem-vindo!" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="glass h-11 rounded-xl font-bold" />
                    </div>
                 </div>

                 <div className="flex-1 space-y-3">
                    <label className="text-[10px] font-black uppercase opacity-40 ml-1">Variáveis Disponíveis</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['name', 'email', 'restaurant_name', 'login_url', 'support_email', 'order_id'].map(v => (
                         <button key={v} onClick={() => injectVariable(v)} className="text-[10px] font-bold py-2 px-3 bg-white/5 hover:bg-[#df0024]/10 hover:text-[#df0024] rounded-lg border border-white/5 transition-colors">
                           {v}
                         </button>
                       ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground italic mt-2">Clique para inserir no cursor.</p>
                 </div>

                 <Button onClick={handleSubmit} className="w-full bg-[#df0024] h-14 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" /> : 'SALVAR TEMPLATE'}
                 </Button>
              </div>

              {/* Área de Código / Preview */}
              <div className="flex-1 flex flex-col bg-black/20">
                 <div className="h-14 border-b border-white/5 flex items-center justify-between px-6">
                    <div className="flex gap-4">
                       <button className="text-xs font-black border-b-2 border-[#df0024] pb-1">HTML EDITOR</button>
                       <button className="text-xs font-bold opacity-30">PREVIEW REALTIME</button>
                    </div>
                    <Variable size={16} className="opacity-20" />
                 </div>
                 <Textarea 
                   value={formData.htmlContent} 
                   onChange={e => setFormData({...formData, htmlContent: e.target.value})}
                   className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none p-8 font-mono text-sm leading-relaxed"
                   placeholder="<html><body><h1>Olá {{name}}</h1>...</body></html>"
                 />
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
