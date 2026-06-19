import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { DeleteProjectButton } from '@/components/projects/DeleteProjectButton'
import { Button } from '@/components/ui/button'
import { FolderOpen, Calendar, Users, Award, Plus } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

function ProjectStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: 'DRAFT', className: 'bg-slate-100 text-slate-600 border-transparent' },
    active: { label: 'ACTIVE', className: 'bg-emerald-50 text-emerald-600 border-transparent' },
    completed: { label: 'COMPLETED', className: 'bg-blue-50 text-blue-600 border-transparent' },
  }
  const config = map[status] ?? map.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider border ${config.className}`}>
      {config.label}
    </span>
  )
}

function getBorderColor(status: string) {
  switch(status) {
    case 'active': return 'border-t-emerald-400'
    case 'completed': return 'border-t-blue-400'
    default: return 'border-t-slate-300'
  }
}

function CertificateThumbnail({ title }: { title: string }) {
  return (
    <div className="w-36 h-[104px] shrink-0 rounded border border-slate-300 bg-white p-1.5 shadow-sm relative overflow-hidden flex flex-col items-center justify-start group-hover:border-blue-300 transition-colors">
      <div className="absolute inset-1.5 border border-slate-200 rounded-sm pointer-events-none" />
      
      {/* Cert header */}
      <div className="mt-3 text-[9px] font-serif font-bold tracking-widest text-slate-800 uppercase">
        Certificate
      </div>
      
      {/* Title preview */}
      <div className="mt-2 text-[7px] font-serif font-medium text-slate-500 w-full text-center px-4 truncate">
        {title}
      </div>
      
      {/* Line */}
      <div className="w-12 h-[1px] bg-slate-300 mt-1 rounded-full" />
      
      {/* Seal */}
      <div className="absolute bottom-2.5 flex flex-col items-center">
        <div className="w-5 h-5 bg-amber-400 rounded-full shadow-sm flex items-center justify-center relative">
          <div className="w-3 h-3 border border-amber-200 rounded-full"></div>
          {/* Ribbon tails */}
          <div className="absolute -bottom-1.5 left-[3px] w-1.5 h-3 bg-amber-500 transform rotate-[25deg]"></div>
          <div className="absolute -bottom-1.5 right-[3px] w-1.5 h-3 bg-amber-500 transform -rotate-[25deg]"></div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
        <CreateProjectDialog
          trigger={
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md rounded-lg font-semibold px-5 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          }
        />
      </PageHeader>

      {!projects || projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to start generating certificates."
          icon={FolderOpen}
          action={<CreateProjectDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6 animate-stagger-children">
          {projects.map((project) => {
            const createdAt = new Date(project.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            
            return (
              <div 
                key={project.id} 
                className={`flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-t-[4px] ${getBorderColor(project.status)} transition-all duration-200 relative group`}
              >
                {/* Delete button (visible on hover) */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteProjectButton projectId={project.id} projectName={project.name} />
                </div>

                {/* Top Half: Content */}
                <div className="flex flex-col sm:flex-row p-6 gap-6">
                  {/* Left: Thumbnail */}
                  <div className="hidden sm:block">
                     <CertificateThumbnail title={project.name} />
                  </div>

                  {/* Right: Details */}
                  <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-between items-start pr-8">
                      <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight line-clamp-1 pr-2">
                        {project.name}
                      </h3>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    
                    <p className="text-[13px] text-slate-500 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                    
                    <div className="mt-auto pt-5 flex items-center gap-5 text-[11px] font-bold text-slate-500 tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        CREATED {createdAt.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {project.certificate_count} CERTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Half: Action */}
                <div className="px-6 pb-6 pt-0 mt-auto">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-bold shadow-sm transition-all active:scale-[0.98]">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      Open Project
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
