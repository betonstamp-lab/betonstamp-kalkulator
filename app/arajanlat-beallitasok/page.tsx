'use client';

// Árajánlat-beállítások oldal — CSAK partner user férhet hozzá.
// A partner itt írja be a cégbemutatót és tölt fel/töröl referenciaképeket;
// a hivatalos árajánlat-PDF ebből építkezik majd (következő lépés).
//
// Data-réteg: lib/quoteProfile.ts (Supabase quote_profiles tábla +
// quote-reference-images bucket). Nem-partner user redirect a /calculators-re.

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserProfile } from '@/lib/shared/supabase';
import AppHeader from '@/components/AppHeader';
import {
  getQuoteProfile,
  upsertQuoteProfile,
  listReferenceImages,
  uploadReferenceImage,
  deleteReferenceImage,
  getReferenceImageUrl,
  uploadCompanyLogo,
  deleteCompanyLogo,
  getCompanyLogoUrl,
  type QuoteReferenceImage,
} from '@/lib/quoteProfile';

const MAX_INTRO_CHARS = 2000;
const MAX_IMAGES = 8;
const ACCEPTED_MIME = 'image/jpeg,image/jpg,image/png,image/webp';

interface GalleryItem {
  image: QuoteReferenceImage;
  /** Signed URL az előnézethez (null amíg tölt). */
  url: string | null;
}

