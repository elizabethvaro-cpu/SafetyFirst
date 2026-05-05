-- SafeSteps schema for Supabase Postgres
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reporter_device_id text not null,
  incident_type text not null check (incident_type in ('crime', 'accident', 'harassment', 'other')),
  severity text not null check (severity in ('low', 'medium', 'high')),
  location_text text not null,
  details text not null,
  is_anonymous boolean not null default false,
  status text not null default 'active' check (status in ('active', 'resolved')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  owner_device_id text not null,
  contact_name text not null,
  phone_number text not null,
  relationship text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sos_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  trigger_type text not null check (trigger_type in ('broadcast', 'silent')),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.route_history (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  owner_device_id text not null,
  origin text not null,
  destination text not null,
  route_key text not null check (route_key in ('A', 'B')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  eta_minutes int not null check (eta_minutes > 0),
  is_favorite boolean not null default false,
  options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  owner_device_id text not null,
  language text not null default 'en' check (language in ('en', 'es', 'fr')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  push_alerts boolean not null default true,
  location_sharing boolean not null default false,
  auto_siren boolean not null default false,
  share_route boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_incident_reports_created_at on public.incident_reports(created_at desc);
create index if not exists idx_incident_reports_status on public.incident_reports(status);
create index if not exists idx_incident_reports_reporter_user_id on public.incident_reports(reporter_user_id);

create index if not exists idx_trusted_contacts_owner_user_id on public.trusted_contacts(owner_user_id);
create index if not exists idx_sos_events_user_id on public.sos_events(user_id);
create index if not exists idx_sos_events_created_at on public.sos_events(created_at desc);
create index if not exists idx_route_history_owner_user_id on public.route_history(owner_user_id);
create index if not exists idx_route_history_created_at on public.route_history(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_incident_reports_updated_at on public.incident_reports;
create trigger trg_incident_reports_updated_at
before update on public.incident_reports
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_trusted_contacts_updated_at on public.trusted_contacts;
create trigger trg_trusted_contacts_updated_at
before update on public.trusted_contacts
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_route_history_updated_at on public.route_history;
create trigger trg_route_history_updated_at
before update on public.route_history
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute procedure public.set_updated_at();

alter table public.incident_reports enable row level security;
alter table public.trusted_contacts enable row level security;
alter table public.sos_events enable row level security;
alter table public.route_history enable row level security;
alter table public.user_preferences enable row level security;

-- Incident feed is readable by authenticated users.
drop policy if exists "incident_reports_select_all_auth" on public.incident_reports;
create policy "incident_reports_select_all_auth"
on public.incident_reports
for select
to authenticated
using (true);

drop policy if exists "incident_reports_insert_own" on public.incident_reports;
create policy "incident_reports_insert_own"
on public.incident_reports
for insert
to authenticated
with check (auth.uid() = reporter_user_id);

drop policy if exists "incident_reports_update_own" on public.incident_reports;
create policy "incident_reports_update_own"
on public.incident_reports
for update
to authenticated
using (auth.uid() = reporter_user_id)
with check (auth.uid() = reporter_user_id);

drop policy if exists "incident_reports_delete_own" on public.incident_reports;
create policy "incident_reports_delete_own"
on public.incident_reports
for delete
to authenticated
using (auth.uid() = reporter_user_id);

drop policy if exists "trusted_contacts_select_own" on public.trusted_contacts;
create policy "trusted_contacts_select_own"
on public.trusted_contacts
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "trusted_contacts_insert_own" on public.trusted_contacts;
create policy "trusted_contacts_insert_own"
on public.trusted_contacts
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "trusted_contacts_update_own" on public.trusted_contacts;
create policy "trusted_contacts_update_own"
on public.trusted_contacts
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "trusted_contacts_delete_own" on public.trusted_contacts;
create policy "trusted_contacts_delete_own"
on public.trusted_contacts
for delete
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "sos_events_select_own" on public.sos_events;
create policy "sos_events_select_own"
on public.sos_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "sos_events_insert_own" on public.sos_events;
create policy "sos_events_insert_own"
on public.sos_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "route_history_select_own" on public.route_history;
create policy "route_history_select_own"
on public.route_history
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "route_history_insert_own" on public.route_history;
create policy "route_history_insert_own"
on public.route_history
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "route_history_update_own" on public.route_history;
create policy "route_history_update_own"
on public.route_history
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "route_history_delete_own" on public.route_history;
create policy "route_history_delete_own"
on public.route_history
for delete
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);
create index if not exists idx_profiles_created_at on public.profiles(created_at desc);

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_authenticated" on public.profiles;
create policy "profiles_insert_authenticated"
on public.profiles
for insert
to authenticated
with check (true);

