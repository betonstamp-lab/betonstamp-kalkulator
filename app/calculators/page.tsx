'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function CalculatorsPage() {
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

          {/* Right - Sign out */}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 font-medium border-2 border-red-500 rounded-lg px-3 py-2 hover:text-red-500 transition-colors shrink-0"
          >
            Kijelentkezés
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 pt-8 md:pt-16">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          Kalkulátorok
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-10 text-center">
          Válassza ki a kívánt kalkulátort
        </p>

        {/* Cards grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Mikrocement - ACTIVE */}
          <Link
            href="/calculators/mikrocement"
            className="group bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="h-32 md:h-40 flex items-center justify-center mb-4">
              <Image
                src="/images/topciment-logo2.png"
                alt="Topciment"
                width={200}
                height={160}
                className="max-h-24 md:max-h-32 w-auto object-contain"
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Mikrocement Kalkulátor</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">
              Topciment professzionális mikrocement rendszerek anyagszükséglet és ár kalkulátora.
            </p>
            <span className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm">
              Kalkulátor megnyitása
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>

          {/* Vakolat - COMING SOON */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center opacity-60 grayscale">
            <span className="absolute top-3 right-3 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
              Hamarosan
            </span>
            <div className="h-32 md:h-40 flex items-center justify-center mb-4">
              <Image
                src="/images/estecha_logo_hungary.png"
                alt="Estecha"
                width={400}
                height={200}
                className="max-h-28 md:max-h-36 w-auto object-contain"
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Vakolat Kalkulátor</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">
              Az Estecha tematizációs vakolat rendszerének anyagszükséglet és ár kalkulátora. (Hamarosan elérhető)
            </p>
          </div>

          {/* Beton/Overlay - COMING SOON */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center opacity-60 grayscale">
            <span className="absolute top-3 right-3 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
              Hamarosan
            </span>
            <div className="h-32 md:h-40 flex items-center justify-center mb-4">
              <Image
                src="/images/betonstamp-logo.png"
                alt="BetonStamp"
                width={320}
                height={160}
                className="max-h-28 md:max-h-36 w-auto object-contain"
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Beton/Overlay Kalkulátor</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">
              Beton és overlay rendszerek anyagszükséglet kalkulátora. Hamarosan elérhető!
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-auto pb-6 text-sm text-gray-400 text-center">
          © 2024 Betonstamp Kft. - Minden jog fenntartva.
        </p>
      </div>
    </div>
  );
}
