'use client';

import { useEffect } from 'react';
import axios from 'axios';

export default function BrandingProvider({ children }) {
  useEffect(() => {
    async function loadBranding() {
      try {
        // Usando axios direto para evitar dependência do config interno se necessário
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
        const response = await axios.get(`${baseUrl}/public/branding`);
        const branding = response.data.data;

        if (branding) {
          // 1. Aplicar Cores
          if (branding.brand_primary_color) {
            document.documentElement.style.setProperty('--primary', branding.brand_primary_color);
            // Gerar variações se necessário ou apenas o hex
          }

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
