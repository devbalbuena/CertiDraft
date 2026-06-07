import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Must be called inside an async context — never at
 * module level — because it awaits next/headers cookies().
 *
 * Cookie writes in Server Components are silently ignored (the middleware
 * handles session refreshes). In Server Actions and Route Handlers, cookies
 * are written to the outgoing response as expected.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet, responseHeaders) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
            // Forward cache-busting headers when cookies are refreshed.
            // In a Server Component context this is a no-op; in a Route
            // Handler or Server Action the headers are set on the response.
            Object.entries(responseHeaders).forEach(([key, value]) => {
              cookieStore.set(key, value)
            })
          } catch {
            // setAll is called from a Server Component where response cookies
            // cannot be set. This is safe to ignore — the middleware refreshes
            // the session before each page render.
          }
        },
      },
    }
  )
}
