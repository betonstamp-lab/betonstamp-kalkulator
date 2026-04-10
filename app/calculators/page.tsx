'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/shared/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function CalculatorsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center p-4 pt-8 md:pt-16">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <Image
            src="/images/betonstamp-logo.png"
            alt="BetonStamp"
            width={180}
            height={72}
            className="h-16 w-auto"
          />
          <Image
            src="/images/topciment-logo.png"
            alt="Topciment"
            width={200}
            height={80}
            className="h-20 w-auto hidden sm:block"
          />
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          Kijelentkezés
        </button>
      </div>

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
          <div className="w-16 h-16 mb-4 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="20" width="24" height="4" rx="1" fill="#053d57" opacity="0.3" />
              <rect x="4" y="14" width="24" height="4" rx="1" fill="#053d57" opacity="0.5" />
              <rect x="4" y="8" width="24" height="4" rx="1" fill="#053d57" opacity="0.7" />
              <path d="M2 26h28" stroke="#053d57" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 4l4 2v2h-4V4z" fill="#fbc02d" />
            </svg>
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
          <div className="w-16 h-16 mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="20" height="16" rx="2" fill="#053d57" opacity="0.3" />
              <path d="M8 10V8a2 2 0 012-2h12a2 2 0 012 2v2" stroke="#053d57" strokeWidth="2" />
              <path d="M6 18h20" stroke="#053d57" strokeWidth="1.5" strokeDasharray="3 2" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Vakolat Kalkulátor</h2>
          <p className="text-sm text-gray-500 mb-4 flex-1">
            Vakolat rendszerek anyagszükséglet kalkulátora. Hamarosan elérhető!
          </p>
        </div>

        {/* Beton/Overlay - COMING SOON */}
        <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center opacity-60 grayscale">
          <span className="absolute top-3 right-3 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
            Hamarosan
          </span>
          <div className="w-16 h-16 mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="16" width="24" height="10" rx="2" fill="#053d57" opacity="0.3" />
              <rect x="8" y="12" width="16" height="4" rx="1" fill="#053d57" opacity="0.5" />
              <circle cx="16" cy="8" r="3" fill="#053d57" opacity="0.4" />
            </svg>
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
  );
}
