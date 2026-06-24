-- ============================================================
--  HealthMe A.I – Datenbank-Schema
--  Im Supabase SQL-Editor ausführen (Project → SQL Editor → New query).
-- ============================================================

-- Aktiviert UUID-Generierung (in Supabase i. d. R. schon vorhanden)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  Tabelle: gespeicherte Inhalte der Nutzer
--  kind: 'recipe' | 'workout' | 'scan' | 'plan'
--  data: beliebiges JSON (der jeweilige Inhalt aus der App)
-- ------------------------------------------------------------
create table if not exists public.saved_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('recipe', 'workout', 'scan', 'plan')),
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists saved_items_user_kind_idx
  on public.saved_items (user_id, kind, created_at desc);

-- ------------------------------------------------------------
--  Row-Level-Security: jeder Nutzer sieht/ändert nur seine Daten
-- ------------------------------------------------------------
alter table public.saved_items enable row level security;

drop policy if exists "saved_items_select_own" on public.saved_items;
create policy "saved_items_select_own"
  on public.saved_items for select
  using (auth.uid() = user_id);

drop policy if exists "saved_items_insert_own" on public.saved_items;
create policy "saved_items_insert_own"
  on public.saved_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved_items_delete_own" on public.saved_items;
create policy "saved_items_delete_own"
  on public.saved_items for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
--  Optional: Protokoll der Digistore24-Käufe (Audit / Idempotenz)
-- ------------------------------------------------------------
create table if not exists public.purchases (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  order_id        text,
  event           text,
  product_id      text,
  product_name    text,
  raw             jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists purchases_email_idx on public.purchases (email);
create index if not exists purchases_order_idx on public.purchases (order_id);

-- Nur der Service-Role-Key (Webhook) schreibt hier – RLS an, keine Policies
-- für normale Nutzer => kein Zugriff über den Anon-Key.
alter table public.purchases enable row level security;

-- ------------------------------------------------------------
--  Hilfsfunktion: Benutzer-ID anhand der E-Mail finden
--  (für den Digistore24-Webhook, z. B. bei Rückerstattung).
--  SECURITY DEFINER => darf auf das auth-Schema zugreifen.
--  Ausführung nur für service_role erlaubt.
-- ------------------------------------------------------------
create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = auth, public
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke execute on function public.get_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_user_id_by_email(text) to service_role;

-- ------------------------------------------------------------
--  Tabelle: profiles (Onboarding-Quiz / Dashboard-Daten)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  first_name         text,
  last_name          text,
  age                int,
  city               text,
  gender             text,
  height_cm          numeric,
  start_weight_kg    numeric,
  current_weight_kg  numeric,
  goal_weight_kg     numeric,
  activity_level     text,
  glp1_medication    text,
  glp1_dose          text,
  glp1_frequency     text,
  glp1_start_date    date,
  plan               jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Falls die Tabelle schon existierte: Spalten nachrüsten
alter table public.profiles add column if not exists plan jsonb;
alter table public.profiles add column if not exists avatar_url text;

-- ------------------------------------------------------------
--  Storage-Bucket für Profilfotos (öffentlich lesbar)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Jeder darf Avatare lesen (öffentlich)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Nutzer dürfen nur ihren eigenen Ordner (= user_id) beschreiben
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);
