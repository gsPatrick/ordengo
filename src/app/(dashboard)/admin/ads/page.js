'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Megaphone, Users, Plus, Trash2, Edit,
  Calendar, MapPin, Eye, MousePointer, Loader2,
  TrendingUp, Search, LayoutTemplate, CheckCircle2, XCircle, PlayCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// URL base para imagens (backend)
const IMAGE_BASE_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function AdNetworkPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Dados da API
  const [advertisers, setAdvertisers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [regions, setRegions] = useState([]);

  // Estados de UI
  const [isAdvModalOpen, setIsAdvModalOpen] = useState(false);
  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerPreview, setBannerPreview] = useState(null);

  // Models de Formulário
  const [newAdv, setNewAdv] = useState({
    id: null, companyName: '', taxId: '', contactName: '', email: '', phone: ''
  });

  const [newCamp, setNewCamp] = useState({
    advertiserId: '', title: '', startDate: '', endDate: '',
    priority: 'medium', frequency: '10', targetRegionIds: [],
    file: null
  });

  // --- CARREGAMENTO DE DADOS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Endpoints corrigidos com /admin/ prefixo
      const [advRes, campRes, regRes] = await Promise.all([
        api.get('/admin/advertisers'),
        api.get('/admin/campaigns'),
        api.get('/admin/regions')
      ]);
      setAdvertisers(advRes.data.data.advertisers || []);
      setCampaigns(campRes.data.data.campaigns || []);
      setRegions(regRes.data.data.regions || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- CÁLCULOS DE KPI (Frontend) ---
  const kpis = useMemo(() => {
    const active = campaigns.filter(c => c.status === 'active').length;
    // Soma views e clicks de todos os criativos de todas as campanhas
    const views = campaigns.reduce((acc, c) => acc + (c.creatives?.reduce((sum, cr) => sum + (cr.viewsCount || 0), 0) || 0), 0);
    const clicks = campaigns.reduce((acc, c) => acc + (c.creatives?.reduce((sum, cr) => sum + (cr.clicksCount || 0), 0) || 0), 0);

    // Dados para o gráfico (Top 5 Campanhas por Views)
    const chartData = campaigns
      .map(c => ({
        name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
        views: c.creatives?.reduce((sum, cr) => sum + (cr.viewsCount || 0), 0) || 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 7);

    return { active, views, clicks, chartData };
  }, [campaigns]);

  // --- HANDLERS ---

  const handleCreateAdvertiser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (newAdv.id) {
        // UPDATE
        await api.patch(`/admin/advertisers/${newAdv.id}`, newAdv);
      } else {
        // CREATE
        await api.post('/admin/advertisers', newAdv);
      }
      setIsAdvModalOpen(false);
      setNewAdv({ id: null, companyName: '', taxId: '', contactName: '', email: '', phone: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar anunciante.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdvertiser = async (id) => {
    if (!confirm("Tem certeza? Isso removerá o anunciante e todas as suas campanhas.")) return;
    try {
      await api.delete(`/admin/advertisers/${id}`);
      setAdvertisers(prev => prev.filter(a => a.id !== id));
    } catch (e) { alert("Erro ao deletar anunciante."); }
  };

  const handleEditAdvertiser = (adv) => {
    setNewAdv({
      id: adv.id,
      companyName: adv.companyName,
      taxId: adv.taxId || '',
      contactName: adv.contactName || '',
      email: adv.email || '',
      phone: adv.phone || ''
    });
    setIsAdvModalOpen(true);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCamp.advertiserId || !newCamp.file) return alert("Preencha todos os campos e anexe o banner.");

    setSubmitting(true);
    try {
      // 1. Criar Campanha
      const campRes = await api.post('/admin/campaigns', {
        advertiserId: newCamp.advertiserId,
        title: newCamp.title,
        startDate: newCamp.startDate,
        endDate: newCamp.endDate,
        priority: newCamp.priority,
        frequency: newCamp.frequency,
        targetRegionIds: newCamp.targetRegionIds
      });

      const campaignId = campRes.data.data.campaign.id;

      // 2. Upload Criativo
      const formData = new FormData();
      formData.append('file', newCamp.file);
      // Se houver linkUrl, adicionar aqui: formData.append('linkUrl', 'http...')

      await api.post(`/admin/campaigns/${campaignId}/creatives`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. Ativar
      await api.patch(`/admin/campaigns/${campaignId}/status`, { status: 'active' });

      setIsCampModalOpen(false);
      // Reset form
      setNewCamp({
        advertiserId: '', title: '', startDate: '', endDate: '',
        priority: 'medium', frequency: '10', targetRegionIds: [], file: null
      });
      setBannerPreview(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar campanha. Verifique o console.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm("Tem certeza? Isso removerá os banners dos tablets imediatamente.")) return;
    try {
      await api.delete(`/admin/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) { alert("Erro ao deletar."); }
  };

  const handleToggleRegion = (regionId) => {
    const current = newCamp.targetRegionIds;
    if (current.includes(regionId)) {
      setNewCamp({ ...newCamp, targetRegionIds: current.filter(id => id !== regionId) });
    } else {
      setNewCamp({ ...newCamp, targetRegionIds: [...current, regionId] });
    }
  };

  // --- COMPONENTES ---

  const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-center h-full">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
        <Icon className="text-gray-400" size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-2 mb-6">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} className="bg-[#df0024] hover:bg-red-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Rede de Publicidade</h1>
            <p className="text-gray-500">Gerencie parceiros, campanhas e o inventário de telas.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setNewAdv({ id: null, companyName: '', taxId: '', contactName: '', email: '', phone: '' }); setIsAdvModalOpen(true); }}>
              <Users className="mr-2 h-4 w-4" /> Novo Parceiro
            </Button>
            <Button className="bg-[#df0024] hover:bg-red-700 text-white" onClick={() => setIsCampModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova Campanha
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="overview" className="gap-2"><TrendingUp size={16} /> Visão Geral</TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2"><Megaphone size={16} /> Campanhas</TabsTrigger>
            <TabsTrigger value="advertisers" className="gap-2"><Users size={16} /> Anunciantes</TabsTrigger>
          </TabsList>

          {/* --- ABA 1: VISÃO GERAL --- */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Cards de KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Campanhas Ativas</CardTitle>
                  <Megaphone className="h-4 w-4 text-[#df0024]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : kpis.active}</div>
                  <p className="text-xs text-gray-500">de {campaigns.length} cadastradas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Parceiros</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : advertisers.length}</div>
                  <p className="text-xs text-gray-500">Anunciantes registrados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Impressões Totais</CardTitle>
                  <Eye className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : kpis.views.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Visualizações em tablets</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Top Campanhas (Visualizações)</CardTitle>
                <CardDescription>Comparativo das campanhas com maior alcance.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#df0024]" /></div>
                ) : kpis.chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg">
                    Nenhum dado de impressão registrado ainda.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpis.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} />
                      <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="views" fill="#df0024" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- ABA 2: CAMPANHAS --- */}
          <TabsContent value="campaigns" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#df0024]" /></div>
            ) : campaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Nenhuma Campanha"
                description="Comece criando uma campanha para exibir anúncios nos tablets dos restaurantes."
                actionLabel="Criar Primeira Campanha"
                onAction={() => setIsCampModalOpen(true)}
              />
            ) : (
              <div className="space-y-4">
                {/* Barra de Filtro */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm max-w-md">
                  <Search className="text-gray-400 ml-2" size={18} />
                  <Input
                    placeholder="Filtrar campanhas..."
                    className="border-none shadow-none focus-visible:ring-0 h-8"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Lista de Campanhas */}
                <div className="grid grid-cols-1 gap-4">
                  {campaigns.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map(camp => {
                    // Pega o primeiro criativo se existir
                    const creative = camp.creatives && camp.creatives.length > 0 ? camp.creatives[0] : null;

                    return (
                      <div key={camp.id} className="group bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-all">

                        {/* Preview da Imagem */}
                        <div className="w-full md:w-48 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative border flex items-center justify-center">
                          {creative ? (
                            creative.type === 'video' ? (
                              <div className="flex flex-col items-center text-gray-400">
                                <PlayCircle size={32} />
                                <span className="text-[10px] mt-1">VÍDEO</span>
                              </div>
                            ) : (
                              <img
                                src={`${IMAGE_BASE_URL}${creative.mediaUrl}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                alt="Banner"
                              />
                            )
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs flex-col">
                              <LayoutTemplate size={20} className="mb-1" /> Sem Mídia
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge className={camp.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}>
                              {camp.status === 'active' ? 'No Ar' : camp.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Informações */}
                        <div className="flex-1 space-y-1 min-w-0 w-full">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-gray-900 truncate">{camp.title}</h4>
                            <Badge variant="outline" className="text-[10px] h-5 border-gray-300 text-gray-500">
                              {camp.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Users size={12} /> {camp.Advertiser?.companyName || 'Anunciante Removido'}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border">
                              <Calendar size={12} /> {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border">
                              <MapPin size={12} /> {camp.Regions?.length > 0 ? `${camp.Regions.length} Regiões Alvo` : 'Global'}
                            </span>
                          </div>
                        </div>

                        {/* Métricas e Ações */}
                        <div className="flex flex-row md:flex-col gap-4 items-end border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100 w-full md:w-auto justify-between">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{creative?.viewsCount || 0}</p>
                            <p className="text-xs text-gray-400 uppercase font-bold">Impressões</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-blue-600">
                              <Edit size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteCampaign(camp.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* --- ABA 3: ANUNCIANTES --- */}
          <TabsContent value="advertisers" className="mt-6">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : advertisers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Cadastre seus Parceiros"
                description="Adicione as empresas que contrataram publicidade na sua rede."
                actionLabel="Novo Anunciante"
                onAction={() => { setNewAdv({ id: null, companyName: '', taxId: '', contactName: '', email: '', phone: '' }); setIsAdvModalOpen(true); }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisers.map(adv => (
                  <Card key={adv.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-gray-100 border">
                            <AvatarFallback className="text-gray-500 font-bold">{adv.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-base text-gray-900">{adv.companyName}</h3>
                            <p className="text-xs text-gray-500">{adv.taxId || 'Sem Tax ID'}</p>
                          </div>
                        </div>
                        {adv.isActive ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p className="flex items-center gap-2"><Users size={14} className="text-gray-400" /> {adv.contactName || 'Sem contato'}</p>
                        <p className="flex items-center gap-2 truncate" title={adv.email}><span className="text-gray-400">@</span> {adv.email || '-'}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400">Contrato Ativo</span>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#df0024]" onClick={() => handleEditAdvertiser(adv)}>
                          <Edit size={14} className="mr-1" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-700" onClick={() => handleDeleteAdvertiser(adv.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* --- MODAL NOVO ANUNCIANTE --- */}
        <Dialog open={isAdvModalOpen} onOpenChange={setIsAdvModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newAdv.id ? 'Editar Anunciante' : 'Novo Anunciante'}</DialogTitle>
              <DialogDescription>Cadastre os dados fiscais e de contato do parceiro.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdvertiser} className="space-y-4 mt-2">
              <Input placeholder="Nome da Empresa / Marca" value={newAdv.companyName} onChange={e => setNewAdv({ ...newAdv, companyName: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="NIF / CNPJ" value={newAdv.taxId} onChange={e => setNewAdv({ ...newAdv, taxId: e.target.value })} />
                <Input placeholder="Nome do Contato" value={newAdv.contactName} onChange={e => setNewAdv({ ...newAdv, contactName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="email" placeholder="Email Comercial" value={newAdv.email} onChange={e => setNewAdv({ ...newAdv, email: e.target.value })} />
                <Input placeholder="Telefone" value={newAdv.phone} onChange={e => setNewAdv({ ...newAdv, phone: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setIsAdvModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#df0024] hover:bg-red-700" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Salvar Parceiro
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- MODAL NOVA CAMPANHA --- */}
        <Dialog open={isCampModalOpen} onOpenChange={setIsCampModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Campanha Publicitária</DialogTitle>
              <DialogDescription>Configure a exibição e faça upload do banner.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-5 mt-2">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Anunciante</label>
                  <Select value={newCamp.advertiserId} onValueChange={val => setNewCamp({ ...newCamp, advertiserId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {advertisers.map(a => <SelectItem key={a.id} value={a.id}>{a.companyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Título Interno</label>
                  <Input placeholder="Ex: Promoção Verão 2025" value={newCamp.title} onChange={e => setNewCamp({ ...newCamp, title: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><label className="text-xs font-bold uppercase text-gray-500">Início</label><Input type="date" value={newCamp.startDate} onChange={e => setNewCamp({ ...newCamp, startDate: e.target.value })} required /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase text-gray-500">Fim</label><Input type="date" value={newCamp.endDate} onChange={e => setNewCamp({ ...newCamp, endDate: e.target.value })} required /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase text-gray-500">Prioridade</label>
                  <Select value={newCamp.priority} onValueChange={val => setNewCamp({ ...newCamp, priority: val })}>
                    <SelectTrigger><SelectValue placeholder="Média" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Regiões Alvo (Opcional)</label>
                <div className="flex flex-wrap gap-2 border p-3 rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                  {regions.length === 0 && <span className="text-xs text-gray-400">Nenhuma região cadastrada em Regiões & Fiscal.</span>}
                  {regions.map(reg => (
                    <Badge
                      key={reg.id}
                      variant={newCamp.targetRegionIds.includes(reg.id) ? "default" : "outline"}
                      className={`cursor-pointer select-none ${newCamp.targetRegionIds.includes(reg.id) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
                      onClick={() => handleToggleRegion(reg.id)}
                    >
                      {reg.name} ({reg.country})
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 text-right">Se nenhuma for selecionada, a campanha será Global.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Banner Criativo (1920x1080)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center relative bg-gray-50 hover:bg-white transition-colors group cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewCamp({ ...newCamp, file });
                        setBannerPreview(URL.createObjectURL(file));
                      }
                    }}
                    required
                  />
                  {bannerPreview ? (
                    <img src={bannerPreview} className="h-full w-full object-contain p-1" />
                  ) : (
                    <div className="text-center text-gray-400 group-hover:text-[#df0024]">
                      <Megaphone size={24} className="mx-auto mb-2" />
                      <span className="text-sm font-medium">Clique para carregar imagem/vídeo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setIsCampModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#df0024] hover:bg-red-700 text-white" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Publicar Campanha
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}