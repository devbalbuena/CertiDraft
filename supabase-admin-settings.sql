-- ============================================================================
-- CertiDraft Admin: Platform Settings Table
-- ============================================================================
-- Run this SQL in your Supabase project's SQL Editor.
-- This table uses a single-row pattern (id = 1 always) for global settings.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id                 integer PRIMARY KEY DEFAULT 1,
  maintenance_mode   boolean NOT NULL DEFAULT false,
  maintenance_message text,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  -- Enforce the single-row constraint
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the default row (safe to re-run; will do nothing if already exists)
INSERT INTO public.platform_settings (id, maintenance_mode, maintenance_message)
VALUES (1, false, NULL)
ON CONFLICT (id) DO NOTHING;

-- RLS: Only the service role (admin client) can read/write this table.
-- The admin UI reads it via the API route which uses the admin client.
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed — the service role bypasses RLS entirely.
-- Regular users should never be able to access this table directly.

COMMENT ON TABLE public.platform_settings IS
  'Global platform settings. Always contains exactly one row with id = 1.';
