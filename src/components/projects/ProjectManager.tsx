'use client'

import * as React from 'react'
import { LayoutDashboard, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectStepper } from './ProjectStepper'
import { ProjectDashboard } from './ProjectDashboard'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'stepper' | 'expert'

interface ProjectManagerProps {
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
  featuredTemplates: { id: string; name: string; category: string | null; accent: string }[]
  latestBatchJob: {
    id: string
    status: string
    processed_count: number
    total_count: number
    created_at: string
  } | null
  /** True if the user has only 1 project total (brand new user) */
  isNewUser: boolean
}

const PREF_KEY = 'certidraft_project_view_mode'

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectManager({
  project,
  featuredTemplates,
  latestBatchJob,
  isNewUser,
}: ProjectManagerProps) {
  // Derive the default mode: new users see the stepper, experienced users see the dashboard
  const defaultMode: ViewMode = isNewUser ? 'stepper' : 'expert'

  const [viewMode, setViewMode] = React.useState<ViewMode>(defaultMode)
  const [hydrated, setHydrated] = React.useState(false)

  // On mount, check for a saved user preference and override the default
  React.useEffect(() => {
    const saved = localStorage.getItem(PREF_KEY) as ViewMode | null
    if (saved === 'stepper' || saved === 'expert') {
      setViewMode(saved)
    }
    setHydrated(true)
  }, [])

  const switchTo = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(PREF_KEY, mode)
  }

  // Avoid a flash of wrong content during SSR hydration
  if (!hydrated) return null

  return (
    <div className="space-y-6">
      {/* View toggle row */}
      <div className="flex items-center justify-end gap-2">
        {viewMode === 'stepper' && (
          <p className="text-xs text-slate-400 dark:text-slate-600 mr-2 hidden sm:block">
            New to CertiDraft? Follow the guided steps.
          </p>
        )}

        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 gap-0.5">
          <Button
            size="sm"
            variant={viewMode === 'stepper' ? 'default' : 'ghost'}
            onClick={() => switchTo('stepper')}
            className={`h-7 px-3 text-xs gap-1.5 rounded-md transition-all ${
              viewMode === 'stepper'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Guided
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'expert' ? 'default' : 'ghost'}
            onClick={() => switchTo('expert')}
            className={`h-7 px-3 text-xs gap-1.5 rounded-md transition-all ${
              viewMode === 'expert'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Render the active view */}
      {viewMode === 'stepper' ? (
        <ProjectStepper
          project={project}
          featuredTemplates={featuredTemplates}
          latestBatchJob={latestBatchJob}
          onSkip={() => switchTo('expert')}
        />
      ) : (
        <ProjectDashboard
          project={project}
          latestBatchJob={latestBatchJob}
        />
      )}
    </div>
  )
}
