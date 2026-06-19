import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AdminAnalyticsClient } from './AdminAnalyticsClient'

// ── Helper: generate last N days as YYYY-MM-DD strings ────────────────────────
function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

// ── Helper: fill missing dates with 0 ────────────────────────────────────────
function fillDates(
  raw: { date: string; count: number }[],
  days: string[]
): { date: string; count: number }[] {
  const map = new Map(raw.map((r) => [r.date, r.count]))
  return days.map((d) => ({ date: d, count: map.get(d) ?? 0 }))
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminAnalyticsPage() {
  // ── Auth & role guard ──────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const db = supabaseAdmin
  const days30 = lastNDays(30)
  const thirtyDaysAgo = `${days30[0]}T00:00:00.000Z`

  // ── Fetch raw data in parallel ─────────────────────────────────────────────
  const [
    { data: rawCerts },
    { data: rawSignups },
    { data: allCerts },
    { data: batchJobs },
  ] = await Promise.all([
    // Certificates per day (use created_at date part)
    db
      .from('certificates')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo),

    // User signups per day
    db
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo),

    // All certs with template name for usage breakdown
    db
      .from('certificates')
      .select('template_id, templates(name)'),

    // Batch jobs for status breakdown + processing time
    db
      .from('batch_jobs')
      .select('status, started_at, completed_at'),
  ])

  // ── Aggregate: certs by day ───────────────────────────────────────────────
  const certDayCounts = (rawCerts ?? []).reduce<Record<string, number>>((acc, c) => {
    const d = c.created_at.split('T')[0]
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {})
  const certsByDay = fillDates(
    Object.entries(certDayCounts).map(([date, count]) => ({ date, count })),
    days30
  )

  // ── Aggregate: signups by day ─────────────────────────────────────────────
  const signupDayCounts = (rawSignups ?? []).reduce<Record<string, number>>((acc, u) => {
    const d = u.created_at.split('T')[0]
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {})
  const signupsByDay = fillDates(
    Object.entries(signupDayCounts).map(([date, count]) => ({ date, count })),
    days30
  )

  // ── Aggregate: template usage ─────────────────────────────────────────────
  const templateMap = new Map<string, number>()
  for (const cert of allCerts ?? []) {
    const tmpl = cert.templates as { name?: string } | null
    const name = tmpl?.name ?? 'Unknown Template'
    templateMap.set(name, (templateMap.get(name) ?? 0) + 1)
  }
  const templateUsage = Array.from(templateMap.entries())
    .map(([template_name, count]) => ({ template_name, count }))
    .sort((a, b) => b.count - a.count)

  // ── Aggregate: batch status breakdown ────────────────────────────────────
  const statusMap = new Map<string, number>()
  for (const job of batchJobs ?? []) {
    const s = job.status ?? 'unknown'
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  }
  const batchStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }))

  // ── Aggregate: avg processing time ───────────────────────────────────────
  const completedWithTimes = (batchJobs ?? []).filter(
    (j) => j.started_at && j.completed_at && j.status === 'completed'
  )
  const avgProcessingMinutes =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, j) => {
          const diff =
            new Date(j.completed_at!).getTime() -
            new Date(j.started_at!).getTime()
          return sum + diff / 60000
        }, 0) / completedWithTimes.length
      : null

  return (
    <AdminAnalyticsClient
      certsByDay={certsByDay}
      signupsByDay={signupsByDay}
      templateUsage={templateUsage}
      batchStatus={batchStatus}
      avgProcessingMinutes={avgProcessingMinutes}
    />
  )
}
