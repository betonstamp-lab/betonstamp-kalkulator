'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import {
  STONECEM_FLOOR_COLORS,
  STONECEM_FLOOR_PRICE,
  ARCOCEM_FAST_COLORS,
  ARCOCEM_FAST_KG_PER_BAG,
  ARCOCEM_FAST_KG_PER_M3,
  DESMOCEM_POWDER_COLORS,
  DESMOCEM_POWDER_M2_PER_BUCKET,
  DESMOCEM_LIQUID_PRODUCTS,
  DESMOCEM_LIQUID_M2_PER_5L,
  RELIEF_COLORS,
  RELIEF_PRICE,
  RELIEF_M2_PER_BOX,
  SEALCEM_M70_PRODUCTS,
  SEALCEM_M70_M2_PER_18L_SINGLE_LAYER,
  POLISZAL,
  POLISZAL_KG_PER_M3,
} from '@/lib/calculators/belyegzett-beton/products';

type Technology = 'felkemenyit' | 'pigment';
type Separator = 'por' | 'folyekony';
type LakkType = 'normal' | 'antislip';
type Thickness = 10 | 15;

interface Surface {
  id: number;
  technology: Technology;
  area: string; // input string
  thickness: Thickness;
  concretePrice: string; // input string
  colorKey: string;
  separator: Separator;
  powderColorKey: string;
  reliefs: Record<string, number>;
  lakkType: LakkType;
  result: SurfaceResult | null;
}

function isSurfaceValid(s: Surface): boolean {
  const area = parseFloat(s.area);
  const concretePrice = parseFloat(s.concretePrice);
  if (isNaN(area) || area <= 0) return false;
  if (isNaN(concretePrice) || concretePrice < 0) return false;
  if (!s.colorKey) return false;
  if (s.separator === 'por' && !s.powderColorKey) return false;
  return true;
}

interface LineItem {
  name: string;
  sku: string;
  units: number;
  unitSize: string;
  pricePerUnit: number;
  totalPrice: number;
  partnerEligible: boolean; // -10% alkalmazható?
  inCart: boolean; // kosárba rakható-e
}

interface SurfaceResult {
  surfaceId: number;
  concreteLine: LineItem | null; // beton, külön (nem partneri)
  poliszalLine: LineItem | null; // partneri
  stampLines: LineItem[]; // hardener/pigment + separator + relief + lakk
  reliefCoverageM2: number; // választott relief lefedettség
  concreteSubtotal: number;
  suppliesNet: number; // poliszal + stampLines nettó
  totalNet: number; // minden
  totalGross: number;
  totalPartner?: number;
}

const formatFt = (n: number) => `${Math.round(n).toLocaleString('hu-HU')} Ft`;

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
          <div className="fixed left-4 right-4 bottom-4 p-4 bg-gray-800 text-white text-sm rounded-lg shadow-xl z-50 leading-relaxed sm:absolute sm:left-1/2 sm:right-auto sm:bottom-full sm:top-auto sm:mb-2 sm:w-64 sm:-translate-x-1/2 sm:text-xs sm:p-3">
            {text.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
            <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </>
      )}
    </div>
  );
};

function optimize18LAnd5L(litersNeeded: number): { large18L: number; small5L: number } {
  if (litersNeeded <= 0) return { large18L: 0, small5L: 0 };
  const large18L = Math.floor(litersNeeded / 18);
  const remaining = litersNeeded - large18L * 18;
  let small5L = remaining > 0 ? Math.ceil(remaining / 5) : 0;
  if (small5L * 5 >= 18) {
    return { large18L: large18L + 1, small5L: 0 };
  }
  return { large18L, small5L };
}

function createEmptySurface(id: number): Surface {
  return {
    id,
    technology: 'felkemenyit',
    area: '',
    thickness: 10,
    concretePrice: '',
    colorKey: '',
    separator: 'por',
    powderColorKey: '',
    reliefs: {},
    lakkType: 'normal',
    result: null,
  };
}

