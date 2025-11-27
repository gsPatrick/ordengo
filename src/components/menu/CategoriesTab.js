'use client';

import { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Plus, 
  ChevronRight, 
  MoreHorizontal 
} from 'lucide-react';
import api from '@/lib/api';

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  
  const fetchCategories = async () => {
    try {
      const response = await api.get('/menu');
      setCategories(response.data.data.menu);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Árvore do Menu</h3>
        <button className="flex items-center gap-2 text-sm font-medium text-[#df0024] hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
          <Plus size={18} />
          Nova Categoria
        </button>
      </div>

      <div className="space-y-3">
        {categories.length === 0 && (
          <p className="text-gray-500 text-center py-8">Nenhuma categoria cadastrada.</p>
        )}

        {categories.map((cat) => (
          <div key={cat.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Categoria Pai */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white rounded border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing">
                  <FolderTree size={16} className="text-gray-400" />
                </div>
                <span className="font-bold text-gray-800">{cat.name.pt}</span>
                <span className="text-xs text-gray-400 ml-2 font-normal">
                  ({cat.subcategories ? cat.subcategories.length : 0} subcategorias)
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Subcategorias */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="bg-white px-4 py-2 space-y-1">
                {cat.subcategories.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-2 pl-8 pr-2 hover:bg-gray-50 rounded-lg group/sub">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-gray-300" />
                      <span className="text-sm text-gray-600">{sub.name.pt}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {sub.Products ? sub.Products.length : 0} produtos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}