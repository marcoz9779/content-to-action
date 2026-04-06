-- Migration 003: Collections, Chat, Nutrition, Watch Accounts

-- ============================================
-- COLLECTIONS
-- ============================================
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collections enable row level security;
create policy "Users can CRUD own collections" on public.collections for all using (true);
create index idx_collections_user_id on public.collections (user_id);
create index idx_collections_share_token on public.collections (share_token);

create trigger on_collections_updated
  before update on public.collections
  for each row execute function public.handle_updated_at();

-- ============================================
-- COLLECTION ITEMS
-- ============================================
create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  result_id uuid not null references public.analysis_results(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (collection_id, result_id)
);

alter table public.collection_items enable row level security;
create policy "Anyone can read/write collection items" on public.collection_items for all using (true);
create index idx_collection_items_collection on public.collection_items (collection_id, sort_order);

-- ============================================
-- CHAT MESSAGES
-- ============================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.analysis_results(id) on delete cascade,
  user_id uuid,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;
create policy "Anyone can read/write chat messages" on public.chat_messages for all using (true);
create index idx_chat_messages_result on public.chat_messages (result_id, created_at);

-- ============================================
-- NUTRITION INFO
-- ============================================
create table if not exists public.nutrition_info (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.analysis_results(id) on delete cascade unique,
  calories_per_serving int,
  protein_grams numeric(6,1),
  carbs_grams numeric(6,1),
  fat_grams numeric(6,1),
  fiber_grams numeric(6,1),
  servings text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.nutrition_info enable row level security;
create policy "Anyone can read/write nutrition" on public.nutrition_info for all using (true);

-- ============================================
-- WATCHED ACCOUNTS
-- ============================================
create table if not exists public.watched_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook', 'youtube')),
  account_handle text not null,
  last_checked_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, platform, account_handle)
);

alter table public.watched_accounts enable row level security;
create policy "Users can CRUD own watches" on public.watched_accounts for all using (true);
create index idx_watched_accounts_user on public.watched_accounts (user_id);
