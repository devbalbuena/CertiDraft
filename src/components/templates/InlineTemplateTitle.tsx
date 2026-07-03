'use client'

import * as React from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InlineTemplateTitleProps {
  templateId: string
  initialName: string
  onNameChange?: (newName: string) => void
}

export function InlineTemplateTitle({ templateId, initialName, onNameChange }: InlineTemplateTitleProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)
  const [name, setName] = React.useState(initialName)
  const [draft, setDraft] = React.useState(initialName)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync state if initialName changes
  React.useEffect(() => {
    setName(initialName)
    setDraft(initialName)
  }, [initialName])

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
      const res = await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to rename template')
      setName(data.name)
      setIsEditing(false)
      if (onNameChange) onNameChange(data.name)
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
      <div className="space-y-1 w-full">
        <div className="flex items-center gap-1 w-full">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight bg-transparent border-b-2 border-indigo-500 outline-none w-full py-0.5 focus:border-indigo-600"
          />
          <button
            onClick={save}
            disabled={isSaving}
            title="Save"
            className="flex-shrink-0 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={cancel}
            disabled={isSaving}
            title="Cancel"
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="group flex items-start justify-between w-full">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
        {name}
      </h2>
      <button
        onClick={startEdit}
        title="Rename template"
        className="opacity-0 group-hover:opacity-100 p-1.5 -mt-1 -mr-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
