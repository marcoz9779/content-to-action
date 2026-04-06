create table if not exists public.result_tags (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.analysis_results(id) on delete cascade,
  tag text not null,
  category text not null default 'ingredient',
  created_at timestamptz not null default now()
);

alter table public.result_tags enable row level security;
create policy "Anyone can read/write tags" on public.result_tags for all using (true);
create index idx_result_tags_result on public.result_tags (result_id);
create index idx_result_tags_tag on public.result_tags (tag);
create index idx_result_tags_category on public.result_tags (category);
