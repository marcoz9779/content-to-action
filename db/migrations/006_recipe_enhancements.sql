-- Migration 006: Recipe enhancements — thumbnail, seasonality

-- Add thumbnail_url to analysis_results
alter table public.analysis_results add column if not exists thumbnail_url text;

-- Add source_creator to analysis_results for display
alter table public.analysis_results add column if not exists source_creator text;

-- Add source_url to analysis_results for linking back
alter table public.analysis_results add column if not exists source_url text;
