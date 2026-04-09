'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import Calculator from '@/components/Calculator';
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
  const handleLogout = async () => {
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
    <div className="min-h-screen bg-gray-100">
      {/* Header felhasználói adatokkal */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{profile?.name}</p>
              <p className="text-sm text-gray-500">
                {profile?.role === 'partner' ? (
                  <span className="text-green-600 font-medium">
                    Partner ({profile.partner_discount}% kedvezmény)
                  </span>
                ) : (
                  'Ügyfél'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Kijelentkezés
          </button>
        </div>
      </div>

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
