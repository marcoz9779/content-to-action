-- Migration 002: Add new content types (travel, fashion, tech_review, education)
-- Alter the check constraint on analysis_results.content_type to include new types

-- Drop existing check constraint on content_type
alter table public.analysis_results
  drop constraint if exists analysis_results_content_type_check;

-- Add updated check constraint with new content types
alter table public.analysis_results
  add constraint analysis_results_content_type_check
  check (content_type in ('recipe', 'business', 'diy', 'workout', 'travel', 'fashion', 'tech_review', 'education', 'other'));
