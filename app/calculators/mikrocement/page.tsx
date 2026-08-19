'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Calculator from '@/components/Calculator';
import AppHeader from '@/components/AppHeader';
export default function CalculatorPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shopSyncMessage, setShopSyncMessage] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);
      // Profil lekérése
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profileData) {
        setProfile(profileData);

        // Partner szinkronizálás a Shoprenter webshoppal
        if (profileData.role === 'partner') {
          try {
            const syncRes = await fetch('/api/shoprenter/sync-partner', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: session.user.email,
                name: profileData.name || ''
              }),
            });
            const syncData = await syncRes.json();
            
            if (syncData.status === 'created' && syncData.needsPasswordReset) {
              setShopSyncMessage('Webshop fiókod létrejött a partneri kedvezménnyel. A betonstamp.hu oldalon az "Elfelejtett jelszó" funkcióval tudsz jelszót beállítani.');
            }
          } catch (err) {
            // Sync hiba csendben - ne akadályozza a kalkulátor használatát
            console.error('Shoprenter sync error:', err);
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
    // Auth state változás figyelése
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header — közös AppHeader */}
      <AppHeader profile={profile} userEmail={user?.email} />

      {/* Webshop fiók értesítés */}
      {shopSyncMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start justify-between gap-2">
            <p className="text-sm text-yellow-800">{shopSyncMessage}</p>
            <button 
              onClick={() => setShopSyncMessage(null)}
              className="text-yellow-600 hover:text-yellow-800 font-bold text-lg leading-none"
            >×</button>
          </div>
        </div>
      )}

      {/* Kalkulátor komponens a profil adatokkal */}
      <Calculator profile={profile} />
    </div>
  );
}
