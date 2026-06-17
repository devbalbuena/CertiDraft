'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { CreateTemplateDialog } from '@/components/templates/CreateTemplateDialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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

const categoryColors: Record<string, string> = {
  Corporate: 'bg-blue-50 text-blue-700 border-blue-200',
  Academic: 'bg-purple-50 text-purple-700 border-purple-200',
  Sports: 'bg-orange-50 text-orange-700 border-orange-200',
  Recognition: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200',
}

function ToggleCell({ templateId, field, initialValue }: { templateId: string; field: 'is_featured' | 'is_public'; initialValue: boolean }) {
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
        setValue(!newValue) // revert on error
        toast.error('Failed to update template')
      }
    })
  }

  return (
    <div className="flex items-center">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : (
        <Switch checked={value} onCheckedChange={toggle} />
      )}
    </div>
  )
}

function DeleteTemplateButton({ templateId, templateName }: { templateId: string; templateName: string }) {
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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border-slate-200">
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

export function AdminTemplatesClient({ templates }: { templates: Template[] }) {
  return (
    <div className="font-sans">
      <PageHeader title="Templates" subtitle="Manage system and user-created certificate templates.">
        <CreateTemplateDialog />
      </PageHeader>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-200">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Template Name</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Category</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Creator</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Featured</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Public</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">Created</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                  No templates yet. Create your first system template.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900 py-4">{template.name}</TableCell>
                  <TableCell className="py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${categoryColors[template.category] ?? categoryColors.Other}`}>
                      {template.category}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    {template.creator_id === null ? (
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">System</span>
                    ) : (
                      <span className="text-sm text-slate-500 font-medium">{template.users?.email ?? '—'}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <ToggleCell templateId={template.id} field="is_featured" initialValue={template.is_featured} />
                  </TableCell>
                  <TableCell className="py-4">
                    <ToggleCell templateId={template.id} field="is_public" initialValue={template.is_public} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 py-4">
                    {new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-1">
                      <DeleteTemplateButton templateId={template.id} templateName={template.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
