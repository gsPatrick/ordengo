'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Check, Plus, Edit2, Power, 
  CreditCard, Tablet, ShieldCheck, Loader2, X, PackageOpen, LayoutList
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  // --- HANDLERS ---

  const openModal = (plan = null) => {
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
      } else {
        // CORREÇÃO: Adicionado prefixo /admin
        await api.post('/admin/plans', payload);
      }
      
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      alert('Erro ao salvar plano.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    if(!confirm("Alterar status do plano?")) return;
    try {
      // CORREÇÃO: Adicionado prefixo /admin
      await api.patch(`/admin/plans/${id}/toggle`);
      fetchPlans();
    } catch (e) { alert("Erro ao alterar status."); }
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
      <Button onClick={() => openModal()} className="bg-[#df0024] hover:bg-red-700 text-white px-8 py-6 text-lg h-auto rounded-xl shadow-lg shadow-red-100 transition-transform hover:scale-105">
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
            <Button onClick={() => openModal()} className="bg-[#df0024] hover:bg-red-700 text-white gap-2">
              <Plus size={18} /> Criar Novo Plano
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#df0024]" size={48}/>
            <p className="text-gray-400 font-medium">Carregando catálogo de planos...</p>
          </div>
        ) : plans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className={`relative flex flex-col transition-all hover:shadow-xl border-t-4 group ${plan.isActive ? 'border-t-[#df0024]' : 'border-t-gray-300 opacity-75 hover:opacity-100'}`}>
                
                {!plan.isActive && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-gray-200 text-gray-600">Arquivado</Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    {plan.isActive && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
                  </div>
                  <CardDescription className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(plan.priceMonthly, plan.currency)}</span>
                    <span className="text-sm text-gray-500 font-medium">/mês</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-5">
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 flex items-center gap-3 border border-gray-100 group-hover:border-[#df0024]/20 transition-colors">
                    <div className="bg-white p-1.5 rounded-md shadow-sm text-gray-500">
                      <Tablet size={16}/>
                    </div>
                    {plan.maxTablets === 0 ? <span className="font-bold">Tablets Ilimitados</span> : <span>Até <strong className="text-gray-900">{plan.maxTablets}</strong> tablets</span>}
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recursos Inclusos</p>
                    <ul className="space-y-2 text-sm">
                      <li className={`flex items-center gap-2 ${plan.features.removeAds ? 'text-gray-900 font-medium' : 'text-gray-400 line-through'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${plan.features.removeAds ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {plan.features.removeAds ? <Check size={10}/> : <X size={10}/>}
                        </div>
                        Sem Publicidade
                      </li>
                      <li className={`flex items-center gap-2 ${plan.features.prioritySupport ? 'text-gray-900 font-medium' : 'text-gray-400 line-through'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${plan.features.prioritySupport ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {plan.features.prioritySupport ? <Check size={10}/> : <X size={10}/>}
                        </div>
                        Suporte Prioritário
                      </li>
                      <li className={`flex items-center gap-2 ${plan.features.customBranding ? 'text-gray-900 font-medium' : 'text-gray-400 line-through'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${plan.features.customBranding ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {plan.features.customBranding ? <Check size={10}/> : <X size={10}/>}
                        </div>
                        Whitelabel
                      </li>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="grid grid-cols-4 gap-2 border-t pt-4 bg-gray-50/50 rounded-b-xl">
                  <Button variant="outline" className="col-span-3 bg-white hover:bg-gray-50 hover:text-[#df0024] border-gray-200" onClick={() => openModal(plan)}>
                    <Edit2 size={14} className="mr-2"/> Editar Detalhes
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={plan.isActive ? "text-red-500 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100" : "text-green-500 hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-100"}
                    onClick={() => handleToggleStatus(plan.id)}
                    title={plan.isActive ? "Desativar Plano" : "Ativar Plano"}
                  >
                    <Power size={16}/>
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
                  <Input placeholder="Ex: Enterprise" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Limite Tablets (0 = Ilimitado)</Label>
                  <Input type="number" placeholder="Ex: 10" value={formData.maxTablets} onChange={e=>setFormData({...formData, maxTablets:e.target.value})} required />
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="space-y-2">
                  <Label className="text-blue-900 font-bold text-xs">Moeda</Label>
                  <Select value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}>
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
                  <Input type="number" step="0.01" value={formData.priceMonthly} onChange={e=>setFormData({...formData, priceMonthly:e.target.value})} required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-900 font-bold text-xs">Preço Anual</Label>
                  <Input type="number" step="0.01" value={formData.priceYearly} onChange={e=>setFormData({...formData, priceYearly:e.target.value})} required className="bg-white" />
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
                    <Switch checked={formData.features.removeAds} onCheckedChange={c => setFormData(p => ({...p, features: {...p.features, removeAds: c}}))} />
                  </div>

                  <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${formData.features.prioritySupport ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Suporte Prioritário</Label>
                      <p className="text-xs text-gray-500">SLA reduzido.</p>
                    </div>
                    <Switch checked={formData.features.prioritySupport} onCheckedChange={c => setFormData(p => ({...p, features: {...p.features, prioritySupport: c}}))} />
                  </div>

                  <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${formData.features.customBranding ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Whitelabel</Label>
                      <p className="text-xs text-gray-500">Remove marca &quot;OrdenGo&quot;.</p>
                    </div>
                    <Switch checked={formData.features.customBranding} onCheckedChange={c => setFormData(p => ({...p, features: {...p.features, customBranding: c}}))} />
                  </div>

                  <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${formData.features.analytics ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Analytics Pro</Label>
                      <p className="text-xs text-gray-500">Relatórios avançados.</p>
                    </div>
                    <Switch checked={formData.features.analytics} onCheckedChange={c => setFormData(p => ({...p, features: {...p.features, analytics: c}}))} />
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