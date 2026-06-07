import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components and browser contexts.
 * Call this at the top of any Client Component that needs Supabase access.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
