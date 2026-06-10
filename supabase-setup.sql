-- ============================================================================
-- CertiDraft — Complete Database Setup Script
-- ============================================================================
-- Run this entire file in the Supabase SQL Editor to create the full schema
-- from scratch, including enums, tables, indexes, triggers, RLS, and seed data.
--
-- Order of execution matters — tables are created before foreign keys reference them.
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable UUID generation (used as primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for secure token generation (used in verification tokens)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- 2. ENUMS (Custom Types)
-- ============================================================================

-- Subscription plan tiers
DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free', 'starter', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User roles for RBAC (admin panel access)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Project lifecycle statuses
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Batch job processing states
DO $$ BEGIN
  CREATE TYPE batch_job_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'completed_with_errors',
    'failed',
    'retrying'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Certificate generation status
DO $$ BEGIN
  CREATE TYPE certificate_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1  users
-- Extends Supabase Auth's auth.users. One row per authenticated user.
-- Created automatically via trigger when a new user signs up.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                  TEXT,                            -- Synced from auth.users
  full_name              TEXT,                            -- Set by user in Settings
  avatar_url             TEXT,                            -- Profile photo URL
  role                   user_role NOT NULL DEFAULT 'user', -- 'admin' grants admin panel access
  plan                   plan_type NOT NULL DEFAULT 'free', -- Active subscription tier
  certificates_this_month INT NOT NULL DEFAULT 0,         -- Resets monthly for quota enforcement
  -- Public wallet settings
  wallet_slug            TEXT UNIQUE,                     -- URL slug e.g. "ivan-lee" → /wallet/ivan-lee
  wallet_title           TEXT,                            -- Display name on the wallet page
  wallet_is_public       BOOLEAN NOT NULL DEFAULT FALSE,  -- Toggle public/private visibility
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles, subscription state, and wallet configuration.';


-- ----------------------------------------------------------------------------
-- 3.2  templates
-- Predefined certificate design templates seeded by admins.
-- Users can load a template as the starting point for a project.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.templates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,                           -- Display name e.g. "Minimal", "Bordered"
  description    TEXT,                                    -- Short description shown in the gallery
  elements       JSONB,                                   -- Fabric.js canvas JSON (objects array)
  thumbnail_url  TEXT,                                    -- Preview image URL
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,           -- Hidden templates won't appear in gallery
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.templates IS 'Global certificate design templates seeded and managed by admins.';


-- ----------------------------------------------------------------------------
-- 3.3  projects
-- A project represents one certificate campaign (e.g. one workshop, one course).
-- Each project has one saved design and can have many batch jobs.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id       UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,                         -- User-provided project name
  description       TEXT,                                  -- Optional description
  event_type        TEXT NOT NULL,                         -- e.g. "Workshop", "Course", "Seminar"
  elements          JSONB,                                  -- Saved Fabric.js canvas JSON (null = not designed yet)
  certificate_count INT NOT NULL DEFAULT 0,                 -- Total certs generated (all time), updated via RPC
  status            project_status NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.projects IS 'Certificate campaigns. Holds the saved design and links to batch jobs.';


-- ----------------------------------------------------------------------------
-- 3.4  batch_jobs
-- One batch job = one CSV upload + generation run.
-- Tracks the queue state, CSV payload, column mapping, and progress.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batch_jobs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status           batch_job_status NOT NULL DEFAULT 'pending',
  -- CSV payload stored in full (JSONB array of row objects, parsed from CSV)
  csv_data         JSONB,
  -- Maps CertiDraft fields → CSV column headers
  -- e.g. {"recipient_name": "Name", "achievement": "Course", "recipient_email": "Email"}
  column_mapping   JSONB,
  -- Snapshot of the project's design at the time of queuing (immutable after queuing)
  design_snapshot  JSONB,
  -- Counters
  total_count      INT NOT NULL DEFAULT 0,                 -- Total rows in the CSV
  processed_count  INT NOT NULL DEFAULT 0,                 -- How many have been processed so far
  -- Error log (array of error strings, one per failed row)
  errors           JSONB,
  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at       TIMESTAMPTZ,                            -- When worker picked it up
  completed_at     TIMESTAMPTZ                             -- When worker finished or failed
);

COMMENT ON TABLE public.batch_jobs IS 'Tracks individual CSV-based certificate generation runs. Consumed by the BullMQ worker.';


