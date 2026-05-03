'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function BrandingProvider({ children }) {
  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await api.get('/public/branding');
        const branding = response.data.data;

        if (branding) {
          console.log('Applying branding:', branding);
          const primary = branding.brand_primary_color || '#df0024';
          const secondary = branding.brand_secondary_color || '#1f1c1d';

          // 1. Aplicar Cores via Style Tag para máxima especificidade
          let styleTag = document.getElementById('dynamic-branding');
          if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-branding';
            document.head.appendChild(styleTag);
          }

          styleTag.innerHTML = `
            :root {
              --primary: ${primary} !important;
              --sidebar-primary: ${primary} !important;
              --ring: ${primary} !important;
              --secondary: ${secondary} !important;
              --sidebar-accent: ${secondary} !important;
            }
            
            /* Sobrescrever classes fixas do OrdenGO antigo */
            [class*="bg-[#df0024]"], .bg-primary { background-color: ${primary} !important; }
            [class*="text-[#df0024]"], .text-primary { color: ${primary} !important; }
            [class*="border-[#df0024]"], .border-primary { border-color: ${primary} !important; }
            [class*="ring-[#df0024]"], .ring-primary { --tw-ring-color: ${primary} !important; border-color: ${primary} !important; }
            [class*="from-[#df0024]"] { --tw-gradient-from: ${primary} !important; }
            [class*="to-[#df0024]"] { --tw-gradient-to: ${primary} !important; }
            [class*="via-[#df0024]"] { --tw-gradient-via: ${primary} !important; }
            
            /* Efeitos de Hover */
            .hover\\:bg-red-700:hover { background-color: ${primary} !important; opacity: 0.9; }
            .hover\\:text-red-700:hover { color: ${primary} !important; opacity: 0.9; }
          `;

          // 2. Atualizar Título e Favicon
          if (branding.brand_name) {
            document.title = branding.brand_name;
          }

          if (branding.brand_favicon_url) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = branding.brand_favicon_url;
          }

          // 3. Salvar no LocalStorage para uso rápido em outros componentes (como o logo na sidebar)
          localStorage.setItem('global_branding', JSON.stringify(branding));
          
          // Disparar evento customizado para componentes que já renderizaram (como o Sidebar)
          window.dispatchEvent(new Event('branding_updated'));
        }
      } catch (error) {
        console.error('Falha ao carregar branding:', error);
      }
    }

    loadBranding();
  }, []);

  return <>{children}</>;
}
