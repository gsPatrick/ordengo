'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatAssetUrl } from '@/lib/utils';

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
            link.href = formatAssetUrl(branding.brand_favicon_url);
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
