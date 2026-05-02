'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Tv, 
  TrendingUp, 
  MousePointer2, 
  Eye,
  ArrowRight,
  PlusCircle,
  LayoutGrid
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdsOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalAdvertisers: 0,
    totalImpressions: 0,
    totalClicks: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/admin/analytics/ads');
        setStats(res.data.data.stats || stats);
      } catch (e) { console.error(e); }
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Publicidad (Ad Network)</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Monitore e controle a rede de anúncios global.</p>
          </div>
          <div className="flex gap-3">
             <Button onClick={() => router.push('/admin/campaigns')} variant="outline" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl font-bold gap-2">
                <LayoutGrid size={18} /> Ver Campañas
             </Button>
             <Button onClick={() => router.push('/admin/campaigns')} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 rounded-xl px-6 font-bold">
                <PlusCircle size={18} /> Nueva Campaña
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Campañas Activas" value={stats.totalCampaigns} icon={<Tv className="text-[#df0024]" />} />
           <StatCard title="Anunciantes" value={stats.totalAdvertisers} icon={<Users className="text-blue-500" />} />
           <StatCard title="Impresiones (24h)" value={stats.totalImpressions.toLocaleString()} icon={<Eye className="text-purple-500" />} />
           <StatCard title="Clicks (CTR)" value={stats.totalClicks} icon={<MousePointer2 className="text-green-500" />} />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <QuickLinkCard 
              title="Anunciantes" 
              desc="Gerencie marcas, contratos e faturamento." 
              href="/admin/advertisers" 
              color="from-blue-600 to-blue-400"
           />
           <QuickLinkCard 
              title="Campañas" 
              desc="Crie anúncios, defina filtros e prioridades." 
              href="/admin/campaigns" 
              color="from-red-600 to-red-400"
           />
           <QuickLinkCard 
              title="Configuración" 
              desc="Batch sizes, idle times e regras globais." 
              href="/admin/ads/config" 
              color="from-gray-800 to-gray-600"
           />
        </div>

      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="size-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-tighter opacity-40 mb-1">{title}</p>
          <h3 className="text-2xl font-black text-foreground">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({ title, desc, href, color }) {
  const router = useRouter();
  return (
     <div 
      onClick={() => router.push(href)}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] p-8 cursor-pointer group hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all relative overflow-hidden"
    >
      <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity", color)}></div>
      <div className="relative z-10 space-y-4">
         <h4 className="text-2xl font-black tracking-tight">{title}</h4>
         <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
         <div className="flex items-center gap-2 text-[#df0024] font-black text-xs uppercase tracking-widest pt-2">
            Gestionar <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
         </div>
      </div>
    </div>
  );
}