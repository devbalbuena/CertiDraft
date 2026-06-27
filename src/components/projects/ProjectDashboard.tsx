'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Palette,
  PenLine,
  Users,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Eye,
  FileDown,
  ChevronRight,
  Layers,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectDashboardProps {
  project: {
    id: string
    name: string
    description: string | null
    status: string
    event_type: string | null
    template_id: string | null
    elements: any
    certificate_count: number
    created_at: string
    templates: { name: string; accent_color?: string | null } | null
  }
  latestBatchJob: {
    id: string
    status: string
    processed_count: number
    total_count: number
    created_at: string
  } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBatchStatusMeta(status: string) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> }
    case 'completed_with_errors':
      return { label: 'Completed with errors', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', icon: <AlertCircle className="h-4 w-4 text-amber-500" /> }
    case 'failed':
      return { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', icon: <AlertCircle className="h-4 w-4 text-red-500" /> }
    case 'processing':
    case 'pending':
    case 'retrying':
      return { label: 'In progress', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800', icon: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" /> }
    default:
      return { label: status, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800', icon: <Clock className="h-4 w-4 text-slate-400" /> }
  }
}

// ─── Quick Actions Bar ────────────────────────────────────────────────────────

function QuickActions({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline" className="gap-1.5 h-9 font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
        <Link href={`/dashboard/projects/${projectId}/design`}>
          <Palette className="h-3.5 w-3.5 text-violet-500" />
          Edit Design
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="gap-1.5 h-9 font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
        <Link href={`/dashboard/projects/${projectId}/upload`}>
          <Users className="h-3.5 w-3.5 text-blue-500" />
          Manage Recipients
        </Link>
      </Button>
    </div>
  )
}

// ─── Design Card ──────────────────────────────────────────────────────────────

function DesignCard({ project }: { project: ProjectDashboardProps['project'] }) {
  const hasDesign = !!project.elements
  const hasTemplate = !!project.template_id

  const accentMap: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-violet-500 to-purple-700',
    green: 'from-emerald-500 to-teal-600',
    gold: 'from-amber-400 to-orange-500',
    default: 'from-slate-500 to-slate-700',
  }
  const accentKey = project.templates?.accent_color?.toLowerCase() ?? 'default'
  const gradient = accentMap[accentKey] ?? accentMap.default

  return (
    <Card className="h-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-violet-500" />
            Certificate Design
          </CardTitle>
          {hasDesign ? (
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 text-[11px]">
              Saved
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px]">Not started</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Template preview area */}
        <div className={`relative h-28 rounded-lg overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Layers className="h-10 w-10 text-white/30" />
          {hasTemplate && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <div className="w-20 h-1 rounded bg-white/40" />
              <div className="w-14 h-1 rounded bg-white/30" />
              <div className="w-16 h-1 rounded bg-white/20 mt-1" />
            </div>
          )}
          {!hasTemplate && (
            <p className="absolute bottom-2 left-0 right-0 text-center text-white/60 text-[10px] font-medium">
              No template selected
            </p>
          )}
        </div>

        {hasTemplate && (
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-600">Template</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
              {project.templates?.name ?? 'Custom'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white gap-1.5 text-xs">
            <Link href={`/dashboard/projects/${project.id}/design`}>
              <PenLine className="h-3.5 w-3.5" />
              {hasDesign ? 'Edit Design' : 'Open Designer'}
            </Link>
          </Button>
          {hasDesign && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs border-slate-200 dark:border-slate-700">
              <Link href={`/dashboard/projects/${project.id}/design`}>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Recipients Card ──────────────────────────────────────────────────────────

function RecipientsCard({ project }: { project: ProjectDashboardProps['project'] }) {
  const count = project.certificate_count ?? 0

  const downloadSample = () => {
    const csv = 'recipient_name,achievement,email\n"Maria Santos","Certificate of Completion",maria@example.com\n"Juan Dela Cruz","Best Employee Award",juan@example.com'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-recipients.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Recipients
          </CardTitle>
          {count > 0 ? (
            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 text-[11px]">
              {count} loaded
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px]">Empty</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {count > 0 ? (
          <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-4 text-center">
            <p className="text-4xl font-extrabold text-blue-700 dark:text-blue-400">{count}</p>
            <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
              recipient{count !== 1 ? 's' : ''} ready
            </p>
          </div>
        ) : (
          <Link href={`/dashboard/projects/${project.id}/upload`}>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors group">
              <Upload className="h-6 w-6 text-slate-300 dark:text-slate-700 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Upload CSV file
              </p>
            </div>
          </Link>
        )}

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs">
            <Link href={`/dashboard/projects/${project.id}/upload`}>
              <Upload className="h-3.5 w-3.5" />
              {count > 0 ? 'Update Recipients' : 'Upload CSV'}
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-slate-200 dark:border-slate-700" onClick={downloadSample}>
            <FileDown className="h-3.5 w-3.5" />
            Sample
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Generation Card ──────────────────────────────────────────────────────────

function GenerationCard({
  project,
  latestBatchJob,
}: {
  project: ProjectDashboardProps['project']
  latestBatchJob: ProjectDashboardProps['latestBatchJob']
}) {
  const router = useRouter()
  const [generating, setGenerating] = React.useState(false)

  const canGenerate =
    !!project.template_id &&
    (project.certificate_count ?? 0) > 0

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/batch`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || 'Generation failed')
      }
      const { batchJobId } = await res.json()
      toast.success('Generation started!')
      router.push(`/dashboard/projects/${project.id}/batch?batchJobId=${batchJobId}`)
    } catch (e: any) {
      toast.error(e.message)
      setGenerating(false)
    }
  }

  const progressPercent =
    latestBatchJob && latestBatchJob.total_count > 0
      ? Math.round((latestBatchJob.processed_count / latestBatchJob.total_count) * 100)
      : 0

  const batchMeta = latestBatchJob ? getBatchStatusMeta(latestBatchJob.status) : null
  const isCompleted = latestBatchJob?.status === 'completed' || latestBatchJob?.status === 'completed_with_errors'
  const isRunning = latestBatchJob && !['completed', 'completed_with_errors', 'failed'].includes(latestBatchJob.status)

  return (
    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Generate & Send
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 text-[11px]">
              Done
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Readiness checklist */}
        <div className="space-y-1.5">
          {[
            { label: 'Template selected', done: !!project.template_id },
            { label: 'Design saved', done: !!project.elements },
            { label: 'Recipients uploaded', done: (project.certificate_count ?? 0) > 0 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              {item.done ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
              )}
              <span className={item.done ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Latest generation run */}
        {latestBatchJob && batchMeta && (
          <div className={`rounded-lg border p-3 space-y-2 ${batchMeta.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {batchMeta.icon}
                <span className={`text-xs font-semibold ${batchMeta.color}`}>
                  Last run: {batchMeta.label}
                </span>
              </div>
              <Link
                href={`/dashboard/projects/${project.id}/batch?batchJobId=${latestBatchJob.id}`}
                className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-0.5"
              >
                Details <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {!isCompleted && (
              <>
                <Progress value={progressPercent} className="h-1.5" />
                <p className="text-[11px] text-slate-500">
                  {latestBatchJob.processed_count} / {latestBatchJob.total_count} certificates
                </p>
              </>
            )}
            {isCompleted && (
              <p className="text-[11px] text-slate-500">
                {latestBatchJob.processed_count} certificates generated successfully
              </p>
            )}
          </div>
        )}

        {/* Primary action */}
        <div className="flex gap-2">
          {isCompleted ? (
            <Button asChild size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
              <Link href="/dashboard/certificates">
                <Eye className="h-3.5 w-3.5" />
                View Certificates
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={!canGenerate || generating || !!isRunning}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white gap-1.5 text-xs shadow-md shadow-emerald-100 dark:shadow-emerald-900/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? 'Starting…' : isRunning ? 'Running…' : 'Generate Certificates'}
            </Button>
          )}
          {latestBatchJob && !isCompleted && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs border-slate-200 dark:border-slate-700">
              <Link href={`/dashboard/projects/${project.id}/batch?batchJobId=${latestBatchJob.id}`}>
                <RefreshCw className="h-3.5 w-3.5" />
                Status
              </Link>
            </Button>
          )}
        </div>

        {!canGenerate && (
          <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center">
            Select a template and upload recipients to unlock generation.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Project Info Card ────────────────────────────────────────────────────────

function ProjectInfoCard({ project }: { project: ProjectDashboardProps['project'] }) {
  const createdAt = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
      <CardContent className="p-4">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">Event type</dt>
            <dd className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{project.event_type || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">Created</dt>
            <dd className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{createdAt}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">Status</dt>
            <dd className="mt-0.5">
              <Badge
                variant="outline"
                className={`text-[11px] capitalize ${project.status === 'active' ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 text-slate-600 dark:text-slate-400'}`}
              >
                {project.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">Certificates</dt>
            <dd className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{project.certificate_count ?? 0}</dd>
          </div>
        </dl>
        {project.description && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800 leading-relaxed">
            {project.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ProjectDashboard({ project, latestBatchJob }: ProjectDashboardProps) {
  return (
    <div className="space-y-5">
      {/* Project info bar */}
      <ProjectInfoCard project={project} />

      {/* Quick Actions */}
      <QuickActions projectId={project.id} />

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        <DesignCard project={project} />
        <RecipientsCard project={project} />
        <GenerationCard project={project} latestBatchJob={latestBatchJob} />
      </div>
    </div>
  )
}
