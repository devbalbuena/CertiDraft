'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Star, Sparkles, Loader2, ArrowRight, PenLine, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TemplateForPreview = {
  id: string
  name: string
  category: string
  description: string | null
  accent_color: string
  secondary_color: string
  style: string | null
  is_featured: boolean
  uses: number
  price: number
}

interface TemplatePreviewDialogProps {
  template: TemplateForPreview | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isOwned: boolean
}

// ─── Category badge colours (mirrors page.tsx) ────────────────────────────────

const categoryBadgeColors: Record<string, string> = {
  Corporate: 'bg-blue-50 text-blue-700 border-blue-200',
  Academic: 'bg-purple-50 text-purple-700 border-purple-200',
  Sports: 'bg-orange-50 text-orange-700 border-orange-200',
  Recognition: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200',
}

// ─── Swatch component ─────────────────────────────────────────────────────────

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-[10px] text-slate-400 leading-none">{label}</p>
        <p className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 leading-tight">
          {color}
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TemplatePreviewDialog({ template, open, onOpenChange, isOwned }: TemplatePreviewDialogProps) {
  const router = useRouter()
  const [mode, setMode] = React.useState<'preview' | 'ai'>('preview')
  const [description, setDescription] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isPurchasing, setIsPurchasing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset to preview mode when the dialog reopens
  React.useEffect(() => {
    if (open) {
      setMode('preview')
      setDescription('')
      setError(null)
    }
  }, [open])

  if (!template) return null

  const badgeClass = categoryBadgeColors[template.category] ?? categoryBadgeColors.Other

  const handleAiGenerate = async () => {
    if (!description.trim()) return
    setIsGenerating(true)
    setError(null)
    try {
      const fullDescription = `Context: This is for a ${template.category} certificate.\n\n${description}`
      const res = await fetch('/api/ai/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: fullDescription, baseTemplateId: template.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate project')
      if (data.projectId) {
        router.push(`/dashboard/projects/${data.projectId}/design`)
        onOpenChange(false)
      }
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  const handlePurchaseAndUse = async () => {
    setIsPurchasing(true)
    setError(null)
    try {
      const res = await fetch('/api/templates/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: template.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')
      
      // If purchase succeeds, immediately use it (without AI)
      await handleUseWithoutAi()
    } catch (err: any) {
      setError(err.message)
      setIsPurchasing(false)
    }
  }

  const handleUseWithoutAi = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} Project`,
          template_id: template.id,
          event_type: template.category,
          description: '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create project')
      if (data.id) {
        router.push(`/dashboard/projects/${data.id}/design`)
        onOpenChange(false)
      }
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl gap-0">
        <DialogTitle className="sr-only">{template.name} Preview</DialogTitle>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* ── Preview Mode ── */}
        {mode === 'preview' && (
          <>
            {/* Large gradient preview — ~40% of dialog height */}
            <div
              className="h-52 w-full flex items-center justify-center relative flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${template.accent_color} 0%, ${template.secondary_color} 100%)`,
              }}
            >
              {/* Certificate mockup */}
              <div className="w-36 h-28 border-2 border-white/40 rounded-lg flex flex-col items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm shadow-lg">
                <div className="h-2.5 w-20 bg-white/70 rounded" />
                <div className="h-1.5 w-14 bg-white/50 rounded" />
                <div className="h-1 w-24 bg-white/30 rounded mt-1.5" />
                <div className="h-1 w-16 bg-white/30 rounded" />
                <div className="h-1 w-20 bg-white/20 rounded mt-1" />
              </div>

              {/* Featured badge */}
              {template.is_featured && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-amber-900" />
                    Featured
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 bg-white dark:bg-slate-950">
              {/* Name + category */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {template.name}
                </h2>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${badgeClass}`}>
                  {template.category}
                </span>
              </div>

              {/* Style + uses */}
              <div className="flex items-center gap-3 text-xs">
                {template.style && (
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">
                    {template.style}
                  </span>
                )}
                <span className="text-slate-300 dark:text-slate-700">·</span>
                {template.uses === 0 ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 text-[10px] px-2">
                    New
                  </Badge>
                ) : (
                  <span className="text-slate-400">Used {template.uses} time{template.uses !== 1 ? 's' : ''}</span>
                )}
              </div>

              {/* Color swatches */}
              <div className="flex items-center gap-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <ColorSwatch color={template.accent_color} label="Accent" />
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <ColorSwatch color={template.secondary_color} label="Secondary" />
              </div>

              {/* Description */}
              {template.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {template.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {template.price > 0 && !isOwned ? (
                  <Button
                    onClick={handlePurchaseAndUse}
                    disabled={isPurchasing || isGenerating}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-11 rounded-xl gap-2 shadow-md shadow-amber-200/50"
                  >
                    {isPurchasing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Unlocking…</>
                    ) : (
                      <><span className="text-base leading-none">🪙</span> Unlock for {template.price} Credits</>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setMode('ai')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 rounded-xl gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Use this template
                    </Button>
                    <Button
                      onClick={handleUseWithoutAi}
                      disabled={isGenerating}
                      variant="outline"
                      className="w-full h-10 rounded-xl font-semibold gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {isGenerating ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating project…</>
                      ) : (
                        <><PenLine className="h-4 w-4" /> Use without AI</>
                      )}
                    </Button>
                  </>
                )}
                {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
              </div>
            </div>
          </>
        )}

        {/* ── AI Mode ── */}
        {mode === 'ai' && (
          <>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-5 pb-4 border-b border-indigo-100 dark:border-indigo-900/50">
              <button
                onClick={() => setMode('preview')}
                className="text-xs text-indigo-400 hover:text-indigo-600 mb-3 flex items-center gap-1"
              >
                ← Back to preview
              </button>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shadow-sm">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Generate with AI</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 ml-10">
                Describe your event and Gemini will draft certificate content for you.
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-950 flex flex-col gap-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`e.g. A certificate of completion for the 2026 Annual ${template.category} event.`}
                className="min-h-[100px] resize-none text-sm border-slate-200 focus-visible:ring-indigo-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl"
                disabled={isGenerating}
              />
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <Button
                onClick={handleAiGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-md gap-2"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Drafting content…</>
                ) : (
                  <>Generate &amp; Use Template <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
