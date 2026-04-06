# Database Design

## Overview

Supabase Postgres with Row Level Security. All tables use UUIDs as primary keys. Timestamps use `timestamptz`.

## Tables

### profiles
User profile data linked to Supabase Auth.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, references auth.users(id) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| full_name | text | nullable |

### analysis_jobs
Tracks analysis job lifecycle.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | nullable |
| source_type | text | check: url, upload |
| source_platform | text | check: instagram, tiktok, facebook, youtube, unknown |
| source_url | text | nullable |
| upload_path | text | nullable |
| caption_text | text | nullable |
| comment_text | text | nullable |
| status | text | check: queued, fetching_source, transcribing, extracting_ocr, classifying, structuring, completed, failed |
| progress_percent | int | not null, default 0 |
| error_message | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### analysis_artifacts
Raw artifacts collected during processing.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| job_id | uuid | FK → analysis_jobs(id) on delete cascade |
| raw_transcript | text | nullable |
| raw_ocr_text | text | nullable |
| raw_caption_text | text | nullable |
| raw_comment_text | text | nullable |
| detected_language | text | nullable |
| source_title | text | nullable |
| source_creator | text | nullable |
| source_metadata | jsonb | default '{}' |
| created_at | timestamptz | default now() |

### analysis_results
Final structured analysis output.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| job_id | uuid | FK → analysis_jobs(id) on delete cascade |
| user_id | uuid | nullable |
| content_type | text | check: recipe, business, diy, workout, other |
| title | text | not null |
| summary | text | not null |
| confidence_score | numeric(4,3) | default 0 |
| warnings | jsonb | default '[]' |
| missing_information | jsonb | default '[]' |
| structured_output | jsonb | not null |
| created_at | timestamptz | default now() |

### saved_results
User-saved results (requires authentication).

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | not null |
| result_id | uuid | FK → analysis_results(id) on delete cascade |
| created_at | timestamptz | default now() |
| | | unique(user_id, result_id) |

### analytics_events
Lightweight event tracking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | nullable |
| event_name | text | not null |
| event_payload | jsonb | default '{}' |
| created_at | timestamptz | default now() |

## Indexes

- `analysis_jobs.status` — filter by job status
- `analysis_jobs.created_at` — sort by creation date
- `analysis_results.content_type` — filter by type
- `saved_results.user_id` — user's saved results
- `analytics_events(event_name, created_at)` — event queries

## Row Level Security

- `analysis_jobs`: Public read for own jobs (by user_id or anonymous), insert allowed
- `analysis_results`: Public read
- `saved_results`: Authenticated users can CRUD their own saved results
- `analytics_events`: Insert-only for all, read for service role only

## Migrations

Migrations are in `db/migrations/` and should be applied via Supabase CLI (`supabase db push`) or manually through the SQL editor.
