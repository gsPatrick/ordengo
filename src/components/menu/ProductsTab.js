'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Pizza,
  Utensils,
  Loader2,
  X
} from 'lucide-react';
import api from '@/lib/api';

import { useRestaurant } from '../../context/RestaurantContext';

export default function ProductsTab() {
  const { currency } = useRestaurant();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  // Form Data
  const initialFormState = {
    id: null,
    namePt: '',
    nameEn: '', // Campo duplicado para tradução
    descriptionPt: '',
    descriptionEn: '',
    price: '',
    categoryId: '',
    interfaceType: 'standard', // 'standard' ou 'pizza'
    calories: '',
    prepTime: '',
    imageFile: null
  };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Carregar Dados Iniciais
  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/menu'), // Retorna a árvore, vamos ter que "achatá-la" ou usar uma rota de lista simples se houver
        api.get('/menu')  // Usando a mesma rota por enquanto para pegar categorias
      ]);

      // Processar Categorias (Flat list para o select)
      const flatCategories = [];
      // Assumindo que a API retorna estrutura de árvore (Categorias -> Subcategorias)
      if (catRes.data.data.menu) {
        catRes.data.data.menu.forEach(cat => {
          flatCategories.push(cat);
          if (cat.subcategories) {
            cat.subcategories.forEach(sub => flatCategories.push({ ...sub, name: { pt: `${cat.name.pt} > ${sub.name.pt}` } }));
          }
        });
      }
      setCategories(flatCategories);

      // Processar Produtos (Extrair de todas as categorias)
      // Na prática real, teríamos uma rota GET /products paginada. 
      // Aqui vamos extrair da árvore para simplificar a demo.
      const allProducts = [];
      const traverse = (cats) => {
        cats.forEach(c => {
          if (c.Products) c.Products.forEach(p => allProducts.push({ ...p, categoryName: c.name.pt }));
          if (c.subcategories) traverse(c.subcategories);
        });
      };
      traverse(catRes.data.data.menu);
      setProducts(allProducts);

    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers do Modal
  const openModal = (product = null) => {
    if (product) {
      // Modo Edição (Popular campos)
      setFormData({
        id: product.id,
        namePt: product.name.pt,
        nameEn: product.name.en || '',
        descriptionPt: product.description?.pt || '',
        descriptionEn: product.description?.en || '',
        price: product.price,
        categoryId: product.categoryId,
        interfaceType: product.details?.interfaceType || 'standard',
        calories: product.details?.calories || '',
        prepTime: product.details?.prepTime || '',
        imageFile: null // Não carregamos o arquivo, apenas mostramos o preview da URL existente
      });
      setPreview(product.imageUrl ? `https://geral-ordengoapi.r954jc.easypanel.host${product.imageUrl}` : null);
    } else {
      // Modo Criação
      setFormData(initialFormState);
      setPreview(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = new FormData();
    // Montando JSONs complexos
    payload.append('name', JSON.stringify({ pt: formData.namePt, en: formData.nameEn }));
    payload.append('description', JSON.stringify({ pt: formData.descriptionPt, en: formData.descriptionEn }));
    payload.append('price', formData.price);
    payload.append('categoryId', formData.categoryId);

    // Detalhes Técnicos
    const details = {
      interfaceType: formData.interfaceType,
      calories: formData.calories,
      prepTime: formData.prepTime
    };
    payload.append('details', JSON.stringify(details));

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }

    try {
      // Nota: A rota de UPDATE não foi criada no passo anterior do backend (apenas createProduct). 
      // Assumindo que existe ou usando POST para criar sempre por enquanto.
      if (formData.id) {
        // await api.patch(`/menu/products/${formData.id}`, payload); // Futuro
        alert('Edição simulada (Endpoint de update pendente no backend)');
      } else {
        await api.post('/menu/products', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsModalOpen(false);
      fetchData(); // Recarrega lista
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.pt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#df0024] focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#df0024] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produto</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Preço</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={`https://geral-ordengoapi.r954jc.easypanel.host${product.imageUrl}`}
                          alt={product.name.pt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name.pt}</p>
                      {/* Badge de Tipo de Interface */}
                      {product.details?.interfaceType === 'pizza' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 mt-1">
                          <Pizza size={10} /> PIZZA
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {product.categoryName || 'Sem Categoria'}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'es-ES', { style: 'currency', currency: currency || 'EUR' }).format(product.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE PRODUTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <form onSubmit={handleSubmit}>

              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-gray-900">
                  {formData.id ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna 1: Mídia e Básico */}
                <div className="space-y-6">
                  {/* Upload Imagem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Prato</label>
                    <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#df0024] transition-colors">
                      <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      {preview ? (
                        <img src={preview} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon size={40} className="mx-auto mb-2" />
                          <span className="text-xs">Clique para upload</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tipo de Interface (Switch Visual) */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Interface</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, interfaceType: 'standard' })}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${formData.interfaceType === 'standard'
                          ? 'border-[#df0024] bg-white text-[#df0024]'
                          : 'border-transparent hover:bg-gray-200 text-gray-500'
                          }`}
                      >
                        <Utensils size={24} className="mb-1" />
                        <span className="text-xs font-bold">Padrão</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, interfaceType: 'pizza' })}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${formData.interfaceType === 'pizza'
                          ? 'border-[#df0024] bg-white text-[#df0024]'
                          : 'border-transparent hover:bg-gray-200 text-gray-500'
                          }`}
                      >
                        <Pizza size={24} className="mb-1" />
                        <span className="text-xs font-bold">Pizza</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                      {formData.interfaceType === 'pizza'
                        ? 'Habilita seleção de fatias e sabores.'
                        : 'Layout clássico para pratos e bebidas.'}
                    </p>
                  </div>
                </div>

                {/* Coluna 2 e 3: Dados */}
                <div className="lg:col-span-2 space-y-5">

                  {/* Tabs de Tradução (Simples) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">PT</span>
                        <span className="text-xs font-bold text-gray-400">Português (Principal)</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                        <input
                          required
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.namePt}
                          onChange={e => setFormData({ ...formData, namePt: e.target.value })}
                          placeholder="Ex: X-Bacon"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none"
                          value={formData.descriptionPt}
                          onChange={e => setFormData({ ...formData, descriptionPt: e.target.value })}
                          placeholder="Pão, carne, queijo..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">EN</span>
                        <span className="text-xs font-bold text-gray-400">Inglês (Opcional)</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                        <input
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.nameEn}
                          onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                          placeholder="Ex: Bacon Burger"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none"
                          value={formData.descriptionEn}
                          onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                          placeholder="Bread, meat, cheese..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#df0024] focus:border-[#df0024]"
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {typeof cat.name === 'object' ? cat.name.pt : cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Base</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#df0024] focus:border-[#df0024]"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Detalhes Extras */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Detalhes Nutricionais</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Calorias (kcal)</label>
                        <input
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="ex: 350"
                          value={formData.calories}
                          onChange={e => setFormData({ ...formData, calories: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Tempo de Preparo (min)</label>
                        <input
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="ex: 15-20"
                          value={formData.prepTime}
                          onChange={e => setFormData({ ...formData, prepTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#df0024] rounded-lg hover:bg-red-700 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Salvar Produto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}