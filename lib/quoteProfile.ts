// Data-access modul a partner árajánlat-profilhoz.
// - quote_profiles tábla: partnerenként egy sor (user_id primary key)
// - quote_reference_images tábla: partnerenkénti N kép nyilvántartása
// - Supabase Storage bucket "quote-reference-images": partnerenként {user_id}/ prefix
//
// A séma és a policy-k a Supabase dashboardon manuálisan futtatottak
// (l. docs/quote-profile-setup.sql). Ez a modul CSAK a JS/TS oldali
// data-access-t adja — UI még nincs.
//
// A signed URL 1 órás lejáratú (getReferenceImageUrl); a bucket privát,
// nyilvános URL nincs — az UI a listReferenceImages után egy signed URL-t kér.

import { supabase } from '@/lib/shared/supabase';

// ---------------------------------------------------------------------------
// Típusok
// ---------------------------------------------------------------------------

/** Egy partner árajánlat-profilja (egy sor / user).
 *  A company_logo_path a Supabase séma bővítés után (l. docs/quote-profile-
 *  migration-company-logo.sql) érhető el; addig undefined-ként érkezik vissza. */
export interface QuoteProfile {
  user_id: string;
  /** Cégbemutató szöveg — a PDF-be kerül. */
  company_intro: string;
  /** Opcionális láb-szöveg (pl. banki adatok, elérhetőség). */
  default_footer: string | null;
  /** A partner céges logójának Storage-útvonala a quote-reference-images
   *  bucketben, `{userId}/logo/{uuid}.{ext}` formában. null vagy undefined,
   *  ha a partner nem töltött fel logót — ekkor a PDF Betonstamp-fallbackkel megy. */
  company_logo_path?: string | null;
  created_at: string;
  updated_at: string;
}

/** Egy referenciakép metaadata (a Storage-ban a `storage_path`). */
export interface QuoteReferenceImage {
  id: string;
  user_id: string;
  storage_path: string;
  created_at: string;
}

/** Kliens oldali patch a quote_profiles upsert-hez.
 *  A company_logo_path csak akkor kerül be a rowba, ha a hívó
 *  EXPLICIT megadja — így a szöveg-mentés akkor is működik, ha a séma
 *  még nem tartalmazza az oszlopot. */
export type QuoteProfilePatch = Partial<Pick<QuoteProfile, 'company_intro' | 'default_footer' | 'company_logo_path'>>;

const TABLE_PROFILES = 'quote_profiles';
const TABLE_IMAGES = 'quote_reference_images';
const BUCKET = 'quote-reference-images';

// ---------------------------------------------------------------------------
// quote_profiles
// ---------------------------------------------------------------------------

/** A partner árajánlat-profilja. Nem létező sor esetén null. */
export async function getQuoteProfile(userId: string): Promise<QuoteProfile | null> {
  const { data, error } = await supabase
    .from(TABLE_PROFILES)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as QuoteProfile | null) ?? null;
}

/** Létrehozás vagy frissítés — a partner user_id-ja alapján (upsert).
 *  A company_logo_path CSAK akkor kerül be a rowba, ha explicit be van
 *  állítva a patch-ben — így ha a séma még nem tartalmazza az oszlopot,
 *  a cégbemutató mentés akkor is működik. */
