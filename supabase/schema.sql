-- ============================================================
-- CertiDraft — Supabase PostgreSQL Setup Script
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- 1. ENUMS
-- ============================================================

create type user_plan as enum ('free', 'starter', 'pro', 'enterprise');
create type user_role as enum ('user', 'admin');
create type project_status as enum ('draft', 'active', 'completed');
create type batch_status as enum (
  'pending',
  'processing',
  'completed',
  'completed_with_errors',
  'failed',
  'retrying'
);
create type certificate_status as enum ('completed', 'failed');
create type template_category as enum ('Corporate', 'Academic', 'Sports', 'Recognition');


-- ============================================================
-- 2. TABLES
-- ============================================================

-- ----------------------------------------------------------
-- 2.1  users  (mirrors / extends auth.users)
-- ----------------------------------------------------------
create table public.users (
  id                     uuid        primary key references auth.users (id) on delete cascade,
  email                  text,
  full_name              text,
  avatar_url             text,
  plan                   user_plan   not null default 'free',
  role                   user_role   not null default 'user',
  plan_expires_at        timestamptz,
  certificates_this_month integer    not null default 0,
  last_usage_reset       timestamptz,
  wallet_slug            text        unique,
  wallet_title           text,
  wallet_is_public       boolean     not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.users is
  'Public profile and billing metadata for each authenticated user.';


-- ----------------------------------------------------------
-- 2.2  templates
-- ----------------------------------------------------------
create table public.templates (
  id              uuid             primary key default gen_random_uuid(),
  name            text             not null,
  category        template_category not null,
  description     text,
  thumbnail_url   text,
  accent_color    text,
  secondary_color text,
  style           text,
  uses            integer          not null default 0,
  is_featured     boolean          not null default false,
  elements        jsonb,
  is_public       boolean          default false,
  price           numeric          default 0,
  creator_id      uuid             references public.users (id) on delete set null,
  created_at      timestamptz      not null default now()
);

comment on table public.templates is
  'Certificate design templates. System templates have creator_id = NULL.';


-- ----------------------------------------------------------
-- 2.3  projects
-- ----------------------------------------------------------
create table public.projects (
  id                uuid           primary key default gen_random_uuid(),
  user_id           uuid           not null references public.users (id) on delete cascade,
  name              text           not null,
  event_type        text,
  description       text,
  template_id       uuid           references public.templates (id) on delete set null,
  elements          jsonb,
  status            project_status not null default 'draft',
  certificate_count integer        not null default 0,
  created_at        timestamptz    not null default now(),
  updated_at        timestamptz    not null default now()
);

comment on table public.projects is
  'A certificate campaign / event owned by a user.';


-- ----------------------------------------------------------
-- 2.4  batch_jobs  (merged batch_uploads + batch_jobs)
-- ----------------------------------------------------------
create table public.batch_jobs (
  id              uuid         primary key default gen_random_uuid(),
  project_id      uuid         not null references public.projects (id) on delete cascade,
  user_id         uuid         not null references public.users (id) on delete cascade,
  status          batch_status not null default 'pending',
  csv_data        jsonb,
  column_mapping  jsonb,
  design_snapshot jsonb,
  processed_count integer      not null default 0,
  total_count     integer      not null default 0,
  errors          jsonb,
  storage_bucket  text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz  not null default now()
);

comment on table public.batch_jobs is
  'Tracks a bulk certificate generation run, merging upload metadata and processing state.';


-- ----------------------------------------------------------
-- 2.5  certificates
-- ----------------------------------------------------------
create table public.certificates (
  id                 uuid               primary key default gen_random_uuid(),
  batch_job_id       uuid               not null references public.batch_jobs (id) on delete cascade,
  user_id            uuid               not null references public.users (id) on delete cascade,
  recipient_name     text               not null,
  recipient_email    text,
  achievement        text,
  citation_text      text,
  grade              text,
  template_id        uuid               references public.templates (id) on delete set null,
  template_name      text,
  verification_token uuid               not null unique default gen_random_uuid(),
  verification_url   text,
  storage_bucket     text,
  storage_path       text,
  issued_at          timestamptz        not null default now(),
  status             certificate_status not null default 'completed'
);

comment on table public.certificates is
  'Individual certificates generated within a batch job.';


-- ============================================================
-- 3. INDEXES
-- ============================================================

create index idx_projects_user_id              on public.projects      (user_id);
create index idx_batch_jobs_user_id            on public.batch_jobs    (user_id);
create index idx_batch_jobs_project_id         on public.batch_jobs    (project_id);
create index idx_certificates_batch_job_id     on public.certificates  (batch_job_id);
create index idx_certificates_user_id          on public.certificates  (user_id);
create index idx_certificates_verification_token on public.certificates (verification_token);
create index idx_templates_category            on public.templates     (category);
create index idx_templates_creator_id          on public.templates     (creator_id);


-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- ----------------------------------------------------------
-- 4.1  Auto-create a public.users row on auth.users insert
-- ----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ----------------------------------------------------------
-- 4.2  Keep updated_at current on users and projects
-- ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.users        enable row level security;
alter table public.templates    enable row level security;
alter table public.projects     enable row level security;
alter table public.batch_jobs   enable row level security;
alter table public.certificates enable row level security;


-- ----------------------------------------------------------
-- 5.1  users policies
-- ----------------------------------------------------------

-- Signup trigger can insert; the function runs as SECURITY DEFINER so
-- it bypasses RLS, but we also expose an explicit insert policy so that
-- the trigger owner context is covered in all Supabase plan configs.
create policy "users_insert_on_signup"
  on public.users
  for insert
  with check (auth.uid() = id);

create policy "users_select_own"
  on public.users
  for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_delete_own"
  on public.users
  for delete
  using (auth.uid() = id);


-- ----------------------------------------------------------
-- 5.2  templates policies
-- ----------------------------------------------------------

-- System templates (creator_id IS NULL) are readable by everyone.
create policy "templates_select_system"
  on public.templates
  for select
  using (creator_id is null);

-- Public user-created templates are readable by everyone.
create policy "templates_select_public_user"
  on public.templates
  for select
  using (creator_id is not null and is_public = true);

-- Private user-created templates are only readable by their creator.
create policy "templates_select_own_private"
  on public.templates
  for select
  using (creator_id = auth.uid());

-- Authenticated users can create their own templates.
create policy "templates_insert_own"
  on public.templates
  for insert
  with check (creator_id = auth.uid());

-- Creators can update / delete only their own templates.
create policy "templates_update_own"
  on public.templates
  for update
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

create policy "templates_delete_own"
  on public.templates
  for delete
  using (creator_id = auth.uid());


-- ----------------------------------------------------------
-- 5.3  projects policies
-- ----------------------------------------------------------

create policy "projects_select_own"
  on public.projects
  for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects
  for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects
  for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------
-- 5.4  batch_jobs policies
-- ----------------------------------------------------------

create policy "batch_jobs_select_own"
  on public.batch_jobs
  for select
  using (auth.uid() = user_id);

create policy "batch_jobs_insert_own"
  on public.batch_jobs
  for insert
  with check (auth.uid() = user_id);

create policy "batch_jobs_update_own"
  on public.batch_jobs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "batch_jobs_delete_own"
  on public.batch_jobs
  for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------
-- 5.5  certificates policies
-- ----------------------------------------------------------

-- Owners can read all their certificates.
create policy "certificates_select_own"
  on public.certificates
  for select
  using (auth.uid() = user_id);


create policy "certificates_insert_own"
  on public.certificates
  for insert
  with check (auth.uid() = user_id);

create policy "certificates_update_own"
  on public.certificates
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "certificates_delete_own"
  on public.certificates
  for delete
  using (auth.uid() = user_id);

-- Certificate verification by token is intentionally handled server-side
-- via a service role API route at /api/verify/[token]. The server queries
-- by verification_token using the service role key which bypasses RLS safely.
-- Never expose this query to the client.


-- ============================================================
-- 6. SEED DATA — System Templates (creator_id = NULL)
-- ============================================================

insert into public.templates
  (name, category, description, accent_color, secondary_color, style, is_featured, is_public, price, creator_id)
values

  -- ── Corporate (3) ──────────────────────────────────────────
  (
    'Executive Excellence',
    'Corporate',
    'A refined, gold-on-midnight template built for boardroom presentations and leadership recognition programs. Clean serif typography meets structured layout for an authoritative feel.',
    '#C9A84C',   -- antique gold
    '#1A1F2E',   -- midnight navy
    'Classic Executive',
    true,        -- featured in Corporate
    true,
    0,
    null
  ),
  (
    'Prestige Boardroom',
    'Corporate',
    'Deep charcoal and rose gold create a sophisticated contrast ideal for executive awards and corporate milestones. Features a double-rule border and embossed-style logo placement.',
    '#B76E79',   -- rose gold
    '#2C2C2C',   -- charcoal
    'Modern Formal',
    false,
    true,
    0,
    null
  ),
  (
    'Tech Innovator',
    'Corporate',
    'A forward-looking template with electric teal accents and a dark slate base. Perfect for tech companies, hackathons, and innovation awards seeking a contemporary edge.',
    '#00D4C8',   -- electric teal
    '#1E2530',   -- dark slate
    'Contemporary Tech',
    false,
    true,
    0,
    null
  ),

  -- ── Academic (3) ───────────────────────────────────────────
  (
    'Scholars Crest',
    'Academic',
    'Traditional parchment tones anchored by deep burgundy — the quintessential academic certificate that evokes Ivy League prestige. Includes a decorative crest placeholder.',
    '#6B0F1A',   -- deep burgundy
    '#F5ECD7',   -- parchment
    'Heritage Academic',
    true,        -- featured in Academic
    true,
    0,
    null
  ),
  (
    'Campus Modern',
    'Academic',
    'A clean, contemporary take on the graduation certificate with bold cobalt highlights and ample white space. Suits modern universities and online learning platforms alike.',
    '#2563EB',   -- cobalt blue
    '#F8FAFC',   -- off-white
    'Modern Minimal',
    false,
    true,
    0,
    null
  ),
  (
    'Global Scholar',
    'Academic',
    'An internationally inspired design with geometric patterns and a vibrant emerald accent, celebrating academic achievement across cultures and disciplines.',
    '#059669',   -- emerald green
    '#ECFDF5',   -- mint white
    'International Modern',
    false,
    true,
    0,
    null
  ),

  -- ── Sports (3) ─────────────────────────────────────────────
  (
    'Champion Series',
    'Sports',
    'Bold, dynamic, and energetic — this template commands attention with a blazing amber-on-black palette and angular design elements. Built for champions who demand recognition.',
    '#F59E0B',   -- blazing amber
    '#111827',   -- near black
    'Bold Dynamic',
    true,        -- featured in Sports
    true,
    0,
    null
  ),
  (
    'Victory Grid',
    'Sports',
    'A sports-grid inspired layout with crisp white lines on a deep navy field. Ideal for league championships, team awards, and athletic department recognitions.',
    '#FFFFFF',   -- crisp white
    '#0F172A',   -- deep navy
    'Athletic Grid',
    false,
    true,
    0,
    null
  ),
  (
    'Summit Achievement',
    'Sports',
    'Elevated and adventurous — gradients of alpine purple and silver convey the feeling of reaching the top. Great for endurance events, marathons, and outdoor competitions.',
    '#7C3AED',   -- alpine purple
    '#CBD5E1',   -- silver grey
    'Elevation Gradient',
    false,
    true,
    0,
    null
  ),

  -- ── Recognition (2) ────────────────────────────────────────
  (
    'Royal Sovereign',
    'Recognition',
    'Commanding and majestic, this template uses rich royal purple with bright gold ornamentation. Designed for lifetime achievement awards, hall-of-fame inductions, and distinguished service honours.',
    '#FFD700',   -- bright gold
    '#4C1D95',   -- royal purple
    'Majestic Formal',
    true,        -- featured in Recognition
    true,
    0,
    null
  ),
  (
    'Spotlight Honor',
    'Recognition',
    'A warm, celebratory design with coral and champagne tones that feel personal and heartfelt. Perfect for employee-of-the-month, volunteer recognition, and community appreciation certificates.',
    '#FF6B6B',   -- coral
    '#FFF8F0',   -- champagne
    'Warm Celebratory',
    false,
    true,
    0,
    null
  );

-- ============================================================
-- END OF SCRIPT
-- ============================================================
