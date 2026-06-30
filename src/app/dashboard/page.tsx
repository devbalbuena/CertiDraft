import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/layout/StatCard'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { AiQuickGenerate } from '@/components/dashboard/AiQuickGenerate'
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
  LayoutTemplate,
  Upload,
  BookOpen,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Zap,
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
      
      {/* ── AI Quick Generate / Onboarding ─────────────────────────────────── */}
      <AiQuickGenerate isOnboarding={totalProjects === 0} />

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
        >
          {/* Visual quota progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercentage >= 90 ? 'bg-red-500' :
                progressPercentage >= 70 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </StatCard>

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

      {/* ── Quick Actions Bar ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Plus,
            label: 'New Project',
            desc: 'Start from scratch or use AI',
            href: '/dashboard/projects',
            color: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
          },
          {
            icon: LayoutTemplate,
            label: 'Browse Templates',
            desc: 'Pick from professionally designed templates',
            href: '/dashboard/templates',
            color: 'text-violet-600 bg-violet-50 group-hover:bg-violet-600 group-hover:text-white',
          },
          {
            icon: Upload,
            label: 'Batch Upload CSV',
            desc: 'Generate bulk certificates from spreadsheet',
            href: '/dashboard/projects',
            color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
          },
        ].map(({ icon: Icon, label, desc, href, color }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{label}</p>
              <p className="text-xs text-slate-500 font-medium leading-snug mt-0.5 truncate">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {/* ── Main Content Split ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger-children">
        
        {/* Left: Charts */}
        <div className="lg:col-span-2">
          <DashboardChartsClient data={chartData} />
        </div>

        {/* Right: Activity Feed + Help Widget */}
        <div className="lg:col-span-1 flex flex-col gap-6">
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
                <div className="h-full w-full flex flex-col items-center justify-center text-center py-10 gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">No jobs yet</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Start a project and generate your first batch</p>
                  </div>
                  <Link
                    href="/dashboard/projects"
                    className="mt-1 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Project
                  </Link>
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

          {/* Help & Tutorials Widget */}
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Help &amp; Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-2">
              {[
                { icon: BookOpen, label: '1-Min Quickstart Guide', desc: 'Get started fast', href: '#', color: 'text-indigo-500 bg-indigo-50' },
                { icon: ExternalLink, label: 'API Documentation', desc: 'Integrate with your app', href: '#', color: 'text-violet-500 bg-violet-50' },
                { icon: MessageSquare, label: 'Contact Support', desc: 'We\'re here to help', href: '#', color: 'text-emerald-500 bg-emerald-50' },
              ].map(({ icon: Icon, label, desc, href, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{label}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 ml-auto shrink-0 transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
