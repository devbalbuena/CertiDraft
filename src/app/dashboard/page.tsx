import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/layout/StatCard'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardChartsClient, DailyCount } from './DashboardChartsClient'
import {
  Award,
  CalendarDays,
  CreditCard,
  FolderOpen,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  RefreshCw,
  Box,
} from 'lucide-react'

// ── Plan limits lookup ────────────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  pro: 300,
  enterprise: 1000,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

// Render functions removed in favor of clean StatCard typography.

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    case 'completed_with_errors': return <AlertCircle className="w-5 h-5 text-amber-500" />
    case 'failed': return <XCircle className="w-5 h-5 text-red-500" />
    case 'processing': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin-slow" />
    default: return <Clock className="w-5 h-5 text-slate-400" />
  }
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: 'Done', className: 'bg-emerald-50 text-emerald-700' },
    completed_with_errors: { label: 'Partial', className: 'bg-amber-50 text-amber-700' },
    processing: { label: 'Active', className: 'bg-blue-50 text-blue-700' },
    retrying: { label: 'Retry', className: 'bg-amber-50 text-amber-700' },
    failed: { label: 'Failed', className: 'bg-red-50 text-red-700' },
    pending: { label: 'Wait', className: 'bg-slate-100 text-slate-700' },
  }
  const config = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${config.className}`}>
      {config.label}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify session
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch user profile (plan + this-month count + full name)
  const { data: profile } = await supabase
    .from('users')
    .select('plan, certificates_this_month, full_name')
    .eq('id', user.id)
    .single()

  // Fetch total certificates (all time)
  const { count: totalCerts } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch total projects count
  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch 6 most recent batch jobs joined with project name
  const { data: recentBatches } = await supabase
    .from('batch_jobs')
    .select('id, status, processed_count, total_count, created_at, projects(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch certificates from the last 30 days for the chart
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentCerts } = await supabase
    .from('certificates')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo)

  // Aggregate chart data
  const days30 = lastNDays(30)
  const certDayCounts = (recentCerts ?? []).reduce<Record<string, number>>((acc, c) => {
    const d = c.created_at.split('T')[0]
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {})
  const chartData: DailyCount[] = days30.map((d) => ({ date: d, count: certDayCounts[d] ?? 0 }))

  // Calculate metrics
  const plan = profile?.plan ?? 'free'
  const usedThisMonth = profile?.certificates_this_month ?? 0
  const planLimit = PLAN_LIMITS[plan] ?? 5
  const progressPercentage = Math.min((usedThisMonth / planLimit) * 100, 100)
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const certsToday = chartData[chartData.length - 1].count

  return (
    <div className="pb-12">
      
      {/* ── Premium Welcome Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 sm:p-10 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Left Side: Content */}
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-3">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-6">
            Your certificate drafting workspace is ready. Generate new credentials, track your batch progress, and manage templates all from your command center.
          </p>
          <CreateProjectDialog
            trigger={
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 font-bold h-12 px-6 rounded-xl transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                Create New Project
              </Button>
            }
          />
        </div>
        
        {/* Right Side: Graphic/Accent */}
        <div className="relative z-10 shrink-0 hidden md:flex items-center justify-center w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-50 to-blue-50/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent opacity-50 blur-xl"></div>
          <Award className="w-24 h-24 text-indigo-600/80 transform rotate-12 drop-shadow-sm" strokeWidth={1.5} />
        </div>

        {/* Subtle Background Mesh/Gradient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-50/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-stagger-children">
        <StatCard
          label="Total Certificates"
          value={totalCerts ?? 0}
          icon={Award}
          variant="primary"
          trend={{ value: certsToday, label: 'new today', isPositive: true, showPlus: true }}
        />
        
        <StatCard
          label="This Month"
          value={`${usedThisMonth} / ${planLimit}`}
          icon={CalendarDays}
          variant="destructive"
          trend={{ value: `${progressPercentage.toFixed(0)}%`, label: 'Limit used', isPositive: progressPercentage < 100 }}
        />

        <StatCard
          label="Current Plan"
          value={plan.charAt(0).toUpperCase() + plan.slice(1)}
          icon={CreditCard}
          variant="success"
          trend={{ value: 'Active', label: 'Subscription', isPositive: true }}
        />

        <StatCard
          label="Total Projects"
          value={totalProjects ?? 0}
          icon={FolderOpen}
          variant="violet"
        />
      </div>

      {/* ── Main Content Split ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger-children">
        
        {/* Left: Charts */}
        <div className="lg:col-span-2">
          <DashboardChartsClient data={chartData} />
        </div>

        {/* Right: Modern Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Latest batch generation jobs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 gap-2">
              {!recentBatches || recentBatches.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <Box className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm font-medium text-center">No recent jobs.<br/>Create a project to start.</p>
                </div>
              ) : (
                recentBatches.map((batch) => {
                  const projectName = Array.isArray(batch.projects)
                    ? (batch.projects[0]?.name ?? 'Untitled')
                    : ((batch.projects as { name: string } | null)?.name ?? 'Untitled')
                  const createdAt = new Date(batch.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                  
                  return (
                    <div 
                      key={batch.id} 
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                        {getStatusIcon(batch.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 truncate">
                          {projectName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                            {createdAt.toUpperCase()}
                          </p>
                          <span className="text-slate-300">•</span>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            {batch.processed_count}/{batch.total_count} CERTS
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(batch.status)}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
            {recentBatches && recentBatches.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center rounded-b-2xl">
                 <Link href="/dashboard/projects" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                   View all projects →
                 </Link>
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  )
}
