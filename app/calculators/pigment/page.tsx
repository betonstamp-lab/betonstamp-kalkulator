'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Image from 'next/image';
import Link from 'next/link';
import {
  EFECTTO_QUARTZ_PIGMENT_UNDER_DEVELOPMENT,
  EFECTTO_PU_PIGMENT_UNDER_DEVELOPMENT,
} from '@/lib/calculators/pigment/featureFlags';
import AppHeader from '@/components/AppHeader';

type System = {
  key: string;
  label: string;
  logo: string;
  href: string;
  active: boolean;
  badge?: string; // ha nem active, akkor a kártyán megjelenő badge szövege
};

const SYSTEMS: System[] = [
  { key: 'natture', label: 'Natture', logo: '/images/natture.png', href: '/calculators/pigment/natture', active: true },
  { key: 'pool', label: 'Atlanttic', logo: '/images/Atlanttic_Topciment_Logo_200px.png', href: '/calculators/pigment/pool', active: true },
  {
    key: 'efecttoQuartz', label: 'Efectto Quartz', logo: '/images/efectto_quartz.png', href: '/calculators/pigment/efectto-quartz',
    active: !EFECTTO_QUARTZ_PIGMENT_UNDER_DEVELOPMENT,
    badge: EFECTTO_QUARTZ_PIGMENT_UNDER_DEVELOPMENT ? 'Fejlesztés alatt' : undefined,
  },
  {
    key: 'efecttoPU', label: 'Efectto PU', logo: '/images/Efectto_PU_logo_web.png', href: '/calculators/pigment/efectto-pu',
    active: !EFECTTO_PU_PIGMENT_UNDER_DEVELOPMENT,
    badge: EFECTTO_PU_PIGMENT_UNDER_DEVELOPMENT ? 'Fejlesztés alatt' : undefined,
  },
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
      {/* Header — közös AppHeader */}
      <AppHeader profile={profile} userEmail={user?.email} />

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
                  <span className="absolute top-2 right-2 bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {sys.badge ?? 'Hamarosan'}
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
