'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, Search, Loader2, Filter, AlertTriangle, 
  CheckCircle2, Info, User, Settings, Trash2, LogIn,
  Shield, RefreshCw, ChevronDown
} from 'lucide-react';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout.js/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import EmptyState from '@/components/ui/EmptyState';

const ACTION_ICONS = {
  login: LogIn,
  create: CheckCircle2,
  update: Settings,
  delete: Trash2,
  error: AlertTriangle,
};

const ACTION_COLORS = {
  login: 'bg-green-500/10 text-green-500',
  create: 'bg-emerald-500/10 text-emerald-500',
  update: 'bg-amber-500/10 text-amber-500',
  delete: 'bg-red-500/10 text-red-500',
  error: 'bg-red-500/10 text-red-500',
};

export default function LogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.data?.logs || []);
    } catch (e) {
      console.error(e);
      // Fallback: show empty state gracefully
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetResource?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || log.action === filter;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action) => {
    if (action?.includes('login')) return ACTION_ICONS.login;
    if (action?.includes('create')) return ACTION_ICONS.create;
    if (action?.includes('update')) return ACTION_ICONS.update;
    if (action?.includes('delete')) return ACTION_ICONS.delete;
    if (action?.includes('error')) return ACTION_ICONS.error;
    return Info;
  };

  const getActionColor = (action) => {
    if (action?.includes('login')) return ACTION_COLORS.login;
    if (action?.includes('create')) return ACTION_COLORS.create;
    if (action?.includes('update')) return ACTION_COLORS.update;
    if (action?.includes('delete')) return ACTION_COLORS.delete;
    if (action?.includes('error')) return ACTION_COLORS.error;
    return 'bg-gray-500/10 text-gray-500';
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Logs del Sistema</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">
              Registro de actividades críticas, accesos y errores de la plataforma.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchLogs} variant="ghost" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl h-12 px-6 font-bold gap-2">
              <RefreshCw size={18} /> Actualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input 
              placeholder="Buscar por usuario, acción o recurso..." 
              className="pl-12 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 h-12 rounded-2xl shadow-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
           <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
            {['all', 'login', 'create', 'update', 'delete', 'error'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)} 
                className={cn(
                  "px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-tight transition-all",
                  filter === f ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <Card className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-white/5 px-8 pt-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Activity size={24} />
                </div>
                <CardTitle className="text-xl font-black">Registro de Actividad</CardTitle>
                <CardDescription>{filteredLogs.length} eventos registrados</CardDescription>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-none font-bold">
                <div className="size-2 bg-green-500 rounded-full animate-pulse mr-2" /> EN VIVO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="font-black text-[10px] uppercase">Fecha</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Usuario</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Acción</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Recurso</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, i) => {
                      const ActionIcon = getActionIcon(log.action);
                      const colorClass = getActionColor(log.action);
                      return (
                        <TableRow key={log.id || i} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('es-ES', { 
                              day: '2-digit', month: '2-digit', year: '2-digit',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <User size={14} />
                              </div>
                              <div>
                                <p className="text-xs font-bold leading-none">{log.User?.name || 'Sistema'}</p>
                                <p className="text-[10px] text-muted-foreground">{log.User?.email || 'system@ordengo'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase", colorClass)}>
                              <ActionIcon size={12} />
                              {log.action}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">
                            {log.targetResource || '—'}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {log.ipAddress || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="Sin registros de actividad"
                subtitle="Aún no se han registrado acciones en el sistema. Los logs aparecerán aquí automáticamente."
              />
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
