// app/relatorios/page.js
"use client"

import React, { useState } from "react"
import { 
  FileText, 
  Printer, 
  Download, 
  TrendingDown, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  Search,
  ShieldAlert,
  User
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// --- MOCK DATA ---
const logsData = [
  { id: 1, user: "Admin Super", action: "Alterou preço do Plano Pro", target: "Configurações SaaS", date: "22/11/2023 14:30" },
  { id: 2, user: "Maria Silva", action: "Removeu cliente inadimplente", target: "Restaurante Pizza Top", date: "22/11/2023 10:15" },
  { id: 3, user: "System", action: "Falha no Job de Email", target: "Cron Daily", date: "21/11/2023 03:00" },
  { id: 4, user: "Admin Super", action: "Login realizado", target: "IP 192.168.1.1", date: "21/11/2023 08:00" },
]

const adPerformance = [
  { campaign: "Verão Coca-Cola", impressions: "150k", clicks: "2,300", ctr: "1.5%", spend: "€2,500" },
  { campaign: "Heineken Promo", impressions: "80k", clicks: "900", ctr: "1.1%", spend: "€1,200" },
  { campaign: "Turismo Local", impressions: "300k", clicks: "5,000", ctr: "1.6%", spend: "€4,000" },
]

export default function RelatoriosPage() {
  const [currentTab, setCurrentTab] = useState("financeiro")

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* --- HEADER & EXPORT ACTIONS --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Centro de Relatórios</h2>
            <p className="text-muted-foreground">Inteligência de negócios, métricas de performance e auditoria.</p>
        </div>
        
        {/* Botões de Exportação Globais */}
        <div className="flex gap-2">
            <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="financeiro" className="space-y-6" onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="financeiro">Financeiro (DRE)</TabsTrigger>
          <TabsTrigger value="saas">Performance SaaS</TabsTrigger>
          <TabsTrigger value="ads">Performance Ads</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria & Logs</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: FINANCEIRO (DRE) --- */}
        <TabsContent value="financeiro" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                {/* Tabela DRE */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Demonstrativo de Resultados (DRE)</CardTitle>
                        <CardDescription>Visão consolidada do exercício atual (Novembro/2023).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell>Receita Bruta Total</TableCell>
                                    <TableCell className="text-right">€ 60,000.00</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4 text-muted-foreground">(-) Impostos s/ Venda</TableCell>
                                    <TableCell className="text-right text-red-500">(€ 6,000.00)</TableCell>
                                </TableRow>
                                <TableRow className="font-medium">
                                    <TableCell>Receita Líquida</TableCell>
                                    <TableCell className="text-right">€ 54,000.00</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4 text-muted-foreground">(-) Custos Operacionais (Servidores/Infra)</TableCell>
                                    <TableCell className="text-right text-red-500">(€ 5,000.00)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4 text-muted-foreground">(-) Despesas com Pessoal</TableCell>
                                    <TableCell className="text-right text-red-500">(€ 15,000.00)</TableCell>
                                </TableRow>
                                <TableRow className="bg-green-50 dark:bg-green-900/20 font-bold text-lg">
                                    <TableCell>EBITDA (Lucro Operacional)</TableCell>
                                    <TableCell className="text-right text-green-700 dark:text-green-400">€ 34,000.00</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Faturamento por Região */}
                <Card>
                    <CardHeader>
                        <CardTitle>Receita por Região</CardTitle>
                        <CardDescription>Top performace geográfica.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Tenerife (Sul)</span>
                                <span className="font-bold">45%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Gran Canaria</span>
                                <span className="font-bold">30%</span>
                            </div>
                            <Progress value={30} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Madrid</span>
                                <span className="font-bold">15%</span>
                            </div>
                            <Progress value={15} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Outros</span>
                                <span className="font-bold">10%</span>
                            </div>
                            <Progress value={10} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* --- ABA 2: PERFORMANCE SAAS --- */}
        <TabsContent value="saas" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate (Mensal)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-red-600">2.4%</span>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Meta: &lt; 2.0%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Crescimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-green-600">+12.5%</span>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Novos clientes líquidos.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Uso do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">8.5h</div>
                        <p className="text-xs text-muted-foreground mt-1">Tempo médio logado por dia.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico Simulado: Novos vs Cancelados */}
            <Card>
                <CardHeader>
                    <CardTitle>Aquisição vs Cancelamento (Últimos 6 meses)</CardTitle>
                    <CardDescription>Evolução da base de clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full flex items-end justify-between gap-2 px-4">
                        {['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'].map((month, i) => {
                            // Simulando dados randomicos
                            const heightNew = 40 + Math.random() * 50; 
                            const heightChurn = 10 + Math.random() * 20;
                            return (
                                <div key={month} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="w-full max-w-[60px] flex items-end gap-1 h-[200px] relative">
                                        <div 
                                            style={{ height: `${heightNew}%` }} 
                                            className="flex-1 bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600 relative"
                                        >
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">+{Math.round(heightNew)}</span>
                                        </div>
                                        <div 
                                            style={{ height: `${heightChurn}%` }} 
                                            className="flex-1 bg-red-400 rounded-t-sm transition-all group-hover:bg-red-500 relative"
                                        >
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity text-red-600">-{Math.round(heightChurn)}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{month}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-3 w-3 bg-blue-500 rounded-sm" /> Novos Clientes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-3 w-3 bg-red-400 rounded-sm" /> Cancelamentos
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- ABA 3: PERFORMANCE ADS --- */}
        <TabsContent value="ads" className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Relatório de Entregas</CardTitle>
                    <CardDescription>Performance agregada das campanhas ativas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campanha</TableHead>
                                <TableHead>Impressões</TableHead>
                                <TableHead>Cliques (Interações)</TableHead>
                                <TableHead>CTR Médio</TableHead>
                                <TableHead>Investimento</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {adPerformance.map((ad, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{ad.campaign}</TableCell>
                                    <TableCell>{ad.impressions}</TableCell>
                                    <TableCell>{ad.clicks}</TableCell>
                                    <TableCell>{ad.ctr}</TableCell>
                                    <TableCell>{ad.spend}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>

             {/* Ocupação de Inventário */}
             <Card>
                <CardHeader>
                    <CardTitle>Ocupação do Inventário (Slots de Ads)</CardTitle>
                    <CardDescription>Quanto do tempo ocioso dos tablets foi preenchido com publicidade paga.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Slots Preenchidos (Ocupação)</span>
                            <span className="text-sm font-bold">78%</span>
                        </div>
                        <Progress value={78} className="h-4" />
                        <p className="text-xs text-muted-foreground text-right">22% de inventário não monetizado (House Ads)</p>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>

        {/* --- ABA 4: AUDITORIA E LOGS --- */}
        <TabsContent value="auditoria" className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                            Logs de Auditoria
                        </CardTitle>
                        <CardDescription>Rastreamento de ações administrativas sensíveis.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filtrar logs..." className="pl-8 w-[250px]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Usuário (Admin)</TableHead>
                                <TableHead>Ação</TableHead>
                                <TableHead>Alvo/Contexto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logsData.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs font-mono text-muted-foreground">{log.date}</TableCell>
                                    <TableCell className="flex items-center gap-2 font-medium">
                                        <User className="h-3 w-3" /> {log.user}
                                    </TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell><Badge variant="outline">{log.target}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}