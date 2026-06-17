'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import { ATLANTTIC_PIGMENT_RECIPES } from '@/lib/calculators/mikrocement/pigments';
import { MICROCEMENT_COVERAGE } from '@/lib/calculators/pigment/coverage';

const POOL_PRODUCTS = [
  { value: 'xl', label: 'Aquaciment XL' },
];

const POOL_COLORS = ['BLANCO'];
const POOL_COLOR_HEX: Record<string, string> = { 'BLANCO': '#efede8' };

// m² mód: Atlanttic-nál grain fix XL, szín fix BLANCO
const ATLANTTIC_FIXED_GRAIN = 'xl' as const;
const ATLANTTIC_FIXED_COLOR = 'BLANCO';

interface PigmentResult {
  product: string;
  color: string;
  kg: number;
  pigments: { name: string; grams: number }[];
  totalGrams: number;
}

interface M2Surface {
  id: number;
  m2: string;
}

interface M2SurfaceResult {
  n: number;
  m2: number;
  weightKg: number;
  pigments: { name: string; grams: number }[];
}

interface M2Result {
  surfaces: M2SurfaceResult[];
  totalKg: number;
  byColor: Array<{ color: string; pigments: { name: string; grams: number }[] }>;
}

const fmt2 = (n: number) => parseFloat(n.toFixed(2));

// A pigmentet rétegenként mérik ki, ezért az m² mód egy rétegre számol —
// nincs rétegszám input, és a kg-súly szorzóban sincs layers.
function createEmptyM2Surface(id: number): M2Surface {
  return { id, m2: '' };
}

