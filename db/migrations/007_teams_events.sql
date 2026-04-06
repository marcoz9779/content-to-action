-- Teams & Events Schema
-- Migration: 002_teams_events

-- ============================================
-- TEAMS
-- ============================================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  owner_member_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;

create policy "Anyone can read teams"
  on public.teams for select using (true);
create policy "Anyone can insert teams"
  on public.teams for insert with check (true);
create policy "Anyone can update teams"
  on public.teams for update using (true);
create policy "Anyone can delete teams"
  on public.teams for delete using (true);

create index idx_teams_invite_code on public.teams (invite_code);

-- ============================================
-- TEAM MEMBERS
-- ============================================
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  display_name text not null,
  color text not null default '#6336f5',
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

create policy "Anyone can read team_members"
  on public.team_members for select using (true);
create policy "Anyone can insert team_members"
  on public.team_members for insert with check (true);
create policy "Anyone can update team_members"
  on public.team_members for update using (true);
create policy "Anyone can delete team_members"
  on public.team_members for delete using (true);

create index idx_team_members_team_id on public.team_members (team_id);

-- Add foreign key for owner_member_id now that team_members exists
alter table public.teams
  add constraint fk_teams_owner_member
  foreign key (owner_member_id) references public.team_members(id)
  on delete set null;

-- ============================================
-- EVENTS
-- ============================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  description text,
  event_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Anyone can read events"
  on public.events for select using (true);
create policy "Anyone can insert events"
  on public.events for insert with check (true);
create policy "Anyone can update events"
  on public.events for update using (true);
create policy "Anyone can delete events"
  on public.events for delete using (true);

create index idx_events_team_id on public.events (team_id);

-- ============================================
-- EVENT ITEMS
-- ============================================
create table if not exists public.event_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  item_name text not null,
  quantity text,
  category text,
  assigned_to uuid references public.team_members(id) on delete set null,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_items enable row level security;

create policy "Anyone can read event_items"
  on public.event_items for select using (true);
create policy "Anyone can insert event_items"
  on public.event_items for insert with check (true);
create policy "Anyone can update event_items"
  on public.event_items for update using (true);
create policy "Anyone can delete event_items"
  on public.event_items for delete using (true);

create index idx_event_items_event_id on public.event_items (event_id);
create index idx_event_items_assigned_to on public.event_items (assigned_to);

-- ============================================
-- TRIGGERS
-- ============================================
create trigger on_teams_updated
  before update on public.teams
  for each row execute function public.handle_updated_at();

create trigger on_events_updated
  before update on public.events
  for each row execute function public.handle_updated_at();

create trigger on_event_items_updated
  before update on public.event_items
  for each row execute function public.handle_updated_at();
