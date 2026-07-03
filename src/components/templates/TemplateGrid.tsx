'use client'

import * as React from 'react'
import { Search, Sparkles, Star, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { TemplatePreviewDialog, type TemplateForPreview } from './TemplatePreviewDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TemplateRow = {
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
  creator_name: string | null
  price: number
  created_at: string
  uses: number
}

interface TemplateGridProps {
  templates: TemplateRow[]
  recommendedTemplates: TemplateRow[]
  currentUserId: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Community', 'Corporate', 'Academic', 'Sports', 'Recognition', 'Other']

const categoryBadgeColors: Record<string, string> = {
  Corporate: 'bg-blue-50 text-blue-700 border-blue-200',
  Academic: 'bg-purple-50 text-purple-700 border-purple-200',
  Sports: 'bg-orange-50 text-orange-700 border-orange-200',
  Recognition: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200',
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function ColorDot({ color }: { color: string }) {
  return (
    <div
      className="h-4 w-4 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200/50 flex-shrink-0"
      style={{ backgroundColor: color }}
      title={color}
    />
  )
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  compact = false,
  onClick,
}: {
  template: TemplateRow
  compact?: boolean
  onClick: (t: TemplateRow) => void
}) {
  const badgeClass = categoryBadgeColors[template.category] ?? categoryBadgeColors.Other

  return (
    <div
      onClick={() => onClick(template)}
      className={`group relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${compact ? 'w-52 flex-shrink-0' : ''}`}
    >
      {/* Preview gradient */}
      <div
        className={`${compact ? 'h-28' : 'h-40'} w-full flex items-center justify-center relative flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.02]`}
        style={{
          background: `linear-gradient(135deg, ${template.accent_color} 0%, ${template.secondary_color} 100%)`,
        }}
      >
        {/* Certificate mockup */}
        <div className={`${compact ? 'w-24 h-16' : 'w-32 h-24'} border-2 border-white/40 rounded flex flex-col items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm`}>
          <div className={`${compact ? 'h-1.5 w-12' : 'h-2 w-16'} bg-white/60 rounded`} />
          <div className={`${compact ? 'h-1 w-8' : 'h-1.5 w-10'} bg-white/40 rounded`} />
          <div className={`${compact ? 'h-1 w-14' : 'h-1 w-20'} bg-white/30 rounded mt-1`} />
          <div className={`${compact ? 'h-1 w-10' : 'h-1 w-14'} bg-white/30 rounded`} />
        </div>

        {/* Featured badge */}
        {template.is_featured && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              <Star className="w-2.5 h-2.5 fill-amber-900" />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className={`${compact ? 'p-3' : 'p-5'} flex flex-col flex-1`}>
        {/* Name + category badge */}
        <div className="flex flex-col gap-2 mb-2">
          <h3 className={`font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-1 ${compact ? 'text-sm' : 'text-base'}`}>
            {template.name}
          </h3>

          {!compact && (
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}
              >
                {template.category}
              </span>

              {/* Price Badge */}
              {template.price > 0 ? (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <span className="text-[11px] leading-none">🪙</span> {template.price}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
                  Free
                </span>
              )}
            </div>
          )}
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5 mb-2">
          <ColorDot color={template.accent_color} />
          <ColorDot color={template.secondary_color} />
        </div>

        {/* Style */}
        {template.style && (
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold uppercase tracking-wider mb-1">
            {template.style}
          </p>
        )}

        {/* Uses count */}
        <div className="mb-2">
          {template.uses === 0 ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 text-[9px] px-1.5 py-0.5 h-auto">
              New
            </Badge>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-600">
              Used {template.uses} time{template.uses !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {!compact && template.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
            {template.description}
          </p>
        )}

        {/* Preview CTA */}
        <div className={`${compact ? 'mt-2' : 'mt-4'}`}>
          {/* Creator badge for community templates */}
          {template.creator_name && (
            <p className="text-[10px] text-slate-400 font-medium mb-1.5 truncate">
              By <span className="text-indigo-500 font-semibold">{template.creator_name}</span>
            </p>
          )}
          <div className="w-full bg-slate-900 group-hover:bg-blue-600 dark:bg-slate-100 dark:text-slate-900 dark:group-hover:bg-blue-600 dark:group-hover:text-white text-white font-semibold rounded-lg h-8 text-xs flex items-center justify-center transition-colors duration-200">
            Preview &amp; Use
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Create Your Own card (Other category) ────────────────────────────────────

function CreateOwnCard() {
  return (
    <a
      href="/dashboard/projects/new?blank=1"
      className="group relative bg-white dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl transition-all duration-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md min-h-[280px]"
    >
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 flex items-center justify-center transition-colors">
          <Plus className="h-7 w-7 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
        </div>
        <div>
          <p className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors text-sm">
            Create your own template
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1.5 leading-relaxed">
            Design a custom certificate template from scratch and save it to your library.
          </p>
        </div>
      </div>
    </a>
  )
}

// ─── Recommended Row ──────────────────────────────────────────────────────────

function RecommendedRow({
  templates,
  onSelect,
}: {
  templates: TemplateRow[]
  onSelect: (t: TemplateRow) => void
}) {
  if (templates.length === 0) return null
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Recommended for you
        </h2>
      </div>
      <ScrollArea className="w-full whitespace-nowrap pb-3">
        <div className="flex gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} compact onClick={onSelect} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

// ─── Main TemplateGrid ────────────────────────────────────────────────────────

interface TemplateGridProps {
  templates: TemplateRow[]
  recommendedTemplates: TemplateRow[]
  currentUserId: string
  purchasedTemplateIds?: string[]
}

export function TemplateGrid({ templates, recommendedTemplates, currentUserId, purchasedTemplateIds = [] }: TemplateGridProps) {
  const [search, setSearch] = React.useState('')
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateRow | null>(null)

  const handleSelect = React.useCallback((template: TemplateRow) => {
    setSelectedTemplate(template)
  }, [])

  // Client-side filter by search query (name, style, description)
  const filterTemplates = (list: TemplateRow[]) => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.style ?? '').toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    )
  }

  return (
    <>
      {/* Recommended row — shown when there's no active search */}
      {!search.trim() && (
        <RecommendedRow templates={recommendedTemplates} onSelect={handleSelect} />
      )}

      <Tabs defaultValue="All" className="w-full">
        {/* Tabs + Search row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-0 mb-8">
          <TabsList className="flex-1 justify-start h-auto p-0 bg-transparent rounded-none space-x-4 overflow-x-auto border-b-0">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'All'
                  ? templates.length
                  : templates.filter((t) => t.category === cat).length
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors text-sm"
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className="ml-1.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Search input */}
          <div className="relative w-full sm:w-56 flex-shrink-0 pb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="pl-8 h-8 text-sm rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* Tab content panels */}
        {CATEGORIES.map((cat) => {
          let base: TemplateRow[]
          if (cat === 'All') {
            base = templates
          } else if (cat === 'Community') {
            // Community = all templates with a real creator_name (user-published)
            base = templates.filter((t) => !!t.creator_name)
          } else {
            base = templates.filter((t) => t.category === cat && !t.creator_name)
          }
          const filtered = filterTemplates(base)
          const isOther = cat === 'Other'

          return (
            <TabsContent key={cat} value={cat} className="mt-0">
              {filtered.length === 0 && !isOther ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  {cat === 'Community' && !search ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Sparkles className="h-7 w-7 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                          No community templates yet
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 max-w-[280px] leading-relaxed">
                          Design a certificate in the builder and click{' '}
                          <span className="font-semibold text-indigo-500">Publish</span> to share
                          it with everyone here.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-600 font-medium">
                      {search
                        ? `No templates match "${search}".`
                        : 'No templates in this category yet.'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((t) => (
                    <TemplateCard key={t.id} template={t} onClick={handleSelect} />
                  ))}
                  {/* Always append "Create your own" card to Other tab */}
                  {isOther && <CreateOwnCard />}
                </div>
              )}

              {/* Other tab with zero results: still show CreateOwnCard */}
              {filtered.length === 0 && isOther && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <CreateOwnCard />
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Preview dialog */}
      <TemplatePreviewDialog
        template={selectedTemplate}
        open={!!selectedTemplate}
        onOpenChange={(o) => !o && setSelectedTemplate(null)}
        isOwned={selectedTemplate ? (selectedTemplate.creator_id === currentUserId || purchasedTemplateIds.includes(selectedTemplate.id)) : false}
        currentUserId={currentUserId}
      />
    </>
  )
}
