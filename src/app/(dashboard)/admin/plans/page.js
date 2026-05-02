'use client';

import { useState, useEffect } from 'react';
import {
  Package, Check, Plus, Edit2, Power,
  CreditCard, Tablet, ShieldCheck, Loader2, X, PackageOpen, LayoutList, Ban, Trash2, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    priceMonthly: '',
    priceYearly: '',
    currency: 'EUR',
    maxTablets: '', 
    features: {
      removeAds: false,
      prioritySupport: false,
      customBranding: false,
      analytics: false
    }
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/plans?active=false');
      setPlans(res.data.data.plans);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleEdit = (plan = null) => {
    if (plan) {
      setFormData({
        id: plan.id,
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        currency: plan.currency,
        maxTablets: plan.maxTablets,
        features: {
          removeAds: plan.features?.removeAds || false,
          prioritySupport: plan.features?.prioritySupport || false,
          customBranding: plan.features?.customBranding || false,
          analytics: plan.features?.analytics || false,
        }
      });
    } else {
      setFormData({
        id: null,
        name: '', priceMonthly: '', priceYearly: '', currency: 'EUR', maxTablets: '',
        features: { removeAds: false, prioritySupport: false, customBranding: false, analytics: false }
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        maxTablets: Number(formData.maxTablets),
        priceMonthly: Number(formData.priceMonthly),
        priceYearly: Number(formData.priceYearly)
      };

      if (formData.id) {
        await api.patch(`/admin/plans/${formData.id}`, payload);
      } else {
        await api.post('/admin/plans', payload);
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar plano.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (planId) => {
    if (!confirm("Alterar status do plano?")) return;
    try {
      await api.patch(`/admin/plans/${planId}/toggle`);
      fetchPlans();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Tem certeza que deseja excluir este plano permanentemente?')) return;
    try {
      await api.delete(`/admin/plans/${planId}`);
      fetchPlans();
    } catch (error) { console.error(error); }
  };

  const formatCurrency = (val, curr) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: curr }).format(val);

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Planes de Suscripción</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Defina as regras de monetização e limites de serviço.</p>
          </div>
          <Button onClick={() => handleEdit()} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95">
            <Plus size={18} /> Crear Nuevo Plan
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[#df0024]" size={48} />
            <p className="text-muted-foreground font-medium animate-pulse">Carregando catálogo de planos...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[3rem] p-24 flex flex-col items-center text-center gap-6">
             <div className="size-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <PackageOpen size={48} className="opacity-20" />
             </div>
             <div>
                <h3 className="text-2xl font-black">Sin Planes Configuradores</h3>
                <p className="text-muted-foreground max-w-md mt-2">Empiece a monetizar su SaaS creando su primer plan de suscripción.</p>
             </div>
             <Button onClick={() => handleEdit()} className="bg-[#df0024] px-10 h-14 rounded-2xl font-black">CREAR PRIMER PLAN</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className={cn(
                "glass border-none shadow-xl rounded-[2.5rem] p-8 flex flex-col group transition-all duration-500",
                !plan.isActive && "opacity-40 grayscale"
              )}>
                <div className="flex justify-between items-start mb-6">
                   <div className="size-12 bg-[#df0024]/10 rounded-2xl flex items-center justify-center text-[#df0024]">
                      <Package size={24} />
                   </div>
                   <Badge className={cn("border-none font-bold uppercase text-[10px]", plan.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                   </Badge>
                </div>
                
                <h3 className="text-xl font-black tracking-tight mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                   <span className="text-3xl font-black">{formatCurrency(plan.priceMonthly, plan.currency || 'EUR')}</span>
                   <span className="text-xs font-bold opacity-40 uppercase ml-2">/ mes</span>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                   <div className="flex items-center gap-3 text-sm font-medium">
                      <Tablet size={16} className="text-[#df0024]" />
                      <span>{plan.maxTablets === 0 ? 'Tablets Ilimitados' : `${plan.maxTablets} Tablets Máx.`}</span>
                   </div>
                   {Object.entries(plan.features || {}).map(([key, val]) => val && (
                     <div key={key} className="flex items-center gap-3 text-xs opacity-70">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                     </div>
                   ))}
                </div>

                <div className="pt-6 border-t border-white/10 flex gap-2">
                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-[#df0024]/10 hover:text-[#df0024]" onClick={() => handleEdit(plan)}>
                      <Edit2 size={16} />
                   </Button>
                   <Button variant="ghost" size="icon" className={cn("rounded-xl", plan.isActive ? "hover:bg-yellow-500/10 text-yellow-500" : "hover:bg-green-500/10 text-green-500")} onClick={() => toggleStatus(plan.id)}>
                      {plan.isActive ? <Ban size={16} /> : <Check size={16} />}
                   </Button>
                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/10 text-red-500" onClick={() => handleDelete(plan.id)}>
                      <Trash2 size={16} />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black">{formData.id ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
              <DialogDescription className="font-medium">Defina as regras de cobrança e recursos disponíveis.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-8 mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1 opacity-60">Nombre del Plan</label>
                  <Input placeholder="Ex: Pro Business" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="glass h-12 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1 opacity-60">Límite de Tablets (0 = Ilimitado)</label>
                  <Input type="number" placeholder="Ej: 10" value={formData.maxTablets} onChange={e => setFormData({ ...formData, maxTablets: e.target.value })} required className="glass h-12 rounded-2xl font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1 opacity-60">Moneda</label>
                  <Select value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger className="glass h-12 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900">
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1 opacity-60">Precio Mensual</label>
                  <Input type="number" step="0.01" value={formData.priceMonthly} onChange={e => setFormData({ ...formData, priceMonthly: e.target.value })} required className="glass h-12 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase ml-1 opacity-60">Precio Anual</label>
                  <Input type="number" step="0.01" value={formData.priceYearly} onChange={e => setFormData({ ...formData, priceYearly: e.target.value })} required className="glass h-12 rounded-2xl font-bold" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase ml-1 opacity-60">Funcionalidades</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureToggle label="Remover Ads" checked={formData.features.removeAds} onChange={c => setFormData(p => ({ ...p, features: { ...p.features, removeAds: c } }))} />
                  <FeatureToggle label="Soporte Prioritario" checked={formData.features.prioritySupport} onChange={c => setFormData(p => ({ ...p, features: { ...p.features, prioritySupport: c } }))} />
                  <FeatureToggle label="Marca Blanca" checked={formData.features.customBranding} onChange={c => setFormData(p => ({ ...p, features: { ...p.features, customBranding: c } }))} />
                  <FeatureToggle label="Analytics Pro" checked={formData.features.analytics} onChange={c => setFormData(p => ({ ...p, features: { ...p.features, analytics: c } }))} />
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                <Button type="submit" className="bg-[#df0024] hover:bg-red-700 h-14 px-12 rounded-2xl font-black shadow-lg shadow-red-500/20" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "GUARDAR PLAN"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}

function FeatureToggle({ label, checked, onChange }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-2xl border transition-all",
      checked ? "bg-white/10 border-[#df0024]/50" : "bg-white/5 border-white/5"
    )}>
      <span className="text-sm font-bold">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
      </div>
    </AdminLayout>
  );
}