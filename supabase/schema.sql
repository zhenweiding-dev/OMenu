-- ============================================================
-- OMenu: Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferences jsonb default null,
  current_week_id text default null,
  current_day_index smallint default 0 check (current_day_index between 0 and 6),
  is_menu_open boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Menu Books table
create table if not exists public.menu_books (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'ready' check (status in ('generating', 'ready', 'error')),
  preferences jsonb not null default '{}'::jsonb,
  menus jsonb not null default '{}'::jsonb,
  shopping_list jsonb default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_menu_books_user_id on public.menu_books(user_id);
create index if not exists idx_menu_books_created_at on public.menu_books(created_at desc);

-- 3. Enable RLS
alter table public.profiles enable row level security;
alter table public.menu_books enable row level security;

-- 4. RLS Policies — Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 5. RLS Policies — Menu Books
create policy "Users can view own menu books"
  on public.menu_books for select
  using (auth.uid() = user_id);

create policy "Users can insert own menu books"
  on public.menu_books for insert
  with check (auth.uid() = user_id);

create policy "Users can update own menu books"
  on public.menu_books for update
  using (auth.uid() = user_id);

create policy "Users can delete own menu books"
  on public.menu_books for delete
  using (auth.uid() = user_id);

-- 6. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists set_menu_books_updated_at on public.menu_books;
create trigger set_menu_books_updated_at
  before update on public.menu_books
  for each row execute function public.update_updated_at();
