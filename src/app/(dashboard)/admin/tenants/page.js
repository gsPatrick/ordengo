'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, CheckCircle, XCircle, Store, Mail, Loader2, ShieldCheck, Globe, LogIn, Edit, Trash2, MapPin, CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TenantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [regions, setRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de Impersonate (Animação de Troca de Contexto)
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonateTarget, setImpersonateTarget] = useState('');

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    restaurantName: '', slug: '', taxId: '', 
    contactPerson: '', timezone: 'Europe/Madrid', country: 'ES', currency: 'EUR',
    planId: '', regionId: '',
    managerName: '', managerEmail: '', managerPassword: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // --- CARREGAR DADOS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tenRes, planRes, regRes] = await Promise.all([
        api.get('/admin/tenants'),
        api.get('/admin/plans'),
        api.get('/admin/regions')
      ]);
      setTenants(tenRes.data.data.restaurants);
      setPlans(planRes.data.data.plans);
      setRegions(regRes.data.data.regions);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- AÇÕES ---

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/tenants', formData);
      alert('Restaurante criado com sucesso!');
      setIsCreateOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao criar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!confirm(`Deseja realmente ${currentStatus ? 'bloquear' : 'ativar'} este restaurante?`)) return;
    try {
      await api.patch(`/admin/tenants/${id}/toggle-status`);
      fetchData();
    } catch (e) { alert('Erro ao alterar status.'); }
  };

  const handleImpersonate = async (restaurantId, restaurantName) => {
    setImpersonateTarget(restaurantName);
    setIsImpersonating(true); // Ativa a animação de overlay

    try {
      // 1. Solicita o token de gerente ao backend
      const res = await api.post(`/admin/tenants/${restaurantId}/impersonate`);
      const { token, data } = res.data;
      const user = data.user;

      // 2. Limpa cookies antigos do Admin para evitar conflito
      Cookies.remove('ordengo_token');
      Cookies.remove('ordengo_user');

      // 3. Define novos cookies do Gerente
      Cookies.set('ordengo_token', token, { expires: 1 });
      Cookies.set('ordengo_user', JSON.stringify(user), { expires: 1 });
      
      // Flag para saber que somos admin logado como gerente (opcional, para mostrar botão de voltar depois)
      Cookies.set('admin_impersonating', 'true', { expires: 1 });

      // 4. Aguarda um pouco para a animação rodar e o cookie assentar
      setTimeout(() => {
        // Redirecionamento forçado para garantir recarregamento do layout
        window.location.href = '/dashboard'; 
      }, 2000);

    } catch (error) {
      console.error(error);
      alert('Falha ao acessar painel do cliente. Verifique se existe um gerente ativo.');
      setIsImpersonating(false); // Cancela animação em caso de erro
    }
  };

  // --- FILTRO ---
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      
      {/* --- OVERLAY DE IMPERSONATE (ANIMAÇÃO DE LOGIN) --- */}
      {isImpersonating && (
        <div className="fixed inset-0 z-[9999] bg-[#1f1c1d] flex flex-col items-center justify-center animate-in fade-in duration-500">
          {/* Efeitos de Fundo */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#df0024] opacity-20 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600 opacity-10 blur-[100px]"></div>
          </div>

          <div className="z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-[#df0024] rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/50 animate-bounce">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Acessando Painel do Cliente</h2>
              <p className="text-gray-400 text-sm">Autenticando como gerente de <span className="text-[#df0024] font-bold">{impersonateTarget}</span>...</p>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <Loader2 className="text-[#df0024] animate-spin" size={18} />
              <span className="text-xs text-gray-300 font-mono">Redirecionando ambiente seguro...</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurantes (Tenants)</h1>
            <p className="text-gray-500">Gestão completa de clientes, contratos e acesso.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-md shadow-red-100">
            <Plus size={18} /> Novo Cliente
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex items-center bg-white p-2 rounded-xl border shadow-sm max-w-md">
          <Search className="text-gray-400 ml-2" size={20} />
          <Input 
            placeholder="Buscar por nome, slug ou email..." 
            className="border-none shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#df0024]" size={32}/></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Restaurante</TableHead>
                  <TableHead>Plano & Região</TableHead>
                  <TableHead>Contato (Gerente)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1f1c1d] flex items-center justify-center text-white font-bold shadow-sm">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{tenant.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Globe size={10} /> {tenant.slug}
                            <span className="text-gray-300">|</span>
                            <span className="uppercase font-mono">{tenant.taxId || 'S/NIF'}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex w-fit items-center gap-1">
                          <CreditCard size={10}/> {tenant.Plan?.name || 'Sem Plano'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10}/> {tenant.Region?.name || 'Global'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{tenant.Users?.[0]?.name || '---'}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={10}/> {tenant.Users?.[0]?.email || '---'}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {tenant.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive">Bloqueado</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#df0024] hover:border-[#df0024]"
                          onClick={() => handleImpersonate(tenant.id, tenant.name)}
                          title="Logar como Gerente"
                        >
                          <LogIn size={14}/> <span className="hidden md:inline">Acessar Painel</span>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8"><div className="rotate-90 font-bold text-lg">...</div></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}>
                              {tenant.isActive ? <><XCircle size={14} className="mr-2 text-red-500"/> Bloquear Acesso</> : <><CheckCircle size={14} className="mr-2 text-green-500"/> Reativar Acesso</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert('Edição ainda não implementada (use o modal de criação como base)')}>
                              <Edit size={14} className="mr-2"/> Editar Dados
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* MODAL DE CRIAÇÃO */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Restaurante</DialogTitle>
              <DialogDescription>Preencha os dados contratuais e crie o acesso do gerente.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreate} className="space-y-6 mt-2">
              
              {/* 1. DADOS EMPRESA */}
              <div className="space-y-4 border p-4 rounded-lg bg-gray-50/50">
                <h4 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2"><Store size={14}/> Dados do Estabelecimento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nome Fantasia</label>
                    <Input placeholder="Pizzaria do Luigi" value={formData.restaurantName} onChange={e=>setFormData({...formData, restaurantName:e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Slug (URL)</label>
                    <div className="flex">
                      <span className="bg-gray-100 border border-r-0 rounded-l-md px-2 py-2 text-xs text-gray-500 flex items-center">app.ordengo/</span>
                      <Input className="rounded-l-none" placeholder="pizzaria-luigi" value={formData.slug} onChange={e=>setFormData({...formData, slug:e.target.value.toLowerCase().replace(/\s+/g,'-')})} required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">NIF / Tax ID</label>
                    <Input placeholder="B-12345678" value={formData.taxId} onChange={e=>setFormData({...formData, taxId:e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Fuso Horário</label>
                    <Select value={formData.timezone} onValueChange={v=>setFormData({...formData, timezone:v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Madrid">Madrid (ES)</SelectItem>
                        <SelectItem value="Atlantic/Canary">Canárias (ES)</SelectItem>
                        <SelectItem value="Europe/Lisbon">Lisboa (PT)</SelectItem>
                        <SelectItem value="Europe/Berlin">Berlin (DE)</SelectItem>
                        <SelectItem value="Europe/Rome">Roma (IT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (FR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 2. CONTRATO */}
              <div className="space-y-4 border p-4 rounded-lg bg-blue-50/30">
                <h4 className="text-xs font-bold uppercase text-blue-600 flex items-center gap-2"><CreditCard size={14}/> Plano & Contrato</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Plano (Tier)</label>
                    <Select value={formData.planId} onValueChange={v=>setFormData({...formData, planId:v})} required>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (€ {p.priceMonthly})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Região (Fiscal)</label>
                    <Select value={formData.regionId} onValueChange={v=>setFormData({...formData, regionId:v})} required>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.country})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Moeda</label>
                    <Select value={formData.currency} onValueChange={v=>setFormData({...formData, currency:v})}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 3. GERENTE */}
              <div className="space-y-4 border p-4 rounded-lg bg-yellow-50/30">
                <h4 className="text-xs font-bold uppercase text-yellow-700 flex items-center gap-2"><ShieldCheck size={14}/> Acesso do Gerente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Nome Completo</label>
                    <Input className="bg-white" placeholder="Gerente Responsável" value={formData.managerName} onChange={e=>setFormData({...formData, managerName:e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Email de Login</label>
                    <Input className="bg-white" type="email" placeholder="gerente@restaurante.com" value={formData.managerEmail} onChange={e=>setFormData({...formData, managerEmail:e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Senha Inicial</label>
                    <Input className="bg-white" type="password" placeholder="••••••" value={formData.managerPassword} onChange={e=>setFormData({...formData, managerPassword:e.target.value})} required />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#df0024] hover:bg-red-700" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin mr-2 h-4 w-4"/>} Criar Restaurante
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}