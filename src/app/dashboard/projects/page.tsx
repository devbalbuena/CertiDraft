import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { Button } from '@/components/ui/button'
import { FolderOpen, Plus } from 'lucide-react'
import { ProjectGrid, type ProjectRow } from '@/components/projects/ProjectGrid'

export const metadata = {
  title: 'Projects | CertiDraft',
  description: 'Manage your certificate generation projects.',
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch projects and join with templates to get colors and names for the thumbnails
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      templates (
        name,
        accent_color,
        secondary_color
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const projectRows = (projects as ProjectRow[]) ?? []

  return (
    <div className="font-sans">
      <PageHeader
        title="Projects"
        subtitle="Manage your certificate generation projects."
      >
        <CreateProjectDialog
          trigger={
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md rounded-lg font-semibold px-5 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          }
        />
      </PageHeader>

      {projectRows.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to start generating certificates."
          icon={FolderOpen}
          action={<CreateProjectDialog />}
        />
      ) : (
        <div className="mt-6">
          <ProjectGrid projects={projectRows} />
        </div>
      )}
    </div>
  )
}
