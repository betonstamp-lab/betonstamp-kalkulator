-- ============================================================================
--  ÁRAJÁNLAT-PROFIL adat-réteg — Supabase setup (MANUÁLIS futtatás a
--  Supabase dashboard SQL Editor-ban).
--
--  Sorrend:
--    1) Ezt a fájlt futtasd le a SQL Editor-ban (két tábla + trigger + RLS).
--    2) A Storage lépéseket kövesd a fájl VÉGÉN — bucket létrehozás dashboardon,
--       majd az itt lévő storage policy-k szintén a SQL Editor-ban futtatva.
--
--  A séma és a policy-k mintája a projekt meglévő `profiles` táblájának
--  konvencióját követi (auth.uid() = user_id).
-- ============================================================================


-- ----------------------------------------------------------------------------
--  1. quote_profiles — partnerenként egy sor (user_id primary key)
-- ----------------------------------------------------------------------------

create table if not exists public.quote_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_intro text not null default '',
  default_footer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at automatikus frissítés
create or replace function public.set_quote_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists quote_profiles_updated_at on public.quote_profiles;
create trigger quote_profiles_updated_at
  before update on public.quote_profiles
  for each row execute function public.set_quote_profiles_updated_at();

-- RLS: a partner CSAK a saját sorát olvashatja/írhatja
alter table public.quote_profiles enable row level security;

drop policy if exists "quote_profiles_select_own" on public.quote_profiles;
create policy "quote_profiles_select_own"
  on public.quote_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "quote_profiles_insert_own" on public.quote_profiles;
create policy "quote_profiles_insert_own"
  on public.quote_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "quote_profiles_update_own" on public.quote_profiles;
create policy "quote_profiles_update_own"
  on public.quote_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
--  2. quote_reference_images — partnerenkénti N kép rekord (a fájl a Storage-ban)
-- ----------------------------------------------------------------------------

create table if not exists public.quote_reference_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists quote_reference_images_user_id_idx
  on public.quote_reference_images(user_id);

alter table public.quote_reference_images enable row level security;

drop policy if exists "quote_reference_images_select_own" on public.quote_reference_images;
create policy "quote_reference_images_select_own"
  on public.quote_reference_images for select
  using (auth.uid() = user_id);

drop policy if exists "quote_reference_images_insert_own" on public.quote_reference_images;
create policy "quote_reference_images_insert_own"
  on public.quote_reference_images for insert
  with check (auth.uid() = user_id);

drop policy if exists "quote_reference_images_delete_own" on public.quote_reference_images;
create policy "quote_reference_images_delete_own"
  on public.quote_reference_images for delete
  using (auth.uid() = user_id);


-- ============================================================================
--  3. STORAGE BUCKET — MANUÁLIS lépés a Supabase dashboardon
-- ============================================================================
--
--  a) Supabase Dashboard → Storage → New bucket
--       Név:              quote-reference-images
--       Public bucket:    NEM (private!)
--       File size limit:  10 MB (javasolt)
--       Allowed MIME:     image/jpeg, image/png, image/webp
--
--  b) Miután a bucket létrejött, futtasd le AZ ALÁBBI POLICY-KAT a SQL Editor-ban.
--     (A Storage policy-k a `storage.objects` táblára hivatkoznak; a bucket_id
--     kulcsolja a bucketet, a folder első szegmense az auth.uid() prefix.)
--
--     A `storage.foldername(name)` egy tömböt ad; a `[1]` az első szegmens.
--     Konvenció: minden feltöltött fájl neve `{userId}/{uuid}.{ext}` alakú.
-- ============================================================================

-- SELECT — csak a saját mappa
drop policy if exists "quote_ref_images_select_own" on storage.objects;
create policy "quote_ref_images_select_own"
  on storage.objects for select
  using (
    bucket_id = 'quote-reference-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT — csak a saját mappába
drop policy if exists "quote_ref_images_insert_own" on storage.objects;
create policy "quote_ref_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'quote-reference-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE — csak a saját mappából
drop policy if exists "quote_ref_images_delete_own" on storage.objects;
create policy "quote_ref_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'quote-reference-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE — feltöltéskor nem szükséges (a modul upsert:false), de a
-- teljesség kedvéért:
drop policy if exists "quote_ref_images_update_own" on storage.objects;
create policy "quote_ref_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'quote-reference-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'quote-reference-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================================
--  ELLENŐRZÉS FUTÁS UTÁN
-- ============================================================================
--
--  Bejelentkezve egy partner-role user-rel, a böngésző konzolból (kliens
--  oldalról) a következőknek kell működniük:
--
--    import { supabase } from '/lib/shared/supabase';
--    const { data, error } = await supabase
--      .from('quote_profiles').select('*').maybeSingle();
--    // → { data: null, error: null } — még nincs sor, de a policy engedi a SELECT-et.
--
--    await supabase.from('quote_profiles')
--      .upsert({ user_id: (await supabase.auth.getUser()).data.user.id,
--                company_intro: 'test' });
--    // → beszúrás sikeres, RLS-hiba nélkül.
--
--    // Storage-teszt:
--    const uid = (await supabase.auth.getUser()).data.user.id;
--    await supabase.storage.from('quote-reference-images')
--      .upload(`${uid}/test.txt`, new Blob(['hello']));
--    // → siker; másik user_id prefix-szel HIBA (RLS blokk).
--
-- ============================================================================