function calculateSurface(s: Surface): SurfaceResult | null {
  const area = parseFloat(s.area);
  const concretePrice = parseFloat(s.concretePrice);
  if (isNaN(area) || area <= 0) return null;
  if (isNaN(concretePrice) || concretePrice < 0) return null;
  if (!s.colorKey) return null;
  if (s.separator === 'por' && !s.powderColorKey) return null;

  // --- Betonozás ---
  const rawM3 = area * (s.thickness / 100) * 1.1;
  const roundedM3 = Math.ceil(rawM3 * 4) / 4;
  const concreteSubtotal = roundedM3 * concretePrice;

  const concreteLine: LineItem = {
    name: 'Beton',
    sku: '',
    units: roundedM3,
    unitSize: 'm³',
    pricePerUnit: concretePrice,
    totalPrice: concreteSubtotal,
    partnerEligible: false,
    inCart: false,
  };

  // Poliszál
  const poliszalKgPerM3 = POLISZAL_KG_PER_M3[s.thickness] ?? 2;
  const poliszalKg = Math.ceil(roundedM3 * poliszalKgPerM3);
  const poliszalLine: LineItem = {
    name: POLISZAL.name,
    sku: POLISZAL.sku,
    units: poliszalKg,
    unitSize: `${POLISZAL.kgPerPack} kg`,
    pricePerUnit: POLISZAL.price,
    totalPrice: poliszalKg * POLISZAL.price,
    partnerEligible: true,
    inCart: true,
  };

  // --- Bélyegzéshez ---
  const stampLines: LineItem[] = [];

  // Szín (hardener vagy pigment)
  if (s.technology === 'felkemenyit') {
    const color = STONECEM_FLOOR_COLORS.find(c => c.key === s.colorKey);
    if (!color) return null;
    const buckets = Math.ceil(area / color.m2PerBucket);
    stampLines.push({
      name: `Stonecem Floor ${color.name}`,
      sku: color.sku,
      units: buckets,
      unitSize: '25 kg',
      pricePerUnit: STONECEM_FLOOR_PRICE,
      totalPrice: buckets * STONECEM_FLOOR_PRICE,
      partnerEligible: true,
      inCart: true,
    });
  } else {
    const color = ARCOCEM_FAST_COLORS.find(c => c.key === s.colorKey);
    if (!color) return null;
    const pigmentKg = roundedM3 * ARCOCEM_FAST_KG_PER_M3;
    const bags = Math.ceil(pigmentKg / ARCOCEM_FAST_KG_PER_BAG);
    stampLines.push({
      name: `Arcocem Fast ${color.name}`,
      sku: color.sku,
      units: bags,
      unitSize: '5 kg',
      pricePerUnit: color.price,
      totalPrice: bags * color.price,
      partnerEligible: true,
      inCart: true,
    });
  }

  // Leválasztó
  if (s.separator === 'por') {
    const color = DESMOCEM_POWDER_COLORS.find(c => c.key === s.powderColorKey);
    if (!color) return null;
    const buckets = Math.ceil(area / DESMOCEM_POWDER_M2_PER_BUCKET);
    stampLines.push({
      name: `Desmocem Powder ${color.name}`,
      sku: color.sku,
      units: buckets,
      unitSize: '10 kg',
      pricePerUnit: color.price,
      totalPrice: buckets * color.price,
      partnerEligible: true,
      inCart: true,
    });
  } else {
    const litersNeeded = (area / DESMOCEM_LIQUID_M2_PER_5L) * 5;
    const { large18L, small5L } = optimize18LAnd5L(litersNeeded);
    if (large18L > 0) {
      stampLines.push({
        name: DESMOCEM_LIQUID_PRODUCTS.large.name,
        sku: DESMOCEM_LIQUID_PRODUCTS.large.sku,
        units: large18L,
        unitSize: '18 L',
        pricePerUnit: DESMOCEM_LIQUID_PRODUCTS.large.price,
        totalPrice: large18L * DESMOCEM_LIQUID_PRODUCTS.large.price,
        partnerEligible: true,
        inCart: true,
      });
    }
    if (small5L > 0) {
      stampLines.push({
        name: DESMOCEM_LIQUID_PRODUCTS.small.name,
        sku: DESMOCEM_LIQUID_PRODUCTS.small.sku,
        units: small5L,
        unitSize: '5 L',
        pricePerUnit: DESMOCEM_LIQUID_PRODUCTS.small.price,
        totalPrice: small5L * DESMOCEM_LIQUID_PRODUCTS.small.price,
        partnerEligible: true,
        inCart: true,
      });
    }
  }

  // Relief (csak folyékony esetén)
  let reliefCoverageM2 = 0;
  if (s.separator === 'folyekony') {
    for (const [key, qty] of Object.entries(s.reliefs)) {
      if (qty > 0) {
        const color = RELIEF_COLORS.find(c => c.key === key);
        if (!color) continue;
        reliefCoverageM2 += qty * RELIEF_M2_PER_BOX;
        stampLines.push({
          name: `Masters Relief Enhancer - ${color.name}`,
          sku: color.sku,
          units: qty,
          unitSize: '150 ml',
          pricePerUnit: RELIEF_PRICE,
          totalPrice: qty * RELIEF_PRICE,
          partnerEligible: true,
          inCart: true,
        });
      }
    }
  }

  // Lakk
  const lakkLayers = s.thickness === 10 ? 2 : 3;
  // 1 réteg 18L-es lakk 100 m²-t fed; rétegszám szerint arányosan
  const lakkLiters = (area * lakkLayers * 18) / SEALCEM_M70_M2_PER_18L_SINGLE_LAYER;
  const lakk18L = Math.ceil(lakkLiters / 18);
  const lakkProduct = s.lakkType === 'normal' ? SEALCEM_M70_PRODUCTS.normal : SEALCEM_M70_PRODUCTS.antislip;
  stampLines.push({
    name: lakkProduct.name,
    sku: lakkProduct.sku,
    units: lakk18L,
    unitSize: '18 L',
    pricePerUnit: lakkProduct.price,
    totalPrice: lakk18L * lakkProduct.price,
    partnerEligible: true,
    inCart: true,
  });

  const suppliesNet = poliszalLine.totalPrice + stampLines.reduce((s, l) => s + l.totalPrice, 0);
  const totalNet = concreteSubtotal + suppliesNet;
  const totalGross = Math.round(totalNet * 1.27);
  // Partneri: a bélyegzési anyagok és poliszál -10% a BRUTTÓ-ból; beton változatlan
  const totalPartner = Math.round(concreteSubtotal * 1.27 + suppliesNet * 1.27 * 0.9);

  return {
    surfaceId: s.id,
    concreteLine,
    poliszalLine,
    stampLines,
    reliefCoverageM2,
    concreteSubtotal,
    suppliesNet,
    totalNet,
    totalGross,
    totalPartner,
  };
}

