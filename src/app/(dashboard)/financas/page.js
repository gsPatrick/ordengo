// app/financas/page.js
"use client"

import React, { useState } from "react"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  FileText, 
  Filter, 
  CreditCard, 
  DollarSign, 
  PieChart, 
  TrendingUp,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Mail
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// --- MOCK DATA ---
const transactionsSaaS = [
  { id: "INV-001", restaurant: "Restaurante El Sol", date: "22/11/2023", amount: "€99.00", plan: "Pro", status: "paid" },
  { id: "INV-002", restaurant: "Tapas Bar Central", date: "21/11/2023", amount: "€49.00", plan: "Basic", status: "pending" },
  { id: "INV-003", restaurant: "Ocean Blue", date: "20/11/2023", amount: "€199.00", plan: "Enterprise", status: "overdue" },
  { id: "INV-004", restaurant: "La Pizza Nostra", date: "19/11/2023", amount: "€99.00", plan: "Pro", status: "paid" },
]

const transactionsAds = [
  { id: "ADS-101", client: "Coca-Cola", campaign: "Verão 2024", date: "15/11/2023", amount: "€2,500.00", status: "paid" },
  { id: "ADS-102", client: "Turismo Tenerife", campaign: "Teide Promo", date: "18/11/2023", amount: "€1,200.00", status: "pending" },
]

const ledgerData = [
  { id: 1, date: "22/11", desc: "Pagamento Stripe (SaaS)", type: "credit", amount: "+€450.00", category: "Vendas" },
  { id: 2, date: "21/11", desc: "Servidores AWS (Infra)", type: "debit", amount: "-€120.50", category: "Operacional" },
  { id: 3, date: "21/11", desc: "Fatura Coca-Cola (Ads)", type: "credit", amount: "+€2,500.00", category: "Publicidade" },
  { id: 4, date: "20/11", desc: "Freelancer (Dev)", type: "debit", amount: "-€300.00", category: "Serviços" },
]

export default function FinancasPage() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Finanças e Contabilidade</h2>
            <p className="text-muted-foreground">Controle de receitas SaaS, publicidade e fluxo de caixa.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar Relatório
            </Button>
            <Button>
                <FileText className="mr-2 h-4 w-4" /> Nova Fatura Avulsa
            </Button>
        </div>
      </div>

      {/* --- RESUMO RÁPIDO (CARDS) --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total (Mês)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">€57,581.89</div>
                <p className="text-xs text-muted-foreground">+12% em relação a outubro</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A Receber (Pendente)</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">€4,250.00</div>
                <p className="text-xs text-muted-foreground">8 faturas em aberto</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Bancário (Est.)</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">€124,000.00</div>
                <p className="text-xs text-muted-foreground">BBVA - Conta Principal</p>
            </CardContent>
        </Card>
      </div>

      <Separator />

      {/* --- ABAS PRINCIPAIS --- */}
      <Tabs defaultValue="saas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="saas">Receita SaaS</TabsTrigger>
          <TabsTrigger value="ads">Receita Ads</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="contabilidade">Contabilidade</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: RECEITA SAAS --- */}
        <TabsContent value="saas" className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Input placeholder="Buscar restaurante ou fatura..." />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-white dark:bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fatura #</TableHead>
                            <TableHead>Restaurante</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Data Emissão</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactionsSaaS.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                <TableCell className="font-medium">{t.restaurant}</TableCell>
                                <TableCell><Badge variant="outline">{t.plan}</Badge></TableCell>
                                <TableCell>{t.date}</TableCell>
                                <TableCell>{t.amount}</TableCell>
                                <TableCell>
                                    {t.status === 'paid' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Pago</Badge>}
                                    {t.status === 'pending' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pendente</Badge>}
                                    {t.status === 'overdue' && <Badge variant="destructive">Atrasado</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> Ver PDF</DropdownMenuItem>
                                            <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Reenviar Email</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setIsPaymentModalOpen(true)} className="text-blue-600">
                                                Dar Baixa Manual
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

        {/* --- ABA 2: RECEITA ADS --- */}
        <TabsContent value="ads" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Faturamento de Mídia</CardTitle>
                    <CardDescription>Faturas geradas para grandes anunciantes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Anunciante</TableHead>
                                <TableHead>Campanha Referência</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Comissão (Est.)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {transactionsAds.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary font-bold">
                                            {t.client.substring(0,1)}
                                        </div>
                                        {t.client}
                                    </TableCell>
                                    <TableCell>{t.campaign}</TableCell>
                                    <TableCell className="font-bold">{t.amount}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">10% (€250)</TableCell>
                                    <TableCell>
                                        {t.status === 'paid' 
                                            ? <Badge className="bg-blue-100 text-blue-800 border-blue-200">Recebido</Badge> 
                                            : <Badge variant="outline">Aguardando</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Detalhes</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </TabsContent>

        {/* --- ABA 3: FLUXO DE CAIXA (VISUAL) --- */}
        <TabsContent value="fluxo" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                
                {/* Entradas vs Saídas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Balanço Mensal</CardTitle>
                        <CardDescription>Consolidado de Receitas e Despesas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mr-4">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Entradas (SaaS + Ads)</span>
                                    <span className="text-sm font-bold text-green-600">€57,581</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[80%]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mr-4">
                                <ArrowDownRight className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Saídas (Operacional)</span>
                                    <span className="text-sm font-bold text-red-600">€12,300</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[25%]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center">
                            <span className="font-medium">Lucro Líquido (Previsto)</span>
                            <span className="text-xl font-bold text-primary">€45,281.00</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Previsão Simples */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Receita</CardTitle>
                        <CardDescription>Origem dos fundos.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[200px]">
                        {/* Placeholder visual para gráfico de pizza */}
                        <div className="relative h-40 w-40 rounded-full border-[16px] border-blue-500 border-r-green-500 border-b-green-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-center">
                                70% SaaS<br/>
                                30% Ads
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 4: CONTABILIDADE (LEDGER) --- */}
        <TabsContent value="contabilidade" className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Livro Razão (Ledger)</CardTitle>
                        <CardDescription>Registro imutável de todas as movimentações financeiras.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Filtrar Data</Button>
                        <Button variant="outline" size="sm">Exportar CSV</Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledgerData.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-mono text-muted-foreground">{entry.date}</TableCell>
                                    <TableCell>{entry.desc}</TableCell>
                                    <TableCell><Badge variant="outline" className="text-xs font-normal">{entry.category}</Badge></TableCell>
                                    <TableCell>
                                        {entry.type === 'credit' 
                                            ? <span className="text-green-600 text-xs font-bold uppercase">Crédito</span>
                                            : <span className="text-red-600 text-xs font-bold uppercase">Débito</span>
                                        }
                                    </TableCell>
                                    <TableCell className={`text-right font-mono font-medium ${entry.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.amount}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>

      {/* --- MODAL: BAIXA MANUAL --- */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Dar Baixa Manual</DialogTitle>
                <DialogDescription>Confirme o recebimento deste pagamento fora do sistema automático.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Valor Recebido</Label>
                    <Input defaultValue="€99.00" />
                </div>
                <div className="space-y-2">
                    <Label>Método</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="transfer">Transferência Bancária</SelectItem>
                            <SelectItem value="cash">Dinheiro / Cheque</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Observações</Label>
                    <Input placeholder="Ex: Comprovante enviado por email" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => setIsPaymentModalOpen(false)}>Confirmar Pagamento</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}