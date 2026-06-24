import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutTemplate, Star } from 'lucide-react'
import Link from 'next/link'
import { UseTemplateDialog } from '@/components/templates/UseTemplateDialog'

type Template = {
  id: string
  name: string
  category: string
  description: string | null
  accent_color: string
  secondary_color: string
  style: string | null
  is_featured: boolean
  is_public: boolean
  creator_id: string | null
  created_at: string
}

const CATEGORIES = ['All', 'Corporate', 'Academic', 'Sports', 'Recognition', 'Other']

const categoryBadgeColors: Record<string, string> = {
  Corporate: 'bg-blue-50 text-blue-700 border-blue-200',
  Academic: 'bg-purple-50 text-purple-700 border-purple-200',
  Sports: 'bg-orange-50 text-orange-700 border-orange-200',
  Recognition: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200',
}

function TemplateCard({ template, currentUserId }: { template: Template; currentUserId: string }) {
  const isOwner = template.creator_id === currentUserId

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Preview Area — colored gradient using accent + secondary colors */}
      <div
        className="h-40 w-full flex items-center justify-center relative flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${template.accent_color} 0%, ${template.secondary_color} 100%)`,
        }}
      >
        {/* Certificate mockup outline */}
        <div className="w-32 h-24 border-2 border-white/40 rounded flex flex-col items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm">
          <div className="h-2 w-16 bg-white/60 rounded" />
          <div className="h-1.5 w-10 bg-white/40 rounded" />
          <div className="h-1 w-20 bg-white/30 rounded mt-1" />
          <div className="h-1 w-14 bg-white/30 rounded" />
        </div>

        {/* Featured badge */}
        {template.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              <Star className="w-2.5 h-2.5 fill-amber-900" />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1">{template.name}</h3>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${categoryBadgeColors[template.category] ?? categoryBadgeColors.Other}`}>
            {template.category}
          </span>
        </div>

        {template.style && (
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">{template.style}</p>
        )}

        {template.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">{template.description}</p>
        )}

        <div className="mt-4">
          <UseTemplateDialog
            templateId={template.id}
            templateCategory={template.category}
            trigger={
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg h-10 text-sm shadow-sm cursor-pointer">
                Use Template
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: templates, error } = await supabase
    .from('templates')
    .select('*')
    .or(`creator_id.is.null,creator_id.eq.${user.id},is_public.eq.true`)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  const allTemplates: Template[] = templates ?? []

  return (
    <div className="font-sans">
      <PageHeader
        title="Templates"
        subtitle="Browse and select certificate templates."
      />

      {allTemplates.length === 0 ? (
        <EmptyState
          title="No templates available yet"
          description="System templates will appear here once an admin creates them."
          icon={LayoutTemplate}
        />
      ) : (
        <Tabs defaultValue="All" className="w-full">
          {/* Category Filter Tabs */}
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-slate-200 rounded-none mb-8 space-x-4 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors text-sm"
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                    {allTemplates.filter(t => t.category === cat).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => {
            const filtered = cat === 'All'
              ? allTemplates
              : allTemplates.filter((t) => t.category === cat)

            return (
              <TabsContent key={cat} value={cat} className="mt-0">
                {filtered.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-slate-400 font-medium">No templates in this category yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        currentUserId={user.id}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </div>
  )
}