interface AggregatedLine {
  sku: string;
  name: string;
  unitSize: string;
  units: number;
  pricePerUnit: number;
  totalPrice: number;
  partnerEligible: boolean;
  inCart: boolean;
}

function aggregateResults(results: SurfaceResult[]): {
  concreteTotal: number; // ár összesen
  concreteM3: number;
  poliszalTotal: AggregatedLine | null;
  stampAgg: AggregatedLine[];
  suppliesNet: number;
  totalNet: number;
  totalGross: number;
  totalPartner: number;
} {
  let concreteTotal = 0;
  let concreteM3 = 0;
  const map = new Map<string, AggregatedLine>();

  const addLine = (l: LineItem) => {
    if (!l.sku) return;
    const key = `${l.sku}|${l.unitSize}`;
    const existing = map.get(key);
    if (existing) {
      existing.units += l.units;
      existing.totalPrice = existing.units * existing.pricePerUnit;
    } else {
      map.set(key, {
        sku: l.sku,
        name: l.name,
        unitSize: l.unitSize,
        units: l.units,
        pricePerUnit: l.pricePerUnit,
        totalPrice: l.units * l.pricePerUnit,
        partnerEligible: l.partnerEligible,
        inCart: l.inCart,
      });
    }
  };

  results.forEach(r => {
    if (r.concreteLine) {
      concreteTotal += r.concreteLine.totalPrice;
      concreteM3 += r.concreteLine.units;
    }
    if (r.poliszalLine) addLine(r.poliszalLine);
    r.stampLines.forEach(addLine);
  });

  const allAgg = Array.from(map.values());
  const poliszalTotal = allAgg.find(a => a.sku === POLISZAL.sku) ?? null;
  const stampAgg = allAgg.filter(a => a.sku !== POLISZAL.sku);

  const suppliesNet = allAgg.reduce((s, l) => s + l.totalPrice, 0);
  const totalNet = concreteTotal + suppliesNet;
  const totalGross = Math.round(totalNet * 1.27);
  const totalPartner = Math.round(concreteTotal * 1.27 + suppliesNet * 1.27 * 0.9);

  return {
    concreteTotal,
    concreteM3,
    poliszalTotal,
    stampAgg,
    suppliesNet,
    totalNet,
    totalGross,
    totalPartner,
  };
}

