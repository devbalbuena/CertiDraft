'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  Circle,
  Lock,
  Palette,
  PenLine,
  Users,
  Rocket,
  ChevronRight,
  FileDown,
  Upload,
  Sparkles,
  Eye,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

type StepStatus = 'completed' | 'active' | 'locked'

interface StepDef {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}

interface TemplateOption {
  id: string
  name: string
  accent: string
  category: string | null
}

interface ProjectStepperProps {
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
  featuredTemplates: TemplateOption[]
  latestBatchJob: {
    id: string
    status: string
    processed_count: number
    total_count: number
    created_at: string
  } | null
  /** Called when the user clicks "Skip tutorial" — switches to expert view */
  onSkip?: () => void
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS: StepDef[] = [
  {
    number: 1,
    title: 'Choose Template',
    description: 'Pick a design style for your certificate.',
    icon: <Palette className="h-4 w-4" />,
  },
  {
    number: 2,
    title: 'Design Certificate',
    description: 'Customize your certificate layout and content.',
    icon: <PenLine className="h-4 w-4" />,
  },
  {
    number: 3,
    title: 'Add Recipients',
    description: 'Upload your recipient list via CSV.',
    icon: <Users className="h-4 w-4" />,
  },
  {
    number: 4,
    title: 'Generate & Send',
    description: 'Create PDFs and deliver certificates.',
    icon: <Rocket className="h-4 w-4" />,
  },
]

// ─── Helper: derive stepper state from project ────────────────────────────────

function getStepStatuses(
  project: ProjectStepperProps['project'],
  latestBatchJob: ProjectStepperProps['latestBatchJob']
): StepStatus[] {
  const step1Done = project.template_id !== null
  const step2Done = project.elements !== null && project.elements !== undefined
  const step3Done = project.certificate_count > 0 || latestBatchJob !== null
  const step4Done =
    latestBatchJob !== null &&
    (latestBatchJob.status === 'completed' || latestBatchJob.status === 'completed_with_errors')

  const statuses: StepStatus[] = [
    step1Done ? 'completed' : 'active',
    step1Done ? (step2Done ? 'completed' : 'active') : 'locked',
    step1Done && step2Done ? (step3Done ? 'completed' : 'active') : 'locked',
    step1Done && step2Done && step3Done ? (step4Done ? 'completed' : 'active') : 'locked',
  ]
  return statuses
}

function getActiveStep(statuses: StepStatus[]): number {
  // Return the first non-completed step index (0-based)
  const firstActive = statuses.findIndex((s) => s === 'active')
  if (firstActive !== -1) return firstActive
  // All done
  return 3
}

function getCompletedCount(statuses: StepStatus[]): number {
  return statuses.filter((s) => s === 'completed').length
}

// ─── Step Indicator row ───────────────────────────────────────────────────────

function StepIndicator({
  steps,
  statuses,
  activeIndex,
  onStepClick,
}: {
  steps: StepDef[]
  statuses: StepStatus[]
  activeIndex: number
  onStepClick: (index: number) => void
}) {
  return (
    <div className="flex items-start w-full gap-0">
      {steps.map((step, i) => {
        const status = statuses[i]
        const isLast = i === steps.length - 1
        const isActive = i === activeIndex

        return (
          <React.Fragment key={step.number}>
            {/* Step node */}
            <button
              onClick={() => status !== 'locked' && onStepClick(i)}
              disabled={status === 'locked'}
              className="flex flex-col items-center gap-1.5 min-w-0 flex-1 group disabled:cursor-not-allowed"
            >
              {/* Circle */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 shrink-0
                  ${status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                  ${status === 'active' ? 'bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-100 scale-110' : ''}
                  ${status === 'locked' ? 'bg-slate-50 border-slate-200 text-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-600' : ''}
                `}
              >
                {status === 'completed' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : status === 'locked' ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-bold">{step.number}</span>
                )}
              </div>

              {/* Labels */}
              <div className="text-center px-1 w-full">
                <p
                  className={`text-xs font-semibold leading-tight truncate
                    ${status === 'completed' ? 'text-emerald-700 dark:text-emerald-400' : ''}
                    ${status === 'active' ? 'text-blue-700 dark:text-blue-400' : ''}
                    ${status === 'locked' ? 'text-slate-400 dark:text-slate-600' : ''}
                  `}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-tight hidden sm:block mt-0.5">
                  {step.description}
                </p>
              </div>
            </button>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-shrink-0 flex items-start pt-5 w-8 min-w-[2rem]">
                <div
                  className={`h-0.5 w-full rounded transition-colors duration-300
                    ${statuses[i] === 'completed' ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'}
                  `}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function Step1Panel({
  project,
  templates,
  projectId,
}: {
  project: ProjectStepperProps['project']
  templates: TemplateOption[]
  projectId: string
}) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)

  const handleSelectTemplate = async (templateId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Template saved! Moving to design step.')
      router.refresh()
    } catch {
      toast.error('Could not save template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const accentColors: Record<string, string> = {
    blue: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    purple: 'bg-gradient-to-br from-violet-500 to-purple-700',
    green: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    gold: 'bg-gradient-to-br from-amber-400 to-orange-500',
    default: 'bg-gradient-to-br from-slate-500 to-slate-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Choose a Certificate Style
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Select a design that best fits your event or occasion. You can customize everything in the
          next step.
        </p>
      </div>

      {/* Featured templates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.length > 0 ? (
          templates.map((tpl) => {
            const gradientClass =
              accentColors[tpl.accent?.toLowerCase() ?? ''] ?? accentColors.default
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl.id)}
                disabled={saving}
                className="group relative flex flex-col rounded-xl border-2 border-transparent hover:border-blue-400 transition-all duration-200 overflow-hidden text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Visual preview */}
                <div className={`${gradientClass} h-24 flex items-center justify-center`}>
                  <FileText className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {tpl.name}
                  </p>
                  {tpl.category && (
                    <p className="text-xs text-slate-500 mt-0.5">{tpl.category}</p>
                  )}
                </div>
                {project.template_id === tpl.id && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Selected
                  </div>
                )}
              </button>
            )
          })
        ) : (
          <div className="col-span-3 py-10 text-center text-slate-400">
            No featured templates found.
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/dashboard/projects/${projectId}/design`}>
            <Eye className="h-4 w-4" />
            Browse all templates
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Step2Panel({ project, projectId }: { project: ProjectStepperProps['project']; projectId: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Design Your Certificate
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Open the certificate builder to add text, images, and personalize the layout to your
          liking.
        </p>
      </div>

      {project.elements ? (
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100">
                  Design saved
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your certificate design is ready. You can edit it at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <PenLine className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">No design yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Open the builder to create your first certificate layout.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button asChild className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 gap-2">
          <Link href={`/dashboard/projects/${projectId}/design`}>
            <PenLine className="h-4 w-4" />
            {project.elements ? 'Edit Design' : 'Open Certificate Designer'}
          </Link>
        </Button>
        {project.elements && (
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/dashboard/projects/${projectId}/design`}>
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function Step3Panel({
  project,
  projectId,
}: {
  project: ProjectStepperProps['project']
  projectId: string
}) {
  const SAMPLE_CSV = 'recipient_name,achievement,email\n"Maria Santos","Best Employee Award",maria@example.com\n"Juan Dela Cruz","Certificate of Completion",juan@example.com'

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-recipients.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Recipients</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload a CSV file with your recipients' names and details. We'll generate one certificate
          per row.
        </p>
      </div>

      {project.certificate_count > 0 ? (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-300">
                {project.certificate_count} recipient{project.certificate_count !== 1 ? 's' : ''} loaded
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your recipient list is ready. You can re-upload to replace it if needed.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Drag-and-drop area — links to the full upload wizard */
        <Link href={`/dashboard/projects/${projectId}/upload`}>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors duration-200 group">
            <Upload className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
            <p className="font-semibold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Click to upload your CSV file
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">
              or drag and drop — max 5 MB
            </p>
          </div>
        </Link>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/dashboard/projects/${projectId}/upload`}>
            <Upload className="h-4 w-4" />
            {project.certificate_count > 0 ? 'Re-upload Recipients' : 'Start Upload Wizard'}
          </Link>
        </Button>
        <Button variant="outline" className="gap-2" onClick={downloadSample}>
          <FileDown className="h-4 w-4" />
          Download Sample CSV
        </Button>
      </div>

      <div className="text-xs text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
        <p className="font-semibold mb-1">Required columns:</p>
        <code className="font-mono">recipient_name, achievement, email</code>
      </div>
    </div>
  )
}

function Step4Panel({
  project,
  projectId,
  latestBatchJob,
}: {
  project: ProjectStepperProps['project']
  projectId: string
  latestBatchJob: ProjectStepperProps['latestBatchJob']
}) {
  const router = useRouter()
  const [generating, setGenerating] = React.useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/batch`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || 'Generation failed')
      }
      const { batchJobId } = await res.json()
      toast.success('Generation started!')
      router.push(`/dashboard/projects/${projectId}/batch?batchJobId=${batchJobId}`)
    } catch (e: any) {
      toast.error(e.message)
      setGenerating(false)
    }
  }

  const isCompleted =
    latestBatchJob?.status === 'completed' ||
    latestBatchJob?.status === 'completed_with_errors'
  const isRunning =
    latestBatchJob &&
    !['completed', 'completed_with_errors', 'failed'].includes(latestBatchJob.status)

  const progressPercent =
    latestBatchJob && latestBatchJob.total_count > 0
      ? Math.round((latestBatchJob.processed_count / latestBatchJob.total_count) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Generate &amp; Send Certificates
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Everything is ready. Hit the button below to create all certificates in one go.
        </p>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Recipients</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              {project.certificate_count}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Template</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {project.templates?.name ?? 'Not set'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Design</p>
            <div className="flex items-center gap-1.5 mt-1">
              {project.elements ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100">
                  Ready
                </Badge>
              ) : (
                <Badge variant="secondary">Not saved</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation run status */}
      {latestBatchJob && (
        <Card className={`border-2 ${isCompleted ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20'}`}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {isCompleted ? '✅ Generation complete' : '⏳ Generation run in progress'}
              </p>
              <Badge variant={isCompleted ? 'outline' : 'default'} className={isCompleted ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400' : ''}>
                {latestBatchJob.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-slate-500">
              {latestBatchJob.processed_count} / {latestBatchJob.total_count} certificates created
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        {isCompleted ? (
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Link href={`/dashboard/certificates`}>
              <Eye className="h-4 w-4" />
              View Certificates
            </Link>
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={generating || !!isRunning}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 px-8 text-base font-semibold shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
          >
            <Sparkles className="h-5 w-5" />
            {generating ? 'Starting…' : 'Generate Certificates'}
          </Button>
        )}
        {latestBatchJob && !isCompleted && (
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/dashboard/projects/${projectId}/batch?batchJobId=${latestBatchJob.id}`}>
              <ChevronRight className="h-4 w-4" />
              View Progress
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProjectStepper({
  project,
  featuredTemplates,
  latestBatchJob,
  onSkip,
}: ProjectStepperProps) {
  const statuses = getStepStatuses(project, latestBatchJob)
  const defaultActive = getActiveStep(statuses)
  const [activeIndex, setActiveIndex] = React.useState(defaultActive)
  const completedCount = getCompletedCount(statuses)
  const progressPercent = Math.round((completedCount / 4) * 100)

  const subtitle =
    completedCount === 0
      ? "Let's get started — follow the steps below."
      : completedCount <= 2
      ? 'Good progress — keep going!'
      : completedCount === 3
      ? 'Almost there — ready to generate!'
      : 'Project complete — certificates issued successfully.'

  return (
    <div className="space-y-8">
      {/* Progress summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 dark:text-slate-600 font-medium">
              {completedCount} / 4 steps done
            </span>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 underline underline-offset-2 transition-colors"
              >
                Skip tutorial
              </button>
            )}
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Stepper header */}
      <StepIndicator
        steps={STEPS}
        statuses={statuses}
        activeIndex={activeIndex}
        onStepClick={setActiveIndex}
      />

      {/* Step panel */}
      <div className="pt-4">
        {activeIndex === 0 && (
          <Step1Panel project={project} templates={featuredTemplates} projectId={project.id} />
        )}
        {activeIndex === 1 && (
          <Step2Panel project={project} projectId={project.id} />
        )}
        {activeIndex === 2 && (
          <Step3Panel project={project} projectId={project.id} />
        )}
        {activeIndex === 3 && (
          <Step4Panel project={project} projectId={project.id} latestBatchJob={latestBatchJob} />
        )}
      </div>
    </div>
  )
}
