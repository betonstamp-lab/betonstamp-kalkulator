'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductOption {
  id: string;
  kg?: number | null;
  liters?: number | null;
  m2?: number | null;
  price: number;
}

interface Product {
  id: string;
  system: string;
  category: string;
  type: string;
  name: string;
  info: string | null;
  options: ProductOption[];
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [editingOption, setEditingOption] = useState<{
    productId: string;
    optionId: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    loadProducts();
  }, [selectedSystem]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const url = selectedSystem === 'all' 
        ? '/api/products'
        : `/api/products?system=${selectedSystem}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Hiba a termékek betöltésekor:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (optionId: string, newPrice: number) => {
    try {
      const response = await fetch(`/api/products/options/${optionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      
      if (response.ok) {
        await loadProducts();
        setEditingOption(null);
      }
    } catch (error) {
      console.error('Hiba az ár frissítésekor:', error);
    }
  };

  const systemNames: Record<string, string> = {
    natture: 'Natture',
    effectoQuartz: 'Effecto Quartz',
    effectoPU: 'Effecto PU',
    pool: 'Pool'
  };

  const categoryNames: Record<string, string> = {
    alapozo: 'Alapozó',
    mikrocement: 'Mikrocement',
    lakk: 'Lakk',
    halo: 'Háló',
    gyanta: 'Gyanta',
    presealer: 'PreSealer'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Termékek kezelése</p>
            </div>
            <Link 
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
            >
              ← Vissza a Kalkulátorhoz
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Rendszer szűrés:
          </label>
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="w-full md:w-64 p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition text-gray-900 font-medium bg-white"
          >
            <option value="all">Összes rendszer</option>
            <option value="natture">Natture</option>
            <option value="effectoQuartz">Effecto Quartz</option>
            <option value="effectoPU">Effecto PU</option>
            <option value="pool">Pool</option>
          </select>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {systemNames[product.system] || product.system}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {categoryNames[product.category] || product.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    {product.info && (
                      <p className="text-sm text-gray-600 mt-1">{product.info}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Kiszerelések és Árak:</h4>
                {product.options.map((option) => (
                  <div 
                    key={option.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-700">
                        {option.kg && <span className="font-medium">{option.kg} kg</span>}
                        {option.liters && <span className="font-medium">{option.liters} L</span>}
                        {option.m2 && <span className="text-gray-500 ml-2">({option.m2} m²)</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {editingOption?.optionId === option.id ? (
                        <>
                          <input
                            type="number"
                            value={editingOption.price}
                            onChange={(e) => setEditingOption({
                              ...editingOption,
                              price: parseInt(e.target.value) || 0
                            })}
                            className="w-32 p-2 border-2 border-blue-500 rounded-lg focus:outline-none text-gray-900 font-semibold"
                            autoFocus
                          />
                          <button
                            onClick={() => updatePrice(option.id, editingOption.price)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingOption(null)}
                            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-gray-800">
                            {option.price.toLocaleString('hu-HU')} Ft
                          </span>
                          <button
                            onClick={() => setEditingOption({
                              productId: product.id,
                              optionId: option.id,
                              price: option.price
                            })}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                          >
                            Szerkeszt
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Nincsenek termékek ebben a rendszerben.</p>
          </div>
        )}
      </div>
    </div>
  );
}