'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['Corporate', 'Academic', 'Sports', 'Recognition', 'Other']),
  description: z.string().optional(),
  accent_color: z.string().min(1, 'Accent color is required'),
  secondary_color: z.string().min(1, 'Secondary color is required'),
  style: z.string().optional(),
  is_featured: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function CreateTemplateDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: 'Corporate',
      description: '',
      accent_color: '#2563eb',
      secondary_color: '#e0e7ff',
      style: '',
      is_featured: false,
    },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, creator_id: null }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create template')
      }

      toast.success('System template created successfully')
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          New System Template
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-2xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">New System Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Template Name</Label>
            <Input
              {...form.register('name')}
              placeholder="e.g. Corporate Excellence"
              className="border-slate-200 focus-visible:ring-blue-600"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Category</Label>
            <Select
              value={form.watch('category')}
              onValueChange={(v) => form.setValue('category', v as FormValues['category'])}
            >
              <SelectTrigger className="border-slate-200 focus:ring-blue-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Corporate', 'Academic', 'Sports', 'Recognition', 'Other'].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Description</Label>
            <Textarea
              {...form.register('description')}
              placeholder="Brief description of this template..."
              className="border-slate-200 focus-visible:ring-blue-600 resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Accent Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...form.register('accent_color')}
                  className="h-9 w-12 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <Input
                  {...form.register('accent_color')}
                  className="border-slate-200 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Secondary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...form.register('secondary_color')}
                  className="h-9 w-12 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <Input
                  {...form.register('secondary_color')}
                  className="border-slate-200 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Style</Label>
            <Input
              {...form.register('style')}
              placeholder="e.g. Minimalist, Bordered, Bold..."
              className="border-slate-200 focus-visible:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">Featured Template</p>
              <p className="text-xs text-slate-500 mt-0.5">Show this prominently in the gallery</p>
            </div>
            <Switch
              checked={form.watch('is_featured')}
              onCheckedChange={(v) => form.setValue('is_featured', v)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-slate-200"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
