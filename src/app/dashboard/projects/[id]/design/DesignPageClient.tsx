'use client'

// ⚠️ This MUST be a client component — it holds the onSave callback which
// is passed to the dynamically imported CertificateBuilder. Passing a server
// action as a prop to a dynamically imported client component causes a
// serialization error in Next.js App Router. The save logic lives here
// and hits the API route via fetch instead.

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── Dynamically import the entire builder shell to ensure ssr:false ────────────
const CertificateBuilder = dynamic(
  () => import('@/components/certificates/CertificateBuilder').then((m) => m.CertificateBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
          <span className="text-sm">Initialising certificate builder…</span>
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
    <div className="flex flex-col h-screen bg-background">
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <header className="h-16 shrink-0 flex items-center gap-4 px-4 border-b border-border bg-card z-10">
        <Button variant="ghost" size="sm" asChild className="-ml-1">
          <Link href={`/dashboard/projects/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="w-px h-5 bg-border" />

        <h1 className="font-semibold text-sm truncate max-w-[260px]">
          {projectName}
        </h1>

        <span className="text-xs text-muted-foreground">— Certificate Builder</span>

        <div className="flex-1" />

        {saveState === 'saving' && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border border-muted-foreground border-t-foreground animate-spin" />
            Saving…
          </span>
        )}
        {saveState === 'saved' && (
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        {saveState === 'error' && (
          <span className="text-xs text-destructive flex items-center gap-1.5">
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
