'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { CreateTemplateDialog } from '@/components/templates/CreateTemplateDialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Trash2, Pencil, Loader2, LayoutTemplate, Server, User, Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type Template = {
  id: string
  name: string
  category: string
  creator_id: string | null
  is_featured: boolean
  is_public: boolean
  created_at: string
  users?: { email: string } | null
}

interface Stats {
  total: number
  systemCount: number
  customCount: number
  topCategory: string
}

interface AdminTemplatesClientProps {
  templates: Template[]
  stats: Stats
  allCategories: string[]
  activeCategory: string
  activeCreator: string
}

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; darkBg: string; gradient: string }> = {
  Corporate: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    darkBg: 'dark:bg-blue-500/20 dark:text-blue-300',
    gradient: 'from-blue-400 to-blue-600',
  },
  Academic: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    darkBg: 'dark:bg-purple-500/20 dark:text-purple-300',
    gradient: 'from-purple-400 to-purple-600',
  },
  Sports: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    darkBg: 'dark:bg-orange-500/20 dark:text-orange-300',
    gradient: 'from-orange-400 to-orange-600',
  },
  Recognition: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    darkBg: 'dark:bg-emerald-500/20 dark:text-emerald-300',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  Other: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    darkBg: 'dark:bg-slate-700 dark:text-slate-300',
    gradient: 'from-slate-400 to-slate-600',
  },
}

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.Other
}

// ── Thumbnail placeholder ─────────────────────────────────────────────────────

function TemplateThumbnail({ name, category }: { name: string; category: string }) {
  const cfg = getCategoryConfig(category)
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'h-10 w-16 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 select-none',
        cfg.gradient
      )}
    >
      <span className="text-[10px] font-extrabold text-white tracking-wider drop-shadow">
        {initials}
      </span>
    </div>
  )
}

// ── Category badge ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const cfg = getCategoryConfig(category)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
        cfg.bg, cfg.text, cfg.darkBg
      )}
    >
      {category}
    </span>
  )
}

// ── Toggle cell ───────────────────────────────────────────────────────────────

function ToggleCell({ templateId, field, initialValue }: {
  templateId: string
  field: 'is_featured' | 'is_public'
  initialValue: boolean
}) {
  const [value, setValue] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const newValue = !value
    setValue(newValue)
    startTransition(async () => {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      })
      if (!res.ok) {
        setValue(!newValue)
        toast.error('Failed to update template')
      }
    })
  }

  return (
    <div className="flex items-center">
      {isPending
        ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        : <Switch checked={value} onCheckedChange={toggle} />
      }
    </div>
  )
}

// ── Delete button ─────────────────────────────────────────────────────────────

function DeleteTemplateButton({ templateId, templateName }: {
  templateId: string
  templateName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success(`"${templateName}" deleted`)
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to delete template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete template?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{templateName}</strong>. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Mini stat card ────────────────────────────────────────────────────────────

function MiniStat({ label, value, icon: Icon, colorClass }: {
  label: string
  value: string | number
  icon: React.ElementType
  colorClass: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className={cn('p-2.5 rounded-xl shrink-0', colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">{value}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminTemplatesClient({
  templates,
  stats,
  allCategories,
  activeCategory,
  activeCreator,
}: AdminTemplatesClientProps) {
  const router = useRouter()

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams()
    if (key !== 'category' && activeCategory !== 'all') params.set('category', activeCategory)
    if (key !== 'creator' && activeCreator !== 'all') params.set('creator', activeCreator)
    if (value !== 'all') params.set(key, value)
    const qs = params.toString()
    router.push(`/admin/templates${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Templates" subtitle="Manage system and user-created certificate templates.">
        <CreateTemplateDialog />
      </PageHeader>

      {/* ── Summary Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStat
          label="Total Templates"
          value={stats.total}
          icon={LayoutTemplate}
          colorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <MiniStat
          label="System / Custom"
          value={`${stats.systemCount} / ${stats.customCount}`}
          icon={Server}
          colorClass="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        />
        <MiniStat
          label="Top Category"
          value={stats.topCategory}
          icon={Tag}
          colorClass="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">Filter by:</p>
        <div className="flex gap-2 flex-wrap">
          <Select value={activeCategory} onValueChange={(v) => applyFilter('category', v)}>
            <SelectTrigger className="h-9 w-[160px] rounded-lg text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={activeCreator} onValueChange={(v) => applyFilter('creator', v)}>
            <SelectTrigger className="h-9 w-[150px] rounded-lg text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <SelectValue placeholder="All Creators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="custom">Custom (Users)</SelectItem>
            </SelectContent>
          </Select>

          {(activeCategory !== 'all' || activeCreator !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 text-sm"
              onClick={() => router.push('/admin/templates')}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
            <TableRow className="border-slate-200 dark:border-slate-700">
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 pl-5">Template</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4">Category</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4">Creator</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4">Featured</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4">Public</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4">Created</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                  <div className="flex flex-col items-center gap-2">
                    <LayoutTemplate className="h-8 w-8 opacity-40" />
                    <p>No templates found. Try adjusting your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow
                  key={template.id}
                  className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* ── Template Name + Thumbnail ────────────────────────── */}
                  <TableCell className="py-3 pl-5">
                    <div className="flex items-center gap-3">
                      <TemplateThumbnail name={template.name} category={template.category} />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm leading-tight">
                          {template.name}
                        </p>
                        {template.is_featured && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* ── Category ────────────────────────────────────────── */}
                  <TableCell className="py-3">
                    <CategoryBadge category={template.category} />
                  </TableCell>

                  {/* ── Creator ─────────────────────────────────────────── */}
                  <TableCell className="py-3">
                    {template.creator_id === null ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                        <Server className="h-3 w-3" />
                        System
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[140px]">{template.users?.email ?? '—'}</span>
                      </span>
                    )}
                  </TableCell>

                  {/* ── Toggles ─────────────────────────────────────────── */}
                  <TableCell className="py-3">
                    <ToggleCell templateId={template.id} field="is_featured" initialValue={template.is_featured} />
                  </TableCell>
                  <TableCell className="py-3">
                    <ToggleCell templateId={template.id} field="is_public" initialValue={template.is_public} />
                  </TableCell>

                  {/* ── Date ────────────────────────────────────────────── */}
                  <TableCell className="text-sm text-slate-500 dark:text-slate-400 py-3">
                    {new Date(template.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </TableCell>

                  {/* ── Actions (Edit + Delete) ──────────────────────────── */}
                  <TableCell className="text-right py-3 pr-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        onClick={() => router.push(`/admin/templates/${template.id}/edit`)}
                        title="Edit template"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteTemplateButton templateId={template.id} templateName={template.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Result count ────────────────────────────────────────────────────── */}
      {templates.length > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
          Showing {templates.length} template{templates.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
