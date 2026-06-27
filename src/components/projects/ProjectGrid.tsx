'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, Calendar, Users, FolderOpen, MoreVertical, PenLine, FileSignature } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DeleteProjectButton } from './DeleteProjectButton'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectRow = {
  id: string
  name: string
  description: string | null
  status: string
  event_type: string | null
  template_id: string | null
  elements: any
  certificate_count: number
  created_at: string
  updated_at: string
  templates: {
    name: string
    accent_color: string | null
    secondary_color: string | null
  } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProjectProgress(project: ProjectRow) {
  let completedSteps = 0
  if (project.template_id) completedSteps++
  if (project.elements) completedSteps++
  if (project.certificate_count > 0) completedSteps++
  // Step 4 is generation, which is hard to check without batch_jobs, but status 'completed' helps
  if (project.status === 'completed') completedSteps = 4
  else if (completedSteps === 3) completedSteps = 3 // Ready to generate

  return {
    steps: completedSteps,
    percent: (completedSteps / 4) * 100,
    text: completedSteps === 4 ? 'Completed' : `Step ${completedSteps + 1} of 4`,
  }
}

function ProjectStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: 'DRAFT', className: 'bg-slate-100 text-slate-600' },
    active: { label: 'ACTIVE', className: 'bg-blue-50 text-blue-600' },
    completed: { label: 'COMPLETED', className: 'bg-emerald-50 text-emerald-600' },
  }
  const config = map[status] ?? map.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${config.className}`}>
      {config.label}
    </span>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: ProjectRow }) {
  const createdAt = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const progress = getProjectProgress(project)
  const hasTemplateColors = project.templates?.accent_color && project.templates?.secondary_color

  return (
    <div className="group relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col h-full overflow-hidden">
      
      {/* Clickable Area */}
      <Link href={`/dashboard/projects/${project.id}`} className="absolute inset-0 z-0" />

      {/* Header Area */}
      <div className="p-5 pb-4 flex items-start gap-4">
        {/* Thumbnail */}
        <div 
          className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden bg-slate-50 dark:bg-slate-900"
          style={hasTemplateColors ? {
            background: `linear-gradient(135deg, ${project.templates!.accent_color} 0%, ${project.templates!.secondary_color} 100%)`
          } : {}}
        >
          {hasTemplateColors ? (
            <div className="w-10 h-8 border-2 border-white/40 rounded shadow-sm bg-white/20 backdrop-blur-sm" />
          ) : (
            <FileSignature className="h-6 w-6 text-slate-300 dark:text-slate-700" />
          )}
        </div>

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate pr-2">
              {project.name}
            </h3>
            <div className="z-10 relative">
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/projects/${project.id}/design`} className="cursor-pointer gap-2">
                      <PenLine className="h-4 w-4" /> Edit Design
                    </Link>
                  </DropdownMenuItem>
                  {/* Delete button wrapper inside Dropdown requires special handling to not close prematurely, but our DeleteProjectButton is an AlertDialog trigger. */}
                  {/* We wrap it carefully */}
                  <div className="px-2 py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">
                    <DeleteProjectButton projectId={project.id} projectName={project.name} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <ProjectStatusBadge status={project.status} />
            <span className="text-[11px] text-slate-500 font-medium truncate">
              {project.templates?.name ?? project.event_type ?? 'Custom Certificate'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 pb-5 mt-auto">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {createdAt}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {project.certificate_count} {project.certificate_count === 1 ? 'Recipient' : 'Recipients'}
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="px-5 pb-5 pt-0">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-500">Progress</span>
          <span className={progress.percent === 100 ? 'text-emerald-600' : 'text-blue-600'}>
            {progress.text}
          </span>
        </div>
        <Progress value={progress.percent} className="h-1.5" />
      </div>

    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProjectGrid({ projects }: { projects: ProjectRow[] }) {
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState('All')

  const filteredProjects = projects.filter((p) => {
    // 1. Status Filter
    if (filter !== 'All') {
      if (filter === 'Drafts' && p.status !== 'draft') return false
      if (filter === 'Active' && p.status !== 'active') return false
      if (filter === 'Completed' && p.status !== 'completed') return false
    }
    // 2. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase()
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.event_type?.toLowerCase().includes(q) &&
        !p.templates?.name.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="bg-transparent p-0 border-b border-slate-200 dark:border-slate-800 rounded-none w-full sm:w-auto justify-start h-auto">
            {['All', 'Drafts', 'Active', 'Completed'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors text-sm"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3">
            <FolderOpen className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {search ? 'No projects match your search.' : `No ${filter.toLowerCase()} projects found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger-children">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
