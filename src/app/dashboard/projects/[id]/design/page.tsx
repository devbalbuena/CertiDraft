import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DesignPageClient } from './DesignPageClient'

// The server component only fetches the project data securely.
// The interactive builder and save callback live in DesignPageClient ('use client').
export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, elements')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <DesignPageClient
      projectId={project.id}
      projectName={project.name}
      initialData={project.elements ?? null}
    />
  )
}
