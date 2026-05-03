'use client';

import { useState, useEffect } from 'react';
import { 
  Printer, Image as ImageIcon, Store, 
  AlignLeft, Save, Trash2, Check,
  Info, Type, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function PrinterSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    businessName: 'Mi Restaurante Gourmet',
    taxId: '12.345.678/0001-99',
    address: 'Calle Falsa 123, Madrid',
    footerMessage: '¡Gracias por su visita! Vuelva pronto.',
    showLogo: true,
    logoUrl: null
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulación de guardado
    setTimeout(() => {
      setLoading(false);
      alert("Configuración de ticket guardada con éxito.");
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Ticket y Facturación</h1>
          <p className="text-gray-500">Configura el diseño de tus recibos impresos y datos fiscales</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-[#df0024] hover:bg-red-700 text-white rounded-xl gap-2 shadow-lg shadow-red-200 h-12 px-8"
        >
          {loading ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Editor de Datos */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="border-b border-gray-50">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Store size={20} className="text-[#df0024]" />
                Datos de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nombre Comercial</label>
                <Input 
                  value={config.businessName}
                  onChange={e => setConfig({...config, businessName: e.target.value})}
                  className="rounded-xl border-gray-200 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">CNPJ / NIF / TAX ID</label>
                <Input 
                  value={config.taxId}
                  onChange={e => setConfig({...config, taxId: e.target.value})}
                  className="rounded-xl border-gray-200 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Dirección Fiscal</label>
                <Input 
                  value={config.address}
                  onChange={e => setConfig({...config, address: e.target.value})}
                  className="rounded-xl border-gray-200 h-11"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="border-b border-gray-50">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <AlignLeft size={20} className="text-[#df0024]" />
                Pie del Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Mensaje Final</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-2xl border border-gray-200 p-4 text-sm outline-none focus:ring-2 focus:ring-red-50"
                  value={config.footerMessage}
                  onChange={e => setConfig({...config, footerMessage: e.target.value})}
                  placeholder="Ej: Gracias por su compra..."
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                  Aparecerá después de los totales del pedido.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon size={20} />
                <span className="font-bold">Logo de Impresión</span>
              </div>
              <Badge variant="outline" className="text-white border-white/20 text-[10px]">RECOMENDADO: B&W</Badge>
            </div>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-red-200 transition-colors cursor-pointer group">
                <div className="size-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Printer className="text-gray-300" size={32} />
                </div>
                <p className="text-sm font-bold text-gray-700">Sube el logo térmico</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Formatos: PNG, JPG (Solo Blanco y Negro para mejor calidad)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview del Ticket */}
        <div className="sticky top-10">
          <div className="flex flex-col items-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Vista Previa Real-Time</p>
            
            <div className="w-[320px] bg-white shadow-2xl rounded-sm p-8 font-mono text-[11px] text-gray-800 leading-tight relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-20"></div>
              
              <div className="text-center mb-6">
                <div className="size-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <ImageIcon size={20} className="text-gray-300" />
                </div>
                <h4 className="font-black text-sm uppercase">{config.businessName}</h4>
                <p>{config.taxId}</p>
                <p>{config.address}</p>
              </div>

              <div className="border-y border-dashed border-gray-200 py-3 mb-4 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Mesa: 04</span>
                  <span>Pedido: #A4B2</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha: 01/05/2026</span>
                  <span>Hora: 14:30</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>1x Pizza Margherita (Grande)</span>
                  <span>14.50</span>
                </div>
                <div className="flex justify-between">
                  <span>2x Coca Cola Zero</span>
                  <span>5.00</span>
                </div>
                <div className="flex justify-between italic text-gray-400 text-[9px]">
                  <span>- Sin hielo y limón</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>SUBTOTAL</span>
                  <span>19.50</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-1 mt-1">
                  <span>TOTAL</span>
                  <span>19.50</span>
                </div>
              </div>

              <div className="mt-8 text-center pt-4 border-t border-dotted border-gray-100">
                <p className="whitespace-pre-line">{config.footerMessage}</p>
                <div className="mt-4 flex flex-col items-center gap-1">
                  <p className="text-[9px] text-gray-400 font-sans font-bold">POWERED BY</p>
                  <span className="font-sans font-black text-[12px] tracking-tighter">OrdenGO</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-4 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-10"></div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 max-w-[320px]">
              <div className="flex gap-3">
                <Info className="text-blue-500 shrink-0" size={18} />
                <p className="text-xs text-blue-700 leading-snug">
                  <b>Nota:</b> El diseño del ticket térmico es de 80mm de ancho. Asegúrate de que el logo subido sea de alto contraste para evitar manchas.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
