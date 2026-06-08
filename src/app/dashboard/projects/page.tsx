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
    draft: { label: 'Draft', className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' },
    active: { label: 'Active', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  }
  const config = map[status] ?? map.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
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
    <div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const createdAt = new Date(project.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            return (
              <Card key={project.id} className="flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight line-clamp-1" title={project.name}>
                        {project.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">
                          {project.event_type || 'Other'}
                        </Badge>
                      </CardDescription>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.certificate_count} certificates</span>
                    <span>Created {createdAt}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex items-center gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/dashboard/projects/${project.id}`}>Open</Link>
                  </Button>
                  <DeleteProjectButton projectId={project.id} projectName={project.name} />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
