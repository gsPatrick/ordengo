import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatAssetUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // URL base fixa conforme solicitado pelo usuário
  const baseUrl = 'https://geral-ordengoapi.r954jc.easypanel.host';
  
  // Garantir que o path comece com /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}
