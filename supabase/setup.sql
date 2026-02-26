-- SQL Setup for Secure Zone Navi backend features

-- 1. Create Evidence Storage Bucket
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do nothing;

-- Set up storage policies for 'evidence' bucket (assuming anon can upload for now, ideally should be auth.uid())
create policy "Anyone can upload evidence"
  on storage.objects for insert
  with check ( bucket_id = 'evidence' );

create policy "Anyone can view evidence"
  on storage.objects for select
  using ( bucket_id = 'evidence' );

-- 2. Create Evidence Table to store metadata
create table if not exists public.evidence (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid, -- Optional for now
    type text not null check (type in ('audio', 'video')),
    duration integer not null,
    file_path text not null,
    public_url text not null
);

-- Enable RLS for evidence
alter table public.evidence enable row level security;

-- Policies for evidence
create policy "Anyone can read evidence" on public.evidence for select using (true);
create policy "Anyone can insert evidence" on public.evidence for insert with check (true);
create policy "Anyone can delete evidence" on public.evidence for delete using (true);

-- 3. Create Live Location Sessions Table
create table if not exists public.safety_sessions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'active' check (status in ('active', 'ended', 'sos')),
    type text not null check (type in ('cab_ride', 'walk_companion')),
    destination text not null,
    vehicle_no text,
    estimated_duration_mins integer,
    last_known_lat double precision,
    last_known_lng double precision,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable realtime for safety_sessions
alter publication supabase_realtime add table public.safety_sessions;

-- Enable RLS for safety_sessions
alter table public.safety_sessions enable row level security;

create policy "Anyone can read safety_sessions" on public.safety_sessions for select using (true);
create policy "Anyone can insert safety_sessions" on public.safety_sessions for insert with check (true);
create policy "Anyone can update safety_sessions" on public.safety_sessions for update using (true);

-- 4. Create Community Alerts Table
create table if not exists public.alerts (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    type text not null,
    location_name text not null,
    lat double precision,
    lng double precision,
    description text not null,
    upvotes integer default 0,
    comments integer default 0
);

-- Enable realtime for alerts
alter publication supabase_realtime add table public.alerts;

-- Enable RLS for alerts
alter table public.alerts enable row level security;

create policy "Anyone can read alerts" on public.alerts for select using (true);
create policy "Anyone can insert alerts" on public.alerts for insert with check (true);
create policy "Anyone can update alerts" on public.alerts for update using (true);
