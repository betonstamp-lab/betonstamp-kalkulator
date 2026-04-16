'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import {
  OVERLAY_COLORS,
  OVERLAY_PRICE_PER_BAG,
  OVERLAY_KG_PER_BAG,
  OVERLAY_M2_PER_BAG,
  OVERLAY_SUPPORTING_PRODUCTS,
} from '@/lib/calculators/overlay/products';

type Technology = 'por' | 'folyekony' | null;
type PowderColor = 'noir' | 'antracita' | null;
type Lacquer = 'normal' | 'ad' | null;

interface OverlayResultLine {
  name: string;
  packaging: string;
  qty: number;
  subtotal: number;
  sku: string;
  needed: number;
  got: number;
  unit: string;
}

interface OverlayResult {
  lines: OverlayResultLine[];
  net: number;
  gross: number;
  partnerPrice?: number;
}

const formatFt = (n: number) => `${n.toLocaleString('hu-HU')} Ft`;

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
          <div className="absolute bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 leading-relaxed left-0 sm:left-1/2 sm:-translate-x-1/2">
            {text}
            <div className="absolute top-full left-4 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default function OverlayCalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const [technology, setTechnology] = useState<Technology>(null);
  const [powderColor, setPowderColor] = useState<PowderColor>(null);
  const [overlayColor, setOverlayColor] = useState<string>('');
  const [lacquer, setLacquer] = useState<Lacquer>(null);
  const [area, setArea] = useState('');
  const [reliefEnabled, setReliefEnabled] = useState<boolean>(true);
  const [result, setResult] = useState<OverlayResult | null>(null);
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

  const handleTechnologyChange = (tech: Technology) => {
    setTechnology(tech);
    if (tech !== 'por') {
      setPowderColor(null);
    }
    setResult(null);
  };

  const areaNum = parseFloat(area);
  const isFormValid =
    technology !== null &&
    (technology !== 'por' || powderColor !== null) &&
    overlayColor !== '' &&
    lacquer !== null &&
    !isNaN(areaNum) &&
    areaNum > 0;

  const handleAddToCart = async () => {
    if (!result) return;

    setCartLoading(true);
    setCartError(null);

    const cartItems = result.lines
      .filter(l => l.sku && l.qty > 0)
      .map(l => ({ sku: l.sku, qty: l.qty, name: l.name }));

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
        window.open(data.redirectUrl, '_blank');
      } else {
        setCartError('Nem sikerült a kosár létrehozása.');
      }
    } catch {
      setCartError('Hiba történt a kosárba helyezés során.');
    }

    setCartLoading(false);
  };

  const handleCalculate = () => {
    if (!isFormValid || technology === null || lacquer === null) return;

    const lines: OverlayResultLine[] = [];

    // 1) Primacem Plus
    const primacem = OVERLAY_SUPPORTING_PRODUCTS.primacem_plus;
    const primacemQty = Math.ceil(areaNum / primacem.m2PerUnit);
    lines.push({
      name: 'Primacem Plus',
      packaging: '5L',
      qty: primacemQty,
      subtotal: primacemQty * primacem.price,
      sku: primacem.sku,
      needed: areaNum * (primacem.liters / primacem.m2PerUnit),
      got: primacemQty * primacem.liters,
      unit: 'L',
    });

    // 2) Overlay (kiválasztott színnel)
    const selectedColor = OVERLAY_COLORS.find(c => c.key === overlayColor);
    const overlayQty = Math.ceil(areaNum / OVERLAY_M2_PER_BAG);
    lines.push({
      name: `Overlay ${selectedColor?.name ?? overlayColor}`,
      packaging: `${OVERLAY_KG_PER_BAG} kg`,
      qty: overlayQty,
      subtotal: overlayQty * OVERLAY_PRICE_PER_BAG,
      sku: selectedColor?.sku ?? '',
      needed: areaNum * (OVERLAY_KG_PER_BAG / OVERLAY_M2_PER_BAG),
      got: overlayQty * OVERLAY_KG_PER_BAG,
      unit: 'kg',
    });

    // 3) Leválasztó
    if (technology === 'por') {
      const powder =
        powderColor === 'noir'
          ? OVERLAY_SUPPORTING_PRODUCTS.leszvalaszto_por_noir
          : OVERLAY_SUPPORTING_PRODUCTS.leszvalaszto_por_antracita;
      const powderQty = Math.ceil(areaNum / powder.m2PerUnit);
      lines.push({
        name:
          powderColor === 'noir'
            ? 'Desmocem Powder Noir'
            : 'Desmocem Powder Antracita',
        packaging: '10 kg',
        qty: powderQty,
        subtotal: powderQty * powder.price,
        sku: powder.sku,
        needed: areaNum * (powder.kg / powder.m2PerUnit),
        got: powderQty * powder.kg,
        unit: 'kg',
      });
    } else {
      const liquid = OVERLAY_SUPPORTING_PRODUCTS.leszvalaszto_folyekony;
      const liquidQty = Math.ceil(areaNum / liquid.m2PerUnit);
      lines.push({
        name: 'Desmocem Liquid',
        packaging: '5L',
        qty: liquidQty,
        subtotal: liquidQty * liquid.price,
        sku: liquid.sku,
        needed: areaNum * (liquid.liters / liquid.m2PerUnit),
        got: liquidQty * liquid.liters,
        unit: 'L',
      });

      // 4) Relief — csak folyékony technológiánál, ha a felhasználó kéri
      if (reliefEnabled) {
        const relief = OVERLAY_SUPPORTING_PRODUCTS.relief;
        const reliefQty = Math.ceil(areaNum / relief.m2PerUnit);
        lines.push({
          name: 'Masters Relief Enhancer',
          packaging: '150 gr',
          qty: reliefQty,
          subtotal: reliefQty * relief.price,
          sku: relief.sku,
          needed: areaNum * (relief.ml / relief.m2PerUnit),
          got: reliefQty * relief.ml,
          unit: 'ml',
        });
      }
    }

    // 5) Lakk
    const lakk =
      lacquer === 'normal'
        ? OVERLAY_SUPPORTING_PRODUCTS.lakk_normal
        : OVERLAY_SUPPORTING_PRODUCTS.lakk_ad;
    const lakkQty = Math.ceil(areaNum / lakk.m2PerUnit);
    lines.push({
      name:
        lacquer === 'normal'
          ? 'Sealcem DSV M70 (normál)'
          : 'Sealcem DSV M70 AD (csúszásgátló)',
      packaging: '18L',
      qty: lakkQty,
      subtotal: lakkQty * lakk.price,
      sku: lakk.sku,
      needed: areaNum * (lakk.liters / lakk.m2PerUnit),
      got: lakkQty * lakk.liters,
      unit: 'L',
    });

    const net = lines.reduce((s, l) => s + l.subtotal, 0);
    const gross = Math.round(net * 1.27);
    const partnerPrice =
      profile?.role === 'partner' ? Math.round(gross * 0.9) : undefined;

    setResult({ lines, net, gross, partnerPrice });
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
      <header className="w-full bg-white shadow-sm py-3 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left - User info */}
          <div className="min-w-0 border-2 border-gray-300 rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-gray-800 truncate">
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

          {/* Center - Logo */}
          <a href="https://www.betonstamp.hu" target="_blank" rel="noopener noreferrer" className="transition-opacity">
            <Image
              src="/images/betonstamp-logo.png"
              alt="BetonStamp"
              width={280}
              height={112}
              className="h-12 md:h-20 w-auto"
            />
          </a>

          {/* Right - Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/calculators')}
              className="text-sm text-gray-700 font-medium border-2 border-gray-300 rounded-lg px-3 py-2 hover:text-gray-900 transition-colors"
            >
              ← Vissza a főoldalra
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 font-medium border-2 border-red-500 rounded-lg px-3 py-2 hover:text-red-500 transition-colors"
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 pt-8 md:pt-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          Overlay Kalkulátor
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 text-center max-w-2xl">
          Meglévő betonfelületekre alkalmazandó 1cm vastagságú anyagrendszer kalkulátora
        </p>

        <div className="w-full max-w-2xl space-y-6">
          {/* 1) Terület */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terület (m²)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={area}
              onChange={(e) => { setArea(e.target.value); setResult(null); }}
              placeholder="Pl. 20"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
            />
          </div>

          {/* 2) Technológia */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Technológia
              <Tooltip text="Por leválasztó: száraz porral történő leválasztás. Folyékony leválasztó: folyékony szerrel történő leválasztás, opcionálisan Relief domborulatkiemelővel kiegészítve." />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleTechnologyChange('por')}
                className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  technology === 'por'
                    ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                Por leválasztó
              </button>
              <button
                onClick={() => handleTechnologyChange('folyekony')}
                className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  technology === 'folyekony'
                    ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                Folyékony leválasztó
              </button>
            </div>
          </div>

          {/* 3) Leválasztó por színe - csak por technológiánál */}
          {technology === 'por' && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                Leválasztó por színe
                <Tooltip text="A Desmocem Powder színes leválasztópor a bélyegzéskor árnyalatot ad a felületnek és megakadályozza a bélyeg ragadását. Válaszd azt a színt, amelyik illik a kiválasztott Overlay színhez." />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => { setPowderColor('noir'); setResult(null); }}
                  className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                    powderColor === 'noir'
                      ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  Desmocem Powder Noir (fekete)
                </button>
                <button
                  onClick={() => { setPowderColor('antracita'); setResult(null); }}
                  className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                    powderColor === 'antracita'
                      ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  Desmocem Powder Antracita (sötétszürke)
                </button>
              </div>
            </div>
          )}

          {/* 4) Overlay szín */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overlay szín
            </label>
            {overlayColor && (
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: OVERLAY_COLORS.find(c => c.key === overlayColor)?.hex || '#ccc' }}
                />
                <span className="text-sm font-medium text-gray-800">
                  {OVERLAY_COLORS.find(c => c.key === overlayColor)?.name}
                </span>
                <button
                  onClick={() => { setOverlayColor(''); setResult(null); }}
                  className="text-xs text-red-500 hover:text-red-700 ml-2"
                >
                  ✕ Törlés
                </button>
              </div>
            )}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {OVERLAY_COLORS.map(c => (
                <button
                  key={c.key}
                  onClick={() => { setOverlayColor(c.key); setResult(null); }}
                  className={`flex flex-col items-center p-1 rounded border-2 transition-all hover:scale-105 ${
                    overlayColor === c.key
                      ? 'border-brand-500 ring-2 ring-brand-300 shadow-md'
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

          {/* 5) Relief toggle - csak folyékony leválasztós technológiánál */}
          {technology === 'folyekony' && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                Relief domborulatkiemelő
                <Tooltip text="A Relief domborulatkiemelő kiemeli a bélyegzett felület mintázatának részleteit. Opcionális, csak folyékony leválasztós technológiánál használható." />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setReliefEnabled(true); setResult(null); }}
                  className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                    reliefEnabled
                      ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  Igen
                </button>
                <button
                  onClick={() => { setReliefEnabled(false); setResult(null); }}
                  className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                    !reliefEnabled
                      ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  Nem
                </button>
              </div>
            </div>
          )}

          {/* 6) Lakk */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Lakk
              <Tooltip text="Az AD verzió csúszásgátló adalékot tartalmaz, kültéri és nedves környezetben ajánlott." />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => { setLacquer('normal'); setResult(null); }}
                className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  lacquer === 'normal'
                    ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                Sealcem DSV M70 (normál)
              </button>
              <button
                onClick={() => { setLacquer('ad'); setResult(null); }}
                className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  lacquer === 'ad'
                    ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                Sealcem DSV M70 AD (csúszásgátló)
              </button>
            </div>
          </div>

          {/* 7) Calculate */}
          <button
            onClick={handleCalculate}
            disabled={!isFormValid}
            className={`w-full font-semibold py-3 rounded-lg transition-colors ${
              isFormValid
                ? 'bg-brand-500 hover:bg-brand-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Kalkuláció Készítése
          </button>
        </div>

        {/* Result card */}
        {result && (
          <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Anyagszükséglet és Árak
            </h2>
            <ul className="divide-y divide-gray-100">
              {result.lines.map((line, idx) => (
                <li
                  key={idx}
                  className="py-2 flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-gray-800 font-medium flex-1">
                    {line.name}
                  </span>
                  <span className="text-gray-500 shrink-0 w-28 text-right">
                    {line.qty} × {line.packaging}
                  </span>
                  <span className="text-gray-900 font-semibold shrink-0 w-28 text-right">
                    {formatFt(line.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">Nettó összesen:</span>
                <span className="text-gray-900 font-semibold">
                  {formatFt(result.net)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-800 font-bold">Bruttó összesen:</span>
                <span className="text-gray-900 font-bold">
                  {formatFt(result.gross)}
                </span>
              </div>
              {result.partnerPrice !== undefined && (
                <div className="flex justify-between text-xs text-green-600 font-semibold">
                  <span>Partneri ár (-10%):</span>
                  <span>{formatFt(result.partnerPrice)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maradék anyagok */}
        {result && result.lines.some(l => l.got - l.needed > 0.01) && (
          <div className="w-full max-w-2xl mt-6 bg-gradient-to-r from-brand-50 to-brand-50 p-5 rounded-xl border-2 border-brand-200">
            <h3 className="font-bold text-lg mb-3 text-brand-900">
              Maradék anyagok
            </h3>
            <div className="space-y-1">
              {result.lines.map((line, idx) => {
                const leftover = line.got - line.needed;
                if (leftover <= 0.01) return null;
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-2 h-2 bg-brand-600 rounded-full shrink-0"></span>
                    <span className="flex-1">{line.name}:</span>
                    <span className="text-gray-500">
                      felhasznált {line.needed.toFixed(2)} {line.unit}
                    </span>
                    <span className="font-semibold text-brand-700">
                      maradék {leftover.toFixed(2)} {line.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kosárba teszem */}
        {result && (
          <div className="w-full max-w-2xl mt-6 bg-white p-5 rounded-xl border-2 border-brand-200">
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
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="py-6 text-sm text-gray-400 text-center">
        © 2026 Betonstamp Kft. - Minden jog fenntartva.
      </p>
    </div>
  );
}
