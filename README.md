# SafeSteps Safety App

SafeSteps is a community safety web app with 5 pages:

- Map danger feed
- Incident reporting
- SOS emergency actions
- Safe route planner
- Settings and preferences

This project now includes Supabase for database-backed CRUD features.

## Stack

- Vite
- Vanilla JavaScript
- Supabase (`@supabase/supabase-js`)

## Environment setup

1. Copy env template (or use the included `.env.local`):

```bash
cp .env.local.example .env.local
```

2. Set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase SQL setup (exact place to paste SQL)

1. Open your Supabase project dashboard.
2. In left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Open `supabase/schema.sql` in this repo.
5. Copy all SQL and paste it into the SQL Editor query window.
6. Click **Run**.

After this, the app tables, indexes, triggers, and Row Level Security (RLS) policies are created.

## Important auth setting

This app signs users in anonymously from the browser to use secure RLS policies.  
In Supabase, enable:

- **Authentication -> Providers -> Anonymous Sign-ins -> Enable**

## Database tables created

- `incident_reports`
- `trusted_contacts`
- `sos_events`
- `route_history`
- `user_preferences`
- `user_profiles`

## CRUD implemented in app

- Incident reports: create, read, update status, delete
- Trusted contacts: create, read, update, delete
- Route history: create, read, update favorite, delete
- SOS events: create + read latest event
- User preferences: upsert + read
- User profile: upsert + read display name from Settings "Edit profile"

