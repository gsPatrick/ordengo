'use client';

import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ManagerLayout from '@/components/ManagerLayout.js/ManagerLayout';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <ManagerLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in duration-700">
        <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100/50 flex flex-col items-center max-w-md text-center shadow-xl shadow-red-900/5">
          <div className="size-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-red-100 border border-red-50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-100/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <ShieldAlert size={36} className="text-[#df0024] relative z-10" />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">Acesso Bloqueado</h1>
          <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 px-4">
            Seu cargo não possui as permissões necessárias para visualizar esta página ou realizar esta ação.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1 rounded-xl h-12 font-bold text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver Atrás
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              className="flex-1 rounded-xl h-12 font-black text-white bg-[#df0024] hover:bg-red-700 shadow-lg shadow-red-50 uppercase tracking-wide"
            >
              <Home size={16} className="mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
