import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { LayoutTemplate } from 'lucide-react'
import { TemplateGrid, type TemplateRow } from '@/components/templates/TemplateGrid'

export const metadata = {
  title: 'Templates | CertiDraft',
  description: 'Browse and select professional certificate templates for your events and projects.',
}

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // ── 1. Fetch all accessible templates ────────────────────────────────────────
  const { data: rawTemplates } = await supabase
    .from('templates')
    .select('*')
    .or(`creator_id.is.null,creator_id.eq.${user.id},is_public.eq.true`)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  const raw = rawTemplates ?? []

  // ── 2. Aggregate uses counts from the projects table ─────────────────────────
  // Count how many projects reference each template_id
  const { data: projectsWithTemplates } = await supabase
    .from('projects')
    .select('template_id')
    .not('template_id', 'is', null)

  const usesMap: Record<string, number> = {}
  for (const p of projectsWithTemplates ?? []) {
    if (p.template_id) {
      usesMap[p.template_id] = (usesMap[p.template_id] ?? 0) + 1
    }
  }

  // Attach uses count to each template
  const allTemplates: TemplateRow[] = raw.map((t) => ({
    ...t,
    uses: usesMap[t.id] ?? 0,
  }))

  // ── 3. Find the user's most common event_type for recommendations ─────────────
  const { data: userProjects } = await supabase
    .from('projects')
    .select('event_type')
    .eq('user_id', user.id)
    .not('event_type', 'is', null)

  // Tally event_type frequencies
  const eventTypeCount: Record<string, number> = {}
  for (const p of userProjects ?? []) {
    if (p.event_type) {
      eventTypeCount[p.event_type] = (eventTypeCount[p.event_type] ?? 0) + 1
    }
  }

  // Pick the most frequent event_type; map it to a template category
  const sortedEventTypes = Object.entries(eventTypeCount).sort((a, b) => b[1] - a[1])
  const topEventType = sortedEventTypes[0]?.[0]?.toLowerCase() ?? null

  // Simple mapping from event_type keywords → template categories
  const categoryMapping: Record<string, string> = {
    workshop: 'Academic',
    seminar: 'Academic',
    training: 'Academic',
    academic: 'Academic',
    corporate: 'Corporate',
    business: 'Corporate',
    work: 'Corporate',
    sports: 'Sports',
    athletic: 'Sports',
    game: 'Sports',
    recognition: 'Recognition',
    award: 'Recognition',
    achievement: 'Recognition',
  }

  let recommendedCategory: string | null = null
  if (topEventType) {
    for (const [keyword, cat] of Object.entries(categoryMapping)) {
      if (topEventType.includes(keyword)) {
        recommendedCategory = cat
        break
      }
    }
  }

  // Build recommended list
  let recommendedTemplates: TemplateRow[]
  if (recommendedCategory) {
    recommendedTemplates = allTemplates
      .filter((t) => t.category === recommendedCategory)
      .slice(0, 4)
  } else {
    // No project history — fall back to featured templates
    recommendedTemplates = allTemplates.filter((t) => t.is_featured).slice(0, 4)
  }

  return (
    <div className="font-sans">
      <PageHeader
        title="Templates"
        subtitle="Browse and select certificate templates for your project."
      />

      {allTemplates.length === 0 ? (
        <EmptyState
          title="No templates available yet"
          description="System templates will appear here once an admin creates them."
          icon={LayoutTemplate}
        />
      ) : (
        <TemplateGrid
          templates={allTemplates}
          recommendedTemplates={recommendedTemplates}
          currentUserId={user.id}
        />
      )}
    </div>
  )
}
