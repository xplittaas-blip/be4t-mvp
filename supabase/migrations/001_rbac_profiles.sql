-- ══════════════════════════════════════════════════════════════════════════════
-- BE4T — Role-Based Access Control Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Profiles table (linked to auth.users) ──────────────────────────────────
create table if not exists public.profiles (
    id         uuid        primary key references auth.users(id) on delete cascade,
    email      text        unique not null,
    role       text        not null default 'investor'
                           check (role in ('admin', 'investor')),
    full_name  text,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on column public.profiles.role is
    'investor: can view and invest. admin: can manage tracks and upload assets.';

-- ── 2. Auto-create profile on new user sign-up ───────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, role)
    values (
        new.id,
        new.email,
        -- Default role: investor. Admin emails get promoted automatically.
        case
            when new.email = 'juan@be4t.io'        then 'admin'
            when new.email = 'admin@be4t.io'        then 'admin'
            when new.email = 'xplittaas@gmail.com'  then 'admin'
            -- ADD YOUR EMAIL HERE:
            -- when new.email = 'tu@correo.com' then 'admin'
            else 'investor'
        end
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

-- Attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ── 3. Timestamp auto-update ─────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.set_updated_at();

-- ── 4. Row Level Security — profiles ─────────────────────────────────────────
alter table public.profiles enable row level security;

-- Any authenticated user can read their own profile
create policy "profiles: users read own"
    on public.profiles for select
    using (auth.uid() = id);

-- Admin can read ALL profiles
create policy "profiles: admin reads all"
    on public.profiles for select
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
        )
    );

-- Only admin can update any profile (e.g. promote someone)
create policy "profiles: admin updates all"
    on public.profiles for update
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
        )
    );

-- Users can update their own non-role fields (full_name, avatar_url)
create policy "profiles: users update own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (role = (select role from public.profiles where id = auth.uid()));

-- ── 5. Tracks / Assets table RLS ─────────────────────────────────────────────
do $$ begin
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'tracks') then
        execute 'alter table public.tracks enable row level security';
        execute $p$ create policy "tracks: public read"
            on public.tracks for select using (true) $p$;
        execute $p$ create policy "tracks: admin write"
            on public.tracks for all
            using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) $p$;
    end if;
end $$;

do $$ begin
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'assets') then
        execute 'alter table public.assets enable row level security';
        execute $p$ create policy "assets: public read"
            on public.assets for select using (true) $p$;
        execute $p$ create policy "assets: admin write"
            on public.assets for all
            using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) $p$;
    end if;
end $$;

-- ── 6. Helper RPC: get current user role (used by frontend) ──────────────────
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
    select role from public.profiles where id = auth.uid();
$$;

-- ── 7. Token transactions audit table ────────────────────────────────────────
create table if not exists public.token_transactions (
    id         uuid        primary key default gen_random_uuid(),
    asset_id   text        not null,
    qty        integer     not null default 0,
    tx_hash    text        unique,
    type       text        check (type in ('acquisition', 'transfer')),
    created_at timestamptz not null default now()
);

alter table public.token_transactions enable row level security;

create policy "token_transactions: admin reads all"
    on public.token_transactions for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "token_transactions: service insert"
    on public.token_transactions for insert
    with check (true);

-- ── 8. PROMOTE EXISTING USERS (run separately after first login) ──────────────
-- Uncomment and replace with your email(s) after users have signed in at least once:
/*
update public.profiles
set role = 'admin'
where email in (
    'juan@be4t.io',
    'admin@be4t.io',
    'xplittaas@gmail.com'
    -- Add your email ↓
    -- 'tu@correo.com'
);
*/
