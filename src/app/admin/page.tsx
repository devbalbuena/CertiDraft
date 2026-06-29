import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlanChartClient } from './PlanChartClient'
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
    <span className="relative flex h-3 w-3 mr-1">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
    </span>
  ) : (
    <span className="relative flex h-3 w-3 mr-1">
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
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
  
  const recentSignupsUsers = (allUsers ?? [])
    .filter((u) => u.created_at >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    
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
  const chartData = planOrder.map((name) => ({
    name,
    value: planBreakdown[name] ?? 0,
  }))

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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Users by Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <PlanChartClient data={chartData} />
          </CardContent>
        </Card>

        {/* ── System Status ──────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
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
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <StatusDot healthy={healthy} />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      healthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {healthy ? 'Live' : 'Down'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Recent Signups ─────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-500" />
                Recent Signups
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                7 DAYS
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {recentSignupsUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[180px] text-slate-400 dark:text-slate-500">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">No recent signups</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSignupsUsers.map((u, i) => {
                  const uName = (u as any).full_name || 'Anonymous User'
                  const uEmail = (u as any).email || ''
                  const initial = uName.charAt(0).toUpperCase()
                  
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{uName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{uEmail}</p>
                      </div>
                    </div>
                  )
                })}
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Total this week</span>
                    <span className="font-bold text-slate-900 dark:text-slate-50">{recentSignups} users</span>
                  </div>
                </div>
              </div>
            )}
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
