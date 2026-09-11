-- Sherry Expense Tracker — cloud sync schema.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- for a fresh project. Safe to re-run: every statement is idempotent.

create table if not exists public.entries (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('expense', 'income')),
  category text not null,
  amount numeric not null,
  currency text not null,
  comment text not null default '',
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_user_id_idx on public.entries (user_id);

create table if not exists public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.entries enable row level security;
alter table public.settings enable row level security;

-- Each user can only ever see or touch their own rows.
drop policy if exists "entries_select_own" on public.entries;
create policy "entries_select_own" on public.entries
  for select using (auth.uid() = user_id);

drop policy if exists "entries_insert_own" on public.entries;
create policy "entries_insert_own" on public.entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "entries_update_own" on public.entries;
create policy "entries_update_own" on public.entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "entries_delete_own" on public.entries;
create policy "entries_delete_own" on public.entries
  for delete using (auth.uid() = user_id);

drop policy if exists "settings_select_own" on public.settings;
create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);

drop policy if exists "settings_insert_own" on public.settings;
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "settings_update_own" on public.settings;
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
