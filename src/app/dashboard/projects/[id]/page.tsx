import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Pencil, Upload, Play, Settings } from 'lucide-react'

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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="font-sans">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-slate-500 hover:text-slate-900 font-medium">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>

      <PageHeader title={project.name} subtitle="Manage this certificate campaign.">
        <Badge variant="outline" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider bg-white border-slate-200 text-slate-600">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${project.status === 'completed' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
          {project.status}
        </Badge>
      </PageHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-slate-200 rounded-none mb-8 space-x-6 overflow-x-auto">
          <TabsTrigger 
            value="overview" 
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Data
          </TabsTrigger>
          <TabsTrigger 
            value="design" 
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Design Template
          </TabsTrigger>
          <TabsTrigger 
            value="generate" 
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-6 md:grid-cols-3 items-start">
            
            {/* Main Info Column (Takes up 2/3) */}
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Event Type</h4>
                      <p className="text-sm font-semibold text-slate-700">{project.event_type || 'Other'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Created Date</h4>
                      <p className="text-sm font-semibold text-slate-700">{createdAt}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {project.description || 'No description provided for this project.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Template</h4>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                        {templateName}
                      </p>
                      {templateName === 'None' && (
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50" asChild>
                          <Link href={`/dashboard/projects/${project.id}/design`}>Choose Template</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metrics Column (Takes up 1/3) */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md rounded-xl border-0 overflow-hidden relative">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Award className="w-24 h-24 -mt-8 -mr-8" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Generated Certificates</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pb-6">
                  <p className="text-5xl font-extrabold tracking-tight">
                    {project.certificate_count}
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>

        {/* ... Upload, Design, Generate Tabs content ... */}
        {/* We can also lightly polish these cards */}
        <TabsContent value="upload" className="mt-0">
          <div className="max-w-2xl">
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Upload Recipients</CardTitle>
                <CardDescription className="text-base text-slate-500 font-medium leading-relaxed">
                  Upload a CSV file containing your recipient data. You can map your CSV columns
                  to the variables you used in your certificate design.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-4">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg h-11 px-6 shadow-sm">
                  <Link href={`/dashboard/projects/${project.id}/upload`}>
                    <Upload className="mr-2 h-4 w-4" />
                    Start CSV Upload Wizard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="design" className="mt-0">
          <div className="max-w-2xl">
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-bold text-slate-900">Certificate Design</CardTitle>
                  {project.elements ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Design saved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      No design yet
                    </span>
                  )}
                </div>
                <CardDescription className="text-base text-slate-500 font-medium leading-relaxed">
                  {project.elements
                    ? 'A certificate design has been saved for this project. Open the builder to edit it.'
                    : 'No design has been created yet. Open the certificate builder to design your certificate template.'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-4">
                <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg h-11 px-6 shadow-sm">
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
          <div className="max-w-2xl">
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Batch Generation</CardTitle>
                <CardDescription className="text-base text-slate-500 font-medium leading-relaxed">
                  Generate certificates in bulk. First upload your recipient data via the Upload Data tab,
                  and the generation process will start automatically after mapping fields.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-4">
                <Button variant="outline" asChild className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg h-11 px-6">
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
