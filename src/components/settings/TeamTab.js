'use client';

import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Shield, 
  User, 
  Loader2, 
  KeyRound
} from 'lucide-react';
import api from '@/lib/api';

export default function TeamTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form
  const [newUser, setNewUser] = useState({
    name: '',
    role: 'waiter', // 'waiter' | 'manager' | 'kitchen'
    pin: '',
    email: '',
    password: ''
  });

  const fetchTeam = async () => {
    try {
      const response = await api.get('/team');
      setMembers(response.data.data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/team', newUser);
      alert('Usuário criado com sucesso!');
      setNewUser({ name: '', role: 'waiter', pin: '', email: '', password: '' });
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao criar usuário.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    try {
      await api.delete(`/team/${id}`);
      setMembers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      alert('Erro ao remover usuário.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* Form de Criação */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-[#df0024]" />
            Novo Membro
          </h3>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input required className="w-full px-3 py-2 border rounded-lg focus:ring-[#df0024]" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="João Silva" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-[#df0024]" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="waiter">Garçom (Acesso via PIN)</option>
                <option value="kitchen">Cozinha (Acesso via PIN)</option>
                <option value="manager">Gerente (Email/Senha)</option>
              </select>
            </div>

            {/* Campos Dinâmicos */}
            {newUser.role === 'manager' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-[#df0024]" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input required type="password" className="w-full px-3 py-2 border rounded-lg focus:ring-[#df0024]" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN de Acesso (4 dígitos)</label>
                <input required maxLength="4" className="w-full px-3 py-2 border rounded-lg focus:ring-[#df0024] font-mono tracking-widest text-center text-lg" value={newUser.pin} onChange={e => setNewUser({...newUser, pin: e.target.value.replace(/\D/g,'')})} placeholder="0000" />
              </div>
            )}

            <button type="submit" disabled={creating} className="w-full py-2 bg-[#df0024] text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 flex justify-center">
              {creating ? <Loader2 className="animate-spin" /> : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="lg:col-span-2 space-y-4">
        {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-[#df0024]" /> : (
          members.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'manager' ? 'bg-gray-900' : 'bg-gray-400'}`}>
                  {user.role === 'manager' ? <Shield size={16} /> : <User size={16} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{user.name}</h4>
                  <p className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                    {user.role === 'waiter' ? 'Garçom' : user.role === 'kitchen' ? 'Cozinha' : 'Gerente'}
                    {user.pin && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex items-center gap-1 ml-2 normal-case"><KeyRound size={10}/> PIN: {user.pin}</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}