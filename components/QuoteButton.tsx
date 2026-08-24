'use client';

// "Hivatalos árajánlat" gomb. CSAK partner-role látja (canDownloadPdf).
// Kattintás → QuoteBuilderDialog nyílik meg (cégbemutató preview + szerkeszthető
// termékleírás + kép-választó). A dialog "Árajánlat letöltése" gombja indítja
// az ár-választót és a PDF generálást.
//
// A userId a supabase auth-ból jön (mount-nál lekérjük — a QuoteBuilderDialog
// ezt használja a quote_profile és a képek betöltéséhez).

import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/shared/supabase';
import { supabase } from '@/lib/shared/supabase';
import { canDownloadPdf } from '@/lib/shared/canDownloadPdf';
import type { PdfData, PdfPriceMode } from '@/lib/shared/pdfExport';
import QuoteBuilderDialog from '@/components/QuoteBuilderDialog';

interface Props {
  profile: UserProfile | null | undefined;
  hasResult: boolean;
  buildData: (mode: PdfPriceMode) => PdfData;
  className?: string;
}

export default function QuoteButton({ profile, hasResult, buildData, className }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!canDownloadPdf(profile)) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
    })();
  }, [profile]);

  if (!canDownloadPdf(profile)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        disabled={!hasResult}
        className={
          className ??
          'inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 text-sm font-semibold border-2 border-brand-500 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed'
        }
        aria-label="Hivatalos árajánlat készítése"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Hivatalos árajánlat
      </button>

      <QuoteBuilderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        profile={profile}
        userId={userId}
        buildData={buildData}
      />
    </>
  );
}
