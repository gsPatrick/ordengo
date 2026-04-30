'use client';

import { useState, useEffect } from 'react';
import {
  Package, Check, Plus, Edit2, Power,
  CreditCard, Tablet, ShieldCheck, Loader2, X, PackageOpen, LayoutList, Ban, Trash2
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast'; // Added toast import

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast(); // Initialize toast

  // Estado do Formulário
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    priceMonthly: '',
    priceYearly: '',
    currency: 'EUR',
    maxTablets: '', // 0 = Ilimitado
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
      // CORREÇÃO: Adicionado prefixo /admin
      const res = await api.get('/admin/plans?active=false');
      setPlans(res.data.data.plans);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar planos.",
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  // --- HANDLERS ---

  const handleEdit = (plan = null) => { // Renamed openModal to handleEdit
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
        // CORREÇÃO: Adicionado prefixo /admin
        await api.patch(`/admin/plans/${formData.id}`, payload);
        toast({
          title: "Sucesso",
          description: "Plano atualizado com sucesso.",
        });
      } else {
        // CORREÇÃO: Adicionado prefixo /admin
        await api.post('/admin/plans', payload);
        toast({
          title: "Sucesso",
          description: "Plano criado com sucesso.",
        });
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao salvar plano.';
      toast({
        title: "Erro",
        description: msg,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (planId) => { // Renamed handleToggleStatus to toggleStatus
    if (!confirm("Alterar status do plano?")) return;
    try {
      // CORREÇÃO: Adicionado prefixo /admin
      await api.patch(`/admin/plans/${planId}/toggle`);
      toast({
        title: "Sucesso",
        description: "Status do plano alterado.",
      });
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status.",
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Tem certeza que deseja excluir este plano permanentemente?')) return;

    try {
      await api.delete(`/admin/plans/${planId}`); // Added /admin prefix
      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso.",
      });
      fetchPlans();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Falha ao excluir plano.';
      toast({
        title: "Erro",
        description: msg,
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (val, curr) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: curr }).format(val);

  // --- EMPTY STATE COMPONENT ---
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 animate-in fade-in zoom-in duration-300">
      <div className="bg-white p-6 rounded-full shadow-lg shadow-gray-100 mb-6">
        <PackageOpen className="text-gray-300" size={64} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum Plano de Assinatura</h3>
      <p className="text-gray-500 max-w-md mb-8 text-lg">
        Crie níveis de serviço (Tiers) para monetizar sua plataforma SaaS. Defina limites de tablets, preços e recursos exclusivos.
      </p>
      <Button onClick={() => handleEdit()} className="bg-[#df0024] hover:bg-red-700 text-white px-8 py-6 text-lg h-auto rounded-xl shadow-lg shadow-red-100 transition-transform hover:scale-105">
        <Plus className="mr-2 h-6 w-6" /> Criar Primeiro Plano
      </Button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* Header só aparece se tiver planos ou durante loading */}
        {(loading || plans.length > 0) && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planos & Preços</h1>
              <p className="text-gray-500">Configure os tiers de assinatura e estratégias de monetização.</p>
            </div>
            <Button onClick={() => handleEdit()} className="bg-[#df0024] hover:bg-red-700 text-white gap-2">
              <Plus size={18} /> Criar Novo Plano
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#df0024]" size={48} />
            <p className="text-gray-400 font-medium">Carregando catálogo de planos...</p>
          </div>
        ) : plans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className={`shadow-sm hover:shadow-md transition-shadow ${!plan.isActive ? 'opacity-70' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {plan.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-3">
                  <div className="text-2xl font-bold">
                    {formatCurrency(plan.priceMonthly, plan.currency || 'EUR')}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                  {plan.priceYearly > 0 && (
                    <div className="text-sm text-muted-foreground">
                      ou {formatCurrency(plan.priceYearly, plan.currency || 'EUR')}/ano
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-sm flex items-center">
                      <span className="font-semibold mr-2">{plan.maxTablets}</span> Tablets
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {Object.keys(plan.features || {}).length} recursos extras
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t mt-2 flex justify-between items-center gap-2 p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(plan)}
                  >
                    Editar
                  </Button>

                  <Button
                    variant={plan.isActive ? "secondary" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleStatus(plan.id)}
                  >
                    {plan.isActive ? (
                      <>
                        <Ban className="w-4 h-4 mr-1" /> Desativar
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" /> Ativar
                      </>
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-8 h-8 p-0"
                    title="Excluir Permanentemente"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutList className="text-[#df0024]" />
                {formData.id ? 'Editar Plano' : 'Criar Novo Plano'}
              </DialogTitle>
              <DialogDescription>Defina as regras de cobrança e recursos disponíveis para este tier.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
              {/* Básico */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Nome do Plano</Label>
                  <Input placeholder="Ex: Enterprise" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Limite Tablets (0 = Ilimitado)</Label>
                  <Input type="number" placeholder="Ex: 10" value={formData.maxTablets} onChange={e => setFormData({ ...formData, maxTablets: e.target.value })} required />
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="space-y-2">
                  <Label className="text-blue-900 font-bold text-xs">Moeda</Label>
                  <Select value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger className="bg-white h-10">
                      <SelectValue placeholder="Moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-900 font-bold text-xs">Preço Mensal</Label>
                  <Input type="number" step="0.01" value={formData.priceMonthly} onChange={e => setFormData({ ...formData, priceMonthly: e.target.value })} required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-900 font-bold text-xs">Preço Anual</Label>
                  <Input type="number" step="0.01" value={formData.priceYearly} onChange={e => setFormData({ ...formData, priceYearly: e.target.value })} required className="bg-white" />
                </div>
              </div>

              {/* Features (Toggles) */}
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-gray-500">Funcionalidades Habilitadas</Label>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${formData.features.removeAds ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Remover Ads</Label>
                      <p className="text-xs text-gray-500">Não exibe publicidade.</p>
                    </div>
                    <Switch checked={formData.features.removeAds} onCheckedChange={c => setFormData(p => ({ ...p, features: { ...p.features, removeAds: c } }))} />
                  </div>

                  <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${formData.features.prioritySupport ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Suporte Prioritário</Label>
                      <p className="text-xs text-gray-500">SLA reduzido.</p>
                    </div>
                    <Switch checked={formData.features.prioritySupport} onCheckedChange={c => setFormData(p => ({ ...p, features: { ...p.features, prioritySupport: c } }))} />
                  </div>

                  <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${formData.features.customBranding ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Whitelabel</Label>
                      <p className="text-xs text-gray-500">Remove marca &quot;OrdenGo&quot;.</p>
                    </div>
                    <Switch checked={formData.features.customBranding} onCheckedChange={c => setFormData(p => ({ ...p, features: { ...p.features, customBranding: c } }))} />
                  </div>

                  <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${formData.features.analytics ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Analytics Pro</Label>
                      <p className="text-xs text-gray-500">Relatórios avançados.</p>
                    </div>
                    <Switch checked={formData.features.analytics} onCheckedChange={c => setFormData(p => ({ ...p, features: { ...p.features, analytics: c } }))} />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#df0024] hover:bg-red-700 h-11 text-base font-bold shadow-md shadow-red-100" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin mr-2" />} Salvar Configuração
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}