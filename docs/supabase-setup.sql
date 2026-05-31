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

-- 公开摘要：记录者校验 token（仅存服务端，本机档案持有副本）
alter table public.reports
  add column if not exists review_token text;

-- 他人申请查看现场照片（记录者在本机档案页处理）
create table if not exists public.photo_access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  report_id uuid not null references public.reports(id) on delete cascade,
  message text not null,
  contact text,
  status text not null default 'pending'
);

create index if not exists photo_access_requests_report_id_idx
  on public.photo_access_requests (report_id, created_at desc);

alter table public.photo_access_requests enable row level security;

create policy "Anyone can insert photo requests"
  on public.photo_access_requests for insert
  with check (true);

-- Storage：在 Dashboard → Storage 新建 bucket
-- 名称: report-images
-- Public bucket: 开启（Demo 缩略图公开读）
--
-- 若需 SQL 创建 bucket（部分项目可用）:
-- insert into storage.buckets (id, name, public)
-- values ('report-images', 'report-images', true)
-- on conflict (id) do nothing;
