'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  LayoutDashboard, 
  Store, 
  Megaphone, 
  Landmark, // Finanças
  MapPin,   // Regiões
  FileBarChart, // Relatórios
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  ShieldCheck,
  Plans
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Carregar dados do usuário do cookie
    const userData = Cookies.get('ordengo_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Se o cookie estiver inválido
        router.push('/auth/login');
      }
    } else {
        // Se não tiver cookie (comentar essa linha se quiser testar sem login)
        // router.push('/auth/login');
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('ordengo_token');
    Cookies.remove('ordengo_user');
    router.push('/auth/login');
  };

  // Menu Completo conforme PDF + Features Implementadas
  const menuItems = [
    { 
      name: 'Dashboard Global', 
      icon: LayoutDashboard, 
      path: '/admin/dashboard' 
    },
    { 
      name: 'Restaurantes', 
      icon: Store, 
      path: '/admin/tenants' 
    },
    { 
      name: 'Rede de Publicidade', 
      icon: Megaphone, 
      path: '/admin/ads' 
    },
    { 
      name: 'Finanças & Contábil', 
      icon: Landmark, 
      path: '/admin/finance' 
    },
    { 
      name: 'Regiões & Fiscal', 
      icon: MapPin, 
      path: '/admin/regions' 
    },
    { 
      name: 'Relatórios', 
      icon: FileBarChart, 
      path: '/admin/analytics' 
    },
    {
      name: 'Planos', 
      icon: Landmark, 
      path: '/admin/analytics' 
    },
    
    { 
      name: 'Configurações', 
      icon: Settings, 
      path: '/admin/settings' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1f1c1d] text-white transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#df0024] rounded-lg flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
                <span className="text-xl font-bold tracking-tighter text-white block leading-none">OrdenGo</span>
                <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Super Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#df0024] text-white shadow-lg shadow-red-900/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white transition-colors'} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-800 bg-black/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white shadow-inner">
              <User size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrador'}</p>
              <p className="text-[10px] text-gray-500 truncate uppercase">{user?.role || 'Super User'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors border border-transparent hover:border-red-900/50"
          >
            <LogOut size={14} />
            SAIR DO SISTEMA
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shrink-0">
          <span className="font-bold text-gray-900 flex items-center gap-2">
             <div className="w-6 h-6 bg-[#df0024] rounded flex items-center justify-center"><ShieldCheck size={12} className="text-white"/></div>
             OrdenGo
          </span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 p-2 rounded-md hover:bg-gray-100">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}