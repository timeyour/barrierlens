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

-- 登录用户可选同步到个人 records（游客仅本机 localStorage）
create table if not exists public.records (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  location_text text not null default '地点未标注',
  issue_type text not null,
  risk_level text not null,
  affected_groups jsonb not null default '[]'::jsonb,
  suggestion text not null default '',
  report_text text not null default '',
  mode text not null default 'public',
  image_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists records_user_created_idx
  on public.records (user_id, created_at desc);

alter table public.records enable row level security;

drop policy if exists "Users can read own records" on public.records;
create policy "Users can read own records"
  on public.records for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own records" on public.records;
create policy "Users can insert own records"
  on public.records for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own records" on public.records;
create policy "Users can update own records"
  on public.records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own records" on public.records;
create policy "Users can delete own records"
  on public.records for delete
  using (auth.uid() = user_id);

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
-- Public bucket: 关闭（私有，仅服务端可读）
--
-- 若需 SQL 创建 bucket（部分项目可用）:
-- insert into storage.buckets (id, name, public)
-- values ('report-images', 'report-images', false)
-- on conflict (id) do nothing;
