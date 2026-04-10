'use client';

import { useState } from 'react';
import { PRODUCTS } from '@/lib/calculators/mikrocement/products';
import { optimizeByM2, optimizeByKg, optimizeByLiters } from '@/lib/shared/utils';
import { SHOPRENTER_SKUS, COMPANION_PRODUCTS } from '@/lib/shared/shoprenterskus';
import { MikrocementSystem, Surface, CalculationResult, SurfaceCalculation, SystemProducts } from '@/types';

const Tooltip = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="relative inline-block ml-1">
      <span 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-4 h-4 inline-flex items-center justify-center text-[10px] font-bold bg-brand-50 text-brand-800 rounded-full cursor-help hover:bg-brand-100 transition border border-brand-300"
      >?</span>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 leading-relaxed">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </>
      )}
    </div>
  );
};

const TooltipSelect = ({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (val: string) => void;
  options: { key: string; name: string; tooltip?: string }[];
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [tooltipReady, setTooltipReady] = useState(false);
  const selectedLabel = options.find(o => o.key === value)?.name || '';

  const handleTooltipClick = (e: React.MouseEvent | React.TouchEvent, text: string) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    if (activeTooltip?.text === text) {
      setActiveTooltip(null);
      setTooltipReady(false);
    } else {
      setActiveTooltip({ text, x: rect.left - 270, y: rect.top - 10 });
      setTooltipReady(false);
      setTimeout(() => setTooltipReady(true), 300);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white text-left flex items-center justify-between"
      >
        <span className={value ? '' : 'text-gray-400'}>{value ? selectedLabel : placeholder}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setActiveTooltip(null); setTooltipReady(false); }} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            <div
              onClick={() => { onChange(''); setOpen(false); setActiveTooltip(null); setTooltipReady(false); }}
              className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              {placeholder}
            </div>
            {options.map(opt => (
              <div
                key={opt.key}
                onClick={() => { if (!activeTooltip) { onChange(opt.key); setOpen(false); } setActiveTooltip(null); setTooltipReady(false); }}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-1 ${
                  value === opt.key ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{opt.name}</span>
                {opt.tooltip && (
                  <span
                    className="w-4 h-4 inline-flex items-center justify-center text-[10px] font-bold bg-brand-50 text-brand-800 rounded-full cursor-help hover:bg-brand-100 transition border border-brand-300 flex-shrink-0"
                    onClick={(e) => handleTooltipClick(e, opt.tooltip!)}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setActiveTooltip({ text: opt.tooltip!, x: rect.left - 270, y: rect.top - 10 });
                      }
                    }}
                    onMouseLeave={() => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        setActiveTooltip(null);
                      }
                    }}
                  >?</span>
                )}
              </div>
            ))}
          </div>
          {activeTooltip && (
            <>
              {tooltipReady && (
                <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); setTooltipReady(false); }} />
              )}
              <div
                className="fixed left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-72 bottom-20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 p-4 bg-gray-800 text-white text-sm rounded-lg shadow-xl leading-relaxed z-[9999]"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); setTooltipReady(false); }}
              >
                {activeTooltip.text}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default function Calculator({ profile }: { profile?: { role?: string; partner_discount?: number; name?: string } | null }) {
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
  const [partnerQtyOverrides, setPartnerQtyOverrides] = useState<Record<string, number>>({});

  const isPartner = profile?.role === 'partner';
  const discountPercent = profile?.partner_discount || 0;
  const discountMultiplier = 1 - discountPercent / 100;
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // Csomagnév → SKU kulcs konverzió
  const getSkuKey = (pkgName: string): string => {
    // "Natture L 20kg" → "Natture L_20kg"
    // "Háló 50gr 50m²" → "Háló 50gr_50m2"
    const lastSpace = pkgName.lastIndexOf(' ');
    if (lastSpace === -1) return pkgName;
    const name = pkgName.substring(0, lastSpace);
    const size = pkgName.substring(lastSpace + 1).replace('m²', 'm2');
    return `${name}_${size}`;
  };

  // Kosárba tétel
  const handleAddToCart = async () => {
    if (!result) return;
    
    setCartLoading(true);
    setCartError(null);

    // Termékek összegyűjtése SKU-kkal
    const cartItems: Array<{ sku: string; qty: number; name: string }> = [];
    const missingSkuItems: string[] = [];

    result.items.forEach((item, idx) => {
      item.pkgs.forEach((pkg, i) => {
        const key = `${idx}_${i}`;
        const effectiveQty = isPartner && partnerQtyOverrides[key] !== undefined 
          ? partnerQtyOverrides[key] 
          : (pkg.qty || 0);
        
        if (effectiveQty <= 0) return;

        const skuKey = getSkuKey(pkg.name || '');
        const sku = SHOPRENTER_SKUS[skuKey] || '';

        if (sku) {
          cartItems.push({ sku, qty: effectiveQty, name: pkg.name || '' });
          
          // Kétkomponensű termék: B komponens automatikus hozzáadása
          const companionKey = COMPANION_PRODUCTS[skuKey];
          if (companionKey) {
            const companionSku = SHOPRENTER_SKUS[companionKey] || '';
            if (companionSku) {
              cartItems.push({ sku: companionSku, qty: effectiveQty, name: `B komp. (${pkg.name})` });
            }
          }
        } else {
          missingSkuItems.push(`${effectiveQty}× ${pkg.name}`);
        }
      });
    });

    if (cartItems.length === 0) {
      setCartError('Egyik termék sem elérhető még a webshopban.');
      setCartLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/shoprenter/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json();

      if (data.redirectUrl) {
        // Átirányítás a Shoprenter webshopra
        window.open(data.redirectUrl, '_blank');
      } else {
        setCartError('Nem sikerült a kosár létrehozása.');
      }
    } catch (err: any) {
      setCartError('Hiba történt a kosárba helyezés során.');
    }

    setCartLoading(false);
  };

  const sys = PRODUCTS[system];

  const getTotalArea = () => {
    return surfaces.reduce((sum, s) => sum + (parseFloat(s.area) || 0), 0);
  };

  const addSurface = () => {
    const newId = Math.max(...surfaces.map(s => s.id), 0) + 1;
    const alapozokKeys = Object.keys(sys.alapozok);
    const defaultAlapozo = alapozokKeys.length === 1 ? alapozokKeys[0] : '';
    setSurfaces([...surfaces, {
      id: newId,
      area: '',
      alapozo: defaultAlapozo,
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

  // Egy felület számítása
  const calculateSurface = (
    surface: Surface,
    sys: SystemProducts
  ): SurfaceCalculation => {
    const result: SurfaceCalculation = {
      surfaceId: surface.id,
      area: parseFloat(surface.area) || 0,
      system: system,
      layers: [],
      materials: []
    };

    // POOL RENDSZER
    if (system === 'pool') {
      const totalM2 = result.area;
      
      const alapozoData = sys.alapozok.arcicem;
      if (alapozoData) {
        result.layers.push(`1× ${alapozoData.name}`);
        result.materials.push({
          category: 'Alapozó',
          items: [{ name: alapozoData.name, amount: totalM2, unit: 'm2' }]
        });
      }
      
      const xxlKg = totalM2 * sys.mikrocementek!.xxl.kgPerM2;
      result.layers.push('2× Aquaciment XXL');
      result.materials.push({
        category: 'Aquaciment XXL',
        items: [{ name: 'Aquaciment XXL 18kg', amount: xxlKg, unit: 'kg' }]
      });
      
      const xlKg = totalM2 * sys.mikrocementek!.xl.kgPerM2;
      result.layers.push('1× Aquaciment XL');
      result.materials.push({
        category: 'Aquaciment XL',
        items: [{ name: 'Aquaciment XL 18kg', amount: xlKg, unit: 'kg' }]
      });
      
      const xxlLiters = xxlKg * 0.3086;
      const xlLiters = xlKg * 0.408;
      result.materials.push({
        category: 'B komponens',
        items: [
          { name: 'B komp XXL', amount: xxlLiters, unit: 'L' },
          { name: 'B komp XL', amount: xlLiters, unit: 'L' }
        ]
      });
      
      const lakkM2 = totalM2 * 2;
      const lakkLiters = lakkM2 * 0.06;
      result.layers.push('2× Topsealer WT Pool');
      result.materials.push({
        category: 'Topsealer WT Pool',
        items: [{ name: 'Topsealer WT Pool 5L', amount: lakkLiters, unit: 'L' }]
      });
    }
    
    // NATTURE RENDSZER
    if (system === 'natture') {
      const totalM2 = result.area;
      const lakk = surface.lakk;
      const alapozo = surface.alapozo;
      
      if (!lakk) return result;
      
      if (alapozo && sys.alapozok[alapozo]) {
        const alapozoData = sys.alapozok[alapozo];
        const alapozoOption = alapozoData.options[0];
        
        result.layers.push(`1× ${alapozoData.name}`);
        
        if (alapozoOption.m2) {
          result.materials.push({
            category: 'Alapozó',
            items: [{ name: alapozoData.name, amount: totalM2, unit: 'm2' }]
          });
        } else if (alapozoOption.kg) {
          const kgPerM2 = alapozoOption.kg / alapozoOption.m2!;
          const kgNeeded = totalM2 * kgPerM2;
          result.materials.push({
            category: 'Alapozó',
            items: [{ name: alapozoData.name, amount: kgNeeded, unit: 'kg' }]
          });
        }
      }
      
      const haloM2 = totalM2 * 1.03;
      result.layers.push('1× Háló');
      result.materials.push({
        category: 'Háló',
        items: [{ name: 'Háló 50gr', amount: haloM2, unit: 'm2' }]
      });
      
      const totalLayers = surface.layers.xl + surface.layers.l + surface.layers.m + surface.layers.s;
      if (totalLayers === 0) return result;
      
      (['xl', 'l', 'm', 's'] as const).forEach(mikroType => {
        if (surface.layers[mikroType] > 0) {
          const mikroName = mikroType.toUpperCase();
          const layerCount = surface.layers[mikroType];
          
          result.layers.push(`${layerCount}× Natture ${mikroName}`);
          
          const mikroData = sys.mikrocementek![mikroType];
          const mikroKg = totalM2 * layerCount * mikroData.kgPerM2;
          result.materials.push({
            category: `Natture ${mikroName}`,
            items: [{ name: mikroData.name, amount: mikroKg, unit: 'kg' }]
          });
          
          const gyantaliter = mikroKg * mikroData.literPerKg!;
          result.materials.push({
            category: 'Acricem gyanta',
            items: [{ name: 'Acricem gyanta', amount: gyantaliter, unit: 'L' }]
          });
        }
      });
      
      const lakkData = sys.lakkok[lakk];
      if (lakkData.needPresealer) {
        const preM2 = totalM2 * 2;
        result.layers.push('2× PreSealer');
        result.materials.push({
          category: 'PreSealer',
          items: [{ name: 'PreSealer', amount: preM2, unit: 'm2' }]
        });
      }
      
      const lakkM2 = totalM2 * 2;
      result.layers.push(`2× ${lakkData.name}`);
      result.materials.push({
        category: lakkData.name,
        items: [{ name: lakkData.name, amount: lakkM2, unit: 'm2' }]
      });
    }
    
    // EFFECTO QUARTZ RENDSZER
    if (system === 'effectoQuartz') {
      const totalM2 = result.area;
      const lakk = surface.lakk;
      const alapozo = surface.alapozo;
      const surfaceType = surface.surfaceType || 'padlo';
      
      if (!lakk) return result;
      
      if (alapozo && sys.alapozok[alapozo]) {
        const alapozoData = sys.alapozok[alapozo];
        result.layers.push(`1× ${alapozoData.name}`);
        
        const alapozoOption = alapozoData.options[0];
        
        if (alapozoOption.m2) {
          result.materials.push({
            category: 'Alapozó',
            items: [{ name: alapozoData.name, amount: totalM2, unit: 'm2' }]
          });
        } else if (alapozoOption.kg) {
          const kgPerM2 = alapozoOption.kg / alapozoOption.m2!;
          const kgNeeded = totalM2 * kgPerM2;
          result.materials.push({
            category: 'Alapozó',
            items: [{ name: alapozoData.name, amount: kgNeeded, unit: 'kg' }]
          });
        }
      }
      
      if (surfaceType === 'padlo') {
        const vastagabb = surface.quartzPadloVastagabb || 'super';
        const vekonyabb = surface.quartzPadloVekonyabb || 'medium';
        
        const vastagabbData = sys.padlo![vastagabb];
        const vekonyabbData = sys.padlo![vekonyabb];
        
        const vastagabbKg = totalM2 * 2 * vastagabbData.kgPerM2;
        const vekonyabbKg = totalM2 * 1 * vekonyabbData.kgPerM2;
        
        result.layers.push(`2× ${vastagabbData.name}`, `1× ${vekonyabbData.name}`);
        
        result.materials.push({
          category: vastagabbData.name,
          items: [{ name: vastagabbData.name, amount: vastagabbKg, unit: 'kg' }]
        });
        
        result.materials.push({
          category: vekonyabbData.name,
          items: [{ name: vekonyabbData.name, amount: vekonyabbKg, unit: 'kg' }]
        });
      } else {
        const vastagabb = surface.quartzFalVastagabb || 'big';
        const vekonyabb = surface.quartzFalVekonyabb || 'small';
        
        const vastagabbData = sys.fal![vastagabb];
        const vekonyabbData = sys.fal![vekonyabb];
        
        const vastagabbKg = totalM2 * 2 * vastagabbData.kgPerM2;
        const vekonyabbKg = totalM2 * 1 * vekonyabbData.kgPerM2;
        
        result.layers.push(`2× ${vastagabbData.name}`, `1× ${vekonyabbData.name}`);
        
        result.materials.push({
          category: vastagabbData.name,
          items: [{ name: vastagabbData.name, amount: vastagabbKg, unit: 'kg' }]
        });
        
        result.materials.push({
          category: vekonyabbData.name,
          items: [{ name: vekonyabbData.name, amount: vekonyabbKg, unit: 'kg' }]
        });
      }
      
      const lakkData = sys.lakkok[lakk];
      result.layers.push(`2× ${lakkData.name}`);
      
      const lakkM2 = totalM2 * 2;
      result.materials.push({
        category: lakkData.name,
        items: [{ name: lakkData.name, amount: lakkM2, unit: 'm2' }]
      });
    }
    
    // EFFECTO PU RENDSZER
    if (system === 'effectoPU') {
      const totalM2 = result.area;
      const lakk = surface.lakk;
      const alapozo = surface.alapozo;
      
      if (!lakk) return result;
      
      if (alapozo && sys.alapozok[alapozo]) {
        const alapozoData = sys.alapozok[alapozo];
        result.layers.push(`1× ${alapozoData.name}`);
        
        const alapozoOption = alapozoData.options[0];
        
        if (alapozoOption.m2) {
          result.materials.push({
            category: 'Alapozó',
            items: [{ name: alapozoData.name, amount: totalM2, unit: 'm2' }]
          });
        } else if (alapozoOption.kg) {
          const kgPerM2 = alapozoOption.kg / alapozoOption.m2!;
          const kgNeeded = totalM2 * kgPerM2;
          result.materials.push({
            category: 'Alapozó',
            items: [{ name: alapozoData.name, amount: kgNeeded, unit: 'kg' }]
          });
        }
      }
      
      const totalPuLayers = surface.puLayers.big + surface.puLayers.medium + surface.puLayers.small;
      if (totalPuLayers === 0) return result;
      
      (['big', 'medium', 'small'] as const).forEach(puType => {
        if (surface.puLayers[puType] > 0) {
          const puName = puType.toUpperCase();
          const layerCount = surface.puLayers[puType];
          result.layers.push(`${layerCount}× Efectto PU ${puName}`);
          
          const puData = sys.mikrocementek![puType];
          const kgPerLayer = puData.kgPerM2 / 3;
          const puKg = totalM2 * layerCount * kgPerLayer;
          
          result.materials.push({
            category: `Efectto PU ${puName}`,
            items: [{ name: puData.name, amount: puKg, unit: 'kg' }]
          });
        }
      });
      
      const lakkData = sys.lakkok[lakk];
      result.layers.push(`2× ${lakkData.name}`);
      
      const lakkM2 = totalM2 * 2;
      result.materials.push({
        category: lakkData.name,
        items: [{ name: lakkData.name, amount: lakkM2, unit: 'm2' }]
      });
    }
    
    return result;
  };

  // Anyagok összesítése és optimalizálása
  const aggregateResults = (
    surfaceCalculations: SurfaceCalculation[],
    sys: SystemProducts
  ): CalculationResult => {
    const aggregated: Record<string, { amount: number; unit: string; category: string }> = {};
    
    surfaceCalculations.forEach(surf => {
      surf.materials.forEach(mat => {
        mat.items.forEach(item => {
          const key = `${item.name}_${item.unit}`;
          if (!aggregated[key]) {
            aggregated[key] = { amount: 0, unit: item.unit, category: mat.category };
          }
          aggregated[key].amount += item.amount;
        });
      });
    });
    
    console.log('🔍 AGGREGATED KEYS:', Object.keys(aggregated));
    console.log('📋 AGGREGATED OBJECT:', aggregated);
    
    const res: CalculationResult = {
      items: [],
      total: 0,
      layers: [],
      surfaces: surfaces,
      totalM2: surfaces.reduce((sum, s) => sum + (parseFloat(s.area) || 0), 0)
    };
    
    // Pool - Arcicem Pool alapozó
    if (system === 'pool') {
      Object.keys(aggregated).forEach(key => {
        if (key.includes('Arcicem')) {
          const name = key.substring(0, key.lastIndexOf('_'));
          const totalAmount = aggregated[key].amount;

          const alapozoKey = Object.keys(sys.alapozok).find(k => {
            const alapozo = sys.alapozok[k];
            return alapozo && alapozo.name === name;
          });

          if (alapozoKey) {
            const alapozoData = sys.alapozok[alapozoKey];
            if (!alapozoData || !alapozoData.options) return;

            const pkgs = optimizeByM2(totalAmount, alapozoData.options);

            res.items.push({
              cat: `${alapozoData.name} (1 réteg)`,
              pkgs: pkgs.map(p => ({
                ...p,
                name: `${alapozoData.name} ${p.liters}L`,
                qty: p.qty || 0
              })),
              price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
            });
          }
        }
      });
    }
    
    if (system === 'pool' && aggregated['Aquaciment XXL 18kg_kg']) {
      const totalKg = aggregated['Aquaciment XXL 18kg_kg'].amount;
      const pieces = Math.ceil(totalKg / 18);
      res.items.push({
        cat: 'Aquaciment XXL (összesített)',
        pkgs: [{ kg: 18, price: 32480, qty: pieces, name: 'Aquaciment XXL 18kg' }],
        price: pieces * 32480
      });
    }
    
    if (system === 'pool' && aggregated['Aquaciment XL 18kg_kg']) {
      const totalKg = aggregated['Aquaciment XL 18kg_kg'].amount;
      const pieces = Math.ceil(totalKg / 18);
      res.items.push({
        cat: 'Aquaciment XL (összesített)',
        pkgs: [{ kg: 18, price: 42660, qty: pieces, name: 'Aquaciment XL 18kg' }],
        price: pieces * 42660
      });
    }
    
    if (system === 'pool' && aggregated['B komp XXL_L']) {
      const totalLiters = aggregated['B komp XXL_L'].amount;
      const pieces25L = Math.ceil(totalLiters / 25);
      res.items.push({
        cat: 'B komponens XXL (összesített)',
        pkgs: [{ liters: 25, price: 88115, qty: pieces25L, name: 'B komp XXL 25L' }],
        price: pieces25L * 88115
      });
    }
    
    if (system === 'pool' && aggregated['B komp XL_L']) {
      const totalLiters = aggregated['B komp XL_L'].amount;
      const pieces25L = Math.ceil(totalLiters / 25);
      res.items.push({
        cat: 'B komponens XL (összesített)',
        pkgs: [{ liters: 25, price: 88030, qty: pieces25L, name: 'B komp XL 25L' }],
        price: pieces25L * 88030
      });
    }
    
    if (system === 'pool' && aggregated['Topsealer WT Pool 5L_L']) {
      const totalLiters = aggregated['Topsealer WT Pool 5L_L'].amount;
      const pieces = Math.ceil(totalLiters / 5);
      res.items.push({
        cat: 'Topsealer WT Pool (összesített)',
        pkgs: [{ liters: 5, price: 76650, qty: pieces, name: 'Topsealer WT Pool 5L' }],
        price: pieces * 76650
      });
    }
    
    // NATTURE - Alapozó
    if (system === 'natture') {
      Object.keys(aggregated).forEach(key => {
        if ((key.includes('Primacem') || key.includes('Primapox') || key.includes('Grip')) && !key.includes('gyanta')) {
          const [name, unit] = key.split('_');
          const totalAmount = aggregated[key].amount;
          
          const alapozoKey = Object.keys(sys.alapozok).find(k => {
            const alapozo = sys.alapozok[k];
            return alapozo && alapozo.name === name;
          });
          
          if (alapozoKey) {
            const alapozoData = sys.alapozok[alapozoKey];
            if (!alapozoData || !alapozoData.options) return;
            
            const pkgs = unit === 'm2' 
              ? optimizeByM2(totalAmount, alapozoData.options)
              : optimizeByKg(totalAmount, alapozoData.options);
            
            res.items.push({
              cat: `${name} (1 réteg)`,
              pkgs: pkgs.map(p => ({ 
                ...p, 
                name: `${name} ${p.liters || p.kg}${p.liters ? 'L' : 'kg'}`, 
                qty: p.qty || 0 
              })),
              price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
            });
          }
        }
      });
    }
    
    // NATTURE - Mikrocement (XL, L, M, S)
    (['XL', 'L', 'M', 'S'] as const).forEach(type => {
      const key = `Natture ${type}`;
      const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(key) && !k.includes('gyanta'));
      
      if (matchingKeys.length > 0 && system === 'natture') {
        const totalKg = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
        const mikroType = type.toLowerCase() as 'xl' | 'l' | 'm' | 's';
        const mikroOptions = sys.mikroOptions![mikroType];
        const pkgs = optimizeByKg(totalKg, mikroOptions);
        
        res.items.push({
          cat: `Natture ${type} (összesített)`,
          pkgs: pkgs.map(p => ({ ...p, name: `Natture ${type} ${p.kg}kg`, qty: p.qty || 0 })),
          price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
        });
      }
    });
    
    // NATTURE - Gyanta
    if (system === 'natture' && aggregated['Acricem gyanta_L']) {
      const totalLiters = aggregated['Acricem gyanta_L'].amount;
      const gPkgs = optimizeByLiters(totalLiters, sys.gyanta!);
      
      res.items.push({
        cat: 'Acricem gyanta (összesített)',
        pkgs: gPkgs.map(p => ({ ...p, name: `Acricem gyanta ${p.liters}L`, qty: p.qty || 0 })),
        price: gPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
      });
    }
    
    // NATTURE - Háló
    if (system === 'natture' && aggregated['Háló 50gr_m2']) {
      const totalM2 = aggregated['Háló 50gr_m2'].amount;
      const haloPkgs = optimizeByM2(totalM2, sys.halo!);
      
      res.items.push({
        cat: 'Háló (összesített)',
        pkgs: haloPkgs.map(p => ({ ...p, name: `Háló 50gr ${p.m2}m²`, qty: p.qty || 0 })),
        price: haloPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
      });
    }
    
    // NATTURE - PreSealer
    if (system === 'natture' && aggregated['PreSealer_m2']) {
      const totalM2 = aggregated['PreSealer_m2'].amount;
      const prePkgs = optimizeByM2(totalM2, sys.presealer!);
      
      res.items.push({
        cat: 'PreSealer (2 réteg)',
        pkgs: prePkgs.map(p => ({ ...p, name: `PreSealer ${p.liters}L`, qty: p.qty || 0 })),
        price: prePkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
      });
    }
    
    // NATTURE - Lakkok
    if (system === 'natture') {
      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (!lakkData || !lakkData.name || !lakkData.options) return;
        
        const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(lakkData.name));
        
        if (matchingKeys.length > 0) {
          const totalM2 = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
          const lakkPkgs = optimizeByM2(totalM2, lakkData.options);
          
          res.items.push({
            cat: `${lakkData.name} (2 réteg)`,
            pkgs: lakkPkgs.map(p => ({ ...p, name: `${lakkData.name} ${p.liters}L`, qty: p.qty || 0 })),
            price: lakkPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
          });
        }
      });
    }
    
    // EFFECTO QUARTZ - Alapozó
    if (system === 'effectoQuartz') {
      Object.keys(aggregated).forEach(key => {
        if ((key.includes('Primacem') || key.includes('Primapox') || key.includes('Grip')) && !key.includes('gyanta')) {
          const [name, unit] = key.split('_');
          const totalAmount = aggregated[key].amount;
          
          const alapozoKey = Object.keys(sys.alapozok).find(k => {
            const alapozo = sys.alapozok[k];
            return alapozo && alapozo.name === name;
          });
          
          if (alapozoKey) {
            const alapozoData = sys.alapozok[alapozoKey];
            if (!alapozoData || !alapozoData.options) return;
            
            const pkgs = unit === 'm2' 
              ? optimizeByM2(totalAmount, alapozoData.options)
              : optimizeByKg(totalAmount, alapozoData.options);
            
            res.items.push({
              cat: `${name} (1 réteg)`,
              pkgs: pkgs.map(p => ({ 
                ...p, 
                name: `${name} ${p.liters || p.kg}${p.liters ? 'L' : 'kg'}`, 
                qty: p.qty || 0 
              })),
              price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
            });
          }
        }
      });
    }
    
    // EFFECTO QUARTZ - Padló mikrocementek
    if (system === 'effectoQuartz' && sys.padlo) {
      (['super', 'medium'] as const).forEach(padloType => {
        const padloData = sys.padlo![padloType];
        if (!padloData || !padloData.name || !padloData.options) return;
        
        const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(padloData.name));
        
        if (matchingKeys.length > 0) {
          const totalKg = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
          const pkgs = optimizeByKg(totalKg, padloData.options);
          
          res.items.push({
            cat: `${padloData.name} (összesített)`,
            pkgs: pkgs.map(p => ({ ...p, name: `${padloData.name} ${p.kg}kg`, qty: p.qty || 0 })),
            price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
          });
        }
      });
    }
    
    // EFFECTO QUARTZ - Fal mikrocementek
    if (system === 'effectoQuartz' && sys.fal) {
      (['big', 'small'] as const).forEach(falType => {
        const falData = sys.fal![falType];
        if (!falData || !falData.name || !falData.options) return;
        
        const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(falData.name));
        
        if (matchingKeys.length > 0) {
          const totalKg = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
          const pkgs = optimizeByKg(totalKg, falData.options);
          
          res.items.push({
            cat: `${falData.name} (összesített)`,
            pkgs: pkgs.map(p => ({ ...p, name: `${falData.name} ${p.kg}kg`, qty: p.qty || 0 })),
            price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
          });
        }
      });
    }
    
    // EFFECTO QUARTZ - Lakkok
    if (system === 'effectoQuartz') {
      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (!lakkData || !lakkData.name || !lakkData.options) return;
        
        const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(lakkData.name));
        
        if (matchingKeys.length > 0) {
          const totalM2 = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
          const lakkPkgs = optimizeByM2(totalM2, lakkData.options);
          
          res.items.push({
            cat: `${lakkData.name} (2 réteg)`,
            pkgs: lakkPkgs.map(p => ({ ...p, name: `${lakkData.name} ${p.liters}L`, qty: p.qty || 0 })),
            price: lakkPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
          });
        }
      });
    }
    
    // EFFECTO PU - Alapozó
    if (system === 'effectoPU') {
      Object.keys(aggregated).forEach(key => {
        if ((key.includes('Primacem') || key.includes('Primapox') || key.includes('Grip')) && !key.includes('gyanta')) {
          const [name, unit] = key.split('_');
          const totalAmount = aggregated[key].amount;
          
          const alapozoKey = Object.keys(sys.alapozok).find(k => {
            const alapozo = sys.alapozok[k];
            return alapozo && alapozo.name === name;
          });
          
          if (alapozoKey) {
            const alapozoData = sys.alapozok[alapozoKey];
            if (!alapozoData || !alapozoData.options) return;
            
            const pkgs = unit === 'm2' 
              ? optimizeByM2(totalAmount, alapozoData.options)
              : optimizeByKg(totalAmount, alapozoData.options);
            
            res.items.push({
              cat: `${name} (1 réteg)`,
              pkgs: pkgs.map(p => ({ 
                ...p, 
                name: `${name} ${p.liters || p.kg}${p.liters ? 'L' : 'kg'}`, 
                qty: p.qty || 0 
              })),
              price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
            });
          }
        }
      });
    }
    
    // EFECTTO PU - Mikrocementek
    if (system === 'effectoPU') {
      (['big', 'medium', 'small'] as const).forEach(puType => {
        const puData = sys.mikrocementek![puType];
        if (!puData || !puData.name) return;
        
        const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(puData.name));
        
        if (matchingKeys.length > 0) {
          const totalKg = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
          const puOptions = sys.mikroOptions![puType];
          if (!puOptions) return;
          
          const pkgs = optimizeByKg(totalKg, puOptions);
          
          res.items.push({
            cat: `${puData.name} (összesített)`,
            pkgs: pkgs.map(p => ({ ...p, name: `${puData.name} ${p.kg}kg`, qty: p.qty || 0 })),
            price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
          });
        }
      });
    }
    
    // EFFECTO PU - Lakkok
    if (system === 'effectoPU') {
      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (!lakkData || !lakkData.name || !lakkData.options) return;
        
        const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(lakkData.name));
        
        if (matchingKeys.length > 0) {
          const totalM2 = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
          const lakkPkgs = optimizeByM2(totalM2, lakkData.options);
          
          res.items.push({
            cat: `${lakkData.name} (2 réteg)`,
            pkgs: lakkPkgs.map(p => ({ ...p, name: `${lakkData.name} ${p.liters}L`, qty: p.qty || 0 })),
            price: lakkPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
          });
        }
      });
    }
    
    res.total = res.items.reduce((sum, item) => sum + item.price, 0);
    
    return res;
  };

  // Egy felület anyagainak optimalizálása maradékkal
  const optimizeSurfaceMaterials = (
    surfaceCalc: SurfaceCalculation,
    sys: SystemProducts
  ): { items: Array<{ cat: string; pkgs: any[]; price: number; needed: number; got: number; leftover: number; unit: string }>; total: number } => {
    const items: Array<{ cat: string; pkgs: any[]; price: number; needed: number; got: number; leftover: number; unit: string }> = [];
    let total = 0;

    const materialsByCategory: Record<string, { amount: number; unit: string; name: string }> = {};
    
    surfaceCalc.materials.forEach(mat => {
      mat.items.forEach(item => {
        const key = mat.category;
        if (!materialsByCategory[key]) {
          materialsByCategory[key] = { amount: 0, unit: item.unit, name: item.name };
        }
        materialsByCategory[key].amount += item.amount;
      });
    });

    // NATTURE rendszer
    if (system === 'natture') {
      // Alapozó
      Object.keys(materialsByCategory).forEach(cat => {
        if (cat === 'Alapozó') {
          const mat = materialsByCategory[cat];
          const alapozoKey = Object.keys(sys.alapozok).find(k => {
            const a = sys.alapozok[k];
            return a && a.name === mat.name;
          });
          
          if (alapozoKey) {
            const alapozoData = sys.alapozok[alapozoKey];
            if (alapozoData && alapozoData.options) {
              const firstOption = alapozoData.options[0];
              
              const isKgBased = firstOption.kg !== undefined;
              
              const pkgs = isKgBased
                ? optimizeByKg(mat.amount * (firstOption.kg! / firstOption.m2!), alapozoData.options)
                : optimizeByM2(mat.amount, alapozoData.options);
              
              const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
              
              if (isKgBased) {
                const gotKg = pkgs.reduce((sum, p) => sum + (p.kg || 0) * (p.qty || 0), 0);
                const kgPerM2 = firstOption.kg! / firstOption.m2!;
                const neededKg = mat.amount * kgPerM2;
                
                items.push({
                  cat: `${mat.name} (1 réteg)`,
                  pkgs: pkgs.map(p => ({ ...p, name: `${mat.name} ${p.kg}kg`, qty: p.qty || 0 })),
                  price,
                  needed: neededKg,
                  got: gotKg,
                  leftover: gotKg - neededKg,
                  unit: 'kg'
                });
              } else {
                const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
                const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
                const neededLiters = mat.amount * litersPerM2;
                
                items.push({
                  cat: `${mat.name} (1 réteg)`,
                  pkgs: pkgs.map(p => ({ ...p, name: `${mat.name} ${p.liters || p.kg}${p.liters ? 'L' : 'kg'}`, qty: p.qty || 0 })),
                  price,
                  needed: neededLiters,
                  got: gotLiters,
                  leftover: gotLiters - neededLiters,
                  unit: 'L'
                });
              }
              total += price;
            }
          }
        }
      });

      // Háló
      if (materialsByCategory['Háló']) {
        const mat = materialsByCategory['Háló'];
        const pkgs = optimizeByM2(mat.amount, sys.halo!);
        const got = pkgs.reduce((sum, p) => sum + (p.m2 || 0) * (p.qty || 0), 0);
        const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
        
        items.push({
          cat: 'Háló',
          pkgs: pkgs.map(p => ({ ...p, name: `Háló 50gr ${p.m2}m²`, qty: p.qty || 0 })),
          price,
          needed: mat.amount,
          got,
          leftover: got - mat.amount,
          unit: 'm²'
        });
        total += price;
      }

      // Mikrocementek
      (['XL', 'L', 'M', 'S'] as const).forEach(type => {
        const catName = `Natture ${type}`;
        if (materialsByCategory[catName]) {
          const mat = materialsByCategory[catName];
          const mikroType = type.toLowerCase() as 'xl' | 'l' | 'm' | 's';
          const pkgs = optimizeByKg(mat.amount, sys.mikroOptions![mikroType]);
          const got = pkgs.reduce((sum, p) => sum + (p.kg || 0) * (p.qty || 0), 0);
          const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
          
          items.push({
            cat: catName,
            pkgs: pkgs.map(p => ({ ...p, name: `Natture ${type} ${p.kg}kg`, qty: p.qty || 0 })),
            price,
            needed: mat.amount,
            got,
            leftover: got - mat.amount,
            unit: 'kg'
          });
          total += price;
        }
      });

      // Gyanta
      if (materialsByCategory['Acricem gyanta']) {
        const mat = materialsByCategory['Acricem gyanta'];
        const pkgs = optimizeByLiters(mat.amount, sys.gyanta!);
        const got = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
        const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
        
        items.push({
          cat: 'Acricem gyanta',
          pkgs: pkgs.map(p => ({ ...p, name: `Acricem gyanta ${p.liters}L`, qty: p.qty || 0 })),
          price,
          needed: mat.amount,
          got,
          leftover: got - mat.amount,
          unit: 'L'
        });
        total += price;
      }

      // PreSealer
      if (materialsByCategory['PreSealer']) {
        const mat = materialsByCategory['PreSealer'];
        const pkgs = optimizeByM2(mat.amount, sys.presealer!);
        
        const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
        const firstOption = sys.presealer![0];
        const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
        const neededLiters = mat.amount * litersPerM2;
        
        const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
        
        items.push({
          cat: 'PreSealer (2 réteg)',
          pkgs: pkgs.map(p => ({ ...p, name: `PreSealer ${p.liters}L`, qty: p.qty || 0 })),
          price,
          needed: neededLiters,
          got: gotLiters,
          leftover: gotLiters - neededLiters,
          unit: 'L'
        });
        total += price;
      }

      // Lakkok
      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (lakkData && materialsByCategory[lakkData.name]) {
          const mat = materialsByCategory[lakkData.name];
          const pkgs = optimizeByM2(mat.amount, lakkData.options);
          
          const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
          const firstOption = lakkData.options[0];
          const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
          const neededLiters = mat.amount * litersPerM2;
          
          const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
          
          items.push({
            cat: `${lakkData.name} (2 réteg)`,
            pkgs: pkgs.map(p => ({ ...p, name: `${lakkData.name} ${p.liters}L`, qty: p.qty || 0 })),
            price,
            needed: neededLiters,
            got: gotLiters,
            leftover: gotLiters - neededLiters,
            unit: 'L'
          });
          total += price;
        }
      });
    }

    // EFECTTO QUARTZ rendszer
    if (system === 'effectoQuartz') {
      Object.keys(materialsByCategory).forEach(cat => {
        if (cat === 'Alapozó') {
          const mat = materialsByCategory[cat];
          const alapozoKey = Object.keys(sys.alapozok).find(k => {
            const a = sys.alapozok[k];
            return a && a.name === mat.name;
          });
          
          if (alapozoKey) {
            const alapozoData = sys.alapozok[alapozoKey];
            if (alapozoData && alapozoData.options) {
              const firstOption = alapozoData.options[0];
              const isKgBased = firstOption.kg !== undefined;
              
              const pkgs = isKgBased
                ? optimizeByKg(mat.amount * (firstOption.kg! / firstOption.m2!), alapozoData.options)
                : optimizeByM2(mat.amount, alapozoData.options);
              
              const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
              
              if (isKgBased) {
                const gotKg = pkgs.reduce((sum, p) => sum + (p.kg || 0) * (p.qty || 0), 0);
                const kgPerM2 = firstOption.kg! / firstOption.m2!;
                const neededKg = mat.amount * kgPerM2;
                
                items.push({
                  cat: `${mat.name} (1 réteg)`,
                  pkgs: pkgs.map(p => ({ ...p, name: `${mat.name} ${p.kg}kg`, qty: p.qty || 0 })),
                  price,
                  needed: neededKg,
                  got: gotKg,
                  leftover: gotKg - neededKg,
                  unit: 'kg'
                });
              } else {
                const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
                const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
                const neededLiters = mat.amount * litersPerM2;
                
                items.push({
                  cat: `${mat.name} (1 réteg)`,
                  pkgs: pkgs.map(p => ({ ...p, name: `${mat.name} ${p.liters || p.kg}${p.liters ? 'L' : 'kg'}`, qty: p.qty || 0 })),
                  price,
                  needed: neededLiters,
                  got: gotLiters,
                  leftover: gotLiters - neededLiters,
                  unit: 'L'
                });
              }
              total += price;
            }
          }
        }
      });

      if (sys.padlo) {
        (['super', 'medium'] as const).forEach(padloType => {
          const padloData = sys.padlo![padloType];
          if (padloData && materialsByCategory[padloData.name]) {
            const mat = materialsByCategory[padloData.name];
            const pkgs = optimizeByKg(mat.amount, padloData.options);
            const got = pkgs.reduce((sum, p) => sum + (p.kg || 0) * (p.qty || 0), 0);
            const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
            
            items.push({
              cat: padloData.name,
              pkgs: pkgs.map(p => ({ ...p, name: `${padloData.name} ${p.kg}kg`, qty: p.qty || 0 })),
              price,
              needed: mat.amount,
              got,
              leftover: got - mat.amount,
              unit: 'kg'
            });
            total += price;
          }
        });
      }

      if (sys.fal) {
        (['big', 'small'] as const).forEach(falType => {
          const falData = sys.fal![falType];
          if (falData && materialsByCategory[falData.name]) {
            const mat = materialsByCategory[falData.name];
            const pkgs = optimizeByKg(mat.amount, falData.options);
            const got = pkgs.reduce((sum, p) => sum + (p.kg || 0) * (p.qty || 0), 0);
            const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
            
            items.push({
              cat: falData.name,
              pkgs: pkgs.map(p => ({ ...p, name: `${falData.name} ${p.kg}kg`, qty: p.qty || 0 })),
              price,
              needed: mat.amount,
              got,
              leftover: got - mat.amount,
              unit: 'kg'
            });
            total += price;
          }
        });
      }

      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (lakkData && materialsByCategory[lakkData.name]) {
          const mat = materialsByCategory[lakkData.name];
          const pkgs = optimizeByM2(mat.amount, lakkData.options);
          
          const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
          const firstOption = lakkData.options[0];
          const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
          const neededLiters = mat.amount * litersPerM2;
          
          const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
          
          items.push({
            cat: `${lakkData.name} (2 réteg)`,
            pkgs: pkgs.map(p => ({ ...p, name: `${lakkData.name} ${p.liters}L`, qty: p.qty || 0 })),
            price,
            needed: neededLiters,
            got: gotLiters,
            leftover: gotLiters - neededLiters,
            unit: 'L'
          });
          total += price;
        }
      });
    }

    // EFECTTO PU rendszer
    if (system === 'effectoPU') {
      Object.keys(materialsByCategory).forEach(cat => {
        if (cat === 'Alapozó') {
          const mat = materialsByCategory[cat];
          const alapozoKey = Object.keys(sys.alapozok).find(k => {
            const a = sys.alapozok[k];
            return a && a.name === mat.name;
          });
          
          if (alapozoKey) {
            const alapozoData = sys.alapozok[alapozoKey];
            if (alapozoData && alapozoData.options) {
              const pkgs = mat.unit === 'm2' 
                ? optimizeByM2(mat.amount, alapozoData.options)
                : optimizeByKg(mat.amount, alapozoData.options);
              
              const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
              const firstOption = alapozoData.options[0];
              const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
              const neededLiters = mat.amount * litersPerM2;
              
              const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
              
              items.push({
                cat: `${mat.name} (1 réteg)`,
                pkgs: pkgs.map(p => ({ ...p, name: `${mat.name} ${p.liters || p.kg}${p.liters ? 'L' : 'kg'}`, qty: p.qty || 0 })),
                price,
                needed: neededLiters,
                got: gotLiters,
                leftover: gotLiters - neededLiters,
                unit: 'L'
              });
              total += price;
            }
          }
        }
      });

      (['big', 'medium', 'small'] as const).forEach(puType => {
        const puData = sys.mikrocementek![puType];
        if (puData && materialsByCategory[`Efectto PU ${puType.toUpperCase()}`]) {
          const mat = materialsByCategory[`Efectto PU ${puType.toUpperCase()}`];
          const pkgs = optimizeByKg(mat.amount, sys.mikroOptions![puType]);
          const got = pkgs.reduce((sum, p) => sum + (p.kg || 0) * (p.qty || 0), 0);
          const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
          
          items.push({
            cat: puData.name,
            pkgs: pkgs.map(p => ({ ...p, name: `${puData.name} ${p.kg}kg`, qty: p.qty || 0 })),
            price,
            needed: mat.amount,
            got,
            leftover: got - mat.amount,
            unit: 'kg'
          });
          total += price;
        }
      });

      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (lakkData && materialsByCategory[lakkData.name]) {
          const mat = materialsByCategory[lakkData.name];
          const pkgs = optimizeByM2(mat.amount, lakkData.options);
          
          const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
          const firstOption = lakkData.options[0];
          const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
          const neededLiters = mat.amount * litersPerM2;
          
          const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
          
          items.push({
            cat: `${lakkData.name} (2 réteg)`,
            pkgs: pkgs.map(p => ({ ...p, name: `${lakkData.name} ${p.liters}L`, qty: p.qty || 0 })),
            price,
            needed: neededLiters,
            got: gotLiters,
            leftover: gotLiters - neededLiters,
            unit: 'L'
          });
          total += price;
        }
      });
    }

    // POOL rendszer
    if (system === 'pool') {
      if (materialsByCategory['Alapozó']) {
        const mat = materialsByCategory['Alapozó'];
        const alapozoKey = Object.keys(sys.alapozok).find(k => {
          const a = sys.alapozok[k];
          return a && a.name === mat.name;
        });

        if (alapozoKey) {
          const alapozoData = sys.alapozok[alapozoKey];
          if (alapozoData && alapozoData.options) {
            const firstOption = alapozoData.options[0];
            const pkgs = optimizeByM2(mat.amount, alapozoData.options);
            const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);

            const gotLiters = pkgs.reduce((sum, p) => sum + (p.liters || 0) * (p.qty || 0), 0);
            const litersPerM2 = firstOption.liters && firstOption.m2 ? firstOption.liters / firstOption.m2 : 0;
            const neededLiters = mat.amount * litersPerM2;

            items.push({
              cat: `${mat.name} (1 réteg)`,
              pkgs: pkgs.map(p => ({ ...p, name: `${mat.name} ${p.liters}L`, qty: p.qty || 0 })),
              price,
              needed: neededLiters,
              got: gotLiters,
              leftover: gotLiters - neededLiters,
              unit: 'L'
            });
            total += price;
          }
        }
      }

      if (materialsByCategory['Aquaciment XXL']) {
        const mat = materialsByCategory['Aquaciment XXL'];
        const qty = Math.ceil(mat.amount / 18);
        const got = qty * 18;
        const price = qty * 32480;
        
        items.push({
          cat: 'Aquaciment XXL',
          pkgs: [{ kg: 18, price: 32480, qty, name: 'Aquaciment XXL 18kg' }],
          price,
          needed: mat.amount,
          got,
          leftover: got - mat.amount,
          unit: 'kg'
        });
        total += price;
      }

      if (materialsByCategory['Aquaciment XL']) {
        const mat = materialsByCategory['Aquaciment XL'];
        const qty = Math.ceil(mat.amount / 18);
        const got = qty * 18;
        const price = qty * 42660;
        
        items.push({
          cat: 'Aquaciment XL',
          pkgs: [{ kg: 18, price: 42660, qty, name: 'Aquaciment XL 18kg' }],
          price,
          needed: mat.amount,
          got,
          leftover: got - mat.amount,
          unit: 'kg'
        });
        total += price;
      }

      if (materialsByCategory['B komponens']) {
        const bItems = surfaceCalc.materials.find(m => m.category === 'B komponens')?.items || [];
        bItems.forEach(item => {
          const qty = Math.ceil(item.amount / 25);
          const got = qty * 25;
          const price = qty * (item.name.includes('XXL') ? 88115 : 88030);
          
          items.push({
            cat: `B komponens ${item.name.includes('XXL') ? 'XXL' : 'XL'}`,
            pkgs: [{ liters: 25, price: item.name.includes('XXL') ? 88115 : 88030, qty, name: `${item.name} 25L` }],
            price,
            needed: item.amount,
            got,
            leftover: got - item.amount,
            unit: 'L'
          });
          total += price;
        });
      }

      if (materialsByCategory['Topsealer WT Pool']) {
        const mat = materialsByCategory['Topsealer WT Pool'];
        const qty = Math.ceil(mat.amount / 5);
        const got = qty * 5;
        const price = qty * 76650;
        
        items.push({
          cat: 'Topsealer WT Pool',
          pkgs: [{ liters: 5, price: 76650, qty, name: 'Topsealer WT Pool 5L' }],
          price,
          needed: mat.amount,
          got,
          leftover: got - mat.amount,
          unit: 'L'
        });
        total += price;
      }
    }

    return { items, total };
  };

  // Fő számítási függvény
  const calc = () => {
    if (!validate()) return;
    
    console.log('🚀🚀🚀 CALC START V5 - System:', system);
    
    const surfaceCalculations: SurfaceCalculation[] = [];
    surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
      const surfaceResult = calculateSurface(surface, sys);
      console.log('📐 Surface Result:', surfaceResult);
      surfaceCalculations.push(surfaceResult);
    });
    
    console.log('📋 All Surface Calculations:', surfaceCalculations);
    
    const surfaceResults = surfaceCalculations.map((sc, idx) => {
      const optimized = optimizeSurfaceMaterials(sc, sys);
      return {
        surfaceId: idx + 1,
        area: sc.area,
        layers: sc.layers,
        ...optimized
      };
    });
    
    const aggregatedResult = aggregateResults(surfaceCalculations, sys);
    
    console.log('✅ Aggregated Result:', aggregatedResult);
    console.log('🎨 Layers:', aggregatedResult.layers);
    
    const allLayers: string[] = [];
    surfaceCalculations.forEach((sc, idx) => {
      if (surfaceCalculations.length > 1) {
        allLayers.push(`Felület ${idx + 1} (${sc.area} m²):`);
      }
      sc.layers.forEach(layer => {
        allLayers.push(layer);
      });
    });
    
    aggregatedResult.layers = allLayers;
    aggregatedResult.surfaceResults = surfaceResults;
    
    console.log('🎨 Final Layers:', aggregatedResult.layers);
    console.log('📐 Surface Results:', surfaceResults);
    
    setPartnerQtyOverrides({});
    setResult(aggregatedResult);
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
    setPartnerQtyOverrides({});
  };

  return (
    <div className="min-h-screen bg-[#eeeeee] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          {/* Logo Banner */}
          <div className="flex justify-center items-center gap-10 mb-1 pb-1 border-b border-gray-200 -mt-4 py-0">
            <img 
              src="/images/betonstamp-logo.png" 
              alt="BetonStamp" 
              className="h-16 md:h-20 object-contain"
            />
            <img 
              src="/images/topciment-logo.png" 
              alt="Topciment Hungary" 
              className="h-20 md:h-28 object-contain"
            />
          </div>

          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Mikrocement Kalkulátor
            </h1>
            {result && (
              <button
                onClick={resetCalc}
                className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-semibold text-gray-700"
              >
                Új
              </button>
            )}
          </div>

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
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Mikrocement Rendszer
              </label>
              <TooltipSelect
                value={system}
                onChange={(val) => {
                  if (!val) return;
                  const newSys = PRODUCTS[val as MikrocementSystem];
                  const alapozokKeys = Object.keys(newSys.alapozok);
                  const defaultAlapozo = alapozokKeys.length === 1 ? alapozokKeys[0] : '';
                  setSystem(val as MikrocementSystem);
                  setSurfaces([{
                    id: 1,
                    area: '',
                    alapozo: defaultAlapozo,
                    lakk: '',
                    layers: { xl: 0, l: 0, m: 0, s: 0 },
                    puLayers: { big: 0, medium: 0, small: 0 }
                  }]);
                  setResult(null);
                  setErrors([]);
                }}
                placeholder="Válassz rendszert..."
                options={[
                  { key: 'natture', name: 'Natture', tooltip: PRODUCTS.natture.tooltip },
                  { key: 'effectoQuartz', name: 'Efectto Quartz', tooltip: PRODUCTS.effectoQuartz.tooltip },
                  { key: 'effectoPU', name: 'Efectto PU', tooltip: PRODUCTS.effectoPU.tooltip },
                  { key: 'pool', name: 'Pool', tooltip: PRODUCTS.pool.tooltip },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Lefedendő Területek
              </label>
              
              <div className="space-y-4">
                {surfaces.map((surface, index) => (
                  <div key={surface.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
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
                            className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-semibold bg-white"
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

                    {parseFloat(surface.area) > 0 && (
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Alapozó (1 réteg):
                        </label>
                        {Object.keys(sys.alapozok).length === 1 ? (
                          <p className="text-sm text-gray-800 font-medium p-2 bg-white border-2 border-gray-200 rounded-lg">
                            {sys.alapozok[Object.keys(sys.alapozok)[0]].name}
                          </p>
                        ) : (
                          <TooltipSelect
                            value={surface.alapozo}
                            onChange={(val) => updateSurface(surface.id, 'alapozo', val)}
                            placeholder="Válassz alapozót..."
                            options={Object.keys(sys.alapozok).map(k => ({
                              key: k,
                              name: sys.alapozok[k].name,
                              tooltip: sys.alapozok[k].tooltip
                            }))}
                          />
                        )}
                        {surface.alapozo && sys.alapozok[surface.alapozo]?.info && (
                          <p className="mt-1 text-xs text-gray-500">
                            {sys.alapozok[surface.alapozo].info}
                          </p>
                        )}
                      </div>
                    )}

                    {system === 'natture' && parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Mikrocement rétegek (összesen 3 kell):
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {(['xl','l','m','s'] as const).map(t => (
                            <div key={t} className="bg-white p-2 rounded-lg border border-gray-200">
                              <label className="block text-xs font-medium mb-1 text-gray-700 flex items-center">
                                {sys.mikrocementek![t].name.replace('Natture ', '')}
                                {sys.mikrocementek![t].tooltip && (
                                  <Tooltip text={sys.mikrocementek![t].tooltip!} />
                                )}
                              </label>
                              <select
                                value={surface.layers[t]}
                                onChange={(e)=>updateSurfaceLayers(surface.id, t, parseInt(e.target.value))}
                                className="w-full p-1 text-sm border border-gray-300 rounded focus:border-brand-500 focus:outline-none text-gray-900 font-medium bg-white"
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

                    {system === 'effectoQuartz' && parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Felület típusa:
                        </p>
                        <select
                          value={surface.surfaceType || 'padlo'}
                          onChange={(e) => updateSurface(surface.id, 'surfaceType', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white mb-3"
                        >
                          <option value="padlo">Padló</option>
                          <option value="fal">Fal</option>
                        </select>

                        {surface.surfaceType === 'fal' ? (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">
                              Fal mikrocementek (automatikusan 2× Big + 1× Small):
                            </p>
                            <div className="bg-brand-50 p-3 rounded-lg">
                              <p className="text-xs text-brand-800">
                                ✔ 2 réteg Big grain (vastagabb)
                              </p>
                              <p className="text-xs text-brand-800">
                                ✔ 1 réteg Small grain (vékonyabb)
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">
                              Padló mikrocementek (automatikusan 2× Super + 1× Medium):
                            </p>
                            <div className="bg-brand-50 p-3 rounded-lg">
                              <p className="text-xs text-brand-800">
                                ✔ 2 réteg Super grain (vastagabb)
                              </p>
                              <p className="text-xs text-brand-800">
                                ✔ 1 réteg Medium grain (vékonyabb)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {system === 'effectoPU' && parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Mikrocement rétegek (összesen 3 kell):
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['big', 'medium', 'small'] as const).map(t => (
                            <div key={t} className="bg-white p-2 rounded-lg border border-gray-200">
                              <label className="block text-xs font-medium mb-1 text-gray-700 flex items-center">
                                {t === 'big' ? 'Big grain' : t === 'medium' ? 'Medium grain' : 'Small grain'}
                                {sys.mikrocementek![t]?.tooltip && (
                                  <Tooltip text={sys.mikrocementek![t].tooltip!} />
                                )}
                              </label>
                              <select
                                value={surface.puLayers[t]}
                                onChange={(e)=>updateSurfacePuLayers(surface.id, t, parseInt(e.target.value))}
                                className="w-full p-1 text-sm border border-gray-300 rounded focus:border-brand-500 focus:outline-none text-gray-900 font-medium bg-white"
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

                    {parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Lakk (2 réteg):
                        </label>
                        <TooltipSelect
                          value={surface.lakk}
                          onChange={(val) => updateSurface(surface.id, 'lakk', val)}
                          placeholder="Válassz lakkot..."
                          options={Object.keys(sys.lakkok).map(k => ({
                            key: k,
                            name: sys.lakkok[k].name,
                            tooltip: sys.lakkok[k].tooltip
                          }))}
                        />
                        {surface.lakk && sys.lakkok[surface.lakk].info && (
                          <p className="mt-1 text-xs text-gray-500">
                            {sys.lakkok[surface.lakk].info}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addSurface}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-brand-400 text-brand-600 hover:bg-brand-50 rounded-xl transition font-semibold"
                >
                  <span className="text-xl">+</span>
                  <span>Felület hozzáadása</span>
                </button>
              </div>

              {getTotalArea() > 0 && (
                <div className="mt-3 p-3 bg-brand-50 rounded-lg">
                  <p className="text-sm font-medium text-brand-800">
                    Összes terület: {getTotalArea().toFixed(1)} m²
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={calc}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-500 hover:from-brand-600 hover:to-brand-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Kalkuláció Készítése
            </button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="bg-gradient-to-r from-brand-50 to-brand-50 p-5 rounded-xl border-2 border-brand-200">
                  <h3 className="font-bold text-lg mb-3 text-brand-900">
                    Rétegrend
                  </h3>
                  <div className="space-y-4">
                    {(() => {
                      const elements: React.ReactNode[] = [];
                      let layerCounter = 0;
                      
                      result.layers.forEach((l, i) => {
                        if (l.includes('Felület') && l.includes('m²')) {
                          layerCounter = 0;
                          elements.push(
                            <div key={`title-${i}`} className={`font-bold text-gray-800 ${i > 0 ? 'mt-4 pt-4 border-t border-brand-200' : ''}`}>
                              {l}
                            </div>
                          );
                        } else {
                          layerCounter++;
                          elements.push(
                            <div key={i} className="flex items-center gap-2 text-gray-700">
                              <span className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {layerCounter}
                              </span>
                              <span>{l}</span>
                            </div>
                          );
                        }
                      });
                      
                      return elements;
                    })()}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">
                    Anyagszükséglet és Árak
                  </h3>
                  
                  {/* Felületenkénti bontás */}
                  {result.surfaceResults && result.surfaceResults.length > 0 && (
                    <div className="space-y-6 mb-6">
                      {result.surfaceResults.map((sr: any, surfIdx: number) => (
                        <div key={surfIdx} className="border-2 border-brand-200 rounded-lg p-4 bg-white">
                          <h4 className="font-bold text-brand-800 mb-3">
                            Felület {sr.surfaceId} ({sr.area} m²)
                          </h4>
                          <div className="space-y-3">
                            {sr.items.map((item: any, idx: number) => (
                              <div key={idx} className="pb-3 border-b last:border-0 border-gray-200">
                                <div className="font-medium text-gray-800 mb-1">{item.cat}</div>
                                <div className="space-y-1">
                                  {item.pkgs.map((pkg: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm text-gray-700">
                                      <span>{pkg.qty}× {pkg.name}</span>
                                      <span className="font-medium">{(pkg.price * pkg.qty).toLocaleString('hu-HU')} Ft</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between font-bold mt-3 pt-3 border-t-2 border-brand-200">
                            <span className="text-gray-700">Felület {sr.surfaceId} végösszeg:</span>
                            <span className="text-brand-600">{sr.total.toLocaleString('hu-HU')} Ft</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Összesített optimalizált anyagszükséglet */}
                  <div className="border-t-2 border-gray-400 pt-4 mt-4">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">
                      Összesített anyagszükséglet (optimalizálva)
                    </h4>
                    
                    <div className="hidden md:flex justify-end gap-2 mb-2 text-xs font-semibold text-gray-500 border-b pb-2">
                   
                    </div>
                    
                    <div className="space-y-4">
                      {result.items.map((item, idx) => {
                        // Maradék érték kiszámítása az ÖSSZESÍTETT csomagokból
                        let leftoverValue = 0;
                        if (result.surfaceResults) {
                          const itemCatClean = item.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '').replace(' (összesített)', '');
                          
                          let totalNeeded = 0;
                          result.surfaceResults.forEach((sr: any) => {
                            sr.items.forEach((srItem: any) => {
                              const srCatClean = srItem.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '');
                              if (srCatClean === itemCatClean || itemCatClean.includes(srCatClean) || srCatClean.includes(itemCatClean)) {
                                totalNeeded += srItem.needed;
                              }
                            });
                          });
                          
                          let gotAmount = 0;
                          if (item.pkgs && item.pkgs.length > 0) {
                            item.pkgs.forEach((pkg: any) => {
                              const pkgSize = pkg.liters || pkg.kg || pkg.m2 || 0;
                              gotAmount += pkgSize * (pkg.qty || 0);
                            });
                          }
                          
                          const leftover = gotAmount - totalNeeded;
                          if (leftover > 0.01 && item.pkgs.length > 0) {
                            const pkg = item.pkgs[0];
                            const pkgSize = pkg.liters || pkg.kg || pkg.m2 || 1;
                            const unitPrice = pkg.price / pkgSize;
                            leftoverValue = leftover * unitPrice;
                          }
                        }
                        
                        const nettoPrice = item.price - leftoverValue;
                        
                        // Partner: módosított mennyiségekkel számolt ár
                        let partnerItemPrice = 0;
                        if (isPartner) {
                          item.pkgs.forEach((pkg, i) => {
                            const key = `${idx}_${i}`;
                            const effectiveQty = partnerQtyOverrides[key] !== undefined ? partnerQtyOverrides[key] : (pkg.qty || 0);
                            partnerItemPrice += pkg.price * effectiveQty;
                          });
                        }
                        
                        return (
                          <div key={idx} className="pb-4 border-b last:border-0 border-gray-300">
                            <h4 className="font-semibold mb-2 text-gray-800">{item.cat}</h4>
                            <div className="space-y-1">
                              {item.pkgs.map((pkg, i) => {
                                const key = `${idx}_${i}`;
                                const effectiveQty = isPartner && partnerQtyOverrides[key] !== undefined ? partnerQtyOverrides[key] : (pkg.qty || 0);
                                
                                return (
                                  <div key={i} className="flex justify-between items-center text-sm text-gray-700">
                                    <span className="flex-1 min-w-0 pr-2 flex items-center gap-1">
                                      {isPartner ? (
                                        <input
                                          type="number"
                                          min="0"
                                          value={effectiveQty}
                                          onChange={(e) => {
                                            const newQty = Math.max(0, parseInt(e.target.value) || 0);
                                            setPartnerQtyOverrides(prev => ({ ...prev, [key]: newQty }));
                                          }}
                                          className="w-12 p-1 text-center border border-green-400 rounded bg-green-50 font-semibold text-green-800 focus:border-green-600 focus:outline-none"
                                        />
                                      ) : (
                                        <span>{effectiveQty}</span>
                                      )}
                                      <span>× {pkg.name}</span>
                                    </span>
                                    <span className="font-medium whitespace-nowrap">
                                      {(pkg.price * effectiveQty).toLocaleString('hu-HU')} Ft
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-300 text-sm">
                              {isPartner ? (
                                <>
                                  <div className="flex justify-between font-semibold">
                                    <span className="text-gray-600">Listaár:</span>
                                    <span className="text-gray-400 line-through">{partnerItemPrice.toLocaleString('hu-HU')} Ft</span>
                                  </div>
                                  <div className="flex justify-between font-semibold mt-1">
                                    <span className="text-green-700">Partneri ár ({discountPercent}% kedvezmény):</span>
                                    <span className="text-green-600 font-bold">{Math.round(partnerItemPrice * discountMultiplier).toLocaleString('hu-HU')} Ft</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between font-semibold">
                                    <span className="text-gray-600">Kiszerelés szerint:</span>
                                    <span className="text-brand-600">{item.price.toLocaleString('hu-HU')} Ft</span>
                                  </div>
                                  <div className="flex justify-between font-semibold mt-1">
                                    <span className="text-gray-600">Anyagszükséglet szerint:</span>
                                    <span className="text-green-600">{Math.round(nettoPrice).toLocaleString('hu-HU')} Ft</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-5 border-t-2 border-gray-400">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <span className="text-xl font-bold text-gray-800">VÉGÖSSZEG:</span>
                      {isPartner ? (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <div className="flex justify-between sm:block sm:text-right">
                            <span className="text-xs text-gray-500 sm:block">Listaár</span>
                            <span className="text-lg sm:text-xl font-bold text-gray-400 line-through">
                              {(() => {
                                let partnerTotal = 0;
                                result.items.forEach((item, idx) => {
                                  item.pkgs.forEach((pkg, i) => {
                                    const key = `${idx}_${i}`;
                                    const effectiveQty = partnerQtyOverrides[key] !== undefined ? partnerQtyOverrides[key] : (pkg.qty || 0);
                                    partnerTotal += pkg.price * effectiveQty;
                                  });
                                });
                                return partnerTotal.toLocaleString('hu-HU');
                              })()} Ft
                            </span>
                          </div>
                          <div className="flex justify-between sm:block sm:text-right">
                            <span className="text-xs text-green-600 sm:block font-semibold">Partneri ár ({discountPercent}%)</span>
                            <span className="text-lg sm:text-xl font-bold text-green-600">
                              {(() => {
                                let partnerTotal = 0;
                                result.items.forEach((item, idx) => {
                                  item.pkgs.forEach((pkg, i) => {
                                    const key = `${idx}_${i}`;
                                    const effectiveQty = partnerQtyOverrides[key] !== undefined ? partnerQtyOverrides[key] : (pkg.qty || 0);
                                    partnerTotal += pkg.price * effectiveQty;
                                  });
                                });
                                return Math.round(partnerTotal * discountMultiplier).toLocaleString('hu-HU');
                              })()} Ft
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <div className="flex justify-between sm:block sm:text-right">
                            <span className="text-xs text-gray-500 sm:block">Kiszerelés szerint</span>
                            <span className="text-lg sm:text-xl font-bold text-brand-600">
                              {result.total.toLocaleString('hu-HU')} Ft
                            </span>
                          </div>
                          <div className="flex justify-between sm:block sm:text-right">
                            <span className="text-xs text-gray-500 sm:block">Anyagszükséglet szerint</span>
                            <span className="text-lg sm:text-xl font-bold text-green-600">
                              {(() => {
                                let totalLeftoverValue = 0;
                                if (result.surfaceResults) {
                                  const totalNeededMap: Record<string, number> = {};
                                  result.surfaceResults.forEach((sr: any) => {
                                    sr.items.forEach((srItem: any) => {
                                      const name = srItem.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '');
                                      if (!totalNeededMap[name]) totalNeededMap[name] = 0;
                                      totalNeededMap[name] += srItem.needed;
                                    });
                                  });
                                  
                                  result.items.forEach((aggItem: any) => {
                                    const catClean = aggItem.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '').replace(' (összesített)', '');
                                    
                                    let neededAmount = 0;
                                    Object.entries(totalNeededMap).forEach(([name, amount]) => {
                                      if (catClean.includes(name) || name.includes(catClean)) {
                                        neededAmount = amount as number;
                                      }
                                    });
                                    
                                    let gotAmount = 0;
                                    if (aggItem.pkgs && aggItem.pkgs.length > 0) {
                                      aggItem.pkgs.forEach((pkg: any) => {
                                        const pkgSize = pkg.liters || pkg.kg || pkg.m2 || 0;
                                        gotAmount += pkgSize * (pkg.qty || 0);
                                      });
                                    }
                                    
                                    const leftover = gotAmount - neededAmount;
                                    if (leftover > 0.01 && aggItem.pkgs.length > 0) {
                                      const pkg = aggItem.pkgs[0];
                                      const pkgSize = pkg.liters || pkg.kg || pkg.m2 || 1;
                                      const unitPrice = pkg.price / pkgSize;
                                      totalLeftoverValue += leftover * unitPrice;
                                    }
                                  });
                                }
                                return Math.round(result.total - totalLeftoverValue).toLocaleString('hu-HU');
                              })()} Ft
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {isPartner 
                        ? 'Az árak tartalmazzák az ÁFÁ-t. Munkadíj nem szerepel a kalkulációban. A mennyiségek szerkeszthetők — ha van raktáron anyagod, csökkentsd a darabszámot.'
                        : 'Az árak tartalmazzák az ÁFÁ-t. Munkadíj nem szerepel a kalkulációban. Az anyagszükséglet szerinti ár a maradék anyag értékének levonásával számolt.'
                      }
                    </p>
                  </div>
                </div>

                {/* Maradék anyagok szekció */}
                {result.surfaceResults && result.surfaceResults.some((sr: any) => sr.items.some((item: any) => item.leftover > 0.01)) && (
                  <div className="bg-gradient-to-r from-brand-50 to-brand-50 p-5 rounded-xl border-2 border-brand-200">
                    <h3 className="font-bold text-lg mb-3 text-brand-900">
                      Maradék anyagok
                    </h3>
                    <div className="space-y-1">
                      {(() => {
                        const totalLeftovers: Record<string, { amount: number; unit: string; order: number }> = {};
                        
                        const categoryOrder = [
                          'Primacem ABS', 'Primacem Plusz', 'Primacem Grip', 'Primapox 100 Barrier',
                          'Háló',
                          'Natture XL', 'Natture L', 'Natture M', 'Natture S',
                          'Super grain', 'Medium grain', 'Big grain', 'Small grain',
                          'Efectto PU BIG', 'Efectto PU MEDIUM', 'Efectto PU SMALL',
                          'Acricem gyanta',
                          'PreSealer',
                          'ONE Coat (matt)', 'ONE Coat (selyemfény)', 'ONE Coat (fényes)',
                          'Dragon (matt)', 'Dragon (selyemfény)', 'Dragon (fényes)',
                          'TOP 100 (matt)', 'TOP 100 (fényes)',
                          'TOP PRO+ (lassú kötésű)', 'TOP PRO+ (gyors kötésű)'
                        ];
                        
                        const totalNeeded: Record<string, { amount: number; unit: string }> = {};
                        result.surfaceResults!.forEach((sr: any) => {
                          sr.items.forEach((item: any) => {
                            const name = item.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '');
                            if (!totalNeeded[name]) {
                              totalNeeded[name] = { amount: 0, unit: item.unit };
                            }
                            totalNeeded[name].amount += item.needed;
                          });
                        });
                        
                        result.items.forEach((item: any) => {
                          const catClean = item.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '').replace(' (összesített)', '');
                          
                          let neededAmount = 0;
                          let unit = '';
                          Object.entries(totalNeeded).forEach(([name, data]) => {
                            if (catClean.includes(name) || name.includes(catClean)) {
                              neededAmount = data.amount;
                              unit = data.unit;
                            }
                          });
                          
                          let gotAmount = 0;
                          if (item.pkgs && item.pkgs.length > 0) {
                            item.pkgs.forEach((pkg: any) => {
                              const pkgSize = pkg.liters || pkg.kg || pkg.m2 || 0;
                              gotAmount += pkgSize * (pkg.qty || 0);
                            });
                          }
                          
                          const leftover = gotAmount - neededAmount;
                          
                          if (leftover > 0.01 && unit) {
                            const orderIndex = categoryOrder.findIndex(c => catClean.includes(c) || c.includes(catClean));
                            totalLeftovers[catClean] = {
                              amount: leftover,
                              unit: unit,
                              order: orderIndex >= 0 ? orderIndex : 999
                            };
                          }
                        });
                        
                        const sortedEntries = Object.entries(totalLeftovers)
                          .sort((a, b) => a[1].order - b[1].order);
                        
                        return sortedEntries.map(([name, data], idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700">
                            <span className="w-2 h-2 bg-brand-600 rounded-full"></span>
                            <span>{name}:</span>
                            <span className="font-semibold text-brand-700">
                              {data.amount.toFixed(2)} {data.unit}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Kosárba teszem gomb */}
                <div className="bg-white p-5 rounded-xl border-2 border-brand-200">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-500 hover:from-brand-600 hover:to-brand-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {cartLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Kosár feltöltése...
                      </span>
                    ) : (
                      'Kosárba teszem'
                    )}
                  </button>
                  
                  {isPartner && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">
                        Fontos: A partneri kedvezmény igénybevételéhez a webshopban is be kell jelentkezned a fiókodba.
                      </p>
                    </div>
                  )}
                  
                  {cartError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{cartError}</p>
                    </div>
                  )}
                  
                  {/* Figyelmeztetés ha vannak hiányzó SKU-k */}
                  {(() => {
                    const missing: string[] = [];
                    result.items.forEach((item, idx) => {
                      item.pkgs.forEach((pkg, i) => {
                        const key = `${idx}_${i}`;
                        const effectiveQty = isPartner && partnerQtyOverrides[key] !== undefined 
                          ? partnerQtyOverrides[key] 
                          : (pkg.qty || 0);
                        if (effectiveQty <= 0) return;
                        const skuKey = getSkuKey(pkg.name || '');
                        if (!SHOPRENTER_SKUS[skuKey]) {
                          missing.push(pkg.name || '');
                        }
                      });
                    });
                    
                    if (missing.length === 0) return null;
                    
                    return (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 mb-1">
                          Az alábbi termékek még nem elérhetők a webshopban:
                        </p>
                        <ul className="text-xs text-yellow-700 space-y-0.5">
                          {missing.map((name, i) => (
                            <li key={i}>• {name}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Topciment Professzionális Mikrocement Rendszerek</p>
          <p className="mt-1">© 2024 - Minden jog fenntartva</p>
        </div>
      </div>
    </div>
  );
}
