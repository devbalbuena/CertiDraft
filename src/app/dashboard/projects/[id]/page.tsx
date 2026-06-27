import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ProjectStepper } from '@/components/projects/ProjectStepper'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('name, description')
    .eq('id', id)
    .single()

  return {
    title: project ? `${project.name} | CertiDraft` : 'Project | CertiDraft',
    description: project?.description ?? 'Manage your certificate generation project step by step.',
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch project details joined with template name
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      templates (name, accent_color)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Fetch featured system templates for Step 1 picker (3 max)
  const { data: featuredTemplates } = await supabase
    .from('templates')
    .select('id, name, category, accent_color')
    .is('creator_id', null)
    .eq('is_featured', true)
    .limit(3)

  // Fetch latest batch job for this project
  const { data: batchJobs } = await supabase
    .from('batch_jobs')
    .select('id, status, processed_count, total_count, created_at')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(1)

  const latestBatchJob = batchJobs?.[0] ?? null

  const templateOptions = (featuredTemplates ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category ?? null,
    accent: t.accent_color ?? 'default',
  }))

  return (
    <div className="font-sans">
      {/* Back nav */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-slate-500 hover:text-slate-900 font-medium">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>

      {/* Page header — no status badge here, status lives in the stepper progress */}
      <PageHeader title={project.name} subtitle="" />

      {/* Guided stepper */}
      <div className="mt-8">
        <ProjectStepper
          project={{
            id: project.id,
            name: project.name,
            description: project.description ?? null,
            status: project.status,
            event_type: project.event_type ?? null,
            template_id: project.template_id ?? null,
            elements: project.elements ?? null,
            certificate_count: project.certificate_count ?? 0,
            created_at: project.created_at,
            templates: (project.templates as { name: string; accent_color?: string | null } | null) ?? null,
          }}
          featuredTemplates={templateOptions}
          latestBatchJob={latestBatchJob}
        />
      </div>
    </div>
  )
}
