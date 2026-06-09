import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Hammer, Pencil } from 'lucide-react'
import { CardDescription, CardFooter } from '@/components/ui/card'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    .eq('id', id)
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
          <div className="max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle>Upload Recipients</CardTitle>
                <CardDescription>
                  Upload a CSV file containing your recipient data. You can map your CSV columns
                  to the variables you used in your certificate design.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link href={`/dashboard/projects/${project.id}/upload`}>
                    Start CSV Upload Wizard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="design" className="mt-0">
          <div className="max-w-lg">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Certificate Design</CardTitle>
                  {project.elements ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-0.5 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Design saved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-0.5 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      No design yet
                    </span>
                  )}
                </div>
                <CardDescription>
                  {project.elements
                    ? 'A certificate design has been saved for this project. Open the builder to edit it.'
                    : 'No design has been created yet. Open the certificate builder to design your certificate template.'}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link href={`/dashboard/projects/${project.id}/design`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Open Certificate Builder
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="mt-0">
          <div className="max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle>Batch Generation</CardTitle>
                <CardDescription>
                  Generate certificates in bulk. First upload your recipient data via the Upload Data tab,
                  and the generation process will start automatically after mapping fields.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="secondary" asChild>
                  <Link href={`/dashboard/projects/${project.id}/upload`}>
                    Go to Upload Data
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
