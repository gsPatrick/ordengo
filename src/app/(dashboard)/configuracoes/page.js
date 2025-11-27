// app/configuracoes/page.js
"use client"

import React from "react"
import { 
  Globe, 
  Users, 
  CreditCard, 
  Shield, 
  Save, 
  Plus, 
  Trash2, 
  RefreshCw,
  Key,
  Mail,
  Server
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// --- MOCK DATA ---
const teamMembers = [
  { id: 1, name: "Admin Super", email: "admin@ordengo.com", role: "Super Admin", status: "active" },
  { id: 2, name: "Carlos Financeiro", email: "carlos@ordengo.com", role: "Financeiro", status: "active" },
  { id: 3, name: "Ana Suporte", email: "ana@ordengo.com", role: "Suporte L1", status: "invited" },
]

export default function ConfiguracoesPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h2>
            <p className="text-muted-foreground">Gerencie preferências globais, equipe e integrações.</p>
        </div>
        <Button>
            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

      <Separator />

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-[800px]">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="equipe">Equipe & RBAC</TabsTrigger>
          <TabsTrigger value="financeiro">Moedas</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: GERAL (IDIOMA E REGIÃO) --- */}
        <TabsContent value="geral" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Idioma e Localização</CardTitle>
                        <CardDescription>Definições padrão para o painel administrativo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Idioma do Painel</Label>
                            <Select defaultValue="pt">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pt">Português (Brasil)</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[0.8rem] text-muted-foreground">Isso não afeta o idioma dos tablets dos clientes.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Fuso Horário Padrão</Label>
                            <Select defaultValue="canary">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="canary">Atlantic/Canary (GMT+0)</SelectItem>
                                    <SelectItem value="madrid">Europe/Madrid (GMT+1)</SelectItem>
                                    <SelectItem value="lisbon">Europe/Lisbon (GMT+0)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações da Empresa</CardTitle>
                        <CardDescription>Dados exibidos nas faturas geradas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome Fantasia</Label>
                            <Input defaultValue="OrdenGo Tech S.L." />
                        </div>
                        <div className="space-y-2">
                            <Label>Email de Suporte</Label>
                            <Input defaultValue="help@ordengo.com" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 2: EQUIPE (RBAC) --- */}
        <TabsContent value="equipe" className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Membros da Equipe</CardTitle>
                        <CardDescription>Gerencie quem tem acesso ao painel admin.</CardDescription>
                    </div>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Convidar Membro</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Função (Role)</TableHead>
                                <TableHead>Permissões</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="flex items-center gap-3 font-medium">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{member.name.substring(0,2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span>{member.name}</span>
                                            <span className="text-xs text-muted-foreground">{member.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select defaultValue={member.role.toLowerCase().includes("super") ? "super" : member.role.toLowerCase().includes("finance") ? "fin" : "sup"}>
                                            <SelectTrigger className="h-8 w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="super">Super Admin</SelectItem>
                                                <SelectItem value="fin">Financeiro</SelectItem>
                                                <SelectItem value="sup">Suporte</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {member.role === "Super Admin" && "Acesso Total"}
                                        {member.role === "Financeiro" && "Apenas Finanças e Relatórios"}
                                        {member.role === "Suporte L1" && "Apenas Clientes e Chamados"}
                                    </TableCell>
                                    <TableCell>
                                        {member.status === "active" 
                                            ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge> 
                                            : <Badge variant="secondary">Pendente</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- ABA 3: FINANCEIRO (MOEDAS) --- */}
        <TabsContent value="financeiro" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configuração de Moeda</CardTitle>
                    <CardDescription>Defina a moeda base e taxas de conversão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 border p-4 rounded-lg">
                         <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                            <span className="font-bold text-lg">€</span>
                         </div>
                         <div className="flex-1">
                            <Label>Moeda Base do Sistema</Label>
                            <p className="text-sm text-muted-foreground">Todas as receitas serão consolidadas nesta moeda.</p>
                         </div>
                         <Select defaultValue="eur">
                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="usd">USD ($)</SelectItem>
                            </SelectContent>
                         </Select>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-3">Taxas de Câmbio (Manual)</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Moeda</TableHead>
                                    <TableHead>Taxa (1 EUR = )</TableHead>
                                    <TableHead>Última Atualização</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-bold">USD (Dólar Americano)</TableCell>
                                    <TableCell>
                                        <Input className="w-24 h-8" defaultValue="1.08" />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">Automático (API)</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="sm"><RefreshCw className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-bold">GBP (Libra Esterlina)</TableCell>
                                    <TableCell>
                                        <Input className="w-24 h-8" defaultValue="0.86" />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">22/11/2023</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="sm"><RefreshCw className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- ABA 4: INTEGRAÇÕES --- */}
        <TabsContent value="integracoes" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Stripe */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">Stripe Payment</CardTitle>
                            <Badge className="bg-green-600">Conectado</Badge>
                        </div>
                        <CardDescription>Processamento de cartões de crédito e assinaturas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Chave Pública (Publishable Key)</Label>
                            <Input type="password" value="pk_live_................" readOnly />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="stripe-enabled" checked />
                            <Label htmlFor="stripe-enabled">Habilitar pagamentos</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Configurar Webhooks</Button>
                    </CardFooter>
                </Card>

                {/* SendGrid */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">SendGrid (Email)</CardTitle>
                            <Badge variant="secondary">Desconectado</Badge>
                        </div>
                        <CardDescription>Envio de faturas e notificações transacionais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input placeholder="Cole sua chave API aqui..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Remetente</Label>
                            <Input placeholder="no-reply@ordengo.com" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Conectar</Button>
                    </CardFooter>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 5: SEGURANÇA & LOGS --- */}
        <TabsContent value="seguranca" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Credenciais de API</CardTitle>
                    <CardDescription>Chaves para acesso externo à API do OrdenGo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md mb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Chave Mestra (Admin)</p>
                            <p className="text-xs font-mono text-muted-foreground">sk_live_83j...9s8d</p>
                        </div>
                        <Button variant="destructive" size="sm">Revogar</Button>
                    </div>
                    <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Gerar Nova Chave</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Retenção de Dados</CardTitle>
                    <CardDescription>Política de armazenamento de logs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Logs de Acesso (Auditoria)</Label>
                            <p className="text-sm text-muted-foreground">Tempo para manter registros de quem acessou o sistema.</p>
                        </div>
                        <Select defaultValue="90">
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 dias</SelectItem>
                                <SelectItem value="90">90 dias</SelectItem>
                                <SelectItem value="365">1 ano</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Logs de Impressão de Ads</Label>
                            <p className="text-sm text-muted-foreground">Dados brutos de entrega de publicidade.</p>
                        </div>
                        <Select defaultValue="30">
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 dias</SelectItem>
                                <SelectItem value="30">30 dias</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}