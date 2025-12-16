'use client';

import { useState, useEffect } from 'react';
import { MonitorPlay, Plus, Trash2, Loader2, Image as ImageIcon, MapPin, Edit } from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout.js/AdminLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '@/lib/api';

const IMAGE_BASE_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function SystemAdsPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        id: null,
        title: '',
        targetState: '',
        file: null
    });

    // Spanish regions/states
    const spanishRegions = [
        'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias',
        'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña',
        'Comunidad Valenciana', 'Extremadura', 'Galicia', 'La Rioja',
        'Madrid', 'Murcia', 'Navarra', 'País Vasco'
    ];

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/ads');
            setAds(res.data.data.ads || []);
        } catch (error) {
            console.error('Erro ao carregar SystemAds:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAds(); }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.file) return alert('Selecione uma imagem.');

        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('image', formData.file);
            payload.append('title', formData.title || 'Banner Global');
            if (formData.targetState) payload.append('targetState', formData.targetState);

            if (formData.id) {
                // UPDATE
                await api.patch(`/admin/ads/${formData.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // CREATE
                await api.post('/admin/ads', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setIsModalOpen(false);
            setFormData({ id: null, title: '', targetState: '', file: null });
            setImagePreview(null);
            fetchAds();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar anúncio.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remover este banner? Ele deixará de aparecer nos tablets.')) return;
        try {
            await api.delete(`/admin/ads/${id}`);
            setAds(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            alert('Erro ao deletar.');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MonitorPlay className="text-[#df0024]" /> Banners Globais (Screensaver)
                        </h1>
                        <p className="text-gray-500">
                            Anúncios institucionais exibidos nos tablets de todos os restaurantes.
                        </p>
                    </div>
                    <Button className="bg-[#df0024] hover:bg-red-700 text-white" onClick={() => { setFormData({ id: null, title: '', targetState: '', file: null }); setImagePreview(null); setIsModalOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Banner
                    </Button>
                </div>

                {/* Lista de Ads */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-[#df0024]" size={32} />
                    </div>
                ) : ads.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum banner global cadastrado.</p>
                        <p className="text-sm text-gray-400 mt-1">Crie banners para exibir nos screensavers de todos os tablets.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map(ad => (
                            <Card key={ad.id} className="overflow-hidden group">
                                <div className="relative h-40 bg-gray-100">
                                    <img
                                        src={ad.imageUrl?.startsWith('http') ? ad.imageUrl : `${IMAGE_BASE_URL}${ad.imageUrl}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={ad.title || 'SystemAd'}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(ad.id)}
                                            className="bg-white text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} className="mr-1" /> Remover
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setFormData({
                                                    id: ad.id,
                                                    title: ad.title,
                                                    targetState: ad.targetState || '',
                                                    file: null
                                                });
                                                setImagePreview(ad.imageUrl?.startsWith('http') ? ad.imageUrl : `${IMAGE_BASE_URL}${ad.imageUrl}`);
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-white text-blue-600 hover:bg-blue-50 ml-2"
                                        >
                                            <Edit size={16} className="mr-1" /> Editar
                                        </Button>
                                    </div>
                                    {ad.isActive && (
                                        <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                                            ATIVO
                                        </span>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate">{ad.title || 'Banner Global'}</h3>
                                    {ad.targetState ? (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={12} /> {ad.targetState}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400 mt-1">Exibido em todas as regiões</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal de Criação */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{formData.id ? 'Editar Banner Global' : 'Novo Banner Global'}</DialogTitle>
                            <DialogDescription>
                                Este banner aparecerá no screensaver de todos os restaurantes (ou de uma região específica).
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-5 mt-4">
                            {/* Upload */}
                            <div className="relative h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-[#df0024] transition-colors group cursor-pointer flex items-center justify-center overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                    required
                                />
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-400 group-hover:text-[#df0024]">
                                        <ImageIcon size={32} className="mx-auto mb-2" />
                                        <span className="text-sm font-medium">Clique para enviar imagem</span>
                                        <p className="text-[10px] mt-1">Recomendado: 1920x1080px</p>
                                    </div>
                                )}
                            </div>

                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título (Interno)</label>
                                <Input
                                    placeholder="Ex: Promoção Natal 2024"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            {/* Região Alvo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Região Alvo (Opcional)</label>
                                <Select value={formData.targetState} onValueChange={val => setFormData({ ...formData, targetState: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas as regiões (Global)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas as regiões (Global)</SelectItem>
                                        {spanishRegions.map(region => (
                                            <SelectItem key={region} value={region}>{region}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-[#df0024] hover:bg-red-700 text-white" disabled={submitting}>
                                    {submitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    Publicar Banner
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AdminLayout>
    );
}
