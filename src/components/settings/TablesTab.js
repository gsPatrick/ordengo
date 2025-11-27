// --- START OF FILE TablesTab.js ---

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Loader2, 
  Copy, 
  Info, 
  Smartphone, 
  Clock, 
  History, 
  Unplug,
  XCircle,
  X,
  Tablet,
  Edit2,
  Check,
  Share2
} from 'lucide-react';
import api from '@/lib/api';

// Função auxiliar para formatar segundos em HH:MM:SS
const formatDuration = (seconds) => {
  if (!seconds) return '0h 0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function TablesTab() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de Criação
  const [creating, setCreating] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');

  // Modais
  const [selectedTable, setSelectedTable] = useState(null); // Modal de Detalhes
  const [shareModalData, setShareModalData] = useState(null); // Modal de Copiar Link/Token

  // Estados de Edição de Dispositivo
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editingDeviceName, setEditingDeviceName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // --- BUSCA DE DADOS ---
  const fetchTables = useCallback(async () => {
    try {
      const response = await api.get('/tables');
      const newTablesData = response.data.data.tables;
      setTables(newTablesData);
      
      // CORREÇÃO AQUI:
      // Usamos o "prev" (estado atual) para garantir que só atualizamos se o modal AINDA estiver aberto.
      // Isso evita que o modal reabra sozinho se o usuário o fechou durante a requisição.
      setSelectedTable(prevSelected => {
        if (!prevSelected) return null; // Se o usuário fechou, mantém null (fechado)
        
        const updatedSelected = newTablesData.find(t => t.id === prevSelected.id);
        return updatedSelected || prevSelected;
      });

    } catch (error) {
      console.error("Erro ao buscar mesas:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Removido 'selectedTable' das dependências para evitar recriação desnecessária

  useEffect(() => {
    fetchTables();
    // Atualiza a cada 15s para ver status em tempo real
    const interval = setInterval(fetchTables, 15000); 
    return () => clearInterval(interval);
  }, [fetchTables]);

  // --- HELPER: Normaliza lista de dispositivos ---
  const getTableDevices = (table) => {
    if (!table) return []; // Proteção extra
    if (table.devices && table.devices.length > 0) {
      return table.devices;
    }
    // Fallback para estrutura antiga/flat
    if (table.isDeviceConnected) {
      return [{
        id: 'primary', 
        name: table.deviceName || 'Tablet Principal',
        agent: table.deviceAgent,
        ip: table.deviceIp,
        connectedAt: table.deviceConnectedAt
      }];
    }
    return [];
  };

  // --- AÇÕES ---

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;
    setCreating(true);
    try {
      await api.post('/tables', { number: newTableNum });
      setNewTableNum('');
      fetchTables();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao criar mesa.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta mesa?')) return;
    try {
      await api.delete(`/tables/${id}`);
      // Atualização otimista da lista
      setTables(prev => prev.filter(t => t.id !== id));
      // Se a mesa deletada for a que está aberta no modal, fecha o modal
      setSelectedTable(prev => (prev && prev.id === id ? null : prev));
    } catch (error) {
      alert('Erro ao deletar mesa. Verifique se há pedidos abertos.');
    }
  };

  const handleDisconnectDevice = async (deviceId, tableId) => {
    if (!confirm('Desvincular este tablet? Ele voltará para a tela de login.')) return;
    setActionLoading(true);
    try {
      const targetId = deviceId === 'primary' ? tableId : deviceId;
      // Tenta rota de dispositivo, se falhar tenta rota de mesa
      try {
        await api.patch(`/tables/devices/${targetId}/unbind`);
      } catch (err) {
        await api.post(`/tables/${tableId}/disconnect`);
      }
      await fetchTables();
    } catch (error) {
      console.error(error);
      alert('Erro ao desconectar.');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditingDevice = (device) => {
    setEditingDeviceId(device.id);
    setEditingDeviceName(device.name || '');
  };

  const handleSaveDeviceName = async (deviceId) => {
    if (!editingDeviceName.trim()) return;
    if (!selectedTable) return;

    setActionLoading(true);
    try {
      const targetId = deviceId === 'primary' ? selectedTable.id : deviceId; 
      await api.patch(`/tables/devices/${targetId}`, { name: editingDeviceName });
      setEditingDeviceId(null);
      await fetchTables();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar nome.');
    } finally {
      setActionLoading(false);
    }
  };

  const openShareModal = (table) => {
    setShareModalData({
      token: table.qrCodeToken,
      tableNum: table.number,
      link: `${window.location.origin}/tablet/${table.qrCodeToken}`
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500 relative">
      
      {/* HEADER DA ABA */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Gestão de Mesas e Dispositivos</h3>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Total: <span className="font-bold text-gray-900">{tables.length}</span>
        </div>
      </div>

      {/* FORM DE CRIAÇÃO RÁPIDA */}
      <form onSubmit={handleCreateTable} className="flex gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="Número ou Nome da Mesa (ex: 10, Terraço 1)"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#df0024] outline-none"
          value={newTableNum}
          onChange={e => setNewTableNum(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={creating || !newTableNum}
          className="px-6 py-2 bg-[#df0024] text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          Adicionar
        </button>
      </form>

      {/* LISTA DE MESAS (GRID) */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#df0024]" size={32} /></div>
      ) : tables.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <QrCode className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma mesa cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map(table => {
            const devices = getTableDevices(table);
            const deviceCount = devices.length;
            
            return (
              <div key={table.id} className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${deviceCount > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Mesa {table.number}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {deviceCount > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                           <Tablet size={10} /> {deviceCount} Tablet{deviceCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                         <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Offline</span>
                      )}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        table.status === 'free' ? 'bg-gray-100 text-gray-600' : 
                        table.status === 'occupied' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {table.status === 'free' ? 'Livre' : table.status === 'occupied' ? 'Ocupada' : 'Atend.'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openShareModal(table)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="QR Code"><Share2 size={16} /></button>
                    <button onClick={() => handleDeleteTable(table.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100/50">
                  <button onClick={() => setSelectedTable(table)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm">
                    <Info size={16} /> Gerenciar Dispositivos
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL 1: GERENCIAR DISPOSITIVOS --- */}
      {selectedTable && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer"
            onClick={() => setSelectedTable(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] cursor-default animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="bg-[#1f1c1d] px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-xl font-bold">Gerenciar Mesa {selectedTable.number}</h2>
                <p className="text-xs text-gray-400 font-mono mt-1">ID: {selectedTable.id}</p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedTable(null)} 
                className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Clock size={12}/> Ocupação Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatDuration(selectedTable.lifetimeOccupiedSeconds)}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><History size={12}/> Sessões</p>
                    <p className="text-lg font-bold text-gray-900">{selectedTable.lifetimeSessionCount || 0}</p>
                 </div>
              </div>

              {/* Lista de Tablets */}
              <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><Smartphone size={16} /> Dispositivos</h3>
                    <button 
                        type="button"
                        onClick={() => openShareModal(selectedTable)} // Abre o modal de share POR CIMA deste
                        className="text-xs text-[#df0024] font-bold flex items-center gap-1 hover:underline bg-red-50 px-2 py-1 rounded-lg"
                    >
                        <Plus size={12} /> Vincular Novo
                    </button>
                </div>
                
                <div className="space-y-3">
                  {getTableDevices(selectedTable).length > 0 ? (
                    getTableDevices(selectedTable).map(device => (
                      <div key={device.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0"><Tablet size={20} /></div>
                                <div className="w-full">
                                    {editingDeviceId === device.id ? (
                                        <div className="flex items-center gap-2">
                                            <input autoFocus className="w-full text-sm border-b border-[#df0024] outline-none bg-transparent" value={editingDeviceName} onChange={e => setEditingDeviceName(e.target.value)} />
                                            <button onClick={() => handleSaveDeviceName(device.id)} disabled={actionLoading} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                                            <button onClick={() => setEditingDeviceId(null)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group/edit">
                                            <p className="text-sm font-bold text-gray-900">{device.name || 'Tablet Principal'}</p>
                                            <button onClick={() => startEditingDevice(device)} className="opacity-0 group-hover/edit:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity"><Edit2 size={12} /></button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded font-mono">{device.ip || 'IP Oculto'}</span>
                                        <span className="text-[10px] text-green-600 flex items-center gap-1">● Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDisconnectDevice(device.id, selectedTable.id)} disabled={actionLoading} className="ml-2 text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg"><Unplug size={18} /></button>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-500">
                      <XCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm font-medium">Nenhum tablet conectado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                <button onClick={() => openShareModal(selectedTable)} className="text-sm font-bold text-[#df0024] hover:underline">
                    Ver QR Code de Conexão
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: COPIAR CONTEÚDO (QR CODE) --- */}
      {shareModalData && (
        <div 
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-pointer animate-in fade-in duration-200"
            onClick={() => setShareModalData(null)}
        >
            <div 
                className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative cursor-default transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    type="button"
                    onClick={() => setShareModalData(null)} 
                    className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-10 transition-colors"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-[#df0024]"><QrCode size={32} /></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Mesa {shareModalData.tableNum}</h3>
                    <p className="text-gray-500 text-sm mb-6">Escaneie ou copie o código para conectar.</p>
                    
                    {/* Box do Token */}
                    <div className="w-full bg-gray-900 rounded-xl p-6 mb-6 relative group cursor-pointer active:scale-95 transition-transform" onClick={() => { navigator.clipboard.writeText(shareModalData.token); alert('Copiado!'); }}>
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Token de Acesso</p>
                        <p className="text-3xl font-mono font-bold text-white tracking-widest select-all">{shareModalData.token}</p>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><Copy size={12}/> Copiar</span>
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={() => navigator.clipboard.writeText(shareModalData.link || shareModalData.token)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Copy size={18} /> Copiar Link Completo
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}