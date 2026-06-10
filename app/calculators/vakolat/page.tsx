'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import {
  SURFACES,
  FINISHING,
  MESH_OVERLAP_FACTOR,
  EST_DECOR_COLORS,
  EST_DECOR_PACKS,
  SILCOPIN,
  MONOCROM,
  MIXOL,
  RELEASE_WARNING,
  IMPREGNATION,
  IMPREGNATION_HELP,
  isPlaceholderSku,
  type Thickness,
  type ImpregnationMode,
} from '@/lib/calculators/vakolat/products';
import {
  calculateVakolat,
  aggregateVakolat,
  type PigmentLine,
  type LineItem,
  type VakolatResult,
} from '@/lib/calculators/vakolat/calculate';

interface Surface {
  id: number;
  area: string;
  thickness: Thickness;
  surfaceId: string;
  finishingId: string;
  finishingColorKey: string;
  pigmentLines: PigmentLine[];
  releaseOn: boolean;
  impregnationMode: ImpregnationMode;
  result: VakolatResult | null;
}

function createEmptySurface(id: number): Surface {
  return {
    id,
    area: '',
    thickness: '2.2',
    surfaceId: '',
    finishingId: '',
    finishingColorKey: '',
    pigmentLines: [],
    releaseOn: false,
    impregnationMode: 'none',
    result: null,
  };
}

