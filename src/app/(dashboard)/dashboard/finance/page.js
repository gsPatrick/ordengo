"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, CreditCard, TrendingUp, Download, 
  Clock, ArrowRightLeft, FileText, Calendar,
  BarChart3, Wallet, Plus, Lock, Unlock, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";

export default function FinancePage() {
  const [reports, setReports] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    cashTotal: 0,
    cardTotal: 0,
    withdrawals: 0
  });

  // Modal States
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalNote, setWithdrawalNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchFinanceData();
    checkActiveSession();
  }, []);

  async function checkActiveSession() {
    try {
      const res = await api.get('/finance/cash-reports/active');
      setActiveSession(res.data.data.session);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchFinanceData() {
    try {
      const res = await api.get('/finance/cash-reports');
      const data = res.data.data.reports || [];
      setReports(data);
      
      const totals = data.reduce((acc, curr) => ({
        totalRevenue: acc.totalRevenue + Number(curr.totalSales || 0),
        cashTotal: acc.cashTotal + Number(curr.totalCash || 0),
        cardTotal: acc.cardTotal + Number(curr.totalCard || 0),
        withdrawals: acc.withdrawals + Number(curr.withdrawals || 0)
      }), { totalRevenue: 0, cashTotal: 0, cardTotal: 0, withdrawals: 0 });
      
      setSummary(totals);
    } catch (error) {
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCash = async () => {
    setActionLoading(true);
    try {
      await api.post('/finance/cash-reports/open', { openingAmount });
      toast.success("Caixa aberto com sucesso!");
      setShowOpenModal(false);
      checkActiveSession();
      fetchFinanceData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Erro ao abrir caixa");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    setActionLoading(true);
    try {
      await api.post('/finance/cash-reports/withdrawal', { 
        amount: withdrawalAmount, 
        note: withdrawalNote 
      });
      toast.success("Sangria realizada com sucesso!");
      setShowWithdrawalModal(false);
      setWithdrawalAmount("");
      setWithdrawalNote("");
      checkActiveSession();
      fetchFinanceData();
    } catch (e) {
      toast.error("Erro ao realizar sangria");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCash = async () => {
    if (!confirm("Deseja realmente fechar o caixa agora? Isso gerará o Ticket Z.")) return;
    try {
      await api.post('/finance/cash-reports/close');
      toast.success("Caixa fechado com sucesso! Ticket Z gerado.");
      checkActiveSession();
      fetchFinanceData();
    } catch (e) {
      toast.error("Erro ao fechar caixa");
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Financiero & Caja</h1>
          <p className="text-muted-foreground text-sm italic">Gestione turnos, sangrías y reportes de ventas.</p>
        </div>
        <div className="flex gap-2">
           {activeSession ? (
             <>
               <Button variant="outline" className="glass rounded-xl font-bold border-rose-500/30 text-rose-500" onClick={() => setShowWithdrawalModal(true)}>
                 <ArrowRightLeft size={18} className="mr-2" /> Sangría
               </Button>
               <Button className="bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary)]/90" onClick={handleCloseCash}>
                 <Lock size={18} className="mr-2" /> Cerrar Caja (Z)
               </Button>
             </>
           ) : (
             <Button className="bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700" onClick={() => setShowOpenModal(true)}>
               <Unlock size={18} className="mr-2" /> Abrir Caja
             </Button>
           )}
        </div>
      </div>

      {/* --- KPI SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceCard title="Vendas Brutas (Hist)" value={`R$ ${summary.totalRevenue.toFixed(2)}`} icon={TrendingUp} color="text-emerald-500" />
        <FinanceCard title="Dinheiro em Caixa" value={activeSession ? `R$ ${activeSession.totalCash || 0}` : 'R$ 0,00'} icon={Wallet} color="text-blue-500" />
        <FinanceCard title="Cartão (Sessão)" value={activeSession ? `R$ ${activeSession.totalCard || 0}` : 'R$ 0,00'} icon={CreditCard} color="text-purple-500" />
        <FinanceCard title="Total Sangrias" value={`R$ ${summary.withdrawals.toFixed(2)}`} icon={ArrowRightLeft} color="text-rose-500" />
      </div>

      {activeSession && (
        <Card className="border-none bg-emerald-500/5 ring-1 ring-emerald-500/20 rounded-[2rem]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-emerald-600/60">Turno en Curso</p>
                <h4 className="text-lg font-black">Abierto el {activeSession.openingTime ? format(new Date(activeSession.openingTime), "dd/MM 'a las' HH:mm") : '...'}</h4>
              </div>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold opacity-40 uppercase">Fundo Inicial</p>
               <p className="text-xl font-black">R$ {Number(activeSession.openingAmount).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- REPORTS TABLE --- */}
      <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
           <div>
              <CardTitle className="text-xl font-black">Historial de Turnos</CardTitle>
              <CardDescription>Detalhamento de cada sessão de caixa do restaurante.</CardDescription>
           </div>
           <div className="flex items-center gap-2">
              <Calendar className="size-4 opacity-40" />
              <span className="text-xs font-bold opacity-60 uppercase">Últimos Registros</span>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
              <TableHeader className="bg-white/5">
                 <TableRow className="border-b border-white/5 h-14">
                    <TableHead className="pl-8">Abertura</TableHead>
                    <TableHead>Fechamento</TableHead>
                    <TableHead>Dinheiro</TableHead>
                    <TableHead>Cartão</TableHead>
                    <TableHead>Sangrias</TableHead>
                    <TableHead className="text-right pr-8 font-black">Total</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {reports.map(report => (
                   <TableRow key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="pl-8 font-medium">
                         <div className="flex flex-col">
                            <span>{format(new Date(report.openingTime), 'dd/MM/yyyy')}</span>
                            <span className="text-[10px] opacity-40 uppercase font-black">{format(new Date(report.openingTime), 'HH:mm')}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         {report.closingTime ? (
                            <div className="flex flex-col">
                               <span>{format(new Date(report.closingTime), 'dd/MM/yyyy')}</span>
                               <span className="text-[10px] opacity-40 uppercase font-black">{format(new Date(report.closingTime), 'HH:mm')}</span>
                            </div>
                         ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px]">En Curso</Badge>
                         )}
                      </TableCell>
                      <TableCell className="opacity-70">R$ {report.totalCash}</TableCell>
                      <TableCell className="opacity-70">R$ {report.totalCard}</TableCell>
                      <TableCell className="text-rose-500 font-bold">R$ {report.withdrawals}</TableCell>
                      <TableCell className="text-right pr-8">
                         <span className="text-lg font-black">R$ {report.totalSales}</span>
                      </TableCell>
                   </TableRow>
                 ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>

      {/* --- MODALS --- */}
      <Dialog open={showOpenModal} onOpenChange={setShowOpenModal}>
        <DialogContent className="glass rounded-[2rem] border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Abrir Sesión de Caja</DialogTitle>
            <DialogDescription>Informe o valor do fundo de caixa (troco) para iniciar o turno.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-40 ml-1">Fundo Inicial (R$)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-14 rounded-2xl glass border-none font-black text-xl"
                value={openingAmount}
                onChange={e => setOpeningAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full h-14 rounded-2xl bg-emerald-600 font-black text-white hover:bg-emerald-700" onClick={handleOpenCash} disabled={actionLoading}>
              ABRIR TURNO AHORA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawalModal} onOpenChange={setShowWithdrawalModal}>
        <DialogContent className="glass rounded-[2rem] border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Registrar Sangría</DialogTitle>
            <DialogDescription>Retirada de dinheiro para pagamentos ou segurança.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-40 ml-1">Valor da Retirada (R$)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-14 rounded-2xl glass border-none font-black text-xl text-rose-500"
                value={withdrawalAmount}
                onChange={e => setWithdrawalAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-40 ml-1">Motivo / Observação</label>
              <Input 
                placeholder="Ex: Pagamento fornecedor" 
                className="h-12 rounded-xl glass border-none"
                value={withdrawalNote}
                onChange={e => setWithdrawalNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full h-14 rounded-2xl bg-rose-500 font-black text-white hover:bg-rose-600" onClick={handleWithdrawal} disabled={actionLoading}>
              CONFIRMAR RETIRADA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function FinanceCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="glass border-none shadow-lg rounded-3xl overflow-hidden transition-all hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
           <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>
              <Icon size={20} />
           </div>
           <div className="p-1.5 glass rounded-lg opacity-40">
              <BarChart3 size={12} />
           </div>
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black mt-1">{value}</h3>
      </CardContent>
    </Card>
  );
}
