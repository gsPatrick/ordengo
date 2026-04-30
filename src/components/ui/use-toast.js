'use client';

import { createContext, useContext, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Contexto opcional – permite acessar o toast em qualquer lugar
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* O componente Toaster já traz a UI padrão */}
            <Toaster
                position="top-right"
                toastOptions={{
                    // estilos globais (pode ajustar)
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />
        </ToastContext.Provider>
    );
}

// Hook que será importado nos componentes
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // fallback caso o provider ainda não esteja no tree
        return toast;
    }
    return ctx;
}