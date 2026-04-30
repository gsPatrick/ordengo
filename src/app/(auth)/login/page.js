// src/app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ChefHat, 
  UtensilsCrossed, 
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [roleAnimation, setRoleAnimation] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, data } = response.data;
      const user = data.user;

      Cookies.set('ordengo_token', token, { expires: 1 });
      Cookies.set('ordengo_user', JSON.stringify(user), { expires: 1 });

      setRoleAnimation(user.role);

      setTimeout(() => {
        if (user.role === 'superadmin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'manager') {
          router.push('/dashboard');
        } else {
          router.push('/waiter/home');
        }
      }, 2500);

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Falha ao conectar com o servidor.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden bg-white">

      {/* 
        === ANIMAÇÃO DE ENTRADA (CORTINA) ===
        Simula a continuidade da Landing Page.
        Começa cobrindo a tela (Vermelho) e sobe (y: -100%) revelando o login.
      */}
      <motion.div
        className="absolute inset-0 z-[60] bg-[#E01928]"
        initial={{ y: "0%" }} 
        animate={{ y: "-100%" }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      />

      {/* ANIMAÇÕES DE SUCESSO (ROLE ANIMATION) */}
      <AnimatePresence>
        {roleAnimation === 'manager' && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 bg-[#df0024] flex flex-col items-center justify-center text-white"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
              className="bg-white p-6 rounded-full text-[#df0024] mb-6 shadow-2xl"
            >
              <ChefHat size={64} strokeWidth={1.5} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold mb-2 tracking-tight"
            >
              Bem-vindo ao OrdenGo
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-red-100 text-lg"
            >
              Preparando seu restaurante...
            </motion.p>

            <div className="flex gap-2 mt-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2, y: 0 }}
                  animate={{ opacity: 1, y: -10 }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    delay: i * 0.2 
                  }}
                  className="w-3 h-3 bg-white rounded-full"
                />
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
               <UtensilsCrossed size={400} />
            </motion.div>
          </motion.div>
        )}

        {roleAnimation === 'superadmin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 bg-[#1f1c1d] flex flex-col items-center justify-center text-white"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-r-4 border-[#df0024] rounded-full w-32 h-32 -m-4 opacity-50"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-b-2 border-l-2 border-gray-500 rounded-full w-40 h-40 -m-8 opacity-30"
                />

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden">
                   <motion.div
                     initial={{ y: 50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.2 }}
                   >
                     <Server size={48} className="text-white relative z-10" />
                   </motion.div>
                   <motion.div 
                     animate={{ top: ['-100%', '200%'] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-[#df0024]/20 to-transparent w-full z-0"
                   />
                </div>
              </div>

              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-mono font-bold mt-12 text-gray-200 tracking-widest uppercase"
              >
                Acesso <span className="text-[#df0024]">Admin</span> Permitido
              </motion.h2>

              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="h-1 bg-gray-800 rounded-full mt-6 overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-[#df0024]"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 1.5 }}
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-500 text-xs mt-2 font-mono"
              >
                Inicializando Dashboard Global...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LADO ESQUERDO (IMAGEM) */}
      <motion.div 
        className="hidden lg:flex w-1/2 bg-[#1f1c1d] items-center justify-center relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }} // Entra depois da cortina subir
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>

        <div className="relative z-10 p-12 text-white">
          
          {/* Logo e Título */}
          <motion.div 
            className="flex items-center gap-3 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex-shrink-0">
              <Image 
                src="/logocerta1.png"
                width={110}
                height={110}
                alt="OrdenGo Logo"
                className="object-contain"
              />
            </div>
          </motion.div>

          <motion.p 
            className="text-xl text-gray-300 max-w-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            A plataforma completa para gestão inteligente de restaurantes, 
            cardápios digitais e pedidos em tempo real.
          </motion.p>
        </div>
      </motion.div>

      {/* LADO DIREITO (FORMULÁRIO) */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-8 bg-gray-50"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }} // Entra ligeiramente depois da esquerda
      >
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-gray-600">
              Entre com suas credenciais de administrador
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df0024] focus:border-transparent transition-all"
                    placeholder="admin@ordengo.com"
                  />
                </div>
              </motion.div>

              {/* Senha */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df0024] focus:border-transparent transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#df0024] focus:ring-[#df0024] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#df0024] hover:text-red-700">
                  Esqueceu a senha?
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#df0024] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#df0024] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-200"
              >
                {loading && !roleAnimation ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Entrar no Painel'
                )}
              </button>
            </motion.div>
          </form>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-xs text-gray-500">
              Acesso restrito a equipe autorizada. <br/>
              Garçons devem usar o login via PIN no tablet.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}