'use client';

// Hivatalos árajánlat összeállító dialog.
// A partner itt:
//   1) Megnézi/módosítja a cégbemutatót (a quote_profiles-ből betöltve).
//   2) Szerkeszti a kalkulációhoz automatikusan generált termékleírást.
//   3) Kiválasztja, mely referenciaképek kerüljenek az ajánlatba.
//   4) "Árajánlat letöltése" → ár-választó (Partner / Fogyasztói) → PDF generálás.
//
// iOS gesztus szigor: a dialog megnyitásakor a referenciaképeket ELŐRE dataURL-be
// cache-eljük (fetch → blob → dataURL). Így a végső "Letöltés" tap-ja már
// cache-hit — nincs hálózati kérés az user-gesztus és a generateCalculationPdf közt.

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import type { UserProfile } from '@/lib/shared/supabase';
import {
  getQuoteProfile,
  listReferenceImages,
  getReferenceImageUrl,
  getCompanyLogoUrl,
  type QuoteReferenceImage,
} from '@/lib/quoteProfile';
import {
  generateCalculationPdf,
  preloadPdfFonts,
  preloadPdfLogo,
  type PdfData,
  type PdfPriceMode,
  type PdfImage,
} from '@/lib/shared/pdfExport';
import PriceModeChooser from '@/components/PriceModeChooser';

interface Props {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null | undefined;
  userId: string | null;
  /** A kalkulátor buildData függvénye — a fő kalkuláció-adatot építi. */
  buildData: (mode: PdfPriceMode) => PdfData;
}

interface CachedImage {
  meta: QuoteReferenceImage;
  /** dataURL a jsPDF.addImage-hez. Amíg tölt: null. */
  dataUrl: string | null;
  width: number;
  height: number;
  mimeType: 'PNG' | 'JPEG' | 'WEBP';
  /** Előnézet a dialogban (signed URL vagy dataUrl). */
  previewUrl: string | null;
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iP(hone|od|ad)/.test(ua)) return true;
  const isTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  if (isTouch && /Mac/.test(ua)) return true;
  return false;
}

function downloadOnDesktop(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Egy signed URL-t fetch-el, canvas-on át PNG dataURL-lé konvertál + méretet
 *  ad vissza. A jsPDF WEBP-et NEM támogat, ezért mindent PNG-vé alakítunk —
 *  így bármilyen bemeneti formátum (JPEG/PNG/WEBP/GIF) garantáltan beágyazható. */
async function fetchImageAsDataUrl(url: string): Promise<{ dataUrl: string; width: number; height: number; mimeType: 'PNG' | 'JPEG' | 'WEBP' }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  // Blob → HTMLImageElement (Object URL-lel gyorsabb, mint dataURL-en át).
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image decode failed'));
      el.src = objectUrl;
    });
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) throw new Error('image has zero dimensions');

    // Canvas → PNG dataURL. Ez a lépés a WEBP-et is normál PNG-vé alakítja.
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d context unavailable');
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/png');
    return { dataUrl, width, height, mimeType: 'PNG' };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Kalkulátor-specifikus rendszer-név a PdfData alapján (title + logoVariant).
 *  Ezt írja a bevezető mondatba a "BetonStamp Kft. által forgalmazott {X}"
 *  helyre. */
function detectSystemLabel(data: PdfData): string {
  const t = data.title || '';
  if (/Natture/i.test(t)) return 'Natture mikrocement pigment';
  if (/Atlanttic|Aquaciment|Pool/i.test(t)) return 'Atlanttic mikrocement pigment';
  if (/Vakolat|ESTonetex/i.test(t)) return 'ESTonetex vakolat';
  if (/B[eé]lyegzett|Overlay/i.test(t)) return 'bélyegzett beton / overlay';
  if (/Mikrocement/i.test(t)) return 'mikrocement';
  if (data.logoVariant === 'estecha') return 'ESTonetex vakolat';
  return 'kivitelezési';
}

/** Auto-termékleírás a kalkulátor buildData(mode='partner') alapján — a partner
 *  a dialog textareájában bármit módosíthat. Kalkulátoronként specifikus
 *  bevezető mondat, alatta felület- és rendszer-elem lista. */
