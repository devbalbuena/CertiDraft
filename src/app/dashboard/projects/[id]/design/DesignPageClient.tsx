'use client'

// ⚠️ This MUST be a client component — it holds the onSave callback which
// is passed to the dynamically imported CertificateBuilder. Passing a server
// action as a prop to a dynamically imported client component causes a
// serialization error in Next.js App Router. The save logic lives here
// and hits the API route via fetch instead.

import * as React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// ── Dynamically import the entire builder shell to ensure ssr:false ────────────
const CertificateBuilder = dynamic(
  () => import('@/components/certificates/CertificateBuilder').then((m) => m.CertificateBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-100" style={{ height: 'calc(100vh - 48px)' }}>
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
          <span className="text-sm font-medium text-slate-500">Initialising certificate builder…</span>
        </div>
      </div>
    ),
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────

interface DesignPageClientProps {
  projectId: string
  projectName: string
  initialData: string | null
}

const CATEGORIES = ['Corporate', 'Academic', 'Sports', 'Recognition', 'Other'] as const
type Category = (typeof CATEGORIES)[number]

// ── Publish Dialog ────────────────────────────────────────────────────────────

function PublishDialog({
  open,
  onOpenChange,
  projectId,
  defaultName,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  projectId: string
  defaultName: string
}) {
  const [name, setName] = React.useState(defaultName)
  const [category, setCategory] = React.useState<Category>('Other')
  const [description, setDescription] = React.useState('')
  const [isPremium, setIsPremium] = React.useState(false)
  const [price, setPrice] = React.useState(10)
  const [state, setState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setName(defaultName)
      setCategory('Other')
      setDescription('')
      setIsPremium(false)
      setPrice(10)
      setState('idle')
      setErrorMsg('')
    }
  }, [open, defaultName])

  const handlePublish = async () => {
    if (!name.trim()) return
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/templates/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          name: name.trim(),
          category,
          description: description.trim() || undefined,
          price: isPremium ? price : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish')
      setState('success')
    } catch (err: any) {
      setErrorMsg(err.message)
      setState('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-slate-200 shadow-2xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Publish to Marketplace</DialogTitle>
        <DialogDescription className="sr-only">
          Share your certificate design with the community as a reusable template.
        </DialogDescription>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-violet-50">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Publish to Community</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Share your design as a reusable template for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Success state */}
        {state === 'success' ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base">Template Published! 🎉</p>
              <p className="text-sm text-slate-500 mt-1">
                Your design is now visible in the Community Templates tab.
              </p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* Template name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Template Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Award Certificate"
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-sm"
                disabled={state === 'loading'}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      category === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                    disabled={state === 'loading'}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Pricing
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPremium(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    !isPremium
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                  disabled={state === 'loading'}
                >
                  Free Template
                </button>
                <button
                  onClick={() => setIsPremium(true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                    isPremium
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                  }`}
                  disabled={state === 'loading'}
                >
                  <span className="text-base leading-none">🪙</span> Premium
                </button>
              </div>
              
              {isPremium && (
                <div className="flex items-center gap-3 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-base leading-none">🪙</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">Price (Credits)</p>
                  </div>
                  <Input
                    type="number"
                    min={5}
                    max={500}
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-24 text-right rounded-lg h-8 text-sm font-bold border-slate-200"
                    disabled={state === 'loading'}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Description <span className="text-slate-400 normal-case font-normal">(optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your template style or use case…"
                className="min-h-[80px] resize-none rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-sm"
                disabled={state === 'loading'}
                maxLength={300}
              />
              <p className="text-[11px] text-slate-400 text-right">{description.length}/300</p>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-xl">{errorMsg}</p>
            )}

            <Button
              onClick={handlePublish}
              disabled={state === 'loading' || !name.trim()}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-indigo-200"
            >
              {state === 'loading' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
              ) : (
                <><Upload className="h-4 w-4" /> Publish to Community</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DesignPageClient({ projectId, projectName, initialData }: DesignPageClientProps) {
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [publishOpen, setPublishOpen] = React.useState(false)

  const handleSave = React.useCallback(async (json: string) => {
    setSaveState('saving')
    try {
      const res = await fetch(`/api/projects/${projectId}/design`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements: json }),
      })

      if (!res.ok) {
        throw new Error('Save failed')
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 4000)
    }
  }, [projectId])

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* ── Slim Light Header ──────────────────────────────────────────────── */}
      <header className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-slate-200 bg-white z-20 shadow-sm">
        {/* Back link */}
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-xs font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {/* Breadcrumb */}
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-slate-500 text-xs">Design</span>
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-slate-800 text-xs font-semibold truncate max-w-[180px]">{projectName}</span>
        <span className="text-slate-400 text-xs hidden sm:inline">— Certificate Builder</span>

        <div className="flex-1" />

        {/* Save state indicators */}
        {saveState === 'saving' && (
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        )}
        {saveState === 'saved' && (
          <span className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        {saveState === 'error' && (
          <span className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Save failed
          </span>
        )}

        {/* Publish button */}
        <button
          onClick={() => setPublishOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Publish
        </button>
      </header>

      {/* ── Builder ─────────────────────────────────────────────────────── */}
      <CertificateBuilder
        onSave={handleSave}
        initialData={initialData}
      />

      {/* ── Publish Dialog ───────────────────────────────────────────────── */}
      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        projectId={projectId}
        defaultName={projectName}
      />
    </div>
  )
}
