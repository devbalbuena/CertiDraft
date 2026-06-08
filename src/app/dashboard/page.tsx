import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { EmptyState } from '@/components/layout/EmptyState'
import { Badge } from '@/components/ui/badge'
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
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    completed_with_errors: {
      label: 'Partial',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    retrying: {
      label: 'Retrying',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    pending: {
      label: 'Pending',
      className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
    },
  }
  const config = map[status] ?? map.pending
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
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

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back. Here's an overview of your activity."
      />

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
        />
        <StatCard
          label="Current Plan"
          value={plan.charAt(0).toUpperCase() + plan.slice(1)}
          icon={CreditCard}
        />
        <StatCard
          label="Projects"
          value={totalProjects ?? 0}
          icon={FolderOpen}
          variant="primary"
        />
      </div>

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>

        {!recentBatches || recentBatches.length === 0 ? (
          <EmptyState
            title="No certificate batches yet"
            description="Create a project and upload a CSV file to generate your first batch of certificates."
            icon={Inbox}
            action={
              <Button asChild>
                <Link href="/dashboard/projects">Create your first project</Link>
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBatches.map((batch) => {
                  const projectName =
                    (batch.projects as { name: string } | null)?.name ?? 'Untitled'
                  const createdAt = new Date(batch.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  return (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{projectName}</TableCell>
                      <TableCell>
                        <BatchStatusBadge status={batch.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {batch.processed_count} / {batch.total_count}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
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
