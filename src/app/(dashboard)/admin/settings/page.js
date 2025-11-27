'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, Key, Users, Globe, Save, Loader2, Trash2 
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [team, setTeam] = useState([]);
  const [logs, setLogs] = useState([]);
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin_support' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tRes, lRes, cRes] = await Promise.all([
          api.get('/settings/team'),
          api.get('/settings/audit-logs'),
          api.get('/settings/integrations')
        ]);
        setTeam(tRes.data.data.team);
        setLogs(lRes.data.data.logs);
        setConfigs(cRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handlers
  const handleSaveConfigs = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/integrations', configs);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings/team', newUser);
      alert('Usuário criado!');
      window.location.reload();
    } catch (err) {
      alert('Erro ao criar usuário.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="integrations" className="gap-2"><Globe size={16}/> Integrações Globais</TabsTrigger>
            <TabsTrigger value="team" className="gap-2"><Users size={16}/> Equipe Interna</TabsTrigger>
            <TabsTrigger value="audit" className="gap-2"><Shield size={16}/> Logs de Auditoria</TabsTrigger>
          </TabsList>

          {/* ABA INTEGRAÇÕES */}
          <TabsContent value="integrations" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gateways de Pagamento</CardTitle>
                <CardDescription>Chaves de API para processar assinaturas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Stripe Public Key</label>
                  <Input value={configs.stripe_public_key || ''} onChange={e=>setConfigs({...configs, stripe_public_key:e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Stripe Secret Key</label>
                  <Input type="password" value={configs.stripe_secret_key || ''} onChange={e=>setConfigs({...configs, stripe_secret_key:e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servidor de Email (SMTP)</CardTitle>
                <CardDescription>Para envio de faturas e recuperação de senha.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-bold">Host</label><Input value={configs.smtp_host || ''} onChange={e=>setConfigs({...configs, smtp_host:e.target.value})} /></div>
                  <div><label className="text-sm font-bold">Port</label><Input value={configs.smtp_port || ''} onChange={e=>setConfigs({...configs, smtp_port:e.target.value})} /></div>
                </div>
                <div><label className="text-sm font-bold">User</label><Input value={configs.smtp_user || ''} onChange={e=>setConfigs({...configs, smtp_user:e.target.value})} /></div>
                <div><label className="text-sm font-bold">Pass</label><Input type="password" value={configs.smtp_pass || ''} onChange={e=>setConfigs({...configs, smtp_pass:e.target.value})} /></div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveConfigs} className="bg-[#df0024] hover:bg-red-700 w-40">
                {saving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2" size={18}/>} Salvar Tudo
              </Button>
            </div>
          </TabsContent>

          {/* ABA EQUIPE */}
          <TabsContent value="team" className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 h-fit">
              <CardHeader><CardTitle>Adicionar Membro</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <Input placeholder="Nome" value={newUser.name} onChange={e=>setNewUser({...newUser, name:e.target.value})} required />
                  <Input placeholder="Email" type="email" value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})} required />
                  <Input placeholder="Senha Provisória" type="password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} required />
                  <select className="w-full border rounded-md p-2 text-sm" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}>
                    <option value="admin_support">Suporte</option>
                    <option value="admin_finance">Financeiro</option>
                    <option value="admin_sales">Vendas</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                  <Button type="submit" className="w-full">Criar Usuário</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Membros Ativos</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Nome</TableHead><TableHead>Role</TableHead><TableHead></TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <p className="font-bold">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </TableCell>
                        <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm"><Trash2 size={16} className="text-red-500"/></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA AUDITORIA */}
          <TabsContent value="audit" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Log de Segurança</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Data</TableHead><TableHead>Usuário</TableHead><TableHead>Ação</TableHead><TableHead>Recurso</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{log.User?.name || 'Sistema'}</TableCell>
                        <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                        <TableCell className="text-xs font-mono text-gray-500 truncate max-w-[200px]">{log.targetResource}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}