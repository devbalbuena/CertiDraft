'use client'

import * as React from 'react'
import Link from 'next/link'

// ── CreditBadge ───────────────────────────────────────────────────────────────
// Fetches and displays the user's credit balance in the Topbar.
// Refreshes on focus so the balance updates after purchases.

export function CreditBadge() {
  const [credits, setCredits] = React.useState<number | null>(null)

  const fetchCredits = React.useCallback(async () => {
    try {
      const res = await fetch('/api/user/credits', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits ?? 0)
      }
    } catch {
      // silently fail — non-critical UI
    }
  }, [])

  React.useEffect(() => {
    fetchCredits()
    // Refresh when user returns to the tab
    window.addEventListener('focus', fetchCredits)
    return () => window.removeEventListener('focus', fetchCredits)
  }, [fetchCredits])

  if (credits === null) return null

  return (
    <Link
      href="/dashboard/templates"
      title="Your CertiDraft Credits"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-colors group"
    >
      {/* Coin icon */}
      <span className="text-base leading-none select-none" aria-hidden>🪙</span>
      <span className="text-xs font-extrabold text-amber-700 tabular-nums">
        {credits.toLocaleString()}
      </span>
      <span className="text-[10px] font-semibold text-amber-500 hidden sm:inline">
        credits
      </span>
    </Link>
  )
}
