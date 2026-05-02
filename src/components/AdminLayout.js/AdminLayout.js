"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex">
      
      {/* --- CANVAS BACKGROUND --- */}
      <div className="fixed inset-0 -z-10 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob opacity-40 dark:opacity-20"></div>
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-red-400/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 opacity-40 dark:opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-gray-400/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000 opacity-40 dark:opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-5"></div>
      </div>

      {/* --- SIDEBAR --- */}
      <AppSidebar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />

      {/* --- MAIN CONTENT AREA --- */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full py-4 px-4 lg:pr-10",
        isCollapsed ? "lg:pl-28" : "lg:pl-72"
      )}>
        
        {/* Topbar Flutuante */}
        <header className="h-16 mb-6 glass rounded-2xl px-4 sm:px-6 flex items-center justify-end sm:justify-between sticky top-4 z-30 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm ml-12 lg:ml-0">
          
          <div className="hidden sm:flex items-center gap-4 w-full max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar en la Plataforma..." 
                className="w-full bg-transparent border-none outline-none pl-10 text-sm placeholder:text-muted-foreground/70 focus:ring-0 text-foreground"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-white/20 rounded-xl">
              <Bell className="size-5 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-black"></span>
            </Button>
            <div className="w-[1px] h-6 bg-white/20 hidden sm:block"></div>
            <div className="text-xs font-bold text-muted-foreground hidden sm:block">
               SUPER ADMIN v2.0
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}