export default function PoolCalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const [product, setProduct] = useState('');
  const [color, setColor] = useState('');
  const [kg, setKg] = useState('');
  const [result, setResult] = useState<PigmentResult | null>(null);

  // m² mód state
  const [inputMode, setInputMode] = useState<'kg' | 'm2'>('kg');
  const [m2Surfaces, setM2Surfaces] = useState<M2Surface[]>([createEmptyM2Surface(1)]);
  const [m2Result, setM2Result] = useState<M2Result | null>(null);

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

  const handleCalculate = () => {
    if (!product || !color || !kg) return;

    const recipe = ATLANTTIC_PIGMENT_RECIPES[product]?.[color];

    if (!recipe) {
      setResult(null);
      return;
    }

    const kgNum = parseFloat(kg);
    const pigments = recipe.map(p => ({
      name: p.basePigment,
      grams: parseFloat((p.gramsPerKg * kgNum).toFixed(2)),
    }));

    const totalGrams = parseFloat(pigments.reduce((s, p) => s + p.grams, 0).toFixed(2));

    const productLabel = POOL_PRODUCTS.find(o => o.value === product)?.label || product;

    setResult({
      product: productLabel,
      color,
      kg: kgNum,
      pigments,
      totalGrams,
    });
  };

  // ---- m² mód handlers ----
  const updateM2Surface = (id: number, patch: Partial<M2Surface>) => {
    setM2Surfaces(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    setM2Result(null);
  };
  const addM2Surface = () => {
    const newId = Math.max(0, ...m2Surfaces.map(s => s.id)) + 1;
    setM2Surfaces([...m2Surfaces, createEmptyM2Surface(newId)]);
    setM2Result(null);
  };
  const removeM2Surface = (id: number) => {
    if (m2Surfaces.length <= 1) return;
    setM2Surfaces(m2Surfaces.filter(s => s.id !== id));
    setM2Result(null);
  };

  const isM2SurfaceValid = (s: M2Surface) => {
    const m2 = parseFloat(s.m2);
    return !isNaN(m2) && m2 > 0;
  };
  const canCalculateM2 = m2Surfaces.every(isM2SurfaceValid);

  const handleCalculateM2 = () => {
    if (!canCalculateM2) return;
    const results: M2SurfaceResult[] = [];
    m2Surfaces.forEach((s, idx) => {
      const m2 = parseFloat(s.m2);
      const cov = MICROCEMENT_COVERAGE.atlantic[ATLANTTIC_FIXED_GRAIN];
      const weightKg = m2 * cov;
      const recipe = ATLANTTIC_PIGMENT_RECIPES[ATLANTTIC_FIXED_GRAIN]?.[ATLANTTIC_FIXED_COLOR];
      const pigments = recipe
        ? recipe.map(p => ({ name: p.basePigment, grams: fmt2(p.gramsPerKg * weightKg) })).filter(p => p.grams > 0)
        : [];
      results.push({
        n: idx + 1,
        m2: fmt2(m2),
        weightKg: fmt2(weightKg),
        pigments,
      });
    });

    const totalKg = fmt2(results.reduce((sum, r) => sum + r.weightKg, 0));

    // Atlanttic-nál egyetlen szín (BLANCO), de a Natture-mintát követve csoportosítjuk
    const colorMap = new Map<string, Map<string, number>>();
    results.forEach(r => {
      if (r.pigments.length === 0) return;
      if (!colorMap.has(ATLANTTIC_FIXED_COLOR)) colorMap.set(ATLANTTIC_FIXED_COLOR, new Map());
      const pigMap = colorMap.get(ATLANTTIC_FIXED_COLOR)!;
      r.pigments.forEach(p => {
        pigMap.set(p.name, (pigMap.get(p.name) || 0) + p.grams);
      });
    });
    const byColor = Array.from(colorMap.entries()).map(([color, pigMap]) => ({
      color,
      pigments: Array.from(pigMap.entries()).map(([name, g]) => ({ name, grams: fmt2(g) })),
    }));

    setM2Result({ surfaces: results, totalKg, byColor });
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
          Atlanttic Pigment Kalkulátor
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 text-center">
          Topciment Atlanttic medence rendszerek
        </p>

        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-4">
          {/* Input mode toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Számítás alapja</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setInputMode('kg'); setM2Result(null); }}
                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  inputMode === 'kg' ? 'border-brand-500 bg-white text-gray-900 shadow-md' : 'border-gray-300 bg-white text-gray-600 hover:border-brand-400'
                }`}
              >
                Mennyiség (kg)
              </button>
              <button
                onClick={() => { setInputMode('m2'); setResult(null); }}
                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  inputMode === 'm2' ? 'border-brand-500 bg-white text-gray-900 shadow-md' : 'border-gray-300 bg-white text-gray-600 hover:border-brand-400'
                }`}
              >
                Terület (m²)
              </button>
            </div>
          </div>

          {/* === KG MÓD === */}
          {inputMode === 'kg' && (
          <>
          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mikrocement
            </label>
            <select
              value={product}
              onChange={(e) => { setProduct(e.target.value); setResult(null); }}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
            >
              <option value="">Válassz terméket...</option>
              {POOL_PRODUCTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Szín
            </label>
            {color && (
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: POOL_COLOR_HEX[color] || '#ccc' }}
                />
                <span className="text-sm font-medium text-gray-800">{color}</span>
                <button
                  onClick={() => { setColor(''); setResult(null); }}
                  className="text-xs text-red-500 hover:text-red-700 ml-2"
                >
                  ✕ Törlés
                </button>
              </div>
            )}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {POOL_COLORS.map(c => {
                const hex = POOL_COLOR_HEX[c] || '#ccc';
                return (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setResult(null); }}
                    className={`flex flex-col items-center p-1 rounded border-2 transition-all hover:scale-105 ${
                      color === c
                        ? 'border-brand-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className="w-full aspect-square rounded-sm mb-1"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[9px] leading-tight text-center text-gray-600 break-words">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kg */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mennyiség (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={kg}
              onChange={(e) => { setKg(e.target.value); setResult(null); }}
              placeholder="Pl. 10"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
            />
          </div>

          {/* Calculate */}
          <button
            onClick={handleCalculate}
            disabled={!product || !color || !kg}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Számítás
          </button>
          </>
          )}

          {/* === M² MÓD === */}
          {inputMode === 'm2' && (
          <>
          <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2">
            <strong>Atlanttic XL — medence mikrocement.</strong> Szín fix: <span className="font-semibold">BLANCO (fehér)</span>. Csak felület kell.
          </div>
          {m2Surfaces.map((s, idx) => (
            <div key={s.id} className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Felület {idx + 1}</h3>
                {m2Surfaces.length > 1 && (
                  <button onClick={() => removeM2Surface(s.id)} className="text-xs text-red-600 hover:text-red-800 border border-red-300 rounded px-2 py-1">✕ Törlés</button>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Felület (m²)</label>
                <input
                  type="number" step="0.1" min="0" value={s.m2}
                  onChange={(e) => updateM2Surface(s.id, { m2: e.target.value })}
                  placeholder="Pl. 20"
                  className="w-full p-2 border-2 border-gray-300 rounded focus:border-brand-500 focus:outline-none transition text-gray-900 bg-white text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 pt-1">
                <span className="text-gray-500">Szín:</span>
                <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: POOL_COLOR_HEX['BLANCO'] }} />
                <span className="font-medium">BLANCO</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">Szemcse:</span>
                <span className="font-medium">XL (1,5 kg/m²)</span>
              </div>
            </div>
          ))}

          <button
            onClick={addM2Surface}
            className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-500 text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
          >
            + Felület hozzáadása
          </button>

          <button
            onClick={handleCalculateM2}
            disabled={!canCalculateM2}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Számítás
          </button>
          </>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Pigment szükséglet</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Termék:</span> {result.product}</p>
              <p><span className="font-medium">Szín:</span> {result.color}</p>
              <p><span className="font-medium">Mennyiség:</span> {result.kg} kg</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Szükséges pigmentek:</p>
              <ul className="space-y-1">
                {result.pigments.map(p => (
                  <li key={p.name} className="flex justify-between text-sm">
                    <span className="text-gray-600">{p.name}</span>
                    <span className="font-medium text-gray-800">{p.grams} g</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm font-bold">
                <span className="text-gray-700">Összesen:</span>
                <span className="text-gray-900">{result.totalGrams} g</span>
              </div>
            </div>
          </div>
        )}

        {/* m² mód eredmény */}
        {m2Result && (
          <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Anyagszükséglet (m² alapú)</h2>
            <p className="text-xs text-gray-500 mb-2">A mennyiségek egy rétegre vonatkoznak — a pigmentet rétegenként, ugyanezzel az aránnyal kell kimérni.</p>
            <p className="text-sm text-gray-700 mb-4"><span className="font-medium">Termék:</span> Aquaciment XL · <span className="font-medium">Szín:</span> BLANCO</p>
            <div className="space-y-3">
              {m2Result.surfaces.map(r => (
                <div key={r.n} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    Felület {r.n} — {r.m2} m²
                  </p>
                  <div className="text-sm text-gray-700">
                    <div className="flex justify-between"><span>Mikrocement:</span><span className="font-medium">{r.weightKg} kg</span></div>
                  </div>
                  {r.pigments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600 mb-1">Pigmentek:</p>
                      <ul className="space-y-0.5 text-xs">
                        {r.pigments.map(p => (
                          <li key={p.name} className="flex justify-between">
                            <span className="text-gray-600">{p.name}</span>
                            <span className="font-medium text-gray-800">{p.grams} g</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-800 mb-3">Összesen</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-700">Mikrocement összesen:</span><span className="font-bold text-gray-900">{m2Result.totalKg} kg</span></div>
              </div>
              {m2Result.byColor.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Pigmentek színenként:</p>
                  <div className="space-y-2">
                    {m2Result.byColor.map(group => (
                      <div key={group.color} className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-bold text-gray-800 mb-1">{group.color}</p>
                        <ul className="space-y-0.5 text-xs">
                          {group.pigments.map(p => (
                            <li key={p.name} className="flex justify-between">
                              <span className="text-gray-600">{p.name}</span>
                              <span className="font-medium text-gray-800">{p.grams} g</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
