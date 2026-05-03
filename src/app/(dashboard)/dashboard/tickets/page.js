"use client";

import React from "react";
import { Ticket, MessageSquare, Clock, ShieldCheck, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TicketsPage() {
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Soporte y Tickets</h1>
          <p className="text-muted-foreground text-sm italic">¿Necesitas ayuda? Abre un ticket para nuestro equipo técnico.</p>
        </div>
        <Button className="bg-[var(--primary)] text-white rounded-xl font-bold">
          <Plus size={18} className="mr-2" /> Nuevo Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Abiertos" value="0" icon={Ticket} color="text-emerald-500" />
        <StatCard title="En Revisión" value="0" icon={Clock} color="text-blue-500" />
        <StatCard title="Cerrados" value="0" icon={ShieldCheck} color="text-gray-500" />
      </div>

      <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-10 text-center">
        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <MessageSquare size={40} className="opacity-20" />
        </div>
        <h3 className="text-xl font-black">Todo bajo control</h3>
        <p className="text-muted-foreground max-w-xs mt-2">No tienes tickets de soporte activos en este momento.</p>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="glass border-none shadow-lg rounded-3xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black mt-1">{value}</h3>
    </Card>
  );
}
