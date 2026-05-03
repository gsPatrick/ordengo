"use client";

import React from "react";
import { Users, UserPlus, Shield, Key, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TeamPage() {
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Equipo y Permisos</h1>
          <p className="text-muted-foreground text-sm italic">Gestione los accesos de sus empleados y administradores.</p>
        </div>
        <Button className="bg-[var(--primary)] text-white rounded-xl font-bold">
          <UserPlus size={18} className="mr-2" /> Agregar Miembro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Miembros" value="1" icon={Users} color="text-blue-500" />
        <StatCard title="Administradores" value="1" icon={Shield} color="text-emerald-500" />
        <StatCard title="Cajeros / Staff" value="0" icon={Key} color="text-purple-500" />
      </div>

      <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
           <CardTitle className="text-xl font-black">Miembros Activos</CardTitle>
           <CardDescription>Lista de personas con acceso a este panel.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
           <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
              <Input placeholder="Buscar por nombre o email..." className="pl-10 glass rounded-xl border-none" />
           </div>
           
           <div className="space-y-3">
              <div className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">P</div>
                    <div>
                       <p className="text-sm font-bold">Patrick (Admin)</p>
                       <p className="text-[10px] opacity-40">patrick@admin.com</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold">Editar</Button>
                 </div>
              </div>
           </div>
        </CardContent>
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
