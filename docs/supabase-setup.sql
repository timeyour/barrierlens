-- 无碍 BarrierLens · Supabase 初始化 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行

create table if not exists public.reports (
  id uuid primary key,
  created_at timestamptz not null default now(),
  local_id text,
  location text not null default '地点未标注',
  lat double precision,
  lng double precision,
  scene_type text not null,
  issue_type text not null,
  risk_level text not null,
  record_mode text not null default 'public',
  target_department text,
  problem_summary text,
  report_text text,
  path_status text,
  review_status text not null default 'pending',
  image_url text,
  image_path text,
  diagnosis jsonb not null,
  analysis_source text
);

create index if not exists reports_created_at_idx
  on public.reports (created_at desc);

alter table public.reports enable row level security;

create policy "Anyone can read reports"
  on public.reports for select
  using (true);

-- Storage：在 Dashboard → Storage 新建 bucket
-- 名称: report-images
-- Public bucket: 开启（Demo 缩略图公开读）
--
-- 若需 SQL 创建 bucket（部分项目可用）:
-- insert into storage.buckets (id, name, public)
-- values ('report-images', 'report-images', true)
-- on conflict (id) do nothing;
