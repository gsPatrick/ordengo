'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, CreditCard, Save, Loader2, Eye, EyeOff, 
  CheckCircle2, Settings, Plus, Trash2, ExternalLink, Shield
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import EmptyState from '@/components/ui/EmptyState';

const GATEWAYS = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Pagos con tarjeta de crédito y débito internacionales.',
    color: 'from-purple-600 to-indigo-600',
    icon: '💳',
    fields: [
      { key: 'stripe_public_key', label: 'Public Key (pk_...)', type: 'text' },
      { key: 'stripe_secret_key', label: 'Secret Key (sk_...)', type: 'password' },
      { key: 'stripe_webhook_secret', label: 'Webhook Secret (whsec_...)', type: 'password' },
    ]
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'PIX, boleto y tarjetas para América Latina.',
    color: 'from-sky-500 to-cyan-500',
    icon: '🏦',
    fields: [
      { key: 'mp_access_token', label: 'Access Token', type: 'password' },
      { key: 'mp_public_key', label: 'Public Key', type: 'text' },
    ]
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pagos online seguros con PayPal Checkout.',
    color: 'from-blue-600 to-blue-800',
    icon: '🅿️',
    fields: [
      { key: 'paypal_client_id', label: 'Client ID', type: 'text' },
      { key: 'paypal_secret', label: 'Secret', type: 'password' },
    ]
  }
];

export default function GatewaysPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [activeGateways, setActiveGateways] = useState({ stripe: true, mercadopago: false, paypal: false });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get('/admin/settings?group=gateways');
        const obj = {};
        res.data.data.settings?.forEach(s => { obj[s.key] = s.value; });
        setConfigs(obj);
        
        // Determine active gateways from config
        setActiveGateways({
          stripe: !!obj.stripe_public_key,
          mercadopago: !!obj.mp_access_token,
          paypal: !!obj.paypal_client_id
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings/batch', {
        settings: Object.entries(configs).map(([key, value]) => ({ key, value, group: 'gateways' }))
      });
      alert('Gateways guardados con éxito!');
    } catch (e) { alert('Error al guardar.'); }
    finally { setSaving(false); }
  };

  const toggleSecret = (key) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) return <AdminLayout><div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Gateways de Pago</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">Configure las claves API de los procesadores de pago del SaaS.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20 rounded-xl px-8 h-12 font-bold">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Todo
          </Button>
        </div>

        {/* Security Note */}
        <div className="glass border-none rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="size-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm font-bold">Seguridad de Claves API</p>
            <p className="text-xs text-muted-foreground">Las claves secretas se almacenan encriptadas. Nunca se exponen en el frontend del cliente.</p>
          </div>
        </div>

        {/* Gateway Cards */}
        <div className="grid grid-cols-1 gap-8">
          {GATEWAYS.map(gw => (
            <Card key={gw.id} className={cn(
              "glass border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-300",
              !activeGateways[gw.id] && "opacity-60"
            )}>
              <CardHeader className="bg-white/10 px-8 pt-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={cn("size-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg", gw.color)}>
                      {gw.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">{gw.name}</CardTitle>
                      <CardDescription>{gw.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("border-none font-bold", activeGateways[gw.id] ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500")}>
                      {activeGateways[gw.id] ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                    <Switch 
                      checked={activeGateways[gw.id]} 
                      onCheckedChange={v => setActiveGateways(prev => ({ ...prev, [gw.id]: v }))}
                    />
                  </div>
                </div>
              </CardHeader>
              
              {activeGateways[gw.id] && (
                <CardContent className="p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gw.fields.map(field => (
                      <div key={field.key} className="space-y-2">
                        <Label className="text-xs font-bold uppercase ml-1 opacity-60">{field.label}</Label>
                        <div className="relative">
                          <Input 
                            type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                            className="glass h-12 rounded-2xl font-mono text-xs pr-12"
                            placeholder={`Ingrese su ${field.label}...`}
                            value={configs[field.key] || ''}
                            onChange={e => setConfigs(prev => ({ ...prev, [field.key]: e.target.value }))}
                          />
                          {field.type === 'password' && (
                            <button 
                              type="button" 
                              onClick={() => toggleSecret(field.key)} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                            >
                              {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}
