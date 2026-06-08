import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Hammer } from 'lucide-react'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch project details joined with template name if it exists
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      templates (name)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) {
    notFound()
  }

  const templateName = (project.templates as { name: string } | null)?.name ?? 'None'
  const createdAt = new Date(project.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>

      <PageHeader title={project.name} subtitle="Manage this certificate campaign.">
        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
          Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </Badge>
      </PageHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 h-auto p-1 bg-muted/50 border border-border/40 inline-flex w-full sm:w-auto">
          <TabsTrigger value="overview" className="py-2 px-4">Overview</TabsTrigger>
          <TabsTrigger value="upload" className="py-2 px-4">Upload Data</TabsTrigger>
          <TabsTrigger value="design" className="py-2 px-4">Design Template</TabsTrigger>
          <TabsTrigger value="generate" className="py-2 px-4">Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Event Type</h4>
                  <p className="mt-1 text-base">{project.event_type || 'Other'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="mt-1 text-base text-foreground/90">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created Date</h4>
                  <p className="mt-1 text-base">{createdAt}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration & Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Selected Template</h4>
                  <p className="mt-1 text-base font-medium">{templateName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Generated Certificates</h4>
                  <p className="mt-1 text-3xl font-bold text-primary tracking-tight">
                    {project.certificate_count}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <EmptyState
            title="CSV upload coming in Phase 7"
            description="You will be able to upload recipient lists and map data fields to your template variables here."
            icon={Hammer}
          />
        </TabsContent>

        <TabsContent value="design" className="mt-0">
          <EmptyState
            title="Certificate builder coming in Phase 6"
            description="The drag-and-drop template designer and variable configuration will be located here."
            icon={Hammer}
          />
        </TabsContent>

        <TabsContent value="generate" className="mt-0">
          <EmptyState
            title="Batch generation coming in Phase 7"
            description="Run batch jobs, preview generated certificates, and monitor progress here."
            icon={Hammer}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
