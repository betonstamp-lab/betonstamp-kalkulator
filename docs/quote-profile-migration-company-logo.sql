-- ============================================================================
--  MIGRÁCIÓ — céges logó tárolása a partner árajánlat-profilban.
--
--  Kézzel futtatandó a Supabase Dashboard → SQL Editor-ban, EGYSZER.
--
--  Új oszlop: quote_profiles.company_logo_path text
--    - Ha NULL, a partner nem tölt fel céglogót → a PDF Betonstamp-fallbackkel
--      generálódik (bal-felül a Betonstamp logó).
--    - Ha nem NULL, egy Storage útvonalat tárol a `quote-reference-images`
--      bucketben: `{userId}/logo/{uuid}.{ext}` formátum.
--
--  A meglévő Storage bucket + policy-k VÁLTOZATLANOK — a partner mappáján
--  belüli `logo/` alkönyvtár is a saját prefixe alá esik, tehát az
--  own-only INSERT/SELECT/DELETE ugyanúgy érvényes.
--
--  A quote_reference_images tábla NEM tartalmazza a logót — az kizárólag a
--  quote_profiles.company_logo_path-ban van nyilvántartva.
-- ============================================================================

alter table public.quote_profiles
  add column if not exists company_logo_path text;

-- (Nincs új RLS-policy szükséges — a meglévő own-only policy-k a
--  company_logo_path frissítésére is érvényesek, mert azokat a `user_id`
--  alapján engedjük.)

-- ELLENŐRZÉS futás után (opcionális):
--   select column_name, data_type
--     from information_schema.columns
--    where table_schema = 'public'
--      and table_name = 'quote_profiles';
--   → company_logo_path | text  sornak lennie kell.
