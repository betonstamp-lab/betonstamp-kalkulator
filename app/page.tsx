'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/shared/supabase';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Image from 'next/image';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/calculators/mikrocement');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-8">
        <Image 
          src="/images/betonstamp-logo.png" 
          alt="BetonStamp" 
          width={240} 
          height={96}
          className="h-24 w-auto"
        />
        <Image 
          src="/images/topciment-logo.png" 
          alt="Topciment" 
          width={280} 
          height={112}
          className="h-28 w-auto"
        />
      </div>

      {/* Cím */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
        Mikrocement Kalkulátor
      </h1>

      {/* Tab váltó */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Belépés
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Regisztráció
          </button>
        </div>

        <div className="p-6">
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-500 text-center">
        © 2024 Topciment Professzionális Mikrocement Rendszerek
      </p>
    </div>
  );
}