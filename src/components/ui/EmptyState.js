'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * EmptyState — Componente Premium reutilizável para estados vazios.
 * Usado em tabelas sem dados, módulos "Em Breve" e placeholders visuais.
 *
 * @param {LucideIcon} icon - Ícone temático do lucide-react
 * @param {string} title - Título principal (ex: "Nenhum dado encontrado")
 * @param {string} subtitle - Texto explicativo secundário
 * @param {string} ctaLabel - Texto do botão CTA (opcional)
 * @param {function} onCtaClick - Handler do botão CTA (opcional)
 * @param {string} badge - Badge superior (ex: "EM BREVE") (opcional)
 * @param {string} className - Classes extras (opcional)
 */
export default function EmptyState({ 
  icon: Icon, 
  title, 
  subtitle, 
  ctaLabel, 
  onCtaClick, 
  badge,
  className 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-8 text-center rounded-[2.5rem] glass border-none shadow-xl relative overflow-hidden group",
      className
    )}>
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-20%] right-[-15%] w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-blob opacity-60" />
        <div className="absolute bottom-[-20%] left-[-10%] w-56 h-56 bg-red-400/10 rounded-full blur-3xl animate-blob animation-delay-2000 opacity-40" />
      </div>

      {/* Optional Badge */}
      {badge && (
        <div className="absolute top-6 right-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-primary/20 backdrop-blur-sm">
            {badge}
          </span>
        </div>
      )}

      {/* Icon Container */}
      <div className="relative mb-8 animate-in fade-in zoom-in-50 duration-700">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-150 animate-pulse" />
        <div className="relative size-24 rounded-[1.5rem] bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
          <Icon className="size-10 text-primary/60" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <h3 className="text-xl font-black tracking-tight text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* CTA Button */}
      {ctaLabel && (
        <div className="relative z-10 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Button 
            onClick={onCtaClick} 
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-2xl px-8 h-12 font-bold gap-2 group/btn"
          >
            <span>{ctaLabel}</span>
            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </Button>
        </div>
      )}

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
    </div>
  );
}
