import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Award,
  FolderOpen,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 199,
  pro: 599,
  enterprise: 1499,
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-100 text-slate-700',
  starter: 'bg-blue-50 text-blue-700',
  pro: 'bg-violet-50 text-violet-700',
  enterprise: 'bg-amber-50 text-amber-700',
}

function StatusDot({ healthy }: { healthy: boolean }) {
  return healthy ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
  ) : (
    <XCircle className="w-5 h-5 text-red-500" />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminOverviewPage() {
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

  // ── Admin data fetching (bypasses RLS) ────────────────────────────────────
  const db = supabaseAdmin

  const [
    { count: userCount },
    { count: certCount },
    { count: projectCount },
    { data: allUsers },
    { data: recentBatchJobs },
  ] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }),
    db.from('certificates').select('*', { count: 'exact', head: true }),
    db.from('projects').select('*', { count: 'exact', head: true }),
    db.from('users').select('plan, created_at'),
    db
      .from('batch_jobs')
      .select('id, status, created_at, projects(name), users(email)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // ── Derived metrics ───────────────────────────────────────────────────────
  const planBreakdown = (allUsers ?? []).reduce<Record<string, number>>(
    (acc, u) => {
      const plan = u.plan ?? 'free'
      acc[plan] = (acc[plan] ?? 0) + 1
      return acc
    },
    {}
  )

  const estimatedMRR = (allUsers ?? []).reduce((sum, u) => {
    return sum + (PLAN_PRICES[u.plan ?? 'free'] ?? 0)
  }, 0)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const recentSignups = (allUsers ?? []).filter(
    (u) => u.created_at >= sevenDaysAgo
  ).length

  // ── Supabase health check ─────────────────────────────────────────────────
  let supabaseHealthy = false
  try {
    const { error } = await db.from('users').select('id').limit(1)
    supabaseHealthy = !error
  } catch {
    supabaseHealthy = false
  }

  const planOrder = ['free', 'starter', 'pro', 'enterprise']
  const maxPlanCount = Math.max(...planOrder.map((p) => planBreakdown[p] ?? 0), 1)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Overview"
        subtitle="Platform-wide metrics and system health."
      />

      {/* ── Stat Cards Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-stagger-children">
        <StatCard
          label="Total Users"
          value={userCount?.toLocaleString() ?? '—'}
          icon={Users}
          variant="primary"
          trend={{ value: recentSignups, label: 'new in last 7 days', isPositive: true }}
        />
        <StatCard
          label="Total Certificates"
          value={certCount?.toLocaleString() ?? '—'}
          icon={Award}
          variant="success"
        />
        <StatCard
          label="Active Projects"
          value={projectCount?.toLocaleString() ?? '—'}
          icon={FolderOpen}
        />
        <StatCard
          label="Est. Monthly Revenue"
          value={`₱${estimatedMRR.toLocaleString()}`}
          icon={DollarSign}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Plan Breakdown ─────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <TrendingUp className="w-4 h-4" />
              Users by Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {planOrder.map((plan) => {
              const count = planBreakdown[plan] ?? 0
              const pct = Math.round((count / maxPlanCount) * 100)
              return (
                <div key={plan} className="space-y-1">
                  <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span className="capitalize">{plan}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* ── System Status ──────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlertCircle className="w-4 h-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Supabase', healthy: supabaseHealthy },
              {
                label: 'Resend (Email)',
                healthy: !!process.env.RESEND_API_KEY,
              },
              {
                label: 'Gemini API',
                healthy: !!process.env.GEMINI_API_KEY,
              },
            ].map(({ label, healthy }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <StatusDot healthy={healthy} />
                  <span
                    className={`text-xs font-semibold ${
                      healthy ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {healthy ? 'Healthy' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Recent Signups ─────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="w-4 h-4" />
              Recent Signups (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-slate-900 tracking-tight">
              {recentSignups}
            </div>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              new users registered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Batch Jobs ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">
            Recent Batch Jobs (All Users)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(recentBatchJobs ?? []).length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-12">
              No batch jobs yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentBatchJobs ?? []).map((job) => {
                  const project = job.projects as { name?: string } | null
                  const userEmail = (job.users as { email?: string } | null)?.email
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {project?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {userEmail ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            job.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : job.status === 'failed'
                              ? 'bg-red-50 text-red-700'
                              : job.status === 'processing'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(job.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
