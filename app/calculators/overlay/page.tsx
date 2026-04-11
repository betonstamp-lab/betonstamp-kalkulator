'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import { OVERLAY_COLORS } from '@/lib/calculators/overlay/products';

type Technology = 'por' | 'folyekony' | null;
type PowderColor = 'noir' | 'antracita' | null;
type Lacquer = 'normal' | 'ad' | null;

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
  };

  const handleCalculate = () => {
    console.log('Overlay kalkuláció input:', {
      technology,
      powderColor,
      overlayColor,
      lacquer,
      area,
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
          Overlay Kalkulátor
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 text-center max-w-2xl">
          Meglévő betonfelületekre alkalmazandó 1cm vastagságú anyagrendszer kalkulátora
        </p>

        <div className="w-full max-w-2xl space-y-6">
          {/* Technológia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technológia
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
                Por leválasztós
              </button>
              <button
                onClick={() => handleTechnologyChange('folyekony')}
                className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  technology === 'folyekony'
                    ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                Folyékony leválasztós (Relief-fel)
              </button>
            </div>
          </div>

          {/* Leválasztó szín - csak por technológiánál */}
          {technology === 'por' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leválasztó por színe
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setPowderColor('noir')}
                  className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                    powderColor === 'noir'
                      ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  Desmocem Powder Noir
                </button>
                <button
                  onClick={() => setPowderColor('antracita')}
                  className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                    powderColor === 'antracita'
                      ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                  }`}
                >
                  Desmocem Powder Antracita
                </button>
              </div>
            </div>
          )}

          {/* Overlay szín */}
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
                  onClick={() => setOverlayColor('')}
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
                  onClick={() => setOverlayColor(c.key)}
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
                    {c.key}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lakk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lakk
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setLacquer('normal')}
                className={`p-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                  lacquer === 'normal'
                    ? 'border-brand-500 ring-2 ring-brand-300 bg-white text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500'
                }`}
              >
                Sealcem DSV M70 (normál)
              </button>
              <button
                onClick={() => setLacquer('ad')}
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

          {/* Terület */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terület (m²)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Pl. 20"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 font-medium bg-white"
            />
          </div>

          {/* Calculate */}
          <button
            onClick={handleCalculate}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Kalkuláció Készítése
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="py-6 text-sm text-gray-400 text-center">
        © 2024 Betonstamp Kft. - Minden jog fenntartva.
      </p>
    </div>
  );
}
