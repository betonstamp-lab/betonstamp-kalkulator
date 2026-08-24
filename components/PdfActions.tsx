'use client';

// PDF-műveletek gombcsoport — a "Kalkuláció letöltése" + "Kalkuláció továbbítása"
// gomb együtt, egy közös wrappercsel. Mobilon egymás alatt (w-full), sm+
// egymás mellett jobbra igazítva. Egy közös buildData a kettő között.
//
// Ha `canDownloadPdf(profile)` false → egyik gomb sem jelenik meg. Ha true, mind
// a kettő ugyanazokat a preload-okat használja (mindkét komponens hívja őket a
// mount-nál — idempotens, cache-elt).

import type { UserProfile } from '@/lib/shared/supabase';
import type { PdfData, PdfPriceMode } from '@/lib/shared/pdfExport';
import DownloadPdfButton from '@/components/DownloadPdfButton';
import ShareCalculationButton from '@/components/ShareCalculationButton';
import QuoteButton from '@/components/QuoteButton';

interface Props {
  profile: UserProfile | null | undefined;
  hasResult: boolean;
  buildData: (mode: PdfPriceMode) => PdfData;
}

export default function PdfActions({ profile, hasResult, buildData }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
      <DownloadPdfButton profile={profile} hasResult={hasResult} buildData={buildData} />
      <ShareCalculationButton profile={profile} hasResult={hasResult} buildData={buildData} />
      <QuoteButton profile={profile} hasResult={hasResult} buildData={buildData} />
    </div>
  );
}
