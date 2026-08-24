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

/** Egy partner árajánlat-profilja (egy sor / user). */
export interface QuoteProfile {
  user_id: string;
  /** Cégbemutató szöveg — a PDF-be kerül. */
  company_intro: string;
  /** Opcionális láb-szöveg (pl. banki adatok, elérhetőség). */
  default_footer: string | null;
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

/** Kliens oldali patch a quote_profiles upsert-hez. */
export type QuoteProfilePatch = Partial<Pick<QuoteProfile, 'company_intro' | 'default_footer'>>;

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

/** Létrehozás vagy frissítés — a partner user_id-ja alapján (upsert). */
export async function upsertQuoteProfile(
  userId: string,
  patch: QuoteProfilePatch
): Promise<QuoteProfile> {
  const row = {
    user_id: userId,
    company_intro: patch.company_intro ?? '',
    default_footer: patch.default_footer ?? null,
  };
  const { data, error } = await supabase
    .from(TABLE_PROFILES)
    .upsert(row, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as QuoteProfile;
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
