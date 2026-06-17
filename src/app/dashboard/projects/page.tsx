import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { DeleteProjectButton } from '@/components/projects/DeleteProjectButton'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderOpen } from 'lucide-react'

function ProjectStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    completed: { label: 'Completed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  }
  const config = map[status] ?? map.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase border ${config.className}`}>
      {config.label}
    </span>
  )
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="font-sans">
      <PageHeader
        title="Projects"
        subtitle="Manage your certificate generation projects."
      >
        <CreateProjectDialog />
      </PageHeader>

      {!projects || projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to start generating certificates."
          icon={FolderOpen}
          action={<CreateProjectDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const createdAt = new Date(project.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            return (
              <Card key={project.id} className="flex flex-col bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl group relative">
                
                {/* Top right delete button (appears on hover or is subtle) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteProjectButton projectId={project.id} projectName={project.name} />
                </div>

                <CardHeader className="pb-3 pt-5 px-6">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-bold text-slate-900 leading-tight line-clamp-1" title={project.name}>
                      {project.name}
                    </CardTitle>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-slate-200">
                      {project.event_type || 'Other'}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-4 px-6">
                  <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem] font-medium leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <span>{project.certificate_count} certs</span>
                    <span>Created {createdAt}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6 mt-auto">
                  <Button asChild className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-none font-semibold transition-colors">
                    <Link href={`/dashboard/projects/${project.id}`}>Open Project</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
