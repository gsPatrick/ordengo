// app/clientes/page.js
"use client"

import React, { useState } from "react"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  CreditCard, 
  Calendar, 
  UserCog, 
  ShieldAlert, 
  LogIn,
  CheckCircle2,
  Tablet
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

// Mock Data para Tabela
const clientsData = [
  { id: 1, name: "Restaurante El Sol", region: "Tenerife (Zona Sul)", plan: "Premium", status: "paid", lastPayment: "15/11/2023", tablets: 12 },
  { id: 2, name: "Tapas Bar Central", region: "Madrid (Centro)", plan: "Basic", status: "late", lastPayment: "01/10/2023", tablets: 3 },
  { id: 3, name: "Ocean Blue Seafood", region: "Gran Canaria", plan: "Enterprise", status: "paid", lastPayment: "20/11/2023", tablets: 25 },
  { id: 4, name: "La Pizza Nostra", region: "Tenerife (Norte)", plan: "Pro", status: "pending", lastPayment: "Aguradando", tablets: 8 },
]

export default function ClientesPage() {
  const [activeTab, setActiveTab] = useState("directory")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estado do Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [step, setStep] = useState(1)

  // Função para avançar no Wizard
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h2>
            <p className="text-muted-foreground">Gerencie assinaturas, acessos e planos SaaS.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setIsWizardOpen(true); setStep(1); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      <Tabs defaultValue="directory" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="directory">Diretório de Clientes</TabsTrigger>
          <TabsTrigger value="plans">Planos e Preços</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: DIRETÓRIO --- */}
        <TabsContent value="directory" className="space-y-4">
          
          {/* Filtros */}
          <div className="flex items-center justify-between gap-4 bg-background/95 p-1 backdrop-blur">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative w-full max-w-sm">
                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input 
                    placeholder="Buscar por nome, NIF ou email..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status Financeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Em dia</SelectItem>
                  <SelectItem value="late">Inadimplente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Clientes */}
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Restaurante / Razão Social</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Tablets</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prox. Cobrança</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsData.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span>{client.name}</span>
                            <span className="text-xs text-muted-foreground">NIF: B-12345678</span>
                        </div>
                    </TableCell>
                    <TableCell>{client.region}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{client.plan}</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Tablet className="h-3 w-3" /> {client.tablets}
                        </div>
                    </TableCell>
                    <TableCell>
                        {client.status === 'paid' && <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>}
                        {client.status === 'late' && <Badge variant="destructive">Atrasado</Badge>}
                        {client.status === 'pending' && <Badge variant="secondary">Pendente</Badge>}
                    </TableCell>
                    <TableCell>{client.lastPayment}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações Administrativas</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <UserCog className="mr-2 h-4 w-4" /> Editar Cadastro
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" /> Ver Faturas
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-blue-600 focus:text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20">
                             <LogIn className="mr-2 h-4 w-4" /> Impersonate (Acessar)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <ShieldAlert className="mr-2 h-4 w-4" /> Suspender Acesso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* --- ABA 2: PLANOS E ASSINATURAS --- */}
        <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                {/* PLANO BASIC */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic</CardTitle>
                        <CardDescription>Para pequenos cafés e bares locais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">€49<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Até 5 Tablets</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Suporte por Email</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Menu Digital</li>
                            <li className="flex items-center opacity-50"><CheckCircle2 className="mr-2 h-4 w-4" /> Sem Remoção de Ads</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Editar Plano</Button>
                    </CardFooter>
                </Card>

                {/* PLANO PRO */}
                <Card className="border-primary shadow-md relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                        Mais Popular
                    </div>
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>Para restaurantes estabelecidos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">€99<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                         <ul className="text-sm space-y-2 text-muted-foreground">
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Até 15 Tablets</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Suporte Prioritário</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Integração PDV</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Ads Reduzidos</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Editar Plano</Button>
                    </CardFooter>
                </Card>

                {/* PLANO ENTERPRISE */}
                <Card>
                    <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>Para redes e franquias.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">€199<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                         <ul className="text-sm space-y-2 text-muted-foreground">
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Tablets Ilimitados</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Gestente de Conta</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Sem Ads (Opcional)</li>
                            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> API Access</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Editar Plano</Button>
                    </CardFooter>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

      {/* --- WIZARD DE NOVO CLIENTE (MODAL) --- */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            <DialogDescription>
              {step === 1 && "Passo 1/3: Dados Cadastrais do Restaurante"}
              {step === 2 && "Passo 2/3: Seleção de Plano SaaS"}
              {step === 3 && "Passo 3/3: Vigência e Contrato"}
            </DialogDescription>
          </DialogHeader>

          {/* CONTEÚDO DO WIZARD */}
          <div className="py-4">
            
            {/* PASSO 1: DADOS */}
            {step === 1 && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="razao">Razão Social</Label>
                            <Input id="razao" placeholder="Ex: Restaurante LTDA" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nif">NIF / CIF</Label>
                            <Input id="nif" placeholder="B-12345678" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endereco">Endereço Completo</Label>
                        <Input id="endereco" placeholder="Rua, Número, Região, CP" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="resp">Nome do Responsável</Label>
                            <Input id="resp" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Login</Label>
                            <Input id="email" type="email" />
                        </div>
                    </div>
                </div>
            )}

            {/* PASSO 2: PLANO */}
            {step === 2 && (
                <div className="grid gap-4 py-4">
                     <div className="space-y-2">
                        <Label>Selecione o Tier</Label>
                        <Select defaultValue="pro">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="basic">Basic (€49/mês)</SelectItem>
                                <SelectItem value="pro">Pro (€99/mês)</SelectItem>
                                <SelectItem value="enterprise">Enterprise (€199/mês)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Número de Tablets Contratados</Label>
                        <Input type="number" placeholder="Ex: 10" />
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                         <Switch id="integracao" />
                         <Label htmlFor="integracao">Habilitar Integração PDV (+€20)</Label>
                    </div>
                </div>
            )}

             {/* PASSO 3: CONTRATO */}
             {step === 3 && (
                <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data de Início</Label>
                            <Input type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label>Renovação</Label>
                            <Select defaultValue="auto">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Automática (Mensal)</SelectItem>
                                    <SelectItem value="manual">Manual (Anual)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                        <p className="font-semibold mb-1">Resumo:</p>
                        <p>Plano Pro + 10 Tablets.</p>
                        <p>Cobrança estimada: <span className="font-bold text-foreground">€99.00 / mês</span></p>
                        <p>Primeira cobrança: Imediata.</p>
                    </div>
                </div>
            )}

          </div>

          {/* FOOTER DO WIZARD */}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
                Anterior
            </Button>
            {step < 3 ? (
                 <Button onClick={nextStep}>Próximo</Button>
            ) : (
                 <Button onClick={() => setIsWizardOpen(false)}>Criar Cliente</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}