'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '../../../../../components/AdminLayout.js/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    Loader2, FileText, StickyNote, ArrowLeft, Upload, Trash2, Plus, Download,
    Building2, MapPin, CreditCard, User, Calendar, Edit2, CheckCircle, DollarSign,
    MonitorPlay
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TenantDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    // Documents State
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Notes State
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTenant();
            fetchDocuments();
            fetchNotes();
        }
    }, [id]);

    const fetchTenant = async () => {
        try {
            const res = await api.get(`/admin/tenants/${id}`);
            setTenant(res.data.data.restaurant);
        } catch (error) {
            console.error("Error fetching tenant:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const res = await api.get(`/admin/tenants/${id}/documents`);
            setDocuments(res.data.data.documents);
        } catch (error) { console.error("Error fetching docs:", error); }
    };

    const fetchNotes = async () => {
        try {
            const res = await api.get(`/admin/tenants/${id}/notes`);
            setNotes(res.data.data.notes);
        } catch (error) { console.error("Error fetching notes:", error); }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'contract'); // Default type
        try {
            await api.post(`/admin/tenants/${id}/documents`, formData);
            fetchDocuments();
        } catch (error) { alert("Erro ao enviar arquivo."); }
        finally { setUploading(false); }
    };

    const handleDeleteDoc = async (docId) => {
        if (!confirm("Deletar documento?")) return;
        try {
            await api.delete(`/admin/tenants/${id}/documents/${docId}`);
            fetchDocuments();
        } catch (e) { alert("Erro ao deletar."); }
    };

    const handleEditClick = (doc) => {
        setEditingDoc(doc);
        setEditForm({
            name: doc.name,
            type: doc.type,
            amount: doc.amount || '',
            dueDate: doc.dueDate || '',
            description: doc.description || '',
            status: doc.status || 'pending'
        });
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/admin/tenants/${id}/documents/${editingDoc.id}`, editForm);
            setEditingDoc(null);
            fetchDocuments();
        } catch (e) { alert("Erro ao salvar."); }
    };

    const handlePay = async (doc) => {
        if (!confirm("Marcar como pago?")) return;
        try {
            await api.patch(`/admin/tenants/${id}/documents/${doc.id}/pay`);
            fetchDocuments();
        } catch (e) { alert("Erro ao pagar."); }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setAddingNote(true);
        try {
            await api.post(`/admin/tenants/${id}/notes`, { content: newNote });
            setNewNote('');
            fetchNotes();
        } catch (e) { alert("Erro ao adicionar nota."); }
        finally { setAddingNote(false); }
    };

    const handleDeleteNote = async (noteId) => {
        if (!confirm("Deletar nota?")) return;
        try {
            await api.delete(`/admin/tenants/${id}/notes/${noteId}`);
            fetchNotes();
        } catch (e) { alert("Erro ao deletar nota."); }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Pago</Badge>;
            case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>;
            default: return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendente</Badge>;
        }
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-[#df0024]" size={48} />
            </div>
        </AdminLayout>
    );

    if (!tenant) return (
        <AdminLayout>
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">Restaurante no encontrado</h2>
                <Button onClick={() => router.push('/admin/tenants')} className="mt-4">Volver</Button>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/tenants')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {tenant.Region?.name || 'Sem Região'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><CreditCard size={14} /> {tenant.Plan?.name || 'Sem Plano'}</span>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <Badge className={tenant.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {tenant.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="overview">Visión General</TabsTrigger>
                        <TabsTrigger value="documents">Documentos</TabsTrigger>
                        <TabsTrigger value="notes">Notas</TabsTrigger>
                        <TabsTrigger value="settings">Configuración</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 size={18} /> Datos de la Empresa</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Razón Social</span>
                                        <span className="font-medium">{tenant.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">NIF/Tax ID</span>
                                        <span className="font-medium">{tenant.taxId || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Dirección</span>
                                        <span className="font-medium text-right max-w-[200px]">{tenant.billingAddress || '-'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-gray-500">Fecha de Inicio</span>
                                        <span className="font-medium">{tenant.contractStartDate ? format(new Date(tenant.contractStartDate), 'dd/MM/yyyy') : '-'}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User size={18} /> Contacto Principal</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Nombre</span>
                                        <span className="font-medium">{tenant.contactPerson || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Email Gerente</span>
                                        <span className="font-medium">{tenant.Users?.find(u => u.role === 'manager')?.email || '-'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* DOCUMENTS */}
                    <TabsContent value="documents" className="mt-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Documentos y Archivos</CardTitle>
                                    <CardDescription>Contratos, facturas y otros archivos.</CardDescription>
                                </div>
                                <div className="relative">
                                    <input type="file" id="doc-upload" className="hidden" onChange={handleUpload} disabled={uploading} />
                                    <Button asChild disabled={uploading}>
                                        <label htmlFor="doc-upload" className="cursor-pointer flex items-center gap-2">
                                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                            Subir
                                        </label>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {documents.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">Ningún documento encontrado.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {documents.map(doc => (
                                            <div key={doc.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                    <div className="bg-blue-100 p-2 rounded text-blue-600 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">{doc.description || doc.type}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {doc.amount && (
                                                                <span className="text-xs font-bold text-gray-700">
                                                                    {new Intl.NumberFormat(tenant.currency === 'BRL' ? 'pt-BR' : 'es-ES', { style: 'currency', currency: tenant.currency || 'EUR' }).format(doc.amount)}
                                                                </span>
                                                            )}
                                                            {doc.dueDate && (
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Calendar size={10} />
                                                                    {format(new Date(doc.dueDate), 'dd/MM/yyyy')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    {getStatusBadge(doc.status)}

                                                    <div className="flex items-center border-l pl-3 gap-1">
                                                        {doc.status === 'pending' && (
                                                            <Button variant="ghost" size="icon" onClick={() => handlePay(doc)} title="Marcar como Pago">
                                                                <DollarSign size={16} className="text-green-600" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(doc)} title="Editar">
                                                            <Edit2 size={16} className="text-gray-500" />
                                                        </Button>
                                                        <a href={api.defaults.baseURL + doc.url} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                                                            <Download size={16} />
                                                        </a>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(doc.id)} title="Excluir">
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NOTES */}
                    <TabsContent value="notes" className="mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* List */}
                            <div className="lg:col-span-2 space-y-4">
                                {notes.length === 0 ? (
                                    <Card className="border-dashed">
                                        <CardContent className="py-10 text-center text-gray-400">
                                            Nenhuma anotação registrada.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    notes.map(note => (
                                        <Card key={note.id} className="group hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {note.createdBy || 'Sistema'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">{format(new Date(note.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                                                    </div>
                                                    <button onClick={() => handleDeleteNote(note.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{note.content}</p>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {/* Add Note */}
                            <div>
                                <Card className="sticky top-6">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><StickyNote size={16} /> Nova Anotação</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Textarea
                                            placeholder="Escreva sua observação aqui..."
                                            className="min-h-[150px] resize-none"
                                            value={newNote}
                                            onChange={e => setNewNote(e.target.value)}
                                        />
                                        <Button className="w-full bg-[#df0024] hover:bg-red-700" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                                            {addingNote ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus className="mr-2" size={16} />}
                                            Adicionar Nota
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SETTINGS */}
                    <TabsContent value="settings" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MonitorPlay size={20} /> Configuración de Screensaver</CardTitle>
                                <CardDescription>Defina la proporción de publicidad global vs local y tiempo de inactividad.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>Admin Batch Size</Label>
                                        <Input
                                            type="number"
                                            value={tenant.config?.screensaverAdminBatchSize || 3}
                                            onChange={e => setTenant({ ...tenant, config: { ...tenant.config, screensaverAdminBatchSize: parseInt(e.target.value) } })}
                                        />
                                        <p className="text-xs text-gray-500">Cuántos banners globales aparecen consecutivamente.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Client Batch Size</Label>
                                        <Input
                                            type="number"
                                            value={tenant.config?.screensaverClientBatchSize || 1}
                                            onChange={e => setTenant({ ...tenant, config: { ...tenant.config, screensaverClientBatchSize: parseInt(e.target.value) } })}
                                        />
                                        <p className="text-xs text-gray-500">Cuántos banners del cliente aparecen después de los globales.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tiempo Inactividad (Segundos)</Label>
                                        <Input
                                            type="number"
                                            value={tenant.config?.screensaverIdleTime || 120}
                                            onChange={e => setTenant({ ...tenant, config: { ...tenant.config, screensaverIdleTime: parseInt(e.target.value) } })}
                                        />
                                        <p className="text-xs text-gray-500">Tiempo sin interacción para iniciar el screensaver.</p>
                                    </div>
                                </div>
                                <Button
                                    className="bg-[#df0024] hover:bg-red-700"
                                    onClick={async () => {
                                        try {
                                            await api.put(`/admin/tenants/${id}`, {
                                                config: {
                                                    screensaverAdminBatchSize: tenant.config?.screensaverAdminBatchSize,
                                                    screensaverClientBatchSize: tenant.config?.screensaverClientBatchSize,
                                                    screensaverIdleTime: tenant.config?.screensaverIdleTime
                                                }
                                            });
                                            alert('¡Configuraciones guardadas con éxito!');
                                        } catch (error) {
                                            alert('Error al guardar configuraciones.');
                                        }
                                    }}
                                >
                                    Guardar Configuraciones
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* EDIT DOCUMENT MODAL */}
                <Dialog open={!!editingDoc} onOpenChange={(open) => !open && setEditingDoc(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Documento</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nome</Label>
                                <Input id="name" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Tipo</Label>
                                <Select value={editForm.type} onValueChange={v => setEditForm({ ...editForm, type: v })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contract">Contrato</SelectItem>
                                        <SelectItem value="invoice">Fatura</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">Valor (€)</Label>
                                <Input id="amount" type="number" step="0.01" value={editForm.amount || ''} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dueDate" className="text-right">Vencimento</Label>
                                <Input id="dueDate" type="date" value={editForm.dueDate || ''} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Descrição</Label>
                                <Textarea id="description" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingDoc(null)}>Cancelar</Button>
                            <Button onClick={handleSaveEdit} className="bg-[#df0024] hover:bg-red-700">Salvar Alterações</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AdminLayout>
    );
}
