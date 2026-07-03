'use client'

import * as React from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InlineProjectTitleProps {
  projectId: string
  initialName: string
}

export function InlineProjectTitle({ projectId, initialName }: InlineProjectTitleProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)
  const [name, setName] = React.useState(initialName)
  const [draft, setDraft] = React.useState(initialName)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setDraft(name)
    setError(null)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const cancel = () => {
    setIsEditing(false)
    setDraft(name)
    setError(null)
  }

  const save = async () => {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === name) {
      cancel()
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to rename project')
      setName(data.name)
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (isEditing) {
    return (
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight bg-transparent border-b-2 border-indigo-500 outline-none w-full max-w-lg py-0.5 focus:border-indigo-600"
          />
          <button
            onClick={save}
            disabled={isSaving}
            title="Save"
            className="flex-shrink-0 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={cancel}
            disabled={isSaving}
            title="Cancel"
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-3 mb-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
        {name}
      </h1>
      <button
        onClick={startEdit}
        title="Rename project"
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  )
}
