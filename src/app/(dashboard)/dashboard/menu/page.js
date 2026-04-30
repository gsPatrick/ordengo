'use client';

import { useState, useEffect } from 'react';
import ManagerLayout from '../../../../components/ManagerLayout.js/ManagerLayout';
import { useRestaurant } from '../../../../context/RestaurantContext';
import {
  Plus,
  Search,
  Layers,
  Loader2,
  Edit,
  Image as ImageIcon,
  Folder,
  FolderOpen,
  CornerDownRight,
  Power,
  PlusCircle,
  Star,
  Tag,
  Trash2
} from 'lucide-react';
import api from '@/lib/api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../../../../components/menu/SortableItem';

// Componentes Internos
import ProductForm from '../../../../components/menu/ProductForm';
import CategoryForm from '../../../../components/menu/CategoryForm';
import ModifierGroupForm from '../../../../components/menu/ModifierGroupForm';
import FirstProductModal from '../../../../components/Onboarding/FirstProductModal';

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function MenuPage() {
  const { currency } = useRestaurant();
  const [fullMenu, setFullMenu] = useState([]);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [showFirstSetupModal, setShowFirstSetupModal] = useState(false);
  // Estado novo para controle visual no modal de bloqueio
  const [hasSubcategories, setHasSubcategories] = useState(false);

  const getText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj.pt || obj.en || Object.values(obj)[0] || '';
  };

  // 1. Carregar Dados
  const fetchData = async () => {
    try {
      const [menuRes, modRes] = await Promise.all([
        api.get('/menu?includeUnavailable=true'),
        api.get('/menu/modifiers')
      ]);
      const menuData = menuRes.data.data.menu;
      setFullMenu(menuData);
      setModifierGroups(modRes.data.data.groups);

      // --- LÓGICA DE BLOQUEIO (ONBOARDING) ---
      let hasProducts = false;
      let hasSubs = false;

      if (menuData) {
        menuData.forEach(cat => {
          if (cat.Products && cat.Products.length > 0) hasProducts = true;
          if (cat.subcategories && cat.subcategories.length > 0) {
            hasSubs = true;
            cat.subcategories.forEach(sub => {
              if (sub.Products && sub.Products.length > 0) hasProducts = true;
            });
          }
        });
      }

      setHasSubcategories(hasSubs);

      // Se NÃO tem produtos, ativa o modal de bloqueio
      if (!hasProducts) {
        setShowFirstSetupModal(true);
      } else {
        setShowFirstSetupModal(false);
      }
      // ---------------------------------------

    } catch (error) {
      console.error("Erro ao carregar menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Filtragem
  const getAllProducts = () => {
    let products = [];
    const traverse = (categories) => {
      categories.forEach(cat => {
        if (cat.Products) {
          cat.Products.forEach(p => products.push({ ...p, categoryName: getText(cat.name) }));
        }
        if (cat.subcategories) traverse(cat.subcategories);
      });
    };

    let targetCategories = fullMenu;
    if (selectedCategoryId) {
      const findCategory = (cats) => {
        for (let cat of cats) {
          if (cat.id === selectedCategoryId) return [cat];
          if (cat.subcategories) {
            const found = findCategory(cat.subcategories);
            if (found) return found;
          }
        }
        return null;
      };
      targetCategories = findCategory(fullMenu) || [];
    }

    traverse(targetCategories);

    if (searchTerm) {
      products = products.filter(p => getText(p.name).toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return products;
  };

  // 3. Ações
  const toggleProductAvailability = async (productId) => {
    try {
      await api.patch(`/menu/products/${productId}/availability`);
      fetchData();
    } catch (error) {
      alert('Erro ao alterar disponibilidade');
    }
  };

  const handleDeleteCategory = async (id, event) => {
    if (event) event.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      setLoading(true);
      await api.delete(`/menu/categories/${id}`);
      fetchData();
    } catch (error) {
      alert('Erro ao excluir categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, event) => {
    if (event) event.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      setLoading(true);
      await api.delete(`/menu/products/${id}`);
      fetchData();
    } catch (error) {
      alert('Erro ao excluir produto');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
  };

  const handleAddSubcategory = (parentCategory, event) => {
    if (event) event.stopPropagation();
    setModalType('category');
    setEditingItem({ parentId: parentCategory.id, parentName: getText(parentCategory.name) });
  };

  // Handler Especial para o Modal de Bloqueio (Cria Subcategoria na primeira categoria disponível)
  const handleAddSubcategoryFromLock = () => {
    if (fullMenu.length > 0) {
      const firstCat = fullMenu[0];
      setModalType('category');
      setEditingItem({ parentId: firstCat.id, parentName: getText(firstCat.name) });
    }
  };

  const handleCloseModal = (shouldRefresh = false) => {
    setModalType(null);
    setEditingItem(null);
    if (shouldRefresh) fetchData();
  };

  // --- DRAG AND DROP ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndCategory = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFullMenu((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // API Call
        const orderedIds = newOrder.map(i => i.id);
        api.patch('/menu/categories/reorder', { orderedIds }).catch(err => console.error(err));

        return newOrder;
      });
    }
  };

  const handleDragEndProduct = (event) => {
    const { active, over } = event;
    if (active.id !== over.id && selectedCategoryId) {
      const newMenu = JSON.parse(JSON.stringify(fullMenu)); // Deep copy

      const findAndReorder = (cats) => {
        for (let cat of cats) {
          if (cat.id === selectedCategoryId) {
            if (!cat.Products) return false;
            const oldIndex = cat.Products.findIndex(p => p.id === active.id);
            const newIndex = cat.Products.findIndex(p => p.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
              cat.Products = arrayMove(cat.Products, oldIndex, newIndex);
              // API Call
              const orderedIds = cat.Products.map(p => p.id);
              api.patch('/menu/products/reorder', { orderedIds }).catch(err => console.error(err));
              return true;
            }
          }
          if (cat.subcategories && findAndReorder(cat.subcategories)) return true;
        }
        return false;
      };

      if (findAndReorder(newMenu)) {
        setFullMenu(newMenu);
      }
    }
  };

  return (
    <ManagerLayout>
      <div className="flex h-[calc(100vh-100px)] gap-6 relative">

        {/* --- SIDEBAR: ÁRVORE DE CATEGORIAS --- */}
        <aside className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <button
              onClick={() => handleOpenModal('category')}
              className="w-full flex items-center justify-center gap-2 bg-[#df0024] text-white py-3 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Criar Categoria Principal
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all border ${selectedCategoryId === null
                ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                : 'text-gray-600 bg-white border-transparent hover:bg-gray-100'
                }`}
            >
              📦 Todos os Produtos
            </button>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategory}>
              <SortableContext items={fullMenu.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="pt-2 space-y-1">
                  {fullMenu.map(cat => (
                    <SortableItem key={cat.id} id={cat.id}>
                      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden mb-2 shadow-sm">
                        <div
                          className={`group flex items-center justify-between px-3 py-3 cursor-pointer transition-colors ${selectedCategoryId === cat.id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedCategoryId(cat.id)}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {selectedCategoryId === cat.id ? <FolderOpen size={18} className="text-[#df0024]" /> : <Folder size={18} className="text-gray-400" />}
                            <span className={`font-bold text-sm truncate ${selectedCategoryId === cat.id ? 'text-[#df0024]' : 'text-gray-700'}`}>
                              {getText(cat.name)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => handleAddSubcategory(cat, e)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"><PlusCircle size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal('category', cat); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={14} /></button>
                            <button onClick={(e) => handleDeleteCategory(cat.id, e)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        {cat.subcategories?.length > 0 && (
                          <div className="bg-gray-50/50 border-t border-gray-100 pb-2">
                            {cat.subcategories.map(sub => (
                              <div
                                key={sub.id}
                                className={`group/sub flex items-center justify-between pl-8 pr-3 py-2 cursor-pointer transition-colors border-l-2 ${selectedCategoryId === sub.id ? 'border-[#df0024] bg-red-50/50' : 'border-transparent hover:bg-gray-100'}`}
                                onClick={() => setSelectedCategoryId(sub.id)}
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  <CornerDownRight size={12} className="opacity-30" />
                                  <span className={`font-medium truncate max-w-[100px] ${selectedCategoryId === sub.id ? 'text-[#df0024]' : 'text-gray-600'}`}>
                                    {getText(sub.name)}
                                  </span>
                                </div>
                                <div className="flex items-center opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenModal('category', sub); }} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit size={12} /></button>
                                  <button onClick={(e) => handleDeleteCategory(sub.id, e)} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={12} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button onClick={() => handleOpenModal('modifier')} className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <Layers size={14} /> Gerenciar Modificadores
            </button>
          </div>
        </aside>

        {/* --- ÁREA PRINCIPAL --- */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Buscar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#df0024] focus:border-transparent outline-none" />
            </div>
            <button onClick={() => handleOpenModal('product')} className="flex items-center gap-2 bg-[#df0024] text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all shadow-md shadow-red-100 font-medium">
              <Plus size={20} /> Novo Produto
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[#df0024]" size={40} /></div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 pb-10">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProduct}>
                <SortableContext items={getAllProducts().map(p => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {getAllProducts().map(product => (
                      <SortableItem key={product.id} id={product.id} className="h-full">
                        <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-red-100 transition-all duration-300 flex flex-col overflow-hidden h-full">
                          <div className="relative h-48 bg-gray-100 overflow-hidden">
                            {product.imageUrl ? (
                              <img src={`${BASE_IMG_URL}${product.imageUrl}`} alt={getText(product.name)} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.isAvailable ? 'grayscale' : ''}`} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><ImageIcon size={32} /></div>
                            )}

                            {/* Flags de Status */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {product.isOffer && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><Tag size={10} /> OFERTA</span>}
                              {product.isHighlight && <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><Star size={10} /> DESTAQUE</span>}
                            </div>

                            <button onClick={(e) => { e.stopPropagation(); toggleProductAvailability(product.id); }} className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-colors z-10 ${product.isAvailable ? 'bg-white/90 text-green-600 hover:bg-red-50 hover:text-red-600' : 'bg-red-600 text-white'}`} title="Pausar/Ativar">
                              <Power size={16} />
                            </button>

                            {!product.isAvailable && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]"><span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">ESGOTADO</span></div>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <div className="mb-2">
                              <h4 className="font-bold text-gray-900 text-lg line-clamp-1 leading-tight">{getText(product.name)}</h4>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">{product.categoryName}</p>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8 leading-relaxed">{getText(product.description) || 'Sem descrição'}</p>
                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                              <div className="flex flex-col">
                                {product.hasVariants && <span className="text-[10px] text-gray-400 font-medium">A partir de</span>}
                                <span className="text-xl font-extrabold text-[#df0024]">{new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'es-ES', { style: 'currency', currency: currency || 'EUR' }).format(product.price)}</span>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => handleOpenModal('product', product)} className="p-2 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><Edit size={18} /></button>
                                <button onClick={(e) => handleDeleteProduct(product.id, e)} className="p-2 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>

      {/* MODAIS */}
      {modalType === 'product' && (
        <ProductForm product={editingItem} categories={fullMenu} modifierGroups={modifierGroups} onClose={handleCloseModal} />
      )}
      {modalType === 'category' && (
        <CategoryForm category={editingItem} parentCategories={fullMenu} onClose={handleCloseModal} />
      )}
      {modalType === 'modifier' && (
        <ModifierGroupForm onClose={handleCloseModal} />
      )}

      {/* --- NOVO MODAL DE BLOQUEIO (FirstProductModal) --- */}
      {/* Só aparece se showFirstSetupModal = true E nenhum outro modal estiver aberto */}
      {showFirstSetupModal && !modalType && !loading && (
        <FirstProductModal
          hasCategories={fullMenu.length > 0}
          hasSubcategories={hasSubcategories}
          onOpenCategory={() => handleOpenModal('category')}
          onOpenSubcategory={handleAddSubcategoryFromLock} // Nova função para sub
          onOpenProduct={() => handleOpenModal('product')}
        />
      )}

    </ManagerLayout>
  );
}