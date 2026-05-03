"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Megaphone, UserCircle, 
  Layers, Settings, Landmark, Globe, FileBarChart, 
  CreditCard, Wallet, Ticket, Mail, ShieldCheck, 
  Plug, Palette, Smartphone, Search, Activity, 
  Sliders, LogOut, ChevronLeft, Menu, Box,
  UtensilsCrossed, Star, ChefHat, BarChart3,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Cookies from "js-cookie";
import Image from "next/image";

// --- CONFIGURAÇÃO DE MENUS ---

const ADMIN_MENU = [
  {
    title: "Visión General",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { name: "Clientes", icon: Users, path: "/admin/tenants" },
    ]
  },
  {
    title: "Publicidad",
    items: [
      { name: "Visión General", icon: Megaphone, path: "/admin/ads" },
      { name: "Anunciantes", icon: UserCircle, path: "/admin/advertisers" },
      { name: "Campañas", icon: Layers, path: "/admin/campaigns" },
      { name: "Configuración", icon: Settings, path: "/admin/ads/config" },
    ]
  },
  {
    title: "Financiero",
    items: [
      { name: "Finanzas y contabilidade", icon: Landmark, path: "/admin/finance" },
      { name: "Regiones y Fiscal", icon: Globe, path: "/admin/regions" },
      { name: "Reportes", icon: FileBarChart, path: "/admin/reports" },
      { name: "Planes", icon: CreditCard, path: "/admin/plans" },
      { name: "Gateways", icon: Wallet, path: "/admin/gateways" },
    ]
  },
  {
    title: "Plataforma",
    items: [
      { name: "Tickets", icon: Ticket, path: "/admin/tickets" },
      { name: "SMTP EMAIL", icon: Mail, path: "/admin/platform/smtp" },
      { name: "Equipo SaaS", icon: Users, path: "/admin/platform/team" },
      { name: "Roles y Permisos", icon: ShieldCheck, path: "/admin/platform/roles" },
      { name: "Integrações", icon: Plug, path: "/admin/platform/integrations" },
    ]
  },
  {
    title: "Sistema",
    items: [
      { name: "Branding Global", icon: Palette, path: "/admin/system/branding" },
      { name: "Branding APP", icon: Smartphone, path: "/admin/system/app-branding" },
      { name: "SEO", icon: Search, path: "/admin/system/seo" },
      { name: "Logs", icon: Activity, path: "/admin/system/logs" },
      { name: "Configuración", icon: Sliders, path: "/admin/system/settings" },
    ]
  }
];

const MANAGER_MENU = [
  {
    title: "Operación",
    items: [
      { name: "Visión General", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Menu (Cardápio)", icon: UtensilsCrossed, path: "/dashboard/menu" },
      { name: "Reservas", icon: FileText, path: "/dashboard/reservations" },
    ]
  },
  {
    title: "Gestión",
    items: [
      { name: "Ofertas", icon: Megaphone, path: "/dashboard/marketing" },
      { name: "Financiero (Caixa)", icon: Landmark, path: "/dashboard/finance" },
      { name: "Tickets (Soporte)", icon: Ticket, path: "/dashboard/tickets" },
    ]
  },
  {
    title: "Configuraciones",
    items: [
      { name: "Mesas y QR Code", icon: Layers, path: "/dashboard/tables" },
      { name: "Equipe (RBAC)", icon: Users, path: "/dashboard/settings/team" },
      { name: "Personalização", icon: Palette, path: "/dashboard/appearance" },
      { name: "General", icon: Settings, path: "/dashboard/settings" },
    ]
  }
];

export function AppSidebar({ mode = "admin", isCollapsed: externalCollapsed, onCollapse }) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : localCollapsed;
  const setIsCollapsed = onCollapse || setLocalCollapsed;
  
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  const menuGroups = mode === "admin" ? ADMIN_MENU : MANAGER_MENU;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const userData = Cookies.get("ordengo_user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    Cookies.remove("ordengo_token");
    Cookies.remove("ordengo_user");
    router.push("/login");
  };

  const [branding, setBranding] = useState(null);

  useEffect(() => {
    const loadBranding = () => {
      const saved = localStorage.getItem('global_branding');
      if (saved) {
        try { setBranding(JSON.parse(saved)); } catch (e) {}
      }
    };

    loadBranding();
    window.addEventListener('branding_updated', loadBranding);
    return () => window.removeEventListener('branding_updated', loadBranding);
  }, []);

  const Logo = () => (
    <div className="flex items-center justify-center w-full px-4">
      <div className="relative w-full h-12 transition-transform hover:scale-105 duration-300">
        <Image 
          src={branding?.brand_logo_url || "/logocolorida2.png"} 
          alt="OrdenGO Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );

  const NavItem = ({ item, collapsed }) => {
    const hasExactMatch = menuGroups.some(group => group.items.some(i => i.path === pathname));
    const isActive = hasExactMatch ? pathname === item.path : pathname.startsWith(item.path);

    return (
      <Link 
        href={item.path} 
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden mb-1",
          isActive 
            ? "bg-primary text-white shadow-lg shadow-primary/25" 
            : "hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-0"
        )}
      >
        <item.icon className={cn("size-5 shrink-0 transition-colors", isActive ? "text-white" : "group-hover:text-primary")} />
        {!collapsed && (
          <span className="font-medium text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden glass fixed top-4 left-4 z-50 rounded-xl">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-white/10 glass bg-white/80 dark:bg-black/80 backdrop-blur-xl">
           <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <div className="h-full flex flex-col p-4">
            <div className="h-20 flex items-center px-2">
              <Logo />
            </div>
            <nav className="flex-1 overflow-y-auto py-6 space-y-6">
              {menuGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">{group.title}</h3>
                  {group.items.map((item) => <NavItem key={item.path} item={item} collapsed={false} />)}
                </div>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside 
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex flex-col glass rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-black/40",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("h-20 flex items-center border-b border-white/5 relative transition-all", isCollapsed ? "justify-center" : "px-6 justify-start")}>
        <Logo showText={!isCollapsed} />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -right-3 top-8 size-6 rounded-full bg-background border shadow-sm z-50 hover:bg-primary hover:text-white transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn("size-3 transition-transform duration-300", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">{group.title}</h3>}
            {group.items.map((item) => <NavItem key={item.path} item={item} collapsed={isCollapsed} />)}
          </div>
        ))}
      </nav>

      <div className="p-3 mt-auto">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all duration-300", 
          isCollapsed ? "justify-center bg-transparent" : "bg-white/40 dark:bg-white/5 border border-white/10"
        )}>
          <Avatar className={cn("border-2 border-white/50 cursor-pointer transition-all hover:scale-105", isCollapsed ? "size-10" : "size-9")}>
            <AvatarFallback className="bg-primary text-white text-xs">{user?.name?.substring(0,2).toUpperCase() || "US"}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden animate-in fade-in">
                <p className="text-xs font-bold truncate leading-none">{user?.name || "Usuario"}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-1 uppercase font-black tracking-tighter">
                   {mode === "admin" ? "Super Admin" : (user?.Restaurant?.name || "Manager")}
                </p>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="icon" className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-lg">
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
