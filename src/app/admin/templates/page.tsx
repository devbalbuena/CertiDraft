import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AdminTemplatesClient } from './AdminTemplatesClient'

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; creator?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { category, creator } = await searchParams

  // ── Fetch all templates (for stats) + filtered templates ──────────────────
  const adminSupabase = supabaseAdmin

  let query = adminSupabase
    .from('templates')
    .select('*, users(email)')
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (creator === 'system') {
    query = query.is('creator_id', null)
  } else if (creator === 'custom') {
    query = query.not('creator_id', 'is', null)
  }

  const { data: templates } = await query

  // ── Summary stats (always unfiltered) ────────────────────────────────────
  const { data: allTemplates } = await adminSupabase
    .from('templates')
    .select('category, creator_id')

  const total = allTemplates?.length ?? 0
  const systemCount = allTemplates?.filter((t) => t.creator_id === null).length ?? 0
  const customCount = total - systemCount

  // Most popular category
  const catCounts = (allTemplates ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1
    return acc
  }, {})
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  // All unique categories for filter dropdown
  const allCategories = [...new Set((allTemplates ?? []).map((t) => t.category))].sort()

  return (
    <AdminTemplatesClient
      templates={templates ?? []}
      stats={{ total, systemCount, customCount, topCategory }}
      allCategories={allCategories}
      activeCategory={category ?? 'all'}
      activeCreator={creator ?? 'all'}
    />
  )
}
