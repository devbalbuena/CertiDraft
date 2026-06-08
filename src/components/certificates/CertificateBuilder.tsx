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
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-600 border-t-indigo-500 animate-spin" />
          <span className="text-sm">Loading canvas…</span>
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
    // Full viewport minus topbar (h-16 = 64px)
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── Top Toolbar ─────────────────────────────────────────────────── */}
      <BuilderToolbar onSave={onSave} />

      {/* ── Three-column shell ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Layers */}
        <BuilderLayersPanel />

        {/* Center: Canvas */}
        <div className="flex-1 overflow-hidden">
          <CertificateCanvas initialData={initialData} />
        </div>

        {/* Right: Properties */}
        <BuilderPropertiesPanel />
      </div>
    </div>
  )
}
