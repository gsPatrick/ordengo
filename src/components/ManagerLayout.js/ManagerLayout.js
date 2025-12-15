'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Megaphone,
  Palette,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat,
  BarChart3,
  FileText,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

import OnboardingWizard from '../../components/Onboarding/OnboardingWizard';

const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

import { RestaurantProvider } from '../../context/RestaurantContext';

export default function ManagerLayout({ children }) {
  return (
    <RestaurantProvider>
      <ManagerLayoutContent>{children}</ManagerLayoutContent>
    </RestaurantProvider>
  );
}

function ManagerLayoutContent({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const userData = Cookies.get('ordengo_user');

    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      if (parsedUser.role !== 'manager') {
        if (!Cookies.get('admin_impersonating')) {
          Cookies.remove('ordengo_token');
          Cookies.remove('ordengo_user');
          router.push('/login');
          return;
        }
      }

      setUser(parsedUser);

      if (parsedUser.Restaurant && parsedUser.Restaurant.isOnboardingCompleted === false) {
        setShowOnboarding(true);
      }

    } catch (error) {
      console.error("Erro ao processar usuário:", error);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    if (Cookies.get('admin_impersonating')) {
      // Fallback if clicked logout while impersonating
      const adminToken = Cookies.get('ordengo_admin_token');
      const adminUser = Cookies.get('ordengo_admin_user');

      Cookies.remove('admin_impersonating');
      Cookies.remove('ordengo_token');
      Cookies.remove('ordengo_user');
      Cookies.remove('ordengo_admin_token');
      Cookies.remove('ordengo_admin_user');

      if (adminToken && adminUser) {
        Cookies.set('ordengo_token', adminToken, { expires: 1 });
        Cookies.set('ordengo_user', adminUser, { expires: 1 });
        window.location.href = '/admin/tenants';
        return;
      }

      router.push('/login');
      return;
    }

    Cookies.remove('ordengo_token');
    Cookies.remove('ordengo_user');
    router.push('/login');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      const updatedUser = {
        ...user,
        Restaurant: { ...user.Restaurant, isOnboardingCompleted: true }
      };
      Cookies.set('ordengo_user', JSON.stringify(updatedUser), { expires: 1 });
      setUser(updatedUser);
    }
    window.location.reload();
  };

  // Menu items - Spanish labels
  const menuItems = [
    {
      name: 'Visión General',
      sub: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      name: 'Analytics',
      sub: 'Inteligencia',
      icon: BarChart3,
      path: '/dashboard/analytics'
    },
    {
      name: 'Marketing',
      sub: 'Promociones y Ads',
      icon: Megaphone,
      path: '/dashboard/marketing'
    },
    {
      name: 'Personalización',
      sub: 'Apariencia',
      icon: Palette,
      path: '/dashboard/appearance'
    },
    {
      name: 'Valoraciones',
      sub: 'Feedback Clientes',
      icon: Star,
      path: '/dashboard/reviews'
    },
    {
      name: 'Configuración',
      sub: 'General y Equipo',
      icon: Settings,
      path: '/dashboard/settings'
    },
  ];

  if (!isClient || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 flex flex-col`}
      >
        {/* Header Sidebar */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 shrink-0 relative">
          {user.Restaurant?.logo ? (
            <div className="w-full flex items-center justify-center">
              <img src={`${BASE_IMG_URL}${user.Restaurant.logo}`} alt="Logo" className="max-h-12 max-w-[200px] object-contain" />
            </div>
          ) : (
            <>
              <div className="bg-red-50 p-2 rounded-lg mr-3 overflow-hidden w-10 h-10 flex items-center justify-center">
                <ChefHat className="text-[#df0024]" size={24} />
              </div>
              <div>
                <span className="block font-bold text-gray-900 leading-tight">OrdenGo</span>
                <span className="text-xs text-gray-500">Gestor</span>
              </div>
            </>
          )}

          <button
            className="lg:hidden absolute right-4 text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-[#df0024] text-white shadow-md shadow-red-200'
                  : 'text-gray-600 hover:bg-red-50 hover:text-[#df0024]'
                  }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#df0024]'} />
                <div className="flex flex-col">
                  <span className="font-medium text-sm leading-none">{item.name}</span>
                  <span className={`text-[10px] mt-1 ${isActive ? 'text-red-100' : 'text-gray-400'}`}>
                    {item.sub}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar (User Info) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-3 shadow-sm">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              {/* Status always shows as Open (green) per user requirement */}
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Tienda Abierta
              </span>
            </div>
          </div>

          {Cookies.get('admin_impersonating') && (
            <button
              onClick={() => {
                const adminToken = Cookies.get('ordengo_admin_token');
                const adminUser = Cookies.get('ordengo_admin_user');

                Cookies.remove('admin_impersonating');
                Cookies.remove('ordengo_token');
                Cookies.remove('ordengo_user');
                Cookies.remove('ordengo_admin_token');
                Cookies.remove('ordengo_admin_user');

                if (adminToken && adminUser) {
                  Cookies.set('ordengo_token', adminToken, { expires: 1 });
                  Cookies.set('ordengo_user', adminUser, { expires: 1 });
                  window.location.href = '/admin/tenants';
                } else {
                  router.push('/login');
                }
              }}
              className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors rounded-lg shadow-md"
            >
              <ShieldCheck size={16} />
              Voltar para Admin
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors hover:bg-white rounded-lg border border-transparent hover:border-gray-200"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>

          {/* SYSTEM LOGO (OrdenGo) */}
          <div className="mt-6 flex items-center justify-center gap-2 opacity-80">
            <img src="/logocerta.png" alt="OrdenGo" className="h-8 object-contain" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative h-screen">

        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
          <span className="font-bold text-gray-900">Panel</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

      {showOnboarding && (
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      )}

    </div>
  );
}