-- ----------------------------------------------------------------------------
-- 3.5  certificates
-- One row per issued certificate PDF.
-- Written by the worker after a successful Puppeteer render + Storage upload.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_job_id        UUID REFERENCES public.batch_jobs(id) ON DELETE SET NULL,
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id          UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  template_id         UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  -- Recipient fields (sourced from CSV via column_mapping)
  recipient_name      TEXT NOT NULL,
  recipient_email     TEXT,                                -- Optional — only present if email column was mapped
  achievement         TEXT NOT NULL,                       -- The award/course name
  grade               TEXT,                                -- Optional grade or score
  -- Verification
  verification_token  UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(), -- Used in /verify/[token]
  verification_url    TEXT,                                -- Full URL of the verification page
  -- Storage (PDF location in Supabase Storage)
  storage_bucket      TEXT,                                -- Bucket name (e.g. "certificates")
  storage_path        TEXT,                                -- Path within bucket e.g. "{user_id}/{project_id}/{token}.pdf"
  -- Status + metadata
  status              certificate_status NOT NULL DEFAULT 'completed',
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Certificate issue date
  -- Email tracking
  last_email_sent_at  TIMESTAMPTZ,                         -- Last time a delivery email was dispatched (for rate limiting)
  -- Optional: cached template name at time of generation
  template_name       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.certificates IS 'Issued certificates — one row per PDF. Supports verification, email delivery, and public wallets.';


-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_wallet_slug ON public.users(wallet_slug) WHERE wallet_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);

-- projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- batch_jobs
CREATE INDEX IF NOT EXISTS idx_batch_jobs_project_id ON public.batch_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_id ON public.batch_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON public.batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_at ON public.batch_jobs(created_at DESC);

-- certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_project_id ON public.certificates(project_id);
CREATE INDEX IF NOT EXISTS idx_certificates_batch_job_id ON public.certificates(batch_job_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_token ON public.certificates(verification_token);
CREATE INDEX IF NOT EXISTS idx_certificates_recipient_email ON public.certificates(recipient_email) WHERE recipient_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON public.certificates(issued_at DESC);


-- ============================================================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1  Auto-create user profile on sign-up
-- Fires when a new user is created in auth.users.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 5.2  Auto-update updated_at on row modifications
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 5.3  increment_certificate_count (RPC)
-- Called by the worker after a batch job completes to bump the project count
-- and the user's monthly quota counter.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_certificate_count(
  p_project_id UUID,
  p_amount     INT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Bump the project's all-time counter
  UPDATE public.projects
  SET certificate_count = certificate_count + p_amount
  WHERE id = p_project_id;

  -- Resolve the owning user
  SELECT user_id INTO v_user_id FROM public.projects WHERE id = p_project_id;

  -- Bump the user's monthly counter (used for plan quota enforcement)
  IF v_user_id IS NOT NULL THEN
    UPDATE public.users
    SET certificates_this_month = certificates_this_month + p_amount
    WHERE id = v_user_id;
  END IF;
END;
$$;


-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- The service role key bypasses RLS — used by the worker and admin routes.
-- Regular users can only access their own data.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;


-- users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- templates (public read for all authenticated users; only service role writes)
DROP POLICY IF EXISTS "Authenticated users can view active templates" ON public.templates;
CREATE POLICY "Authenticated users can view active templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (is_active = TRUE);


-- projects
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- batch_jobs
DROP POLICY IF EXISTS "Users can manage their own batch jobs" ON public.batch_jobs;
CREATE POLICY "Users can manage their own batch jobs"
  ON public.batch_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- certificates
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificates;
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Public verification and wallet pages use the service role (supabaseAdmin) to
-- bypass RLS — this is intentional and safe since those pages are read-only
-- and scoped to a specific token or wallet_slug.


-- ============================================================================
-- 7. SEED DATA — Templates
-- ============================================================================
-- Inserts the three built-in templates defined in src/lib/templates.ts.
-- The elements JSONB matches the format generated by getTemplateElements().

INSERT INTO public.templates (name, description, elements, is_active)
VALUES
(
  'Minimal',
  'A clean, text-only layout with elegant typography. Perfect for academic awards.',
  '{"version":"7.4.0","background":"#ffffff","objects":[{"type":"Textbox","text":"CERTIFICATE OF ACHIEVEMENT","left":421,"top":150,"fontFamily":"Inter","fontSize":32,"fontWeight":"bold","fill":"#1f2937","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"This is to certify that","left":421,"top":220,"fontFamily":"Inter","fontSize":16,"fill":"#6b7280","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{recipient_name}}","left":421,"top":280,"fontFamily":"Georgia","fontSize":48,"fontWeight":"bold","fill":"#111827","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{achievement}}","left":421,"top":350,"fontFamily":"Inter","fontSize":20,"fill":"#4b5563","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{citation_text}}","left":421,"top":400,"fontFamily":"Inter","fontSize":14,"fill":"#6b7280","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"Issued on {{issued_date}}","left":421,"top":500,"fontFamily":"Inter","fontSize":12,"fill":"#9ca3af","textAlign":"center","originX":"center","originY":"center"}]}',
  TRUE
),
(
  'Bordered',
  'A classic double-border frame with traditional serif typography.',
  '{"version":"7.4.0","background":"#ffffff","objects":[{"type":"Rect","left":30,"top":30,"width":782,"height":535,"fill":"transparent","stroke":"#0f172a","strokeWidth":4,"rx":0,"ry":0},{"type":"Rect","left":40,"top":40,"width":762,"height":515,"fill":"transparent","stroke":"#0f172a","strokeWidth":1,"rx":0,"ry":0},{"type":"Textbox","text":"CERTIFICATE","left":421,"top":140,"fontFamily":"Times New Roman","fontSize":48,"fontWeight":"bold","fill":"#0f172a","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{recipient_name}}","left":421,"top":260,"fontFamily":"Times New Roman","fontSize":42,"fontStyle":"italic","fill":"#1e293b","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{achievement}}","left":421,"top":340,"fontFamily":"Inter","fontSize":18,"fill":"#334155","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{citation_text}}","left":421,"top":390,"fontFamily":"Inter","fontSize":14,"fill":"#475569","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{issued_date}}","left":150,"top":480,"fontFamily":"Inter","fontSize":14,"fill":"#0f172a","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"Date","left":150,"top":500,"fontFamily":"Inter","fontSize":12,"fill":"#64748b","textAlign":"center","originX":"center","originY":"center"}]}',
  TRUE
),
(
  'Dark Header',
  'A modern certificate with a bold navy header bar. Great for tech events.',
  '{"version":"7.4.0","background":"#ffffff","objects":[{"type":"Rect","left":0,"top":0,"width":842,"height":120,"fill":"#1e1b4b","strokeWidth":0,"rx":0,"ry":0},{"type":"Textbox","text":"CERTIFICATE OF COMPLETION","left":421,"top":60,"fontFamily":"Inter","fontSize":28,"fontWeight":"bold","fill":"#ffffff","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{recipient_name}}","left":421,"top":250,"fontFamily":"Georgia","fontSize":42,"fontWeight":"bold","fill":"#111827","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{achievement}}","left":421,"top":320,"fontFamily":"Inter","fontSize":20,"fill":"#4b5563","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"{{citation_text}}","left":421,"top":380,"fontFamily":"Inter","fontSize":14,"fill":"#6b7280","textAlign":"center","originX":"center","originY":"center"},{"type":"Textbox","text":"Date: {{issued_date}}","left":421,"top":480,"fontFamily":"Inter","fontSize":14,"fill":"#374151","textAlign":"center","originX":"center","originY":"center"}]}',
  TRUE
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 8. SUPABASE STORAGE BUCKET
-- ============================================================================
-- Run this to create the required public storage bucket for certificate PDFs.
-- This cannot be done via SQL in all Supabase plans — you can also create it
-- manually in the Supabase Dashboard → Storage → New Bucket.

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on the certificates bucket (for PDF download links)
DROP POLICY IF EXISTS "Public read access for certificates bucket" ON storage.objects;
CREATE POLICY "Public read access for certificates bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

-- Allow the service role to upload (worker uses service role key)
-- Note: the worker uses supabaseAdmin which bypasses RLS, so no additional
-- INSERT policy is strictly needed — but this is included for completeness.
DROP POLICY IF EXISTS "Service role can upload certificates" ON storage.objects;
CREATE POLICY "Service role can upload certificates"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'certificates');


-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
-- After running this, verify:
-- 1. All 5 tables exist: users, templates, projects, batch_jobs, certificates
-- 2. The on_auth_user_created trigger is active
-- 3. The increment_certificate_count function exists
-- 4. The "certificates" storage bucket exists and is public
-- 5. RLS is enabled on all tables
-- ============================================================================
