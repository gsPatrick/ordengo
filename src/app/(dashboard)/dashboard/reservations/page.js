"use client";

import React from "react";
import { Calendar, Users, Clock, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReservationsPage() {
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Reservas</h1>
          <p className="text-muted-foreground text-sm italic">Gestión de mesas y reservas de clientes.</p>
        </div>
        <Button className="bg-[var(--primary)] text-white rounded-xl font-bold">
          <Calendar size={18} className="mr-2" /> Nueva Reserva
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Hoy" value="0" icon={Calendar} color="text-blue-500" />
        <StatCard title="Pendientes" value="0" icon={Clock} color="text-orange-500" />
        <StatCard title="Confirmadas" value="0" icon={Users} color="text-emerald-500" />
      </div>

      <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-10 text-center">
        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Calendar size={40} className="opacity-20" />
        </div>
        <h3 className="text-xl font-black">No hay reservas registradas</h3>
        <p className="text-muted-foreground max-w-xs mt-2">Las reservas de tus clientes aparecerán aquí una vez que comiencen a agendar.</p>
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
