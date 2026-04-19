'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import {
  EFECTTO_PU_COLORS,
  EFECTTO_PU_RECIPES,
  EFECTTO_PIGMENT_LABELS,
  EfecttoPigmentRecipe,
} from '@/lib/calculators/pigment/efectto_pu_pigments';
import {
  getEfecttoColorHex,
  sortEfecttoColors,
} from '@/lib/calculators/pigment/efectto_color_hex';

const SORTED_PU_COLORS = sortEfecttoColors(EFECTTO_PU_COLORS);

const PU_PRODUCTS = [
  { value: 'small', label: 'Efectto PU Small Grain' },
  { value: 'medium', label: 'Efectto PU Medium Grain' },
  { value: 'big', label: 'Efectto PU Big Grain' },
] as const;

type GrainSize = typeof PU_PRODUCTS[number]['value'];

interface PigmentResult {
  product: string;
  color: string;
  kg: number;
  pigments: { name: string; grams: number }[];
  totalGrams: number;
}

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
            {text}
            <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default function EfecttoPUCalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const [product, setProduct] = useState<GrainSize | ''>('');
  const [color, setColor] = useState('');
  const [kg, setKg] = useState('');
  const [result, setResult] = useState<PigmentResult | null>(null);

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

    const recipe = EFECTTO_PU_RECIPES[product]?.[color as keyof typeof EFECTTO_PU_RECIPES['small']];
    if (!recipe) {
      setResult(null);
      return;
    }

    const kgNum = parseFloat(kg);
    const pigments = (Object.keys(recipe) as (keyof EfecttoPigmentRecipe)[])
      .map(key => {
        const value = recipe[key];
        if (value === undefined || value === 0) return null;
        return {
          name: EFECTTO_PIGMENT_LABELS[key],
          grams: parseFloat((value * kgNum).toFixed(2)),
        };
      })
      .filter((p): p is { name: string; grams: number } => p !== null && p.grams > 0);

    const totalGrams = parseFloat(pigments.reduce((s, p) => s + p.grams, 0).toFixed(2));

    const productLabel = PU_PRODUCTS.find(o => o.value === product)?.label || product;

    setResult({
      product: productLabel,
      color,
      kg: kgNum,
      pigments,
      totalGrams,
    });
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
          Efectto PU Pigment Kalkulátor
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 text-center">
          Topciment Efectto PU mikrocement rendszerek
        </p>

        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-4">
          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mikrocement
            </label>
            <select
              value={product}
              onChange={(e) => { setProduct(e.target.value as GrainSize | ''); setResult(null); }}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
            >
              <option value="">Válassz terméket...</option>
              {PU_PRODUCTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Szín
              <Tooltip text="A Gábor recept szerinti pigment mennyiségek. 1 kg kész mikrocementre vonatkoznak." />
            </label>
            {color && (() => {
              const selectedHex = getEfecttoColorHex(color);
              return (
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: selectedHex || '#e5e7eb' }}
                  />
                  <span className={`text-sm font-medium text-gray-800 ${!selectedHex ? 'line-through decoration-red-500 decoration-2' : ''}`}>
                    {color}
                  </span>
                  <button
                    onClick={() => { setColor(''); setResult(null); }}
                    className="text-xs text-red-500 hover:text-red-700 ml-2"
                  >
                    ✕ Törlés
                  </button>
                </div>
              );
            })()}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {SORTED_PU_COLORS.map(c => {
                const hex = getEfecttoColorHex(c);
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
                    <div className="relative w-full aspect-square rounded-sm mb-1 overflow-hidden" style={{ backgroundColor: hex || '#e5e7eb' }}>
                      {!hex && (
                        <svg
                          className="absolute inset-0 w-full h-full text-red-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <line x1="3" y1="3" x2="21" y2="21" />
                          <line x1="21" y1="3" x2="3" y2="21" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[9px] leading-tight text-center text-gray-600 break-words ${!hex ? 'line-through decoration-red-500' : ''}`}>{c}</span>
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
              {result.pigments.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Ehhez a színhez nincs pigment szükséglet.</p>
              ) : (
                <ul className="space-y-1">
                  {result.pigments.map(p => (
                    <li key={p.name} className="flex justify-between text-sm">
                      <span className="text-gray-600">{p.name}</span>
                      <span className="font-medium text-gray-800">{p.grams} g</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm font-bold">
                <span className="text-gray-700">Összesen:</span>
                <span className="text-gray-900">{result.totalGrams} g</span>
              </div>
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
