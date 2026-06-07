import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Copies cookies from a supabaseResponse onto a redirect response so that
 * any refreshed session tokens are not lost when we redirect the user.
 */
function withSessionCookies(
  redirect: NextResponse,
  supabaseResponse: NextResponse
): NextResponse {
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie)
  })
  return redirect
}

export async function middleware(request: NextRequest) {
  // Start with a pass-through response that carries the original request.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, responseHeaders) {
          // Mirror refreshed tokens into the request so subsequent middleware
          // reads are consistent, then persist them to the response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          // Forward cache-control headers that prevent CDN caching of
          // authenticated responses.
          Object.entries(responseHeaders).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // IMPORTANT: Call getUser() immediately after createServerClient — do not
  // place any logic between them. getUser() contacts the Supabase Auth server
  // to return a verified user; unlike getSession() it cannot be spoofed via
  // a crafted cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── /dashboard — requires authentication ──────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      return withSessionCookies(NextResponse.redirect(loginUrl), supabaseResponse)
    }
  }

  // ── /admin — requires authentication AND admin role ───────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      return withSessionCookies(NextResponse.redirect(loginUrl), supabaseResponse)
    }

    // Query the user's role from public.users. This is safe because the
    // authenticated user's own RLS policy allows them to read their row.
    // We intentionally use the anon-key client here — the service role key
    // must never be used in middleware.
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return withSessionCookies(
        NextResponse.redirect(dashboardUrl),
        supabaseResponse
      )
    }
  }

  // All other routes — /auth/*, /verify/*, /wallet/*, / — pass through.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run middleware on all paths EXCEPT:
     *   _next/static  — compiled static assets
     *   _next/image   — Next.js image optimisation
     *   favicon.ico   — browser icon request
     *   Files with a dot extension — images, fonts, etc.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)',
  ],
}