function buildAutoDescription(data: PdfData): string {
  const systemLabel = detectSystemLabel(data);
  const surfaceSectionHeadings = data.sections
    .map((s) => s.heading ?? '')
    .filter((h) => /^Fel[uü]let/i.test(h));
  const otherSectionHeadings = data.sections
    .map((s) => s.heading ?? '')
    .filter((h) => h && !/^Fel[uü]let/i.test(h) && !/^Összesen/.test(h) && !/^Pigmentek/i.test(h))
    .slice(0, 6);

  const lines: string[] = [];
  lines.push(`Ajánlatunkban a(z) BetonStamp Kft. által forgalmazott ${systemLabel} rendszer szerinti kivitelezésre teszünk javaslatot.`);
  if (surfaceSectionHeadings.length > 0) {
    lines.push('');
    lines.push('Érintett felületek:');
    for (const h of surfaceSectionHeadings) {
      lines.push(`• ${h}`);
    }
  }
  if (otherSectionHeadings.length > 0) {
    lines.push('');
    lines.push('A rendszer főbb elemei:');
    for (const h of otherSectionHeadings) {
      lines.push(`• ${h}`);
    }
  }
  lines.push('');
  lines.push('A megajánlott anyagok bruttó árakon szerepelnek. A munkadíj külön egyeztetés tárgya.');
  return lines.join('\n');
}