export async function upsertQuoteProfile(
  userId: string,
  patch: QuoteProfilePatch
): Promise<QuoteProfile> {
  const row: Record<string, unknown> = {
    user_id: userId,
  };
  if ('company_intro' in patch) row.company_intro = patch.company_intro ?? '';
  if ('default_footer' in patch) row.default_footer = patch.default_footer ?? null;
  if ('company_logo_path' in patch) row.company_logo_path = patch.company_logo_path ?? null;

  const { data, error } = await supabase
    .from(TABLE_PROFILES)
    .upsert(row, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as QuoteProfile;
}

// ---------------------------------------------------------------------------
// Céges logó — a quote-reference-images bucket `{userId}/logo/` alkönyvtárában
// ---------------------------------------------------------------------------

/** Új céges logó feltöltése — a régit előbb törli.
 *  A path: `{userId}/logo/{uuid}.{ext}`. A company_logo_path a
 *  quote_profiles-ba upsert-el kerül. */
export async function uploadCompanyLogo(userId: string, file: File): Promise<string> {
  // Előbb töröljük a régi logót (ha van), hogy ne halmozódjon a Storage-ban.
  try { await deleteCompanyLogo(userId); } catch { /* best-effort */ }

  const ext = extractExtension(file.name, file.type);
  const id = crypto.randomUUID();
  const storagePath = `${userId}/logo/${id}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || 'image/png',
      upsert: false,
    });
  if (uploadErr) throw uploadErr;

  await upsertQuoteProfile(userId, { company_logo_path: storagePath });
  return storagePath;
}

/** A meglévő logó törlése (Storage + a quote_profiles path null-ozása). */
export async function deleteCompanyLogo(userId: string): Promise<void> {
  const prof = await getQuoteProfile(userId).catch(() => null);
  const path = prof?.company_logo_path;
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => { /* best-effort */ });
  }
  await upsertQuoteProfile(userId, { company_logo_path: null });
}

/** Signed URL a partner céges logójához. null ha nincs logó. */
export async function getCompanyLogoUrl(
  userId: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  const prof = await getQuoteProfile(userId).catch(() => null);
  if (!prof?.company_logo_path) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(prof.company_logo_path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// quote_reference_images
// ---------------------------------------------------------------------------

/** A partner összes referenciaképe, legrégebbi elöl. */
export async function listReferenceImages(userId: string): Promise<QuoteReferenceImage[]> {
  const { data, error } = await supabase
    .from(TABLE_IMAGES)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as QuoteReferenceImage[]) ?? [];
}

/** Feltöltés a Storage-ba + rekord a táblában.
 *  A storage_path formátuma: `{userId}/{crypto.randomUUID()}.{ext}`. */
export async function uploadReferenceImage(
  userId: string,
  file: File
): Promise<QuoteReferenceImage> {
  const ext = extractExtension(file.name, file.type);
  const id = crypto.randomUUID();
  const storagePath = `${userId}/${id}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
  if (uploadErr) throw uploadErr;

  const { data, error: insertErr } = await supabase
    .from(TABLE_IMAGES)
    .insert({ user_id: userId, storage_path: storagePath })
    .select('*')
    .single();
  if (insertErr) {
    // Ha a rekord-insert elhasal, próbáljuk kitörölni a Storage-ból
    // (best-effort — a bucket policy fedi az own-only törlést).
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => { /* ok */ });
    throw insertErr;
  }
  return data as QuoteReferenceImage;
}

/** Törlés — előbb a Storage-ból, majd a táblából.
 *  A user_id ellenőrzést az RLS + a bucket policy is biztosítja. */
export async function deleteReferenceImage(
  userId: string,
  imageId: string
): Promise<void> {
  // Előbb kiolvasás — a storage_path kell a Storage-remove-hoz.
  const { data, error: readErr } = await supabase
    .from(TABLE_IMAGES)
    .select('storage_path')
    .eq('id', imageId)
    .eq('user_id', userId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!data) return; // már nincs, no-op

  const { error: removeErr } = await supabase.storage
    .from(BUCKET)
    .remove([data.storage_path]);
  if (removeErr) throw removeErr;

  const { error: delErr } = await supabase
    .from(TABLE_IMAGES)
    .delete()
    .eq('id', imageId)
    .eq('user_id', userId);
  if (delErr) throw delErr;
}

/** Signed URL egy referenciaképhez (default: 1 óra).
 *  A bucket privát, ezért publikus URL nincs. */
export async function getReferenceImageUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// Segédek
// ---------------------------------------------------------------------------

function extractExtension(filename: string, mimeType: string): string {
  const fromName = filename.includes('.') ? filename.split('.').pop()!.toLowerCase() : '';
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  // Fallback a MIME-ből
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'bin';
}
