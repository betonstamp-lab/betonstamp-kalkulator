'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import Link from 'next/link';

const SYSTEMS = [
  { key: 'natture', label: 'Natture', logo: '/images/natture.png', href: '/calculators/pigment/natture', active: true },
  { key: 'pool', label: 'Atlanttic', logo: '/images/Atlanttic_Topciment_Logo_200px.png', href: '/calculators/pigment/pool', active: true },
  { key: 'efecttoQuartz', label: 'Efectto Quartz', logo: '/images/efectto_quartz.png', href: '/calculators/pigment/efectto-quartz', active: true },
  { key: 'efecttoPU', label: 'Efectto PU', logo: '/images/Efectto_PU_logo_web.png', href: '/calculators/pigment/efectto-pu', active: true },
];

export default function PigmentCalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

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
          Pigment Kalkulátor
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 text-center">
          Válaszd ki a rendszert
        </p>

        {/* System selector */}
        <div className="w-full max-w-3xl grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {SYSTEMS.map(sys => {
            const cardInner = (
              <>
                {!sys.active && (
                  <span className="absolute top-2 right-2 bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Hamarosan
                  </span>
                )}
                <div className="h-24 md:h-32 flex items-center justify-center">
                  <Image
                    src={sys.logo}
                    alt={sys.label}
                    width={200}
                    height={120}
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              </>
            );

            if (sys.active) {
              return (
                <Link
                  key={sys.key}
                  href={sys.href}
                  className="relative bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center transition-all border-2 border-gray-300 hover:border-brand-500 hover:scale-105 cursor-pointer"
                >
                  {cardInner}
                </Link>
              );
            }

            return (
              <div
                key={sys.key}
                className="relative bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center transition-all opacity-60 grayscale border-2 border-gray-300 cursor-not-allowed"
              >
                {cardInner}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <p className="py-6 text-sm text-gray-400 text-center">
        © 2026 Betonstamp Kft. - Minden jog fenntartva.
      </p>
    </div>
  );
}