function isSurfaceValid(s: Surface): boolean {
  const area = parseFloat(s.area);
  if (isNaN(area) || area <= 0) return false;
  if (!s.surfaceId) return false;
  if (!s.finishingId) return false;
  if (!s.finishingColorKey) return false;
  // Mixol színezőhöz kötelező Silcopin VAGY Monocrom kötőanyag
  // (a Mixol-t a folyékony kötőanyagba keverik). EST-Decor önállóan is felvihető.
  const hasMixol = s.pigmentLines.some(p => p.type === 'mixol');
  const hasBinder = s.pigmentLines.some(p => p.type === 'silcopin' || p.type === 'monocrom');
  if (hasMixol && !hasBinder) return false;
  return true;
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
          <div className="fixed left-4 right-4 bottom-4 p-4 bg-gray-800 text-white text-sm rounded-lg shadow-xl z-50 leading-relaxed sm:absolute sm:left-1/2 sm:right-auto sm:bottom-full sm:top-auto sm:mb-2 sm:w-72 sm:-translate-x-1/2 sm:text-xs sm:p-3">
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

// Számozott szekció-fejléc: sárga (brand-500) badge a sorszámmal + sötétkék (#053d57) cím
const SectionHeader = ({ num, title }: { num: number; title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-8 h-8 rounded-full bg-brand-500 text-[#053d57] font-bold text-base flex items-center justify-center shrink-0">
      {num}
    </span>
    <h3 className="text-lg font-bold text-[#053d57]">{title}</h3>
  </div>
);

export default function VakolatCalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const [surfaces, setSurfaces] = useState<Surface[]>([createEmptySurface(1)]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartInfo, setCartInfo] = useState<string | null>(null);

  const isPartner = profile?.role === 'partner';
  // Partneri kedvezmény: a profile.partner_discount mezőből (mikrocement-mintára).
  // Nem-partnernél is biztonságos: discountMultiplier = 1 → nincs csökkentés.
  const discountPercent = profile?.partner_discount || 0;
  const discountMultiplier = 1 - discountPercent / 100;

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
      if (profileData) setProfile(profileData);
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
      const area = parseFloat(s.area);
      if (!isFinite(area) || area <= 0) return { ...s, result: null };
      const result = calculateVakolat({
        area,
        thickness: s.thickness,
        surfaceId: s.surfaceId,
        finishingId: s.finishingId,
        finishingColorKey: s.finishingColorKey,
        pigmentLines: s.pigmentLines,
        releaseOn: s.releaseOn,
        impregnationMode: s.impregnationMode,
        discountMultiplier,
      });
      return { ...s, result };
    }));
  };

  const validResults = surfaces.map(s => s.result).filter((r): r is VakolatResult => r !== null);
  const aggregated = validResults.length > 0 ? aggregateVakolat(validResults, discountMultiplier) : null;
  const showAggregate = surfaces.length > 1 && aggregated !== null; // multi-felület összesítő blokk csak 2+ felületnél

  const handleAddToCart = async () => {
    if (!aggregated) return;
    setCartLoading(true);
    setCartError(null);
    setCartInfo(null);

    const cartItems = aggregated.lines
      .filter(l => l.inCart && l.sku && l.units > 0)
      .map(l => ({ sku: l.sku, qty: l.units, name: l.name }));

    const skippedPlaceholders = aggregated.lines.filter(l => isPlaceholderSku(l.sku));

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
        if (skippedPlaceholders.length > 0) {
          setCartInfo(`A kosár megnyílt, de ${skippedPlaceholders.length} tétel SKU-ja még nincs a Shoprenteren — ezeket nem küldtük be. (Pótlása folyamatban.)`);
        }
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
                <span className="inline-block text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-0.5">Partner</span>
              ) : (
                <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">Ügyfél</span>
              )}
            </div>
          </div>
          <a href="https://www.betonstamp.hu" target="_blank" rel="noopener noreferrer" className="shrink-0 transition-opacity">
            <Image src="/images/betonstamp-logo.png" alt="BetonStamp" width={280} height={112} className="h-10 sm:h-12 md:h-20 w-auto" />
          </a>
          <div className="flex-1 min-w-0 flex justify-end">
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => router.push('/calculators')} className="text-sm text-gray-700 font-medium border-2 border-gray-300 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 hover:text-gray-900 transition-colors">
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">← Vissza a főoldalra</span>
              </button>
              <button onClick={handleSignOut} className="text-sm text-gray-500 font-medium border-2 border-red-500 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 hover:text-red-500 transition-colors">
                <span className="hidden sm:inline">Kijelentkezés</span>
                <span className="sm:hidden">Kilép</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 pt-8 md:pt-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Vakolat kalkulátor</h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 text-center max-w-2xl">
          ESTonetex System — falazatok (függőleges falak) anyag- és árkalkulátora.
        </p>

        <div className="w-full max-w-3xl space-y-6">
          {surfaces.map((surface, idx) => (
            <SurfaceBlock
              key={surface.id}
              surface={surface}
              index={idx}
              totalSurfaces={surfaces.length}
              isPartner={isPartner}
              discountPercent={discountPercent}
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

        {/* Eredmény-blokk: 1+ kalkulált felület esetén (a multi-felület összesítő csak 2+ felületnél) */}
        {aggregated && (
          <div className="w-full max-w-3xl mt-8 space-y-6">
            {showAggregate && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Összesített anyagok</h2>
                <ul className="divide-y divide-gray-100">
                  {aggregated.lines.map((l, i) => (
                    <AggLineRow key={`${l.sku}-${i}`} line={l} />
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  {isPartner && aggregated.totalPartner !== undefined ? (
                    <div className="flex justify-between text-base">
                      <span className="font-bold text-gray-800">Összesen (partner −{discountPercent}%):</span>
                      <span className="font-bold text-green-600">{formatFt(aggregated.totalPartner)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-base">
                      <span className="font-bold text-gray-800">Összesen:</span>
                      <span className="font-bold text-brand-600">{formatFt(aggregated.totalBrutto)}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Az árak tartalmazzák az ÁFÁ-t. A pigmentálás opcionális, effekt jellegű.</p>
                </div>
              </div>
            )}

            {/* Kosárba teszem — 1 vagy több felület esetén egyaránt megjelenik (Bélyegzett-mintára) */}
            <div className="bg-white p-5 rounded-xl border-2 border-brand-200">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="w-full bg-[#053d57] hover:bg-[#042a3d] disabled:bg-gray-400 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition-colors disabled:cursor-not-allowed"
              >
                {cartLoading ? 'Kosár feltöltése...' : 'Kosárba teszem'}
              </button>
              {cartError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{cartError}</p>
                </div>
              )}
              {cartInfo && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">{cartInfo}</p>
              )}
            </div>
          </div>
        )}

        <p className="mt-auto pb-6 pt-12 text-sm text-gray-400 text-center">
          © 2026 Betonstamp Kft. - Minden jog fenntartva.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SurfaceBlock — egy felület teljes UI-ja
// ---------------------------------------------------------------------------

interface SurfaceBlockProps {
  surface: Surface;
  index: number;
  totalSurfaces: number;
  isPartner: boolean;
  discountPercent: number;
  onUpdate: (patch: Partial<Surface>) => void;
  onRemove: () => void;
  onCalculate: () => void;
}

function SurfaceBlock({ surface, index, totalSurfaces, isPartner, discountPercent, onUpdate, onRemove, onCalculate }: SurfaceBlockProps) {
  const result = surface.result;
  const canCalculate = isSurfaceValid(surface);
  const selectedSurface = SURFACES.find(s => s.id === surface.surfaceId);
  const selectedFinishing = FINISHING.find(f => f.id === surface.finishingId);

  // Pigment validáció: ha van EST-Decor, kell kötőanyag
  // Mixol színezőhöz kötelező kötőanyag (Silcopin VAGY Monocrom).
  // EST-Decor önállóan felvihető — nem igényel kötőanyagot.
  const hasMixol = surface.pigmentLines.some(p => p.type === 'mixol');
  const hasBinder = surface.pigmentLines.some(p => p.type === 'silcopin' || p.type === 'monocrom');
  const mixolBinderMissing = hasMixol && !hasBinder;

  const addPigmentLine = (line: PigmentLine) => {
    onUpdate({ pigmentLines: [...surface.pigmentLines, line] });
  };
  const removePigmentLine = (idx: number) => {
    onUpdate({ pigmentLines: surface.pigmentLines.filter((_, i) => i !== idx) });
  };

  // Egységes kártya-stílus a számozott szekciókhoz
  const cardClass = "bg-white rounded-2xl shadow-lg border border-gray-200 p-6";

  return (
    <div className="space-y-6">
      {/* Felület-fejléc (a kártyákon kívül) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-[#053d57]">
          {totalSurfaces > 1 ? `${index + 1}. felület` : 'Felület'}
        </h2>
        {totalSurfaces > 1 && (
          <button onClick={onRemove} className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-300 rounded-lg px-3 py-1.5">Törlés</button>
        )}
      </div>

      {/* ============ 1. Felület ============ */}
      <div className={cardClass}>
        <SectionHeader num={1} title="Felület" />
        <div className="space-y-6">
          {/* Felület mérete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Felület mérete (m²)</label>
            <input
              type="number" step="0.1" min="0"
              value={surface.area}
              onChange={(e) => onUpdate({ area: e.target.value })}
              placeholder="Pl. 25"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
            />
          </div>

          {/* Rétegvastagság */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Rétegvastagság (kialakító réteg)
              <Tooltip text={"1,5 cm: 1 zsák / m².\n2,2 cm: 1,5 zsák / m².\n3 cm: 2 zsák / m²."} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['1.5', '2.2', '3'] as Thickness[]).map(t => (
                <button
                  key={t}
                  onClick={() => onUpdate({ thickness: t })}
                  className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                    surface.thickness === t
                      ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  {t === '3' ? '3 cm' : `${t.replace('.', ',')} cm`}
                </button>
              ))}
            </div>
          </div>

          {/* Alapfelület */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alapfelület</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SURFACES.map(s => (
                <button
                  key={s.id}
                  onClick={() => onUpdate({ surfaceId: s.id })}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold text-left transition-all ${
                    surface.surfaceId === s.id
                      ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {selectedSurface && (
              <p className="text-xs text-gray-600 mt-2 bg-gray-50 border border-gray-200 rounded p-2">{selectedSurface.info}</p>
            )}
          </div>
        </div>
      </div>

      {/* ============ 2. Kialakító vakolat ============ */}
      <div className={cardClass}>
        <SectionHeader num={2} title="Kialakító vakolat" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vakolat típus</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {FINISHING.map(f => (
              <button
                key={f.id}
                onClick={() => onUpdate({ finishingId: f.id, finishingColorKey: '' })}
                className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  surface.finishingId === f.id
                    ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
          {selectedFinishing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Szín</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedFinishing.colors.map(c => (
                  <button
                    key={c.key}
                    onClick={() => onUpdate({ finishingColorKey: c.key })}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      surface.finishingColorKey === c.key
                        ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ 3. Pigmentálás (opcionális) ============ */}
      <div className={cardClass}>
        <SectionHeader num={3} title="Pigmentálás (opcionális)" />
        <PigmentSection
          pigmentLines={surface.pigmentLines}
          onAdd={addPigmentLine}
          onRemove={removePigmentLine}
          mixolBinderMissing={mixolBinderMissing}
        />
      </div>

      {/* ============ 4. Felületvédelem ============ */}
      <div className={cardClass}>
        <SectionHeader num={4} title="Felületvédelem" />
        <div className="space-y-6">
          {/* Leválasztó alszekció */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Leválasztó (opcionális)
              <Tooltip text={RELEASE_WARNING} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdate({ releaseOn: false })}
                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  !surface.releaseOn
                    ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                Nem kérek
              </button>
              <button
                onClick={() => onUpdate({ releaseOn: true })}
                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  surface.releaseOn
                    ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                EST-Release
              </button>
            </div>
            {surface.releaseOn && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">{RELEASE_WARNING}</p>
            )}
          </div>

          {/* Impregnálás alszekció */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Impregnálás
              <Tooltip text={IMPREGNATION_HELP} />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['none', 'normal_1_14', 'wet_1_6'] as ImpregnationMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onUpdate({ impregnationMode: mode })}
                  className={`p-3 rounded-lg border-2 text-xs sm:text-sm font-semibold transition-all ${
                    surface.impregnationMode === mode
                      ? 'border-brand-500 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  {IMPREGNATION[mode].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{IMPREGNATION_HELP}</p>
          </div>
        </div>
      </div>

      {/* ============ 5. Eredmény és kosár ============ */}
      <div className={cardClass}>
        <SectionHeader num={5} title="Eredmény és kosár" />

        {/* Kalkuláció gomb (brand-500 sárga elsődleges CTA) */}
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
        {mixolBinderMissing && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 mt-3">
            ⚠ Mixol színezőhöz kötelező kötőanyag (Silcopin VAGY Monocrom). Adj hozzá egyet a kalkuláció előtt.
          </p>
        )}

        {/* Eredmény panel */}
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <h4 className="font-bold text-gray-800">Anyagszükséglet és árak</h4>

            {result.prepLines.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Előkészítés</h5>
                <ul className="divide-y divide-gray-100">
                  {result.prepLines.map((l, i) => <ResultLineRow key={i} line={l} />)}
                </ul>
              </div>
            )}

            <div>
              <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Kialakító réteg</h5>
              <ul className="divide-y divide-gray-100">
                <ResultLineRow line={result.finishingLine} />
              </ul>
            </div>

            {result.pigmentLines.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Pigmentálás (effekt)</h5>
                <ul className="divide-y divide-gray-100">
                  {result.pigmentLines.map((l, i) => <ResultLineRow key={i} line={l} />)}
                </ul>
              </div>
            )}

            {result.releaseLines.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Leválasztó</h5>
                <ul className="divide-y divide-gray-100">
                  {result.releaseLines.map((l, i) => <ResultLineRow key={i} line={l} />)}
                </ul>
              </div>
            )}

            {result.impregnationLines.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Impregnálás</h5>
                <ul className="divide-y divide-gray-100">
                  {result.impregnationLines.map((l, i) => <ResultLineRow key={i} line={l} />)}
                </ul>
              </div>
            )}

            {parseFloat(surface.area) > 0 && (
              <p className="text-xs text-gray-500">
                Háló-mennyiség: {(parseFloat(surface.area) * MESH_OVERLAP_FACTOR).toFixed(1)} m² ({Math.round(MESH_OVERLAP_FACTOR * 100 - 100)}% átfedési ráhagyás).
              </p>
            )}

            <div className="pt-3 border-t border-gray-200 space-y-2">
              {isPartner && result.totalPartner !== undefined ? (
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-800">Összesen (partner −{discountPercent}%):</span>
                  <span className="font-bold text-green-600">{formatFt(result.totalPartner)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-800">Összesen:</span>
                  <span className="font-bold text-brand-600">{formatFt(result.totalBrutto)}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Az árak tartalmazzák az ÁFÁ-t. Munkadíj nem szerepel a kalkulációban.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PigmentSection — 4 szekciós pigment-választó + hozzáadott tételek lista
// ---------------------------------------------------------------------------

interface PigmentSectionProps {
  pigmentLines: PigmentLine[];
  onAdd: (line: PigmentLine) => void;
  onRemove: (idx: number) => void;
  mixolBinderMissing: boolean;
}

function PigmentSection({ pigmentLines, onAdd, onRemove, mixolBinderMissing }: PigmentSectionProps) {
  const [decorColorKey, setDecorColorKey] = useState('');
  const [decorPackIdx, setDecorPackIdx] = useState<number | null>(null);
  const [mixolIdx, setMixolIdx] = useState<number | null>(null);
  const [mixolPackIdx, setMixolPackIdx] = useState<number | null>(null);

  const submitDecor = () => {
    if (!decorColorKey || decorPackIdx === null) return;
    onAdd({ type: 'est_decor', colorKey: decorColorKey, packIndex: decorPackIdx });
    setDecorColorKey('');
    setDecorPackIdx(null);
  };
  const submitMixol = () => {
    if (mixolIdx === null || mixolPackIdx === null) return;
    onAdd({ type: 'mixol', mixolIndex: mixolIdx, packIndex: mixolPackIdx });
    setMixolIdx(null);
    setMixolPackIdx(null);
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        EST-Decor a poralapú alapszín — önállóan felvihető a falra. A Mixol a folyékony kötőanyaghoz kevert színező, ezért Mixol esetén kötelező Silcopin VAGY Monocrom mellé.
      </p>

      {/* EST-Decor */}
      <div className="border border-gray-200 rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">EST-Decor (alapszín, poralapú)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {EST_DECOR_COLORS.map(c => (
            <button
              key={c.key}
              onClick={() => setDecorColorKey(c.key === decorColorKey ? '' : c.key)}
              className={`p-2 rounded border text-xs font-medium text-left transition-all ${
                decorColorKey === c.key
                  ? 'border-brand-500 bg-brand-50 text-gray-900'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-brand-400'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {EST_DECOR_PACKS.map((p, i) => (
            <button
              key={i}
              onClick={() => setDecorPackIdx(i === decorPackIdx ? null : i)}
              className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${
                decorPackIdx === i
                  ? 'border-brand-500 bg-brand-50 text-gray-900'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-brand-400'
              }`}
            >
              {p.label} ({p.price.toLocaleString('hu-HU')} Ft, ~{p.m2min}–{p.m2max} m²)
            </button>
          ))}
          <button
            onClick={submitDecor}
            disabled={!decorColorKey || decorPackIdx === null}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              decorColorKey && decorPackIdx !== null
                ? 'bg-brand-500 hover:bg-brand-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            + Hozzáad
          </button>
        </div>
      </div>

      {/* Silcopin */}
      <div className="border border-gray-200 rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Silcopin (színtelen kötőanyag, gyengébb)</p>
        <div className="flex flex-wrap gap-2">
          {SILCOPIN.map((p, i) => (
            <button
              key={i}
              onClick={() => onAdd({ type: 'silcopin', packIndex: i })}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:border-brand-500 hover:bg-brand-50 transition-all"
            >
              + {p.label} ({p.price.toLocaleString('hu-HU')} Ft, ~{p.m2} m²) {isPlaceholderSku(p.sku) && <span className="text-amber-600">⚠</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Monocrom */}
      <div className="border border-gray-200 rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Monocrom (színtelen kötőanyag, erős)</p>
        <div className="flex flex-wrap gap-2">
          {MONOCROM.map((p, i) => (
            <button
              key={i}
              onClick={() => onAdd({ type: 'monocrom', packIndex: i })}
              className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:border-brand-500 hover:bg-brand-50 transition-all"
            >
              + {p.label} ({p.price.toLocaleString('hu-HU')} Ft, ~{p.m2} m²)
            </button>
          ))}
        </div>
      </div>

      {/* Mixol */}
      <div className="border border-gray-200 rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Mixol színező (a kötőanyaghoz adagolva)</p>
        <select
          value={mixolIdx === null ? '' : mixolIdx}
          onChange={(e) => { setMixolIdx(e.target.value === '' ? null : parseInt(e.target.value, 10)); setMixolPackIdx(null); }}
          className="w-full p-2 border-2 border-gray-300 rounded text-sm mb-2 bg-white"
        >
          <option value="">— válassz Mixol színt —</option>
          {MIXOL.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
        </select>
        {mixolIdx !== null && (
          <div className="flex flex-wrap gap-2 items-center">
            {MIXOL[mixolIdx].packs.map((p, i) => (
              <button
                key={i}
                onClick={() => setMixolPackIdx(i === mixolPackIdx ? null : i)}
                className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${
                  mixolPackIdx === i
                    ? 'border-brand-500 bg-brand-50 text-gray-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-400'
                }`}
              >
                {p.label} ({p.price.toLocaleString('hu-HU')} Ft, ~{p.m2} m²)
              </button>
            ))}
            <button
              onClick={submitMixol}
              disabled={mixolPackIdx === null}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                mixolPackIdx !== null
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              + Hozzáad
            </button>
          </div>
        )}
      </div>

      {/* Hozzáadott tételek */}
      {pigmentLines.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Hozzáadott pigment-tételek</p>
          <ul className="space-y-1">
            {pigmentLines.map((pl, idx) => (
              <li key={idx} className="flex justify-between items-center text-xs text-gray-700">
                <span>{renderPigmentLineSummary(pl)}</span>
                <button onClick={() => onRemove(idx)} className="text-red-600 hover:text-red-800 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mixolBinderMissing && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 mt-2">
          ⚠ Mixol színezőhöz kötelező kötőanyag (Silcopin VAGY Monocrom). Adj hozzá egyet a kalkuláció előtt.
        </p>
      )}
    </div>
  );
}

function renderPigmentLineSummary(pl: PigmentLine): string {
  if (pl.type === 'est_decor') {
    const c = EST_DECOR_COLORS.find(c => c.key === pl.colorKey);
    const p = EST_DECOR_PACKS[pl.packIndex];
    return `EST-Decor — ${c?.name ?? '?'}, ${p?.label ?? '?'} (${p?.price.toLocaleString('hu-HU')} Ft)`;
  }
  if (pl.type === 'silcopin') {
    const p = SILCOPIN[pl.packIndex];
    return `Silcopin — ${p?.label ?? '?'} (${p?.price.toLocaleString('hu-HU')} Ft)`;
  }
  if (pl.type === 'monocrom') {
    const p = MONOCROM[pl.packIndex];
    return `Monocrom — ${p?.label ?? '?'} (${p?.price.toLocaleString('hu-HU')} Ft)`;
  }
  if (pl.type === 'mixol') {
    const m = MIXOL[pl.mixolIndex];
    const p = m?.packs[pl.packIndex];
    return `${m?.name ?? '?'} — ${p?.label ?? '?'} (${p?.price.toLocaleString('hu-HU')} Ft)`;
  }
  return '?';
}

// ---------------------------------------------------------------------------
// Tételsor megjelenítő komponensek
// ---------------------------------------------------------------------------

function ResultLineRow({ line }: { line: LineItem }) {
  const hasRange = line.m2CoverageMin !== undefined && line.m2CoverageMax !== undefined;
  const coverageText =
    hasRange ? `≈ ${line.m2CoverageMin}–${line.m2CoverageMax} m²` :
    line.m2Coverage !== undefined ? `≈ ${line.m2Coverage} m²` : '';
  return (
    <li className="py-2 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="text-gray-800 font-medium break-words sm:flex-1">
          {line.name}
          {!line.inCart && <span className="ml-1 text-amber-600 text-xs">⚠ SKU pótlása folyamatban</span>}
        </span>
        <span className="text-gray-500 sm:shrink-0 sm:w-36 sm:text-right">
          {line.units} × {line.unitSize}
          {coverageText && <span className="block text-[10px] text-gray-400">{coverageText}</span>}
        </span>
        <span className="text-gray-900 font-semibold sm:shrink-0 sm:w-28 sm:text-right">
          {formatFt(line.totalPrice)}
        </span>
      </div>
    </li>
  );
}

function AggLineRow({ line }: { line: { name: string; sku: string; units: number; unitSize: string; totalPrice: number; inCart: boolean } }) {
  return (
    <li className="py-2 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="text-gray-800 font-medium break-words sm:flex-1">
        {line.name}
        {!line.inCart && <span className="ml-1 text-amber-600 text-xs">⚠ SKU pótlása folyamatban</span>}
      </span>
      <span className="text-gray-500 sm:shrink-0 sm:w-36 sm:text-right">{line.units} × {line.unitSize}</span>
      <span className="text-gray-900 font-semibold sm:shrink-0 sm:w-28 sm:text-right">{formatFt(line.totalPrice)}</span>
    </li>
  );
}
