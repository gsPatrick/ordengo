'use client';

import { motion } from 'framer-motion';
import { UtensilsCrossed, ArrowRight, PlusCircle, Layers, CornerDownRight } from 'lucide-react';

export default function FirstProductModal({ 
  hasCategories, 
  hasSubcategories,
  onOpenCategory, 
  onOpenSubcategory,
  onOpenProduct 
}) {
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Header Decorativo */}
        <div className="h-28 bg-[#df0024] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-20"></div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl z-10 text-[#df0024]">
            <UtensilsCrossed size={32} />
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Vamos montar seu Cardápio!
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Siga os passos abaixo para estruturar seu menu. O sistema será liberado assim que você cadastrar o <strong>primeiro produto</strong>.
            </p>
          </div>

          <div className="space-y-3">
            
            {/* PASSO 1: CATEGORIA */}
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left
              ${!hasCategories 
                ? 'border-[#df0024] bg-red-50' 
                : 'border-green-200 bg-green-50 opacity-100'}
            `}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${!hasCategories ? 'bg-[#df0024] text-white' : 'bg-green-500 text-white'}
              `}>
                <Layers size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900">1. Criar Categoria Principal</h4>
                <p className="text-xs text-gray-500">Ex: Lanches, Bebidas</p>
              </div>
              <button 
                onClick={onOpenCategory}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors
                  ${!hasCategories 
                    ? 'bg-[#df0024] text-white hover:bg-red-700' 
                    : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'}
                `}
              >
                {hasCategories ? 'Criar Mais' : 'Criar'}
              </button>
            </div>

            {/* PASSO 2: SUBCATEGORIA (OPCIONAL) */}
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left relative
              ${!hasCategories 
                ? 'border-gray-100 bg-gray-50 opacity-50' 
                : hasSubcategories 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-blue-200 bg-blue-50'}
            `}>
              {!hasCategories && <div className="absolute inset-0 z-10 cursor-not-allowed" />}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${!hasCategories ? 'bg-gray-300 text-white' : hasSubcategories ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
              `}>
                <CornerDownRight size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900">2. Criar Subcategoria <span className="text-xs font-normal text-gray-500">(Opcional)</span></h4>
                <p className="text-xs text-gray-500">Ex: Artesanais, Refrigerantes</p>
              </div>
              <button 
                onClick={onOpenSubcategory}
                disabled={!hasCategories}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors
                   ${hasSubcategories 
                     ? 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                     : 'bg-blue-600 text-white hover:bg-blue-700'}
                `}
              >
                {hasSubcategories ? 'Criar Mais' : 'Criar'}
              </button>
            </div>

            {/* PASSO 3: PRODUTO */}
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left relative
              ${hasCategories 
                ? 'border-gray-800 bg-gray-50' 
                : 'border-gray-100 bg-gray-50 opacity-50'}
            `}>
              {!hasCategories && <div className="absolute inset-0 z-10 cursor-not-allowed" />}
              
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                <PlusCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900">3. Cadastrar Produto</h4>
                <p className="text-xs text-gray-500">O item final de venda</p>
              </div>
              <button 
                onClick={onOpenProduct}
                disabled={!hasCategories}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 shadow-md transition-colors disabled:opacity-50"
              >
                Cadastrar & Liberar
              </button>
            </div>

          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 uppercase font-bold tracking-widest">
             <UtensilsCrossed size={12} /> Painel bloqueado até o cadastro do produto
          </div>
        </div>
      </motion.div>
    </div>
  );
}