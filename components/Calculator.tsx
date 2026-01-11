'use client';

import { useState } from 'react';
import { PRODUCTS } from '@/lib/products';
import { optimizeByM2, optimizeByKg, optimizeByLiters } from '@/lib/utils';
import { MikrocementSystem, Surface, CalculationResult } from '@/types';

export default function Calculator() {
  const [system, setSystem] = useState<MikrocementSystem>('natture');
  const [surfaces, setSurfaces] = useState<Surface[]>([
    { 
      id: 1, 
      area: '',
      alapozo: '',
      lakk: '',
      layers: { xl: 0, l: 0, m: 0, s: 0 },
      puLayers: { big: 0, medium: 0, small: 0 }
    }
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const sys = PRODUCTS[system];

  // Helper Functions
  const getTotalArea = () => {
    return surfaces.reduce((sum, s) => sum + (parseFloat(s.area) || 0), 0);
  };

  const addSurface = () => {
    const newId = Math.max(...surfaces.map(s => s.id), 0) + 1;
    setSurfaces([...surfaces, { 
      id: newId, 
      area: '',
      alapozo: '',
      lakk: '',
      layers: { xl: 0, l: 0, m: 0, s: 0 },
      puLayers: { big: 0, medium: 0, small: 0 }
    }]);
  };

  const removeSurface = (id: number) => {
    if (surfaces.length > 1) {
      setSurfaces(surfaces.filter(s => s.id !== id));
    }
  };

  const updateSurface = (id: number, field: string, value: string) => {
    setSurfaces(surfaces.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateSurfaceLayers = (id: number, layerType: string, value: number) => {
    setSurfaces(surfaces.map(s => 
      s.id === id ? { ...s, layers: { ...s.layers, [layerType]: value } } : s
    ));
  };

  const updateSurfacePuLayers = (id: number, layerType: string, value: number) => {
    setSurfaces(surfaces.map(s => 
      s.id === id ? { ...s, puLayers: { ...s.puLayers, [layerType]: value } } : s
    ));
  };

  // Validation
  const validate = () => {
    const errs: string[] = [];
    const totalArea = getTotalArea();

    if (totalArea <= 0) {
      errs.push('Adj meg legalább egy felület területet!');
    }

    surfaces.forEach((s, i) => {
      const area = parseFloat(s.area) || 0;
      if (s.area && area < 0) {
        errs.push(`Felület ${i + 1}: A terület nem lehet negatív!`);
      }

      if (area > 0 && !s.alapozo) {
        errs.push(`Felület ${i + 1}: Válassz alapozót!`);
      }

      if (area > 0 && !s.lakk) {
        errs.push(`Felület ${i + 1}: Válassz lakkot!`);
      }

      if (system === 'natture' && area > 0) {
        const total = s.layers.xl + s.layers.l + s.layers.m + s.layers.s;
        if (total !== 3) {
          errs.push(`Felület ${i + 1}: Pontosan 3 réteg mikrocement kell (jelenleg ${total})!`);
        }
      }

      if (system === 'effectoPU' && area > 0) {
        const total = s.puLayers.big + s.puLayers.medium + s.puLayers.small;
        if (total !== 3) {
          errs.push(`Felület ${i + 1}: Pontosan 3 réteg mikrocement kell (jelenleg ${total})!`);
        }
      }
    });

    if (totalArea > 10000) {
      errs.push('A teljes terület túl nagy (maximum 10000 m²)!');
    }

    setErrors(errs);
    return errs.length === 0;
  };

  // Calculation
  const calc = () => {
    if (!validate()) {
      return;
    }

    const totalM2 = getTotalArea();
    const res: CalculationResult = { 
      items: [], 
      total: 0, 
      layers: [], 
      surfaces: surfaces.filter(s => parseFloat(s.area) > 0), 
      totalM2 
    };

    // Alapozó - felületenkénti számítás, majd összesítés típusonként
    const alapozoTotals: Record<string, number> = {};
    
    surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
      const surfaceM2 = parseFloat(surface.area);
      const alapType = surface.alapozo;
      
      if (!alapozoTotals[alapType]) {
        alapozoTotals[alapType] = 0;
      }
      alapozoTotals[alapType] += surfaceM2;
    });
    
    Object.keys(alapozoTotals).forEach(alapType => {
      const alapData = sys.alapozok[alapType];
      const m2 = alapozoTotals[alapType];
      const alapPkgs = optimizeByM2(m2, alapData.options);
      
      res.items.push({
        cat: `${alapData.name} (1 réteg) - ${m2.toFixed(1)} m²`,
        pkgs: alapPkgs.map(p => ({
          ...p, 
          name: `${alapData.name} ${p.kg || p.liters}${p.kg ? 'kg' : 'L'}`
        })),
        price: alapPkgs.reduce((s, p) => s + p.price * p.qty!, 0)
      });
      res.layers.push(`1× ${alapData.name} (${m2.toFixed(1)} m²)`);
    });

    // NATTURE
    if (system === 'natture') {
      const haloM2 = totalM2 * 1.03;
      const haloPkgs = optimizeByM2(haloM2, sys.halo!);
      
      res.items.push({
        cat: 'Háló (3% ráhagyás)',
        pkgs: haloPkgs.map(p => ({...p, name: `Háló ${p.m2}m²`})),
        price: haloPkgs.reduce((s,p) => s+p.price*p.qty!, 0)
      });
      res.layers.push('Háló');

      const mikroTotals: Record<string, number> = { xl: 0, l: 0, m: 0, s: 0 };
      let totalLiters = 0;
      
      surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
        const surfaceM2 = parseFloat(surface.area);
        
        (['xl','l','m','s'] as const).forEach(t => {
          if (surface.layers[t] > 0) {
            const mData = sys.mikrocementek![t];
            const kg = surfaceM2 * surface.layers[t] * mData.kgPerM2;
            mikroTotals[t] += kg;
          }
        });
      });
      
      (['xl','l','m','s'] as const).forEach(t => {
        if (mikroTotals[t] > 0) {
          const mData = sys.mikrocementek![t];
          const pkgs = optimizeByKg(mikroTotals[t], sys.mikroOptions![t]);
          
          const totalLayersCount = surfaces
            .filter(s => parseFloat(s.area) > 0)
            .reduce((sum, s) => sum + s.layers[t], 0);
          
          res.items.push({
            cat: `${mData.name} (${totalLayersCount} réteg összesen)`,
            pkgs: pkgs.map(p => ({...p, name: `${mData.name} ${p.kg}kg`})),
            price: pkgs.reduce((s,p) => s+p.price*p.qty!, 0)
          });
          res.layers.push(`${totalLayersCount}× ${mData.name}`);
          
          totalLiters += mikroTotals[t] * mData.literPerKg!;
        }
      });

      if (totalLiters > 0) {
        const gPkgs = optimizeByLiters(totalLiters, sys.gyanta!);
        
        res.items.push({
          cat: 'Arcicem gyanta',
          pkgs: gPkgs.map(p => ({...p, name: `Gyanta ${p.liters}L`})),
          price: gPkgs.reduce((s,p) => s+p.price*p.qty!, 0)
        });
      }

      const presealerM2: Record<string, number> = {};
      surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
        const lakkData = sys.lakkok[surface.lakk];
        if (lakkData && lakkData.needPresealer) {
          const surfaceM2 = parseFloat(surface.area);
          if (!presealerM2[surface.lakk]) {
            presealerM2[surface.lakk] = 0;
          }
          presealerM2[surface.lakk] += surfaceM2;
        }
      });
      
      if (Object.keys(presealerM2).length > 0) {
        const totalPreM2 = Object.values(presealerM2).reduce((sum, m2) => sum + m2, 0) * 2;
        const prePkgs = optimizeByM2(totalPreM2, sys.presealer!);
        
        res.items.push({
          cat: `PreSealer (2 réteg) - ${(totalPreM2/2).toFixed(1)} m²`,
          pkgs: prePkgs.map(p => ({...p, name: `PreSealer ${p.liters}L`})),
          price: prePkgs.reduce((s,p) => s+p.price*p.qty!, 0)
        });
        res.layers.push(`2× PreSealer (${(totalPreM2/2).toFixed(1)} m²)`);
      }
    }

    // EFFECTO QUARTZ
    if (system === 'effectoQuartz') {
      const superKg = totalM2 * 2 * sys.padlo!.super.kgPerM2;
      const superPkgs = optimizeByKg(superKg, sys.padlo!.super.options);
      res.items.push({
        cat: 'Super grain (2 réteg)',
        pkgs: superPkgs.map(p => ({...p, name: `Super ${p.kg}kg`})),
        price: superPkgs.reduce((s,p) => s+p.price*p.qty!, 0)
      });
      res.layers.push('2× Super grain');
      
      const mediumKg = totalM2 * 1 * sys.padlo!.medium.kgPerM2;
      const mediumPkgs = optimizeByKg(mediumKg, sys.padlo!.medium.options);
      res.items.push({
        cat: 'Medium grain (1 réteg)',
        pkgs: mediumPkgs.map(p => ({...p, name: `Medium ${p.kg}kg`})),
        price: mediumPkgs.reduce((s,p) => s+p.price*p.qty!, 0)
      });
      res.layers.push('1× Medium grain');
    }

    // EFFECTO PU
    if (system === 'effectoPU') {
      const puTotals: Record<string, number> = { big: 0, medium: 0, small: 0 };
      
      surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
        const surfaceM2 = parseFloat(surface.area);
        
        (['big','medium','small'] as const).forEach(t => {
          if (surface.puLayers[t] > 0) {
            const mData = sys.mikrocementek![t];
            const kg = surfaceM2 * surface.puLayers[t] * mData.kgPerM2;
            puTotals[t] += kg;
          }
        });
      });
      
      (['big','medium','small'] as const).forEach(t => {
        if (puTotals[t] > 0) {
          const mData = sys.mikrocementek![t];
          const pkgs = optimizeByKg(puTotals[t], sys.mikroOptions![t]);
          
          const totalLayersCount = surfaces
            .filter(s => parseFloat(s.area) > 0)
            .reduce((sum, s) => sum + s.puLayers[t], 0);
          
          res.items.push({
            cat: `${mData.name} (${totalLayersCount} réteg összesen)`,
            pkgs: pkgs.map(p => ({...p, name: `${mData.name} ${p.kg}kg`})),
            price: pkgs.reduce((s,p) => s+p.price*p.qty!, 0)
          });
          res.layers.push(`${totalLayersCount}× ${mData.name}`);
        }
      });
    }

    // POOL
    if (system === 'pool') {
      const xxlKg = totalM2 * 2 * sys.mikrocementek!.xxl.kgPerM2;
      const xxlPieces = Math.ceil(xxlKg / sys.mikrocementek!.xxl.options[0].kg!);
      res.items.push({
        cat: 'Aquaciment XXL (2 réteg)',
        pkgs: [{...sys.mikrocementek!.xxl.options[0], qty: xxlPieces, name: 'Aquaciment XXL 18kg'}],
        price: sys.mikrocementek!.xxl.options[0].price * xxlPieces
      });
      res.layers.push('2× XXL');
      
      const xlKg = totalM2 * 1 * sys.mikrocementek!.xl.kgPerM2;
      const xlPieces = Math.ceil(xlKg / sys.mikrocementek!.xl.options[0].kg!);
      res.items.push({
        cat: 'Aquaciment XL (1 réteg)',
        pkgs: [{...sys.mikrocementek!.xl.options[0], qty: xlPieces, name: 'Aquaciment XL 18kg'}],
        price: sys.mikrocementek!.xl.options[0].price * xlPieces
      });
      res.layers.push('1× XL');
      
      const xxlLiters = xxlKg * sys.bkomponens!.xxl.literPerKg;
      const xxlBPkgs = optimizeByLiters(xxlLiters, sys.bkomponens!.xxl.options);
      
      const xlLiters = xlKg * sys.bkomponens!.xl.literPerKg;
      const xlBPkgs = optimizeByLiters(xlLiters, sys.bkomponens!.xl.options);
      
      const bPkgs = [
        ...xxlBPkgs.map(p => ({...p, name: `B komp XXL ${p.liters}L`})),
        ...xlBPkgs.map(p => ({...p, name: `B komp XL ${p.liters}L`}))
      ];
      
      res.items.push({
        cat: 'B komponens',
        pkgs: bPkgs,
        price: bPkgs.reduce((s,p) => s+p.price*p.qty!, 0)
      });
    }

    // Lakk - felületenkénti számítás, majd összesítés típusonként
    const lakkTotals: Record<string, number> = {};
    
    surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
      const surfaceM2 = parseFloat(surface.area);
      const lakkType = surface.lakk;
      
      if (!lakkTotals[lakkType]) {
        lakkTotals[lakkType] = 0;
      }
      lakkTotals[lakkType] += surfaceM2;
    });
    
    Object.keys(lakkTotals).forEach(lakkType => {
      const lakkData = sys.lakkok[lakkType];
      const m2 = lakkTotals[lakkType] * 2;
      const lakkPkgs = optimizeByM2(m2, lakkData.options);
      
      res.items.push({
        cat: `${lakkData.name} (2 réteg) - ${(m2/2).toFixed(1)} m²`,
        pkgs: lakkPkgs.map(p => ({
          ...p, 
          name: `${lakkData.name} ${p.liters || ''}L`
        })),
        price: lakkPkgs.reduce((s,p) => s+p.price*p.qty!, 0)
      });
      res.layers.push(`2× ${lakkData.name} (${(m2/2).toFixed(1)} m²)`);
    });

    res.total = res.items.reduce((s,i) => s+i.price, 0);
    setResult(res);
  };

  const resetCalc = () => {
    setSurfaces([{ 
      id: 1, 
      area: '',
      alapozo: '',
      lakk: '',
      layers: { xl: 0, l: 0, m: 0, s: 0 },
      puLayers: { big: 0, medium: 0, small: 0 }
    }]);
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Mikrocement Kalkulátor
            </h1>
            {result && (
              <button
                onClick={resetCalc}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-semibold text-gray-700"
              >
                Új
              </button>
            )}
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-1">Hibák:</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-red-700 text-sm">{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-5">
            {/* Rendszer választás */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Mikrocement Rendszer
              </label>
              <select
                value={system}
                onChange={(e) => {
                  setSystem(e.target.value as MikrocementSystem);
                  setSurfaces([{ 
                    id: 1, 
                    area: '',
                    alapozo: '',
                    lakk: '',
                    layers: { xl: 0, l: 0, m: 0, s: 0 },
                    puLayers: { big: 0, medium: 0, small: 0 }
                  }]);
                  setResult(null);
                  setErrors([]);
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition text-gray-900 font-medium bg-white"
              >
                <option value="natture">Natture</option>
                <option value="effectoQuartz">Effecto Quartz</option>
                <option value="effectoPU">Effecto PU</option>
                <option value="pool">Pool</option>
              </select>
            </div>

            {/* Dinamikus Felületek */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Lefedendő Területek
              </label>
              
              <div className="space-y-4">
                {surfaces.map((surface, index) => (
                  <div key={surface.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    {/* Felület terület */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700 w-24">
                            Felület {index + 1}:
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10000"
                            value={surface.area}
                            onChange={(e) => updateSurface(surface.id, 'area', e.target.value)}
                            className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition text-gray-900 font-semibold bg-white"
                            placeholder="pl. 50"
                          />
                          <span className="text-sm text-gray-700 font-medium">m²</span>
                        </div>
                      </div>
                      
                      {surfaces.length > 1 && (
                        <button
                          onClick={() => removeSurface(surface.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition font-bold"
                          title="Felület törlése"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Alapozó választás */}
                    {parseFloat(surface.area) > 0 && (
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Alapozó (1 réteg):
                        </label>
                        <select 
                          value={surface.alapozo} 
                          onChange={(e) => updateSurface(surface.id, 'alapozo', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition text-gray-900 font-medium bg-white"
                        >
                          <option value="">Válassz alapozót...</option>
                          {Object.keys(sys.alapozok).map(k => (
                            <option key={k} value={k}>{sys.alapozok[k].name}</option>
                          ))}
                        </select>
                        {surface.alapozo && sys.alapozok[surface.alapozo].info && (
                          <p className="mt-1 text-xs text-gray-500">
                            {sys.alapozok[surface.alapozo].info}
                          </p>
                        )}
                      </div>
                    )}

                    {/* NATTURE rétegválasztók */}
                    {system === 'natture' && parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Mikrocement rétegek (összesen 3 kell):
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {(['xl','l','m','s'] as const).map(t => (
                            <div key={t} className="bg-white p-2 rounded-lg border border-gray-200">
                              <label className="block text-xs font-medium mb-1 text-gray-700">
                                {sys.mikrocementek![t].name.replace('Natture ', '')}
                              </label>
                              <select
                                value={surface.layers[t]}
                                onChange={(e)=>updateSurfaceLayers(surface.id, t, parseInt(e.target.value))}
                                className="w-full p-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 font-medium bg-white"
                              >
                                {[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          Összesen: {surface.layers.xl + surface.layers.l + surface.layers.m + surface.layers.s} / 3 réteg
                        </p>
                      </div>
                    )}

                    {/* EFFECTO PU rétegválasztók */}
                    {system === 'effectoPU' && parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Mikrocement rétegek (összesen 3 kell):
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['big','medium','small'] as const).map(t => (
                            <div key={t} className="bg-white p-2 rounded-lg border border-gray-200">
                              <label className="block text-xs font-medium mb-1 text-gray-700">
                                {sys.mikrocementek![t].name.replace('PU ', '')}
                              </label>
                              <select
                                value={surface.puLayers[t]}
                                onChange={(e)=>updateSurfacePuLayers(surface.id, t, parseInt(e.target.value))}
                                className="w-full p-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 font-medium bg-white"
                              >
                                {[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          Összesen: {surface.puLayers.big + surface.puLayers.medium + surface.puLayers.small} / 3 réteg
                        </p>
                      </div>
                    )}

                    {/* Lakk választás */}
                    {parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Lakk (2 réteg):
                        </label>
                        <select 
                          value={surface.lakk} 
                          onChange={(e) => updateSurface(surface.id, 'lakk', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition text-gray-900 font-medium bg-white"
                        >
                          <option value="">Válassz lakkot...</option>
                          {Object.keys(sys.lakkok).map(k => (
                            <option key={k} value={k}>{sys.lakkok[k].name}</option>
                          ))}
                        </select>
                        {surface.lakk && sys.lakkok[surface.lakk].info && (
                          <p className="mt-1 text-xs text-gray-500">
                            {sys.lakkok[surface.lakk].info}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* + Felület gomb */}
                <button
                  onClick={addSurface}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition font-semibold"
                >
                  <span className="text-xl">+</span>
                  <span>Felület hozzáadása</span>
                </button>
              </div>

              {/* Összesítés */}
              {getTotalArea() > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Összes terület: {getTotalArea().toFixed(1)} m²
                  </p>
                </div>
              )}
            </div>

            {/* Számolás gomb */}
            <button
              onClick={calc}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Kalkuláció Készítése
            </button>

            {/* Eredmények */}
            {result && (
              <div className="mt-6 space-y-4">
                {/* Felületek összesítése */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-lg mb-2 text-purple-900">Felületek</h3>
                  <div className="space-y-1 text-sm">
                    {result.surfaces.map((s, i) => (
                      <div key={i} className="flex justify-between">
                        <span>Felület {i + 1}:</span>
                        <span className="font-semibold">{s.area} m²</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-purple-300">
                      <span className="font-bold">Összesen:</span>
                      <span className="font-bold text-purple-700">{result.totalM2.toFixed(1)} m²</span>
                    </div>
                  </div>
                </div>

                {/* Rétegrend */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                  <h3 className="font-bold text-lg mb-3 text-blue-900">
                    Rétegrend
                  </h3>
                  <div className="space-y-2">
                    {result.layers.map((l,i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i+1}
                        </span>
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anyagszükséglet */}
                <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">
                    Anyagszükséglet és Árak
                  </h3>
                  <div className="space-y-4">
                    {result.items.map((item,idx) => (
                      <div key={idx} className="pb-4 border-b last:border-0 border-gray-300">
                        <h4 className="font-semibold mb-2 text-gray-800">{item.cat}</h4>
                        <div className="space-y-1">
                          {item.pkgs.map((pkg,i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-700">
                              <span>
                                {pkg.qty}× {pkg.name}
                              </span>
                              <span className="font-medium">
                                {(pkg.price*pkg.qty!).toLocaleString('hu-HU')} Ft
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-300 text-sm">
                          <span className="text-gray-600">Részösszeg:</span>
                          <span className="text-indigo-600">{item.price.toLocaleString('hu-HU')} Ft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Végösszeg */}
                  <div className="mt-5 pt-5 border-t-2 border-gray-400">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">VÉGÖSSZEG:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {result.total.toLocaleString('hu-HU')} Ft
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Az árak tartalmazzák az ÁFÁ-t. Munkadíj nem szerepel a kalkulációban.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Topciment Professzionális Mikrocement Rendszerek</p>
          <p className="mt-1">© 2024 - Minden jog fenntartva</p>
        </div>
      </div>
    </div>
  );
}