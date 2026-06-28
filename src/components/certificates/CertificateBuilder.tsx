'use client'

import dynamic from 'next/dynamic'
import { BuilderToolbar } from '@/components/certificates/BuilderToolbar'
import { BuilderLayersPanel } from '@/components/certificates/BuilderLayersPanel'
import { BuilderPropertiesPanel } from '@/components/certificates/BuilderPropertiesPanel'

// ── CertificateCanvas must NEVER render on the server ──────────────────────────
const CertificateCanvas = dynamic(
  () => import('@/components/certificates/CertificateCanvas').then((m) => m.CertificateCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
          <span className="text-sm font-medium text-slate-500">Loading canvas…</span>
        </div>
      </div>
    ),
  }
)

interface CertificateBuilderProps {
  onSave: (json: string) => void
  initialData?: string | null
}

export function CertificateBuilder({ onSave, initialData }: CertificateBuilderProps) {
  return (
    // Full viewport minus top header bar (h-12 = 48px)
    <div className="flex flex-col bg-slate-100" style={{ height: 'calc(100vh - 48px)' }}>

      {/* ── Contextual Toolbar ──────────────────────────────────────── */}
      <BuilderToolbar onSave={onSave} />

      {/* ── Three-column workspace ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Tabbed Layers / Elements / Variables panel */}
        <BuilderLayersPanel />

        {/* Center: Canvas on light checkerboard background */}
        <div className="flex-1 overflow-hidden bg-slate-200/70">
          <CertificateCanvas initialData={initialData} />
        </div>

        {/* Right: Properties panel */}
        <BuilderPropertiesPanel />

      </div>
    </div>
  )
}
