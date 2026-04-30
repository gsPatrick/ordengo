'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tablet, Smartphone, ArrowRight, Download, Wifi, Zap } from 'lucide-react';

export default function AppsHub() {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Variantes de Animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#E01928] selection:text-white">

      {/* Background Decorativo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-black/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="z-10 w-full max-w-6xl px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* HEADER */}
        <motion.div className="flex flex-col items-center mb-16" variants={itemVariants}>
          <Link href="/">
            <Image
              src="/logocerta1.png"
              alt="OrdenGO"
              width={180}
              height={60}
              className="object-contain mb-6 hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111] text-center">
            Selecione o seu <span className="text-[#E01928]">Ambiente</span>
          </h1>
          <p className="text-gray-500 mt-2 text-center max-w-lg">
            Acesse o sistema dedicado para cada função do seu restaurante.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* --- CARD TABLET (CLIENTE) --- */}
          <motion.div
            variants={itemVariants}
            className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-red-100 transition-all duration-300 overflow-hidden"
            onMouseEnter={() => setHoveredCard('tablet')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Ícone gigante decorativo */}
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Tablet size={120} className="text-[#E01928]" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Tablet size={32} className="text-[#E01928]" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Modo Mesa</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Interface visual para o cliente. Cardápio digital, fotos em HD e autoatendimento.
                </p>

                {/* Badges */}
                <div className="flex gap-2 mb-8">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <Wifi size={10} /> Online/Offline
                  </span>

                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <Download size={10} /> PWA
                  </span>
                </div>
              </div>

              <Link
                href="/tablet"
                className="w-full py-4 bg-[#111] text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-[#E01928] transition-colors shadow-lg group-hover:shadow-red-200"
              >
                Acessar Tablet
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* --- CARD GARÇOM (STAFF) --- */}
          <motion.div
            variants={itemVariants}
            className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-gray-300 transition-all duration-300 overflow-hidden"
            onMouseEnter={() => setHoveredCard('waiter')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Smartphone size={120} className="text-black" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone size={32} className="text-black" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Modo Caixa</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Ferramenta ágil para staff. Lançamento de pedidos, gestão de mesas e notificações.
                </p>

                {/* Badges */}
                <div className="flex gap-2 mb-8">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <Zap size={10} /> Alta Performance
                  </span>

                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <Download size={10} /> PWA
                  </span>
                </div>
              </div>

              <Link
                href="/waiter/home"
                className="w-full py-4 bg-white border-2 border-[#111] text-[#111] rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-[#111] group-hover:text-white transition-all"
              >
                Acessar Caixa
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* INSTRUÇÕES PWA */}
        <motion.div className="mt-16 text-center" variants={itemVariants}>
          <div className="inline-block bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <Download size={14} className="text-[#E01928]" />
              <strong>Dica:</strong> No seu dispositivo, selecione &quot;Adicionar à Tela de Início&quot; para instalar como App.
            </p>
          </div>
        </motion.div>

      </motion.div>

      {/* FOOTER */}
      <div className="absolute bottom-6 text-center w-full text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        OrdenGo System v2.0
      </div>
    </div>
  );
}
