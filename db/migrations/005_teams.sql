-- Migration 005: Teams — Mitglieder einladen, Farben, Einkaufslisten-Zuweisung

-- ============================================
-- TEAMS
-- ============================================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  invite_code text unique default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;
create policy "Anyone can CRUD teams" on public.teams for all using (true);

create trigger on_teams_updated
  before update on public.teams
  for each row execute function public.handle_updated_at();

-- ============================================
-- TEAM MEMBERS
-- ============================================
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid,
  display_name text not null,
  color text not null default '#6336f5',
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (team_id, display_name)
);

alter table public.team_members enable row level security;
create policy "Anyone can CRUD team members" on public.team_members for all using (true);
create index idx_team_members_team on public.team_members (team_id);

-- ============================================
-- SHOPPING LIST ASSIGNMENTS
-- ============================================
create table if not exists public.shopping_assignments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  list_name text not null,
  item_name text not null,
  assigned_to uuid references public.team_members(id) on delete set null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.shopping_assignments enable row level security;
create policy "Anyone can CRUD shopping assignments" on public.shopping_assignments for all using (true);
create index idx_shopping_assignments_team on public.shopping_assignments (team_id, list_name);

-- ============================================
-- EVENT LISTS (Grillparty, etc.)
-- ============================================
create table if not exists public.event_lists (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  description text,
  event_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_lists enable row level security;
create policy "Anyone can CRUD event lists" on public.event_lists for all using (true);

create trigger on_event_lists_updated
  before update on public.event_lists
  for each row execute function public.handle_updated_at();

-- ============================================
-- EVENT LIST ITEMS (wer bringt was mit)
-- ============================================
create table if not exists public.event_list_items (
  id uuid primary key default gen_random_uuid(),
  event_list_id uuid not null references public.event_lists(id) on delete cascade,
  item_name text not null,
  quantity text,
  assigned_to uuid references public.team_members(id) on delete set null,
  checked boolean not null default false,
  category text default 'Sonstiges',
  created_at timestamptz not null default now()
);

alter table public.event_list_items enable row level security;
create policy "Anyone can CRUD event list items" on public.event_list_items for all using (true);
create index idx_event_list_items_list on public.event_list_items (event_list_id);
