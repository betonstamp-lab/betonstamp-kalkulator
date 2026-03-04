'use client';

import { useState } from 'react';
import { PRODUCTS } from '@/lib/products';
import { optimizeByM2, optimizeByKg, optimizeByLiters } from '@/lib/utils';
import { MikrocementSystem, Surface, CalculationResult, SurfaceCalculation, SystemProducts } from '@/types';

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
      
      // Alapozó/gyanta
      result.layers.push('1× Arcicem Pool gyanta');
      result.materials.push({
        category: 'Arcicem Pool gyanta',
        items: [{ name: 'Arcicem Pool 25L', amount: totalM2 / 200, unit: 'db' }]
      });
      
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
      
      // Alapozó
      if (alapozo && sys.alapozok[alapozo]) {
        const alapozoData = sys.alapozok[alapozo];
        const alapozoOption = alapozoData.options[0];
        
        // Rétegrendhez hozzáadjuk
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
      
      // Háló (mindig, 3% ráhagyással) - KÖZVETLENÜL AZ ALAPOZÓ UTÁN
      const haloM2 = totalM2 * 1.03;
      result.layers.push('1× Háló');
      result.materials.push({
        category: 'Háló',
        items: [{ name: 'Háló 50gr', amount: haloM2, unit: 'm2' }]
      });
      
      // Rétegek számítása
      const totalLayers = surface.layers.xl + surface.layers.l + surface.layers.m + surface.layers.s;
      if (totalLayers === 0) return result;
      
      // Minden réteg típushoz
      (['xl', 'l', 'm', 's'] as const).forEach(mikroType => {
        if (surface.layers[mikroType] > 0) {
          const mikroName = mikroType.toUpperCase();
          const layerCount = surface.layers[mikroType];
          
          // Rétegrendhez hozzáadjuk a teljes névvel
          result.layers.push(`${layerCount}× Natture ${mikroName}`);
          
          // Mikrocement kg
          const mikroData = sys.mikrocementek![mikroType];
          const mikroKg = totalM2 * layerCount * mikroData.kgPerM2;
          result.materials.push({
            category: `Natture ${mikroName}`,
            items: [{ name: mikroData.name, amount: mikroKg, unit: 'kg' }]
          });
          
          // Gyanta - EGYSÉGES KATEGÓRIA!
          const gyantaliter = mikroKg * mikroData.literPerKg!;
          result.materials.push({
            category: 'Acricem gyanta',
            items: [{ name: 'Acricem gyanta', amount: gyantaliter, unit: 'L' }]
          });
        }
      });
      
      // PreSealer (ha ONE Coat vagy Dragon) - 2 RÉTEG!
      const lakkData = sys.lakkok[lakk];
      if (lakkData.needPresealer) {
        const preM2 = totalM2 * 2; // 2 réteg
        result.layers.push('2× PreSealer');
        result.materials.push({
          category: 'PreSealer',
          items: [{ name: 'PreSealer', amount: preM2, unit: 'm2' }]
        });
      }
      
      // Lakk - MINDIG 2 RÉTEG!
      const lakkM2 = totalM2 * 2; // 2 réteg minden lakknál
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
      const surfaceType = surface.surfaceType || 'padlo'; // padlo vagy fal
      
      if (!lakk) return result;
      
      // Alapozó - hozzáadjuk a rétegrendhez
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
      
      // Mikrocement - Padló vagy Fal
      if (surfaceType === 'padlo') {
        // 2× Super/Medium (vastagabb) + 1× Big/Small (vékonyabb)
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
        // Fal: 2× Big (vastagabb) + 1× Small (vékonyabb)
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
      
      // Lakk - MINDIG 2 RÉTEG! - hozzáadjuk a rétegrendhez
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
      
      // Alapozó - hozzáadjuk a rétegrendhez
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
      
      // Mikrocement - 3 réteg mindig (kgPerM2 már tartalmazza a 3 réteget)
      const totalPuLayers = surface.puLayers.big + surface.puLayers.medium + surface.puLayers.small;
      if (totalPuLayers === 0) return result;
      
      (['big', 'medium', 'small'] as const).forEach(puType => {
        if (surface.puLayers[puType] > 0) {
          const puName = puType.toUpperCase();
          const layerCount = surface.puLayers[puType];
          result.layers.push(`${layerCount}× Efectto PU ${puName}`);
          
          const puData = sys.mikrocementek![puType];
          // kgPerM2 = 3 rétegre, tehát 1 rétegre = kgPerM2 / 3
          const kgPerLayer = puData.kgPerM2 / 3;
          const puKg = totalM2 * layerCount * kgPerLayer;
          
          result.materials.push({
            category: `Efectto PU ${puName}`,
            items: [{ name: puData.name, amount: puKg, unit: 'kg' }]
          });
        }
      });
      
      // Lakk - MINDIG 2 RÉTEG! - hozzáadjuk a rétegrendhez
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
    
    // Összesítés
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
    
    console.log('🔑 AGGREGATED KEYS:', Object.keys(aggregated));
    console.log('📦 AGGREGATED OBJECT:', aggregated);
    
    const res: CalculationResult = {
      items: [],
      total: 0,
      layers: [],
      surfaces: surfaces,
      totalM2: surfaces.reduce((sum, s) => sum + (parseFloat(s.area) || 0), 0)
    };
    
    // Pool - Arcicem Pool alapozó
    if (system === 'pool' && aggregated['Arcicem Pool 25L_db']) {
      const totalDb = Math.ceil(aggregated['Arcicem Pool 25L_db'].amount);
      res.items.push({
        cat: 'Arcicem Pool gyanta (összesített)',
        pkgs: [{ liters: 25, price: 88115, qty: totalDb, name: 'Arcicem Pool 25L' }],
        price: totalDb * 88115
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
          
          // Keressük meg melyik alapozó neve egyezik
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
    
    // NATTURE - Gyanta (EGYSÉGES, TELJES MENNYISÉG)
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
    
    // EFFECTO PU - Alapozó (JAVÍTOTT - undefined check hozzáadva!)
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

    // Anyagok összegyűjtése kategóriánként
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
              
              // Ellenőrizzük, hogy kg vagy liter alapú az alapozó
              const isKgBased = firstOption.kg !== undefined;
              
              const pkgs = isKgBased
                ? optimizeByKg(mat.amount * (firstOption.kg! / firstOption.m2!), alapozoData.options)
                : optimizeByM2(mat.amount, alapozoData.options);
              
              const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
              
              if (isKgBased) {
                // Primapox 100 Barrier - kg alapú
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
                // Primacem ABS/Plusz/Grip - liter alapú
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
        
        // Literben számolunk maradékot
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
          
          // Literben számolunk maradékot
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
              
              // Ellenőrizzük, hogy kg vagy liter alapú az alapozó
              const isKgBased = firstOption.kg !== undefined;
              
              const pkgs = isKgBased
                ? optimizeByKg(mat.amount * (firstOption.kg! / firstOption.m2!), alapozoData.options)
                : optimizeByM2(mat.amount, alapozoData.options);
              
              const price = pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0);
              
              if (isKgBased) {
                // Primapox 100 Barrier - kg alapú
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
                // Primacem ABS/Plusz/Grip - liter alapú
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

      // Padló mikrocementek
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

      // Fal mikrocementek
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

      // Lakkok
      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (lakkData && materialsByCategory[lakkData.name]) {
          const mat = materialsByCategory[lakkData.name];
          const pkgs = optimizeByM2(mat.amount, lakkData.options);
          
          // Literben számolunk maradékot
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
              const pkgs = mat.unit === 'm2' 
                ? optimizeByM2(mat.amount, alapozoData.options)
                : optimizeByKg(mat.amount, alapozoData.options);
              
              // Literben számolunk maradékot
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

      // Mikrocementek
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

      // Lakkok
      Object.keys(sys.lakkok).forEach(lakkKey => {
        const lakkData = sys.lakkok[lakkKey];
        if (lakkData && materialsByCategory[lakkData.name]) {
          const mat = materialsByCategory[lakkData.name];
          const pkgs = optimizeByM2(mat.amount, lakkData.options);
          
          // Literben számolunk maradékot
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
      // Pool-nak egyszerűbb logika kell
      if (materialsByCategory['Arcicem Pool gyanta']) {
        const mat = materialsByCategory['Arcicem Pool gyanta'];
        const needed = mat.amount;
        const qty = Math.ceil(needed);
        const got = qty;
        const price = qty * 88115;
        
        items.push({
          cat: 'Arcicem Pool gyanta',
          pkgs: [{ liters: 25, price: 88115, qty, name: 'Arcicem Pool 25L' }],
          price,
          needed: needed * 25, // literben
          got: got * 25, // literben
          leftover: (got - needed) * 25,
          unit: 'L'
        });
        total += price;
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
        // B komponens külön XXL és XL
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
    
    // Minden rendszer ugyanazt a logikát használja
    const surfaceCalculations: SurfaceCalculation[] = [];
    surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
      const surfaceResult = calculateSurface(surface, sys);
      console.log('📊 Surface Result:', surfaceResult);
      surfaceCalculations.push(surfaceResult);
    });
    
    console.log('📦 All Surface Calculations:', surfaceCalculations);
    
    // Felületenkénti optimalizálás
    const surfaceResults = surfaceCalculations.map((sc, idx) => {
      const optimized = optimizeSurfaceMaterials(sc, sys);
      return {
        surfaceId: idx + 1,
        area: sc.area,
        layers: sc.layers,
        ...optimized
      };
    });
    
    // Összesített optimalizálás (az eredeti aggregateResults)
    const aggregatedResult = aggregateResults(surfaceCalculations, sys);
    
    console.log('✅ Aggregated Result:', aggregatedResult);
    console.log('🎯 Layers:', aggregatedResult.layers);
    
    // Rétegrend: minden felület külön, minden réteg új sorban
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
    
    console.log('🎯 Final Layers:', aggregatedResult.layers);
    console.log('📊 Surface Results:', surfaceResults);
    
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
  };

  return (
    <div className="min-h-screen bg-[#eeeeee] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          {/* Logo Banner */}
          <div className="flex justify-center items-center gap-10 mb-1 pb-1 border-b border-gray-200 -mt-4 py-0">
            <img 
              src="/images/logo1.png" 
              alt="BetonStamp" 
              className="h-16 md:h-20 object-contain"
            />
            <img 
              src="/images/tlogo2.png" 
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
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
              >
                <option value="natture">Natture</option>
                <option value="effectoQuartz">Efectto Quartz</option>
                <option value="effectoPU">Efectto PU</option>
                <option value="pool">Pool</option>
              </select>
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
                        <select 
                          value={surface.alapozo} 
                          onChange={(e) => updateSurface(surface.id, 'alapozo', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
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
                                ✓ 2 réteg Big grain (vastagabb)
                              </p>
                              <p className="text-xs text-brand-800">
                                ✓ 1 réteg Small grain (vékonyabb)
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
                                ✓ 2 réteg Super grain (vastagabb)
                              </p>
                              <p className="text-xs text-brand-800">
                                ✓ 1 réteg Medium grain (vékonyabb)
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
                              <label className="block text-xs font-medium mb-1 text-gray-700">
                                {t === 'big' ? 'Big grain' : t === 'medium' ? 'Medium grain' : 'Small grain'}
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
                        <select 
                          value={surface.lakk} 
                          onChange={(e) => updateSurface(surface.id, 'lakk', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
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
                        // Ha ez egy felület cím (tartalmazza a "Felület" szót és "m²"-t)
                        if (l.includes('Felület') && l.includes('m²')) {
                          layerCounter = 0; // Újrakezdjük a számozást
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
                    
                    {/* Fejléc - rejtett mobilon */}
                    <div className="hidden md:flex justify-end gap-2 mb-2 text-xs font-semibold text-gray-500 border-b pb-2">
                      <span className="w-28 text-right">Kiszerelés szerint</span>
                      <span className="w-28 text-right">Anyagszükséglet szerint</span>
                    </div>
                    
                    <div className="space-y-4">
                      {result.items.map((item, idx) => {
                        // Maradék érték kiszámítása az összesített maradékból
                        let leftoverValue = 0;
                        if (result.surfaceResults) {
                          result.surfaceResults.forEach((sr: any) => {
                            sr.items.forEach((srItem: any) => {
                              const srCatClean = srItem.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '').replace(' (összesített)', '');
                              const itemCatClean = item.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '').replace(' (összesített)', '');
                              
                              if (srCatClean === itemCatClean || itemCatClean.includes(srCatClean) || srCatClean.includes(itemCatClean)) {
                                // Egységár számítása: csomag ár / csomag mennyiség
                                if (srItem.pkgs && srItem.pkgs.length > 0 && srItem.leftover > 0) {
                                  const pkg = srItem.pkgs[0];
                                  const pkgSize = pkg.liters || pkg.kg || pkg.m2 || 1;
                                  const unitPrice = pkg.price / pkgSize;
                                  leftoverValue += srItem.leftover * unitPrice;
                                }
                              }
                            });
                          });
                        }
                        
                        const nettoPrice = item.price - leftoverValue;
                        
                        return (
                          <div key={idx} className="pb-4 border-b last:border-0 border-gray-300">
                            <h4 className="font-semibold mb-2 text-gray-800">{item.cat}</h4>
                            <div className="space-y-1">
                              {item.pkgs.map((pkg, i) => (
                                <div key={i} className="flex justify-between text-sm text-gray-700">
                                  <span className="flex-1 min-w-0 pr-2">
                                    {pkg.qty}× {pkg.name}
                                  </span>
                                  <span className="font-medium whitespace-nowrap">
                                    {(pkg.price * pkg.qty!).toLocaleString('hu-HU')} Ft
                                  </span>
                                </div>
                              ))}
                            </div>
                            {/* Részösszeg - mobilon egymás alatt, desktopon egymás mellett */}
                            <div className="mt-2 pt-2 border-t border-gray-300 text-sm">
                              <div className="flex justify-between font-semibold">
                                <span className="text-gray-600">Kiszerelés szerint:</span>
                                <span className="text-brand-600">{item.price.toLocaleString('hu-HU')} Ft</span>
                              </div>
                              <div className="flex justify-between font-semibold mt-1">
                                <span className="text-gray-600">Anyagszükséglet szerint:</span>
                                <span className="text-green-600">{Math.round(nettoPrice).toLocaleString('hu-HU')} Ft</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-5 border-t-2 border-gray-400">
                    {/* Végösszeg - mobilon egymás alatt */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <span className="text-xl font-bold text-gray-800">VÉGÖSSZEG:</span>
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
                                result.surfaceResults.forEach((sr: any) => {
                                  sr.items.forEach((srItem: any) => {
                                    if (srItem.pkgs && srItem.pkgs.length > 0 && srItem.leftover > 0) {
                                      const pkg = srItem.pkgs[0];
                                      const pkgSize = pkg.liters || pkg.kg || pkg.m2 || 1;
                                      const unitPrice = pkg.price / pkgSize;
                                      totalLeftoverValue += srItem.leftover * unitPrice;
                                    }
                                  });
                                });
                              }
                              return Math.round(result.total - totalLeftoverValue).toLocaleString('hu-HU');
                            })()} Ft
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Az árak tartalmazzák az ÁFÁ-t. Munkadíj nem szerepel a kalkulációban. Az anyagszükséglet szerinti ár a maradék anyag értékének levonásával számolt.
                    </p>
                  </div>
                </div>

                {/* Maradék anyagok szekció - csak összesített */}
                {result.surfaceResults && result.surfaceResults.some((sr: any) => sr.items.some((item: any) => item.leftover > 0.01)) && (
                  <div className="bg-gradient-to-r from-brand-50 to-brand-50 p-5 rounded-xl border-2 border-brand-200">
                    <h3 className="font-bold text-lg mb-3 text-brand-900">
                      Maradék anyagok
                    </h3>
                    <div className="space-y-1">
                      {(() => {
                        const totalLeftovers: Record<string, { amount: number; unit: string; order: number }> = {};
                        
                        // Kategória sorrend meghatározása
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
                          'TOP PRO (lassú kötésű)', 'TOP PRO (gyors kötésű)'
                        ];
                        
                        // Összesített szükséglet kiszámítása (összes felület együtt)
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
                        
                        // Az összesített csomagokból számoljuk a maradékot
                        result.items.forEach((item: any) => {
                          const catClean = item.cat.replace(' (1 réteg)', '').replace(' (2 réteg)', '').replace(' (összesített)', '');
                          
                          // Megkeressük a megfelelő szükségletet
                          let neededAmount = 0;
                          let unit = '';
                          Object.entries(totalNeeded).forEach(([name, data]) => {
                            if (catClean.includes(name) || name.includes(catClean)) {
                              neededAmount = data.amount;
                              unit = data.unit;
                            }
                          });
                          
                          // Kapott mennyiség a csomagokból
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
                        
                        // Rendezés kategória sorrend szerint
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