'use client';

import { useState, useEffect } from 'react';
import {
  MapPin, Plus, Trash2, Globe, Search,
  Landmark, Info, Loader2, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Configuração Estática de Países (Suportados pelo Backend)
const COUNTRIES = [
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', defaultTax: 'IVA', defaultRate: 21 },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', defaultTax: 'IVA', defaultRate: 23 },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', defaultTax: 'MwSt', defaultRate: 19 },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', defaultTax: 'IVA', defaultRate: 22 },
  { code: 'FR', name: 'França', flag: '🇫🇷', defaultTax: 'TVA', defaultRate: 20 },
  { code: 'UK', name: 'Reino Unido', flag: '🇬🇧', defaultTax: 'VAT', defaultRate: 20 },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', defaultTax: 'ISS', defaultRate: 5 },
];

export default function RegionsPage() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRegion, setNewRegion] = useState({
    id: null, name: '', country: 'ES', taxName: 'IVA', taxRule: '21', description: ''
  });

  // Estados de Cidades (API Externa)
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // --- CARREGAR DADOS ---
  const fetchRegions = async () => {
    setLoading(true);
    try {
      // CORREÇÃO: Prefixo /admin adicionado
      const res = await api.get('/admin/regions');
      setRegions(res.data.data.regions);
    } catch (error) {
      console.error("Erro ao carregar regiões:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegions(); }, []);

  // --- CARREGAR CIDADES AO MUDAR PAÍS ---
  const fetchCitiesForCountry = async (countryCode) => {
    setLoadingCities(true);
    setCities([]); // Limpa anterior
    try {
      // CORREÇÃO: Prefixo /admin adicionado
      const res = await api.get(`/admin/regions/cities/${countryCode}`);
      setCities(res.data.data.cities || []);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Ao abrir modal ou mudar país, carrega cidades
  useEffect(() => {
    if (isModalOpen) {
      fetchCitiesForCountry(newRegion.country);
    }
  }, [newRegion.country, isModalOpen]);

  // --- HANDLERS ---

  const handleCountryChange = (val) => {
    const countryData = COUNTRIES.find(c => c.code === val);
    setNewRegion({
      ...newRegion,
      country: val,
      taxName: countryData?.defaultTax || 'Tax',
      taxRule: countryData?.defaultRate || 0
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (newRegion.id) {
        // UPDATE
        // CORREÇÃO: Prefixo /admin adicionado
        await api.patch(`/admin/regions/${newRegion.id}`, newRegion);
      } else {
        // CREATE
        // CORREÇÃO: Prefixo /admin adicionado
        await api.post('/admin/regions', newRegion);
      }
      setIsModalOpen(false);
      setNewRegion({ id: null, name: '', country: 'ES', taxName: 'IVA', taxRule: '21', description: '' });
      fetchRegions();
    } catch (error) {
      alert('Erro ao salvar região. Verifique os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (reg) => {
    setNewRegion({
      id: reg.id,
      name: reg.name,
      country: reg.country,
      taxName: reg.taxName,
      taxRule: reg.taxRule,
      description: reg.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza? Restaurantes nesta região perderão a configuração fiscal.")) return;
    try {
      // CORREÇÃO: Prefixo /admin adicionado
      await api.delete(`/admin/regions/${id}`);
      setRegions(prev => prev.filter(r => r.id !== id));
    } catch (e) { alert("Erro ao deletar."); }
  };

  // --- HELPER COMPONENTS ---

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-center">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
        <Globe className="text-gray-400" size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Nenhuma Região Definida</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-2 mb-6">
        Configure zonas geográficas para aplicar regras fiscais (IVA/IGIC) e segmentar campanhas de publicidade.
      </p>
      <Button onClick={() => setIsModalOpen(true)} className="bg-[#df0024] hover:bg-red-700">
        Criar Primeira Região
      </Button>
    </div>
  );

  const filteredCities = cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 50);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Regiões & Fiscal</h1>
            <p className="text-gray-500">Gerencie zonas de atuação, impostos locais e fusos horários.</p>
          </div>
          <Button onClick={() => { setNewRegion({ id: null, name: '', country: 'ES', taxName: 'IVA', taxRule: '21', description: '' }); setIsModalOpen(true); }} className="bg-[#df0024] hover:bg-red-700 text-white gap-2 shadow-md shadow-red-100">
            <Plus size={18} /> Nova Zona Fiscal
          </Button>
        </div>

        {/* Toolbar de Filtro */}
        {regions.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm max-w-md">
            <Search className="text-gray-400 ml-2" size={18} />
            <Input
              placeholder="Buscar região ou país..."
              className="border-none shadow-none focus-visible:ring-0"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Grid de Regiões */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#df0024]" size={32} /></div>
        ) : regions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions
              .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(reg => {
                const countryInfo = COUNTRIES.find(c => c.code === reg.country) || { flag: '🌍', name: reg.country };
                return (
                  <Card key={reg.id} className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-[#df0024]">
                    <CardContent className="p-6">

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-full border border-gray-100">
                            {countryInfo.flag}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">{reg.name}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{countryInfo.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          {reg.country}
                        </Badge>
                      </div>

                      {/* Info Fiscal */}
                      <div className="bg-blue-50/50 rounded-lg p-3 mb-4 border border-blue-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-blue-600 font-bold uppercase flex items-center gap-1">
                            <Landmark size={12} /> Regra Fiscal
                          </span>
                          <span className="text-xs text-blue-800 font-mono bg-blue-100 px-1.5 rounded">AUTO</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">{reg.taxRule}%</span>
                          <span className="text-sm font-medium text-gray-500">{reg.taxName}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Aplicado automaticamente em faturas desta região.</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">ID: ...{reg.id.slice(-6)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(reg.id)}
                        >
                          <Trash2 size={16} className="mr-1" /> Remover
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEdit(reg)}
                        >
                          <Edit size={16} className="mr-1" /> Editar
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {/* --- MODAL DE CRIAÇÃO --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="text-[#df0024]" /> {newRegion.id ? 'Editar Zona Fiscal' : 'Nova Zona Fiscal'}
              </DialogTitle>
              <DialogDescription>
                Defina uma região geográfica para aplicar impostos e segmentar publicidade.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">

              {/* Coluna Esquerda: Formulário */}
              <form id="region-form" onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">País</label>
                  <Select value={newRegion.country} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="mr-2">{c.flag}</span> {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Nome da Região</label>
                  <Input
                    placeholder="Ex: Ilhas Canárias, Bavária..."
                    value={newRegion.name}
                    onChange={e => setNewRegion({ ...newRegion, name: e.target.value })}
                    required
                  />

                  {/* Sugestão de Cidades (API) */}
                  <div className="bg-gray-50 border rounded-md p-2">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 flex items-center gap-1">
                      <Globe size={10} /> SUGESTÕES DE {newRegion.country} ({cities.length})
                    </p>
                    <Input
                      placeholder="Filtrar cidade..."
                      className="h-7 text-xs mb-2 bg-white"
                      value={citySearch}
                      onChange={e => setCitySearch(e.target.value)}
                    />
                    <ScrollArea className="h-24 w-full rounded-md border bg-white p-1">
                      {loadingCities ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin h-4 w-4 text-gray-400" /></div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {filteredCities.map((city, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="cursor-pointer hover:bg-gray-200 font-normal text-[10px]"
                              onClick={() => setNewRegion({ ...newRegion, name: city })}
                            >
                              {city}
                            </Badge>
                          ))}
                          {filteredCities.length === 0 && <span className="text-xs text-gray-400 px-2">Nenhuma cidade encontrada.</span>}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Nome Imposto</label>
                    <Input value={newRegion.taxName} onChange={e => setNewRegion({ ...newRegion, taxName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Taxa (%)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={newRegion.taxRule}
                        onChange={e => setNewRegion({ ...newRegion, taxRule: e.target.value })}
                      />
                      <span className="absolute right-3 top-2 text-sm text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </form>

              {/* Coluna Direita: Simulador */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-center">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" /> Simulador de Fatura
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Assinatura SaaS</span>
                    <span>€ 100,00</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-medium">
                    <span>+ {newRegion.taxName || 'Imposto'} ({newRegion.taxRule || 0}%)</span>
                    <span>€ {Number((100 * (newRegion.taxRule || 0)) / 100).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between text-lg font-bold text-[#df0024]">
                    <span>Total Cliente</span>
                    <span>€ {Number(100 + (100 * (newRegion.taxRule || 0)) / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100">
                  O sistema usará a alíquota de <strong>{newRegion.taxRule}%</strong> para todas as faturas geradas para clientes desta região.
                </div>
              </div>

            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" form="region-form" className="bg-[#df0024] hover:bg-red-700" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" size={18} />}
                Confirmar Região
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}