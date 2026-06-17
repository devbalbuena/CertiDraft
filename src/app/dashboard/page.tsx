import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Award,
  CalendarDays,
  CreditCard,
  FolderOpen,
  Inbox,
  ArrowRight,
} from 'lucide-react'

// ── Plan limits lookup ────────────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  pro: 300,
  enterprise: 1000,
}

// ── Status badge mapping ──────────────────────────────────────────────────────
function BatchStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: {
      label: 'Completed',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    },
    completed_with_errors: {
      label: 'Partial',
      className: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    },
    retrying: {
      label: 'Retrying',
      className: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-50 text-red-700 border border-red-200/60',
    },
    pending: {
      label: 'Pending',
      className: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    },
  }
  const config = map[status] ?? map.pending
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${config.className}`}
    >
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

  // Fetch user profile (plan + this-month count)
  const { data: profile } = await supabase
    .from('users')
    .select('plan, certificates_this_month')
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

  // Fetch 5 most recent batch jobs joined with project name
  const { data: recentBatches } = await supabase
    .from('batch_jobs')
    .select('id, status, processed_count, total_count, created_at, projects(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const plan = profile?.plan ?? 'free'
  const usedThisMonth = profile?.certificates_this_month ?? 0
  const planLimit = PLAN_LIMITS[plan] ?? 5
  
  // Calculate progress percentage, capped at 100
  const progressPercentage = Math.min((usedThisMonth / planLimit) * 100, 100)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back. Here's an overview of your activity."
      />

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard
          label="Total Certificates"
          value={totalCerts ?? 0}
          icon={Award}
          variant="primary"
        />
        <StatCard
          label="This Month"
          value={`${usedThisMonth} / ${planLimit}`}
          icon={CalendarDays}
        >
          {/* Progress Bar for This Month */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
             <div 
               className={`h-full rounded-full ${progressPercentage >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} 
               style={{ width: `${progressPercentage}%` }}
             ></div>
          </div>
        </StatCard>
        <StatCard
          label="Current Plan"
          value={plan.charAt(0).toUpperCase() + plan.slice(1)}
          icon={CreditCard}
        >
          {/* Upgrade Link for Current Plan */}
          <Link 
            href="/dashboard/subscription" 
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
          >
            Upgrade plan 
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </StatCard>
        <StatCard
          label="Projects"
          value={totalProjects ?? 0}
          icon={FolderOpen}
          variant="primary"
        />
      </div>

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4">Recent Activity</h2>

        {!recentBatches || recentBatches.length === 0 ? (
          <EmptyState
            title="No certificate batches yet"
            description="Create a project and upload a CSV file to generate your first batch of certificates."
            icon={Inbox}
            action={
              <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-full">
                <Link href="/dashboard/projects">Create your first project</Link>
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Project</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Progress</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Created</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBatches.map((batch) => {
                  const projectName = Array.isArray(batch.projects)
                    ? (batch.projects[0]?.name ?? 'Untitled')
                    : ((batch.projects as { name: string } | null)?.name ?? 'Untitled')
                  const createdAt = new Date(batch.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  return (
                    <TableRow key={batch.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900 py-4">{projectName}</TableCell>
                      <TableCell className="py-4">
                        <BatchStatusBadge status={batch.status} />
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium text-sm py-4">
                        {batch.processed_count} / {batch.total_count}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm py-4">{createdAt}</TableCell>
                      <TableCell className="text-right py-4">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900" asChild>
                          <Link href={`/dashboard/projects`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