export default function BelyegzettBetonCalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const [surfaces, setSurfaces] = useState<Surface[]>([createEmptySurface(1)]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const isPartner = profile?.role === 'partner';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const updateSurface = (id: number, patch: Partial<Surface>) => {
    setSurfaces(prev => prev.map(s => {
      if (s.id !== id) return s;
      // Ha a `result` nincs a patch-ben, töröljük (mezőváltoztatás → eredmény elvész)
      const clearResult = !('result' in patch);
      return { ...s, ...patch, ...(clearResult ? { result: null } : {}) };
    }));
  };

  const addSurface = () => {
    const newId = Math.max(...surfaces.map(s => s.id), 0) + 1;
    setSurfaces([...surfaces, createEmptySurface(newId)]);
  };

  const removeSurface = (id: number) => {
    if (surfaces.length <= 1) return;
    setSurfaces(surfaces.filter(s => s.id !== id));
  };

  const calculateSurfaceById = (id: number) => {
    setSurfaces(prev => prev.map(s => {
      if (s.id !== id) return s;
      const result = calculateSurface(s);
      return { ...s, result };
    }));
  };

  const validResults = surfaces.map(s => s.result).filter((r): r is SurfaceResult => r !== null);
  const aggregated = validResults.length > 0 ? aggregateResults(validResults) : null;
  const allCalculated = surfaces.every(s => s.result !== null);

  const handleAddToCart = async () => {
    if (!aggregated) return;

    setCartLoading(true);
    setCartError(null);

    const cartItems: { sku: string; qty: number; name: string }[] = [];
    if (aggregated.poliszalTotal?.inCart) {
      cartItems.push({
        sku: aggregated.poliszalTotal.sku,
        qty: aggregated.poliszalTotal.units,
        name: aggregated.poliszalTotal.name,
      });
    }
    aggregated.stampAgg.forEach(l => {
      if (l.inCart && l.sku && l.units > 0) {
        cartItems.push({ sku: l.sku, qty: l.units, name: l.name });
      }
    });

    if (cartItems.length === 0) {
      setCartError('Nincs kosárba helyezhető termék.');
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
        window.open(data.redirectUrl, '_blank');
      } else {
        setCartError('Nem sikerült a kosár létrehozása.');
      }
    } catch {
      setCartError('Hiba történt a kosárba helyezés során.');
    }

    setCartLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-3 px-3 sm:px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0 flex justify-start">
            <div className="min-w-0 border-2 border-gray-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
              <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                {profile?.name || user?.email}
              </p>
              {profile?.role === 'partner' ? (
                <span className="inline-block text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-0.5">
                  Partner
                </span>
              ) : (
                <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">
                  Ügyfél
                </span>
              )}
            </div>
          </div>

          <a href="https://www.betonstamp.hu" target="_blank" rel="noopener noreferrer" className="shrink-0 transition-opacity">
            <Image
              src="/images/betonstamp-logo.png"
              alt="BetonStamp"
              width={280}
              height={112}
              className="h-10 sm:h-12 md:h-20 w-auto"
            />
          </a>

          <div className="flex-1 min-w-0 flex justify-end">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/calculators')}
                aria-label="Vissza a főoldalra"
                className="text-sm text-gray-700 font-medium border-2 border-gray-300 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 hover:text-gray-900 transition-colors"
              >
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">← Vissza a főoldalra</span>
              </button>
              <button
                onClick={handleSignOut}
                aria-label="Kijelentkezés"
                className="text-sm text-gray-500 font-medium border-2 border-red-500 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 hover:text-red-500 transition-colors"
              >
                <span className="sm:hidden inline-flex items-center" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Kijelentkezés</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 pt-8 md:pt-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          Bélyegzett Beton Kalkulátor
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 text-center max-w-2xl">
          Bélyegzett betonfelületek anyag- és árkalkulátora — felületkeményítős vagy pigmentált technológiával
        </p>

        <div className="w-full max-w-3xl space-y-6">
          {surfaces.map((surface, idx) => (
            <SurfaceBlock
              key={surface.id}
              surface={surface}
              index={idx}
              totalSurfaces={surfaces.length}
              isPartner={isPartner}
              onUpdate={(patch) => updateSurface(surface.id, patch)}
              onRemove={() => removeSurface(surface.id)}
              onCalculate={() => calculateSurfaceById(surface.id)}
            />
          ))}

          <button
            onClick={addSurface}
            className="w-full py-4 rounded-xl border-2 border-brand-500 bg-white hover:bg-brand-500 text-brand-700 hover:text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Új felület hozzáadása</span>
          </button>
        </div>

        {/* Összesítés */}
        {aggregated && (
          <div className="w-full max-w-3xl mt-8 space-y-6">
            {surfaces.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                  Összesített anyagszükséglet
                </h2>

                {/* Beton */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Betonozási költség</h3>
                  <div className="text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3 py-1">
                    <span className="text-gray-800 font-medium sm:flex-1">Beton</span>
                    <div className="flex items-center justify-between gap-3 mt-1 sm:mt-0 sm:contents">
                      <span className="text-gray-500 sm:shrink-0 sm:w-36 sm:text-right">
                        {aggregated.concreteM3} m³
                      </span>
                      <span className="text-gray-900 font-semibold sm:shrink-0 sm:w-28 sm:text-right">
                        {formatFt(aggregated.concreteTotal)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">A betont a helyi betonüzemből rendeli, ezért az ár egyedi.</p>
                </div>

                {/* Bélyegzéshez */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bélyegzéshez szükséges anyagok</h3>
                  <ul className="divide-y divide-gray-100">
                    {aggregated.poliszalTotal && (
                      <AggLineRow line={aggregated.poliszalTotal} />
                    )}
                    {aggregated.stampAgg.map((l, i) => (
                      <AggLineRow key={`${l.sku}-${i}`} line={l} />
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Nettó összesen:</span>
                    <span className="text-gray-900 font-semibold">{formatFt(aggregated.totalNet)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-800 font-bold">Bruttó összesen:</span>
                    <span className="text-gray-900 font-bold">{formatFt(aggregated.totalGross)}</span>
                  </div>
                  {isPartner && (
                    <div className="flex justify-between text-xs text-green-600 font-semibold">
                      <span>Partneri ár (-10% csak bélyegzési anyagokra):</span>
                      <span>{formatFt(aggregated.totalPartner)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kosárba teszem */}
            <div className="bg-white p-5 rounded-xl border-2 border-brand-200">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="w-full bg-gradient-to-r from-brand-500 to-brand-500 hover:from-brand-600 hover:to-brand-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed"
              >
                {cartLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Kosár feltöltése...
                  </span>
                ) : (
                  'Kosárba teszem'
                )}
              </button>

              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Fontos:</strong> {isPartner ? 'A partneri kedvezmény igénybevételéhez a webshopban is be kell jelentkezned a fiókodba. ' : ''}
                  A betont a helyi betonüzemből külön kell rendelned.
                </p>
              </div>

              {cartError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{cartError}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="py-6 text-sm text-gray-400 text-center">
        © 2026 Betonstamp Kft. - Minden jog fenntartva.
      </p>
    </div>
  );
}

function AggLineRow({ line }: { line: AggregatedLine }) {
  return (
    <li className="py-2 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="text-gray-800 font-medium break-words sm:flex-1">{line.name}</span>
      <div className="flex items-center justify-between gap-3 mt-1 sm:mt-0 sm:contents">
        <span className="text-gray-500 sm:shrink-0 sm:w-36 sm:text-right">
          {line.units} × {line.unitSize}
        </span>
        <span className="text-gray-900 font-semibold sm:shrink-0 sm:w-28 sm:text-right">
          {formatFt(line.totalPrice)}
        </span>
      </div>
    </li>
  );
}

interface SurfaceBlockProps {
  surface: Surface;
  index: number;
  totalSurfaces: number;
  isPartner: boolean;
  onUpdate: (patch: Partial<Surface>) => void;
  onRemove: () => void;
  onCalculate: () => void;
}

function SurfaceBlock({ surface, index, totalSurfaces, isPartner, onUpdate, onRemove, onCalculate }: SurfaceBlockProps) {
  const result = surface.result;
  const canCalculate = isSurfaceValid(surface);
  const areaNum = parseFloat(surface.area);
  const validArea = !isNaN(areaNum) && areaNum > 0;
  const reliefCoverage = Object.entries(surface.reliefs).reduce((sum, [, q]) => sum + q * RELIEF_M2_PER_BOX, 0);

  const colors = surface.technology === 'felkemenyit' ? STONECEM_FLOOR_COLORS : ARCOCEM_FAST_COLORS;
  const selectedColor = colors.find(c => c.key === surface.colorKey);

  const updateReliefQty = (key: string, delta: number) => {
    const current = surface.reliefs[key] ?? 0;
    const next = Math.max(0, current + delta);
    const newReliefs = { ...surface.reliefs, [key]: next };
    if (next === 0) delete newReliefs[key];
    onUpdate({ reliefs: newReliefs });
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          {totalSurfaces > 1 ? `${index + 1}. felület` : 'Felület'}
        </h2>
        {totalSurfaces > 1 && (
          <button
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-300 rounded-lg px-3 py-1.5"
          >
            Törlés
          </button>
        )}
      </div>

      {/* 1) Technológia */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          Technológia
          <Tooltip text={"Felületkeményítős: a friss beton tetejére Stonecem Floor port szórnak.\nPigmentált: a betont már eleve pigmentálva öntik."} />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onUpdate({ technology: 'felkemenyit', colorKey: '' })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.technology === 'felkemenyit'
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            Felületkeményítős
          </button>
          <button
            onClick={() => onUpdate({ technology: 'pigment', colorKey: '' })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.technology === 'pigment'
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            Pigmentált beton
          </button>
        </div>
      </div>

      {/* 2) Terület */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Terület (m²)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={surface.area}
          onChange={(e) => onUpdate({ area: e.target.value })}
          placeholder="Pl. 50"
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
        />
      </div>

      {/* 3) Vastagság */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          Vastagság
          <Tooltip text={"10 cm: járófelület (2 réteg lakk).\n15 cm: gépjárműforgalom (3 réteg lakk)."} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onUpdate({ thickness: 10 })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.thickness === 10
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            10 cm (járófelület)
          </button>
          <button
            onClick={() => onUpdate({ thickness: 15 })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.thickness === 15
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            15 cm (gépjárműforgalom)
          </button>
        </div>
      </div>

      {/* 4) Beton ár */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Beton ár (Ft/m³)</label>
        <input
          type="number"
          step="1"
          min="0"
          value={surface.concretePrice}
          onChange={(e) => onUpdate({ concretePrice: e.target.value })}
          placeholder="Pl. 35000"
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
        />
        <p className="text-xs text-gray-500 mt-1">A betont a helyi betonüzemből rendeli, ezért az ár egyedi.</p>
      </div>

      {/* 5) Szín */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          {surface.technology === 'felkemenyit' ? 'Stonecem Floor szín' : 'Arcocem Fast szín'}
          <Tooltip text={"Felületkeményítős esetén 25 kg vödörben kapható.\nPigmentált beton esetén 5 kg zsákban."} />
        </label>
        {selectedColor && (
          <div className="mb-2 flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span className="text-sm font-medium text-gray-800">{selectedColor.name}</span>
            <button
              onClick={() => onUpdate({ colorKey: '' })}
              className="text-xs text-red-500 hover:text-red-700 ml-2"
            >
              ✕ Törlés
            </button>
          </div>
        )}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {colors.map(c => (
            <button
              key={c.key}
              onClick={() => onUpdate({ colorKey: c.key })}
              className={`flex flex-col items-center p-1 rounded border-2 transition-all hover:scale-105 ${
                surface.colorKey === c.key
                  ? 'border-brand-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div
                className="w-full aspect-square rounded-sm mb-1"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[9px] leading-tight text-center text-gray-600 break-words">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6) Leválasztó típus */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          Leválasztó típus
          <Tooltip text={"Por: Desmocem Powder, másodlagos színt ad és leválasztja a bélyegzőt.\nFolyékony: Desmocem Liquid, színtelen + opcionális Relief."} />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onUpdate({ separator: 'por', powderColorKey: '', reliefs: {} })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.separator === 'por'
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            Por leválasztó
          </button>
          <button
            onClick={() => onUpdate({ separator: 'folyekony', powderColorKey: '' })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.separator === 'folyekony'
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            Folyékony leválasztó
          </button>
        </div>
      </div>

      {/* 7A) Por szín */}
      {surface.separator === 'por' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Por leválasztó szín</label>
          <div className="grid grid-cols-3 gap-3">
            {DESMOCEM_POWDER_COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => onUpdate({ powderColorKey: c.key })}
                className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                  surface.powderColorKey === c.key
                    ? 'border-brand-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div
                  className="w-full aspect-square rounded-md mb-2 bg-cover bg-center"
                  style={{ backgroundImage: `url(${c.image})` }}
                  role="img"
                  aria-label={c.name}
                />
                <span className="text-xs text-center text-gray-700 font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7B) Relief */}
      {surface.separator === 'folyekony' && (
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            Relief domborulatkiemelő (opcionális)
            <Tooltip text="A Masters Relief Enhancer kontrasztot ad a bélyegzett felületnek. 150 ml doboz, ~30 m² lefedettség. Több szín is keverhető." />
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RELIEF_COLORS.map(c => {
              const qty = surface.reliefs[c.key] ?? 0;
              const m2 = qty * RELIEF_M2_PER_BOX;
              return (
                <div
                  key={c.key}
                  className={`flex flex-col items-center p-2 rounded border-2 ${
                    qty > 0
                      ? 'border-brand-500 shadow-sm'
                      : 'border-gray-200'
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded-sm mb-1"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] leading-tight text-center text-gray-700 break-words mb-1">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateReliefQty(c.key, -1)}
                      disabled={qty === 0}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-gray-800 font-bold"
                    >−</button>
                    <span className="text-sm font-semibold w-5 text-center">{qty}</span>
                    <button
                      onClick={() => updateReliefQty(c.key, 1)}
                      className="w-6 h-6 rounded bg-brand-100 hover:bg-brand-200 text-brand-800 font-bold"
                    >+</button>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1">
                    {qty} doboz / {m2} m²
                  </span>
                </div>
              );
            })}
          </div>
          {validArea && (
            <div className={`mt-3 p-3 rounded-lg text-xs ${
              reliefCoverage === 0
                ? 'bg-gray-50 text-gray-700 border border-gray-200'
                : reliefCoverage < areaNum
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              <div>Választott Relief lefedettség: <strong>{reliefCoverage} m²</strong> / {areaNum} m² terület</div>
              {reliefCoverage > 0 && reliefCoverage < areaNum && (
                <div className="mt-1">
                  <strong>Figyelem:</strong> a választott Relief mennyiség kevesebb mint a terület, csak a terület egy része lesz Relieffel ellátva.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 8) Lakk típus */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          Lakk típus
          <Tooltip text={"Az AD verzió csúszásgátló adalékot tartalmaz, kültéri és nedves környezetben ajánlott.\nRétegszám automatikus: 10 cm → 2 réteg, 15 cm → 3 réteg."} />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onUpdate({ lakkType: 'normal' })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.lakkType === 'normal'
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            Sealcem DSV M70 (normál)
          </button>
          <button
            onClick={() => onUpdate({ lakkType: 'antislip' })}
            className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
              surface.lakkType === 'antislip'
                ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
            }`}
          >
            Sealcem DSV M70 AD (csúszásgátló)
          </button>
        </div>
      </div>

      {/* Kalkuláció gomb */}
      <button
        onClick={onCalculate}
        disabled={!canCalculate}
        className={`w-full font-semibold py-3 rounded-lg transition-colors ${
          canCalculate
            ? 'bg-brand-500 hover:bg-brand-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Kalkuláció készítése
      </button>

      {/* Eredmény */}
      {result && (
        <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <h3 className="font-bold text-gray-800">Anyagszükséglet és árak</h3>

          {/* Betonozási költség */}
          <div>
            <h4 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Betonozási költség</h4>
            <ul className="divide-y divide-gray-100">
              {result.concreteLine && (
                <ResultLineRow line={result.concreteLine} />
              )}
              {result.poliszalLine && (
                <ResultLineRow line={result.poliszalLine} />
              )}
            </ul>
            <div className="mt-2 text-right text-sm">
              <span className="text-gray-600">Részösszeg: </span>
              <span className="font-semibold text-gray-900">
                {formatFt(result.concreteSubtotal + (result.poliszalLine?.totalPrice ?? 0))}
              </span>
            </div>
          </div>

          {/* Bélyegzéshez szükséges */}
          <div>
            <h4 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Bélyegzéshez szükséges anyagok</h4>
            <ul className="divide-y divide-gray-100">
              {result.stampLines.map((l, i) => (
                <ResultLineRow key={i} line={l} />
              ))}
            </ul>
            <div className="mt-2 text-right text-sm">
              <span className="text-gray-600">Részösszeg: </span>
              <span className="font-semibold text-gray-900">
                {formatFt(result.stampLines.reduce((s, l) => s + l.totalPrice, 0))}
              </span>
            </div>
          </div>

          {/* Felület összegzés */}
          <div className="pt-3 border-t border-gray-200 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">Nettó:</span>
              <span className="text-gray-900 font-semibold">{formatFt(result.totalNet)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-800 font-bold">Bruttó:</span>
              <span className="text-gray-900 font-bold">{formatFt(result.totalGross)}</span>
            </div>
            {isPartner && result.totalPartner !== undefined && (
              <div className="flex justify-between text-xs text-green-600 font-semibold">
                <span>Partneri ár (-10% csak bélyegzési anyagokra):</span>
                <span>{formatFt(result.totalPartner)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultLineRow({ line }: { line: LineItem }) {
  return (
    <li className="py-2 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="text-gray-800 font-medium break-words sm:flex-1">{line.name}</span>
      <div className="flex items-center justify-between gap-3 mt-1 sm:mt-0 sm:contents">
        <span className="text-gray-500 sm:shrink-0 sm:w-32 sm:text-right">
          {line.units} × {line.unitSize}
        </span>
        <span className="text-gray-900 font-semibold sm:shrink-0 sm:w-28 sm:text-right">
          {formatFt(line.totalPrice)}
        </span>
      </div>
    </li>
  );
}
