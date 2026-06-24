'use client'

// ⚠️ This MUST be a client component — it holds the onSave callback which
// is passed to the dynamically imported CertificateBuilder. Passing a server
// action as a prop to a dynamically imported client component causes a
// serialization error in Next.js App Router. The save logic lives here
// and hits the API route via fetch instead.

import * as React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

// ── Dynamically import the entire builder shell to ensure ssr:false ────────────
const CertificateBuilder = dynamic(
  () => import('@/components/certificates/CertificateBuilder').then((m) => m.CertificateBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#0f172a]" style={{ height: 'calc(100vh - 48px)' }}>
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
          <span className="text-sm font-medium">Initialising certificate builder…</span>
        </div>
      </div>
    ),
  }
)

interface DesignPageClientProps {
  projectId: string
  projectName: string
  initialData: string | null
}

export function DesignPageClient({ projectId, projectName, initialData }: DesignPageClientProps) {
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

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
    <div className="flex flex-col h-screen bg-[#0f172a]">
      {/* ── Slim Dark Header ──────────────────────────────────────────────── */}
      <header className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-slate-800 bg-[#1e293b] z-20">
        {/* Back link */}
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {/* Breadcrumb */}
        <span className="text-slate-700 text-xs">/</span>
        <span className="text-slate-400 text-xs">Design</span>
        <span className="text-slate-700 text-xs">/</span>
        <span className="text-slate-200 text-xs font-semibold truncate max-w-[180px]">{projectName}</span>
        <span className="text-slate-600 text-xs hidden sm:inline">— Certificate Builder</span>

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
      </header>

      {/* ── Builder ─────────────────────────────────────────────────────── */}
      <CertificateBuilder
        onSave={handleSave}
        initialData={initialData}
      />
    </div>
  )
}