export default function QuoteProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [companyIntro, setCompanyIntro] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Céges logó
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoDeleting, setLogoDeleting] = useState(false);

  // Auth guard + kezdeti betöltés
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? null);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData || profileData.role !== 'partner') {
        // Nem-partner user — a kalkulátor-választóra vissza.
        router.push('/calculators');
        return;
      }
      setProfile(profileData);

      // Párhuzamos betöltés: quote_profile + képek + céglogó
      try {
        const [prof, images, logoUrl] = await Promise.all([
          getQuoteProfile(session.user.id),
          listReferenceImages(session.user.id),
          getCompanyLogoUrl(session.user.id).catch(() => null),
        ]);
        if (prof) setCompanyIntro(prof.company_intro ?? '');
        setCompanyLogoUrl(logoUrl);
        const items: GalleryItem[] = images.map((img) => ({ image: img, url: null }));
        setGallery(items);
        // Signed URL-ek háttérben — ne blokkolja a UI-t
        void hydrateSignedUrls(items, setGallery);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Árajánlat-profil betöltés hiba:', err);
      }
      setLoading(false);
    })();
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await upsertQuoteProfile(userId, { company_intro: companyIntro });
      setSavedAt(Date.now());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Mentés hiba:', err);
      setSaveError('A mentés nem sikerült. Kérjük, próbáld újra.');
    } finally {
      setSaving(false);
    }
  }, [userId, companyIntro]);

  const handleFilesSelected = useCallback(
    async (files: FileList | null) => {
      if (!userId || !files || files.length === 0) return;
      setUploadError(null);
      const remaining = MAX_IMAGES - gallery.length;
      if (remaining <= 0) {
        setUploadError(`Legfeljebb ${MAX_IMAGES} kép tölthető fel.`);
        return;
      }
      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);
      try {
        for (const file of toUpload) {
          const img = await uploadReferenceImage(userId, file);
          const url = await getReferenceImageUrl(img.storage_path).catch(() => null);
          setGallery((prev) => [...prev, { image: img, url }]);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Feltöltés hiba:', err);
        setUploadError('A feltöltés nem sikerült. Ellenőrizd a fájl méretét (max 10 MB) és típusát (JPG/PNG/WEBP).');
      } finally {
        setUploading(false);
      }
    },
    [userId, gallery.length]
  );

  const handleLogoSelected = useCallback(
    async (file: File | null) => {
      if (!userId || !file) return;
      setLogoError(null);
      setLogoUploading(true);
      try {
        await uploadCompanyLogo(userId, file);
        const url = await getCompanyLogoUrl(userId);
        setCompanyLogoUrl(url);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Céglogó feltöltés hiba:', err);
        setLogoError('A logó feltöltése nem sikerült. Ellenőrizd a fájl típusát (PNG/JPG/WEBP) és méretét.');
      } finally {
        setLogoUploading(false);
      }
    },
    [userId]
  );

  const handleLogoDelete = useCallback(async () => {
    if (!userId) return;
    const confirmed = window.confirm('Biztosan törlöd a céges logót?');
    if (!confirmed) return;
    setLogoDeleting(true);
    try {
      await deleteCompanyLogo(userId);
      setCompanyLogoUrl(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Céglogó törlés hiba:', err);
      alert('A logó törlése nem sikerült.');
    } finally {
      setLogoDeleting(false);
    }
  }, [userId]);

  const handleDelete = useCallback(
    async (imageId: string) => {
      if (!userId) return;
      const confirmed = window.confirm('Biztosan törlöd ezt a képet?');
      if (!confirmed) return;
      setDeletingId(imageId);
      try {
        await deleteReferenceImage(userId, imageId);
        setGallery((prev) => prev.filter((g) => g.image.id !== imageId));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Törlés hiba:', err);
        alert('A törlés nem sikerült. Kérjük, próbáld újra.');
      } finally {
        setDeletingId(null);
      }
    },
    [userId]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  const introOver = companyIntro.length > MAX_INTRO_CHARS;
  const canSave = !saving && !introOver && userId !== null;
  const canUpload = !uploading && gallery.length < MAX_IMAGES;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
      <AppHeader profile={profile} userEmail={userEmail} />

      <div className="flex-1 flex flex-col items-center p-4 pt-6 md:pt-10">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
            Árajánlat-beállítások
          </h1>
          <p className="text-sm md:text-base text-gray-500 text-center max-w-2xl mx-auto mb-6">
            A cégbemutató és a referenciaképek a hivatalos árajánlat-PDF-be kerülnek.
          </p>

          {/* Cégbemutató */}
          <section className="mb-8">
            <label htmlFor="company-intro" className="block text-sm font-semibold text-gray-800 mb-2">
              Cégbemutató
            </label>
            <textarea
              id="company-intro"
              value={companyIntro}
              onChange={(e) => { setCompanyIntro(e.target.value); setSavedAt(null); }}
              rows={8}
              maxLength={MAX_INTRO_CHARS + 200}
              placeholder="Rövid bemutatkozás a cégről (tapasztalat, referenciák, elérhetőség stílusa)."
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 bg-white text-sm md:text-base"
            />
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className={introOver ? 'text-red-600' : 'text-gray-500'}>
                {companyIntro.length} / {MAX_INTRO_CHARS} karakter
              </span>
              {saveError && <span className="text-red-600">{saveError}</span>}
            </div>
            <div className="mt-3 flex items-center justify-end gap-3 flex-wrap">
              {savedAt && !saving && (
                <span className="text-sm text-green-700 font-medium">✓ Mentve</span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex items-center h-10 px-5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {saving ? 'Mentés…' : 'Mentés'}
              </button>
            </div>
          </section>

          {/* Céges logó — egyetlen kép, a PDF bal-felső sarkába kerül nagyban */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Céges logó</h2>
            <p className="text-xs text-gray-500 mb-3">
              A hivatalos árajánlat bal-felső sarkába kerül nagyban. PNG (átlátszó háttér ajánlott), JPG vagy WEBP. Csak egy logó — új feltöltés lecseréli a régit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {companyLogoUrl && (
                <div className="w-32 h-32 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={companyLogoUrl} alt="Céges logó" className="max-w-full max-h-full object-contain p-2" />
                </div>
              )}
              <div className="flex flex-col gap-2 flex-1">
                <label
                  className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border-2 text-sm font-semibold cursor-pointer transition-colors w-full sm:w-auto ${
                    !logoUploading
                      ? 'border-brand-500 bg-white text-brand-700 hover:bg-brand-50'
                      : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    disabled={logoUploading}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      handleLogoSelected(f);
                      e.target.value = '';
                    }}
                  />
                  {logoUploading ? 'Feltöltés…' : companyLogoUrl ? 'Csere' : '+ Logó feltöltése'}
                </label>
                {companyLogoUrl && (
                  <button
                    type="button"
                    onClick={handleLogoDelete}
                    disabled={logoDeleting}
                    className="inline-flex items-center justify-center h-10 px-4 rounded-lg border-2 border-red-300 hover:border-red-500 text-sm font-semibold text-red-600 hover:text-red-700 bg-white transition-colors w-full sm:w-auto disabled:opacity-50"
                  >
                    {logoDeleting ? 'Törlés…' : 'Törlés'}
                  </button>
                )}
                {logoError && <p className="text-sm text-red-600">{logoError}</p>}
              </div>
            </div>
          </section>

          {/* Referenciaképek */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-800">Referenciaképek</h2>
              <span className="text-xs text-gray-500">{gallery.length} / {MAX_IMAGES}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              JPG, PNG vagy WEBP. Max {MAX_IMAGES} kép. A hivatalos ajánlatba innen válogatva kerülnek.
            </p>

            {/* Feltöltés */}
            <label
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg border-2 text-sm font-semibold cursor-pointer transition-colors ${
                canUpload
                  ? 'border-brand-500 bg-white text-brand-700 hover:bg-brand-50'
                  : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <input
                type="file"
                accept={ACCEPTED_MIME}
                multiple
                disabled={!canUpload}
                className="hidden"
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  // Ugyanaz a fájl újbóli feltöltése esetén az input reset kell
                  e.target.value = '';
                }}
              />
              {uploading ? 'Feltöltés…' : '+ Kép feltöltése'}
            </label>
            {uploadError && (
              <p className="text-sm text-red-600 mt-2">{uploadError}</p>
            )}

            {/* Galéria */}
            {gallery.length > 0 && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((g) => (
                  <div key={g.image.id} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <div className="aspect-square flex items-center justify-center">
                      {g.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={g.url}
                          alt="Referenciakép"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="animate-pulse w-8 h-8 border-2 border-gray-300 border-t-brand-500 rounded-full" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.image.id)}
                      disabled={deletingId === g.image.id}
                      className="absolute top-1 right-1 h-7 px-2 rounded bg-white/90 hover:bg-red-600 hover:text-white text-xs font-semibold text-red-600 border border-red-300 shadow transition-colors disabled:opacity-50"
                      aria-label="Kép törlése"
                    >
                      {deletingId === g.image.id ? '…' : 'Törlés'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {gallery.length === 0 && !uploading && (
              <p className="text-sm text-gray-500 mt-4 italic">Még nincs feltöltött referenciakép.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

async function hydrateSignedUrls(
  items: GalleryItem[],
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>
) {
  for (const item of items) {
    try {
      const url = await getReferenceImageUrl(item.image.storage_path);
      setGallery((prev) =>
        prev.map((g) => (g.image.id === item.image.id ? { ...g, url } : g))
      );
    } catch {
      /* silent — a kép nélkül is megmarad a törlés gomb */
    }
  }
}
