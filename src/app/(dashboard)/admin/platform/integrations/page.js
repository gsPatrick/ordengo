'use client';

import { 
  Plug, Webhook, Code2, Globe, Zap, Database, 
  MessageSquare, CreditCard, BarChart3, ShieldCheck
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EmptyState from '@/components/ui/EmptyState';

const INTEGRATIONS = [
  {
    name: 'API Pública OrdenGO',
    description: 'Endpoints REST para integrar sistemas externos con los restaurantes.',
    icon: Code2,
    status: 'active',
    color: 'bg-primary/10 text-primary',
  },
  {
    name: 'Webhooks',
    description: 'Notificaciones en tiempo real para eventos del sistema (pedidos, pagos, etc).',
    icon: Webhook,
    status: 'coming_soon',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    name: 'Google Analytics',
    description: 'Tracking de eventos y comportamiento de usuarios en tablets.',
    icon: BarChart3,
    status: 'coming_soon',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    name: 'WhatsApp Business',
    description: 'Envío de notificaciones y recibos directamente al WhatsApp del cliente.',
    icon: MessageSquare,
    status: 'coming_soon',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    name: 'POS / TPV',
    description: 'Conexión directa con terminales de punto de venta físicos.',
    icon: CreditCard,
    status: 'coming_soon',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    name: 'ERP / Contabilidad',
    description: 'Sincronización automática con sistemas de gestión fiscal y contable.',
    icon: Database,
    status: 'coming_soon',
    color: 'bg-amber-500/10 text-amber-500',
  },
];

export default function IntegrationsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Integraciones</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">
              Conecte OrdenGO con servicios externos y APIs de terceros.
            </p>
          </div>
          <Button variant="ghost" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl h-12 px-6 font-bold gap-2">
            <ShieldCheck size={18} /> Documentación API
          </Button>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {INTEGRATIONS.map((integration) => (
            <Card 
              key={integration.name}
              className={cn(
                "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300 relative",
                integration.status === 'coming_soon' && "opacity-70"
              )}
            >
              {/* Coming Soon Overlay */}
              {integration.status === 'coming_soon' && (
                <div className="absolute top-5 right-5 z-10">
                  <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                    Próximamente
                  </Badge>
                </div>
              )}

              <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
                <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500", integration.color)}>
                  <integration.icon size={28} />
                </div>
                <CardTitle className="text-lg font-black">{integration.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{integration.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="px-8 pb-8 pt-4">
                {integration.status === 'active' ? (
                  <div className="flex items-center gap-3">
                    <div className="size-2.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-green-600 uppercase">Conectado</span>
                    <Button size="sm" variant="ghost" className="ml-auto rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-zinc-800">
                      Configurar
                    </Button>
                  </div>
                ) : (
                  <Button disabled className="w-full bg-gray-100 dark:bg-zinc-900 border-none rounded-2xl h-11 font-bold text-xs opacity-60">
                    <Zap size={14} className="mr-2" /> Activar Integración
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <EmptyState
          icon={Plug}
          title="¿Necesita una integración personalizada?"
          subtitle="Nuestro equipo técnico puede desarrollar conectores personalizados para su infraestructura. Contáctenos para una propuesta técnica."
          ctaLabel="Solicitar Integración"
          onCtaClick={() => {}}
        />

      </div>
    </AdminLayout>
  );
}
