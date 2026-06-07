// =============================================================================
// ⛔  SERVER-ONLY — DO NOT IMPORT THIS FILE IN CLIENT COMPONENTS
//
// This client is initialised with the Supabase service role key, which
// bypasses Row Level Security completely. It is intended exclusively for
// trusted server-side operations such as:
//   • The /api/verify/[token] route handler (certificate verification)
//   • Background batch workers
//   • Admin-only data mutations
//
// Never expose this client, its key, or its query results to the browser.
// Never import this file from any file that has 'use client' at the top.
// =============================================================================

import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      // Disable session persistence — the admin client must never store a
      // user session; it always acts as the service role.
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
