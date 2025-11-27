// app/publicidade/page.js
"use client"

import React, { useState } from "react"
import { 
  Megaphone, 
  Target, 
  Plus, 
  Briefcase, 
  MoreHorizontal, 
  PlayCircle, 
  PauseCircle, 
  Eye, 
  MapPin,
  Clock,
  BarChart,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// --- MOCK DATA ---
const advertisers = [
  { id: 1, name: "Coca-Cola Espanha", contact: "marketing@coca-cola.es", campaigns: 3, status: "active", budget: "€5,000" },
  { id: 2, name: "Turismo de Tenerife", contact: "info@visittenerife.com", campaigns: 1, status: "active", budget: "€2,000" },
  { id: 3, name: "Heineken", contact: "ads@heineken.com", campaigns: 0, status: "inactive", budget: "€0" },
]

const campaigns = [
  { id: 1, name: "Verão Refrescante", advertiser: "Coca-Cola", type: "video", duration: "15s", region: "Global", impressions: 15400, target: 50000, status: "running", priority: "High" },
  { id: 2, name: "Promoção Happy Hour", advertiser: "Heineken", type: "image", duration: "10s", region: "Zona Sul", impressions: 8500, target: 10000, status: "paused", priority: "Medium" },
  { id: 3, name: "Visite o Teide", advertiser: "Turismo Tenerife", type: "video", duration: "30s", region: "Norte & Sul", impressions: 2200, target: 100000, status: "running", priority: "Low" },
  { id: 4, name: "Loro Parque Promo", advertiser: "Loro Parque", type: "image", duration: "10s", region: "Tenerife", impressions: 45000, target: 50000, status: "finished", priority: "High" },
]

export default function PublicidadePage() {
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Rede de Publicidade</h2>
            <p className="text-muted-foreground">Gestão de inventário de mídia e parceiros.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none">
                <Briefcase className="mr-2 h-4 w-4" /> Parceiros
            </Button>
            <Button onClick={() => setIsNewCampaignOpen(true)} className="flex-1 md:flex-none">
                <Plus className="mr-2 h-4 w-4" /> Criar Campanha
            </Button>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="campanhas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="anunciantes">Anunciantes</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        {/* --- ABA 1: ANUNCIANTES --- */}
        <TabsContent value="anunciantes">
             <Card>
                <CardHeader>
                    <CardTitle>Carteira de Anunciantes</CardTitle>
                    <CardDescription>Empresas com contratos de mídia ativos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead className="hidden md:table-cell">Contato</TableHead>
                        <TableHead className="text-center">Campanhas</TableHead>
                        <TableHead>Budget Mensal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {advertisers.map((ad) => (
                        <TableRow key={ad.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {ad.name.substring(0,2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span>{ad.name}</span>
                                    <span className="text-xs text-muted-foreground md:hidden">{ad.contact}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{ad.contact}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="font-mono">{ad.campaigns}</Badge>
                            </TableCell>
                            <TableCell>{ad.budget}</TableCell>
                            <TableCell>
                                {ad.status === 'active' 
                                    ? <div className="flex items-center text-green-600 text-xs font-medium gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> Vigente</div> 
                                    : <div className="flex items-center text-muted-foreground text-xs font-medium gap-1"><div className="h-2 w-2 rounded-full bg-slate-300" /> Inativo</div>
                                }
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </TabsContent>

        {/* --- ABA 2: CAMPANHAS (CARDS MELHORADOS) --- */}
        <TabsContent value="campanhas">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {campaigns.map((camp) => (
                    <Card key={camp.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow border-muted/60">
                        {/* Status Bar no Topo do Card */}
                        <div className={`h-1 w-full ${camp.status === 'running' ? 'bg-green-500' : camp.status === 'paused' ? 'bg-yellow-500' : 'bg-slate-300'}`} />
                        
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold leading-tight line-clamp-1" title={camp.name}>
                                        {camp.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium text-primary">
                                        {camp.advertiser}
                                    </CardDescription>
                                </div>
                                {camp.status === 'running' ? (
                                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shrink-0">No Ar</Badge> 
                                ) : camp.status === 'paused' ? (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 shrink-0">Pausado</Badge>
                                ) : (
                                    <Badge variant="outline" className="shrink-0">Finalizado</Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 pb-4 space-y-4">
                            {/* Preview Area (Aspect Video) */}
                            <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center group">
                                {camp.type === 'video' ? (
                                    <PlayCircle className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    {camp.type === 'video' ? <PlayCircle className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {camp.duration}
                                </div>
                            </div>
                            
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex flex-col p-2 bg-muted/50 rounded">
                                    <span className="text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Região</span>
                                    <span className="font-medium truncate" title={camp.region}>{camp.region}</span>
                                </div>
                                <div className="flex flex-col p-2 bg-muted/50 rounded">
                                    <span className="text-muted-foreground mb-1 flex items-center gap-1"><Target className="h-3 w-3" /> Prioridade</span>
                                    <span className={`font-medium ${camp.priority === 'High' ? 'text-red-600' : ''}`}>{camp.priority}</span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Progresso da Meta</span>
                                    <span className="font-mono font-medium">
                                        {Math.round((camp.impressions / camp.target) * 100)}%
                                    </span>
                                </div>
                                <Progress value={(camp.impressions / camp.target) * 100} className="h-2" />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>{camp.impressions.toLocaleString()} imp.</span>
                                    <span>{camp.target.toLocaleString()} total</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-0 gap-2">
                            <Button variant="outline" className="flex-1 h-8 text-xs">Editar</Button>
                            <Button 
                                variant={camp.status === 'running' ? "ghost" : "default"} 
                                className={`flex-1 h-8 text-xs ${camp.status === 'running' ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : ''}`}
                            >
                                {camp.status === 'running' ? 'Pausar' : 'Ativar'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {/* Card de "Adicionar Novo" Fantasma */}
                <Button 
                    variant="outline" 
                    className="h-full min-h-[350px] flex flex-col gap-4 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => setIsNewCampaignOpen(true)}
                >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-muted-foreground">Nova Campanha</span>
                </Button>
            </div>
        </TabsContent>

        {/* --- ABA 3: AUDITORIA (ESTILO LOG) --- */}
        <TabsContent value="auditoria">
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Resumo de Hoje</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-2xl font-bold">145,203</div>
                            <p className="text-xs text-muted-foreground">Impressões Totais</p>
                        </div>
                        <Separator />
                        <div>
                            <div className="text-2xl font-bold">2,100</div>
                            <p className="text-xs text-muted-foreground">Tablets Únicos</p>
                        </div>
                         <Separator />
                        <div>
                            <div className="text-2xl font-bold text-green-600">99.98%</div>
                            <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                Live Feed
                            </CardTitle>
                            <CardDescription>Log de entrega em tempo real.</CardDescription>
                        </div>
                        <Badge variant="outline" className="animate-pulse border-green-500 text-green-600">Ao Vivo</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="flex flex-col text-sm">
                            <div className="bg-muted/50 flex px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                                <div className="w-24">Horário</div>
                                <div className="flex-1">Evento</div>
                                <div className="w-32 text-right">Status</div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {[1,2,3,4,5,6,7,8].map((i) => (
                                     <div key={i} className="flex items-center px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <div className="w-24 font-mono text-xs text-muted-foreground">
                                            14:30:{10 + i}
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <span className="font-medium text-sm">Campanha: Verão Refrescante</span>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" /> Restaurante El Sol (Tenerife) • Tablet ID: <span className="font-mono">TB-{9930 + i}</span>
                                            </div>
                                        </div>
                                        <div className="w-32 text-right">
                                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100">Entregue</Badge>
                                        </div>
                                     </div>
                                ))}
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

      {/* --- MODAL: NOVA CAMPANHA --- */}
      <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
        <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
                <DialogTitle>Nova Campanha</DialogTitle>
                <DialogDescription>Configure a mídia, segmentação e orçamento.</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
                {/* Linha 1 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nome da Campanha</Label>
                        <Input placeholder="Ex: Lançamento Inverno 2024" />
                    </div>
                    <div className="space-y-2">
                        <Label>Anunciante</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="coca">Coca-Cola</SelectItem>
                                <SelectItem value="heineken">Heineken</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Linha 2 - Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Arraste o banner ou vídeo aqui</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG ou MP4 (Max 10MB)</p>
                </div>

                {/* Linha 3 - Regras */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label className="flex items-center gap-2">Segmentação <AlertCircle className="h-3 w-3 text-muted-foreground" /></Label>
                         <Select>
                            <SelectTrigger><SelectValue placeholder="Todas as regiões" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Global (Todas)</SelectItem>
                                <SelectItem value="sul">Tenerife - Zona Sul</SelectItem>
                                <SelectItem value="norte">Tenerife - Norte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                         <Label>Prioridade (Peso)</Label>
                         <Select defaultValue="medium">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">Alta (Prioritário)</SelectItem>
                                <SelectItem value="medium">Média (Padrão)</SelectItem>
                                <SelectItem value="low">Baixa (Preenchimento)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label>Frequência (min)</Label>
                        <Input type="number" defaultValue={5} />
                     </div>
                     <div className="space-y-2">
                        <Label>Duração (seg)</Label>
                        <Input type="number" defaultValue={15} />
                     </div>
                     <div className="space-y-2">
                        <Label>Meta Impressões</Label>
                        <Input type="number" placeholder="Ex: 50000" />
                     </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>Cancelar</Button>
                <Button onClick={() => setIsNewCampaignOpen(false)}>Criar e Ativar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}