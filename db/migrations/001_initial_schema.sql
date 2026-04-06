-- Migration 001: Initial Schema
-- Content to Action MVP

-- ============================================
-- UTILITY FUNCTION
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- PROFILES
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ANALYSIS JOBS
-- ============================================
create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  source_type text not null check (source_type in ('url', 'upload')),
  source_platform text not null default 'unknown' check (source_platform in ('instagram', 'tiktok', 'facebook', 'youtube', 'unknown')),
  source_url text,
  upload_path text,
  caption_text text,
  comment_text text,
  status text not null default 'queued' check (status in ('queued', 'fetching_source', 'transcribing', 'extracting_ocr', 'classifying', 'structuring', 'completed', 'failed')),
  progress_percent int not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analysis_jobs enable row level security;

create policy "Anyone can read jobs" on public.analysis_jobs for select using (true);
create policy "Anyone can insert jobs" on public.analysis_jobs for insert with check (true);
create policy "Service role can update jobs" on public.analysis_jobs for update using (true);

create index idx_analysis_jobs_status on public.analysis_jobs (status);
create index idx_analysis_jobs_created_at on public.analysis_jobs (created_at desc);

create trigger on_analysis_jobs_updated
  before update on public.analysis_jobs
  for each row execute function public.handle_updated_at();

-- ============================================
-- ANALYSIS ARTIFACTS
-- ============================================
create table if not exists public.analysis_artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.analysis_jobs(id) on delete cascade,
  raw_transcript text,
  raw_ocr_text text,
  raw_caption_text text,
  raw_comment_text text,
  detected_language text,
  source_title text,
  source_creator text,
  source_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.analysis_artifacts enable row level security;
create policy "Anyone can read artifacts" on public.analysis_artifacts for select using (true);
create policy "Service role can insert artifacts" on public.analysis_artifacts for insert with check (true);

-- ============================================
-- ANALYSIS RESULTS
-- ============================================
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.analysis_jobs(id) on delete cascade,
  user_id uuid,
  content_type text not null check (content_type in ('recipe', 'business', 'diy', 'workout', 'other')),
  title text not null,
  summary text not null,
  confidence_score numeric(4,3) not null default 0,
  warnings jsonb not null default '[]',
  missing_information jsonb not null default '[]',
  structured_output jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.analysis_results enable row level security;
create policy "Anyone can read results" on public.analysis_results for select using (true);
create policy "Service role can insert results" on public.analysis_results for insert with check (true);
create index idx_analysis_results_content_type on public.analysis_results (content_type);

-- ============================================
-- SAVED RESULTS
-- ============================================
create table if not exists public.saved_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  result_id uuid not null references public.analysis_results(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, result_id)
);

alter table public.saved_results enable row level security;
create policy "Users can read own saved" on public.saved_results for select using (auth.uid() = user_id);
create policy "Users can insert own saved" on public.saved_results for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved" on public.saved_results for delete using (auth.uid() = user_id);
create index idx_saved_results_user_id on public.saved_results (user_id);

-- ============================================
-- ANALYTICS EVENTS
-- ============================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_name text not null,
  event_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
create policy "Anyone can insert events" on public.analytics_events for insert with check (true);
create index idx_analytics_events_name_created on public.analytics_events (event_name, created_at desc);