export default function QuoteBuilderDialog({ open, onClose, profile, userId, buildData }: Props) {
  const [loading, setLoading] = useState(true);
  const [companyIntro, setCompanyIntro] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [images, setImages] = useState<CachedImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chooserOpen, setChooserOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Céges logó cache — dataURL a PDF-hez (iOS user-gesztus szigor miatt előre).
  const [companyLogo, setCompanyLogo] = useState<PdfImage | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);

  // Auto-termékleírás alapja — az első nyitáskor számoljuk (partner ár mód
  // alapján, de csak a section-heading-ekhez kell, ami mode-független).
  const autoDescription = useMemo(() => {
    if (!open) return '';
    try { return buildAutoDescription(buildData('partner')); } catch { return ''; }
  }, [open, buildData]);

  // Betöltés a dialog megnyitásakor
  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    // preload — cache-hit a végső Letöltésnél
    void preloadPdfFonts().catch(() => { /* ok */ });
    void preloadPdfLogo().catch(() => { /* ok */ });
    (async () => {
      try {
        const [prof, imgs, logoUrl] = await Promise.all([
          getQuoteProfile(userId),
          listReferenceImages(userId),
          getCompanyLogoUrl(userId).catch(() => null),
        ]);
        if (cancelled) return;
        setCompanyIntro(prof?.company_intro ?? '');
        // Céges logó dataURL cache-elés — a PDF-generálás szinkron lehessen.
        if (logoUrl) {
          setCompanyLogoPreview(logoUrl);
          void (async () => {
            try {
              const data = await fetchImageAsDataUrl(logoUrl);
              if (!cancelled) setCompanyLogo({
                dataUrl: data.dataUrl,
                width: data.width,
                height: data.height,
                mimeType: data.mimeType,
              });
            } catch { /* ok — a PDF Betonstamp-fallbackkel megy */ }
          })();
        }
        // Először előnézet-URL-lel jelenítjük meg (gyors), közben dataURL cache-elés
        const initial: CachedImage[] = imgs.map((m) => ({
          meta: m, dataUrl: null, width: 0, height: 0, mimeType: 'JPEG', previewUrl: null,
        }));
        setImages(initial);
        // dataURL cache-elés párhuzamosan
        void (async () => {
          const updated = await Promise.all(imgs.map(async (m) => {
            try {
              const signed = await getReferenceImageUrl(m.storage_path);
              const data = await fetchImageAsDataUrl(signed);
              return { meta: m, dataUrl: data.dataUrl, width: data.width, height: data.height, mimeType: data.mimeType, previewUrl: data.dataUrl } as CachedImage;
            } catch {
              return { meta: m, dataUrl: null, width: 0, height: 0, mimeType: 'JPEG' as const, previewUrl: null };
            }
          }));
          if (!cancelled) setImages(updated);
        })();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Árajánlat-adatok betöltés hiba:', err);
        if (!cancelled) setError('Nem sikerült betölteni az árajánlat-adatokat.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, userId]);

  // Auto-termékleírás első kitöltése (csak ha üres — a partner szerkesztését ne írja felül újranyitáskor)
  useEffect(() => {
    if (open && !productDescription && autoDescription) {
      setProductDescription(autoDescription);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoDescription]);

  const toggleImage = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleModeSelected = useCallback(async (mode: PdfPriceMode) => {
    setChooserOpen(false);
    setGenerating(true);
    const isIOS = detectIOS();
    let iosWindow: Window | null = null;
    if (isIOS) {
      iosWindow = window.open('', '_blank');
    }
    try {
      const base = buildData(mode);
      const chosenImages: PdfImage[] = images
        .filter((img) => selectedIds.has(img.meta.id) && img.dataUrl)
        .map((img) => ({
          dataUrl: img.dataUrl!,
          width: img.width,
          height: img.height,
          mimeType: img.mimeType,
        }));
      const quoteData: PdfData = {
        ...base,
        quoteHeader: {
          title: 'Árajánlat',
          companyIntro,
          productDescription,
          companyLogo: companyLogo ?? undefined,
        },
        referenceImages: chosenImages,
        filenamePrefix: 'betonstamp-arajanlat',
      };
      const { blob, filename } = await generateCalculationPdf(quoteData);
      if (isIOS) {
        const file = new File([blob], filename, { type: 'application/pdf' });
        const url = URL.createObjectURL(file);
        if (iosWindow && !iosWindow.closed) {
          iosWindow.location.href = url;
          try {
            iosWindow.addEventListener('load', () => {
              try { iosWindow!.document.title = filename; } catch { /* ok */ }
            }, { once: true });
            setTimeout(() => {
              try { if (iosWindow && !iosWindow.closed) iosWindow.document.title = filename; } catch { /* ok */ }
            }, 500);
          } catch { /* ok */ }
        } else {
          window.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        downloadOnDesktop(blob, filename);
      }
      onClose();
    } catch (err) {
      if (iosWindow && !iosWindow.closed) iosWindow.close();
      // eslint-disable-next-line no-console
      console.error('Árajánlat generálás hiba:', err);
      alert('Nem sikerült létrehozni az árajánlatot. Kérjük, próbáld újra.');
    } finally {
      setGenerating(false);
    }
  }, [buildData, images, selectedIds, companyIntro, productDescription, companyLogo, onClose]);

  if (!open) return null;

  const introMissing = companyIntro.trim().length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Hivatalos árajánlat</h2>
          <p className="text-sm text-gray-500 mb-6">
            Áttekintés a generálás előtt — a szövegek szerkeszthetők, a képek közül kiválasztható, melyik kerüljön be.
          </p>

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
            </div>
          ) : (
            <>
              {/* Céges logó előnézet (a PDF bal-felső sarkába kerül) */}
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Céges logó</h3>
                {companyLogoPreview ? (
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={companyLogoPreview} alt="Céges logó" className="max-w-full max-h-full object-contain p-1" />
                    </div>
                    <p className="text-xs text-gray-500">
                      A PDF bal-felső sarkába kerül nagyban. Cseréd az{' '}
                      <Link href="/arajanlat-beallitasok" className="underline">Árajánlat-beállításokban</Link>.
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    Nincs feltöltött céges logó — a PDF a Betonstamp logóval készül.{' '}
                    <Link href="/arajanlat-beallitasok" className="underline font-medium">Céges logó feltöltése</Link>.
                  </div>
                )}
              </section>

              {/* Cégbemutató előnézet */}
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Cégbemutató</h3>
                {introMissing ? (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                    Nincs cégbemutató. Töltsd ki az{' '}
                    <Link href="/arajanlat-beallitasok" className="underline font-medium">
                      Árajánlat-beállításokban
                    </Link>.
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {companyIntro}
                  </div>
                )}
              </section>

              {/* Termék/technológia — szerkeszthető */}
              <section className="mb-6">
                <label htmlFor="quote-product" className="block text-sm font-semibold text-gray-800 mb-2">
                  Termék és technológia (szerkeszthető)
                </label>
                <textarea
                  id="quote-product"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={7}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition text-gray-900 bg-white text-sm"
                />
              </section>

              {/* Referenciaképek */}
              <section className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">Referenciaképek</h3>
                  <span className="text-xs text-gray-500">
                    {selectedIds.size} / {images.length} kiválasztva
                  </span>
                </div>
                {images.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    Nincs feltöltött referenciakép.{' '}
                    <Link href="/arajanlat-beallitasok" className="underline font-medium">
                      Tölts fel néhányat
                    </Link>{' '}
                    az ajánlat-beállításokban.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((img) => {
                      const isSelected = selectedIds.has(img.meta.id);
                      return (
                        <button
                          key={img.meta.id}
                          type="button"
                          onClick={() => toggleImage(img.meta.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-brand-500 ring-2 ring-brand-500'
                              : 'border-gray-200 hover:border-gray-400'
                          } ${!img.dataUrl ? 'opacity-70 cursor-wait' : ''}`}
                          disabled={!img.dataUrl}
                          aria-pressed={isSelected}
                        >
                          {img.previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img.previewUrl} alt="Referenciakép" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-brand-500 rounded-full" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-brand-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {images.some((i) => !i.dataUrl) && (
                  <p className="text-xs text-gray-500 mt-2">A képek töltése folyamatban — várd meg, mielőtt letöltöd az ajánlatot.</p>
                )}
              </section>

              {error && (
                <p className="text-sm text-red-600 mb-3">{error}</p>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto h-10 px-5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Mégse
                </button>
                <button
                  type="button"
                  onClick={() => setChooserOpen(true)}
                  disabled={generating || introMissing}
                  className="w-full sm:w-auto h-10 px-5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {generating ? 'Generálás…' : 'Árajánlat letöltése'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <PriceModeChooser
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onSelect={handleModeSelected}
        title="Melyik áron állítsam össze?"
        description="A választás az árajánlatba kerülő árakat vezérli."
      />
    </div>
  );
}
