'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  event_type: z.string().min(1, 'Please select an event type'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EVENT_TYPES = [
  'Conference',
  'Training',
  'Academic',
  'Sports',
  'Workshop',
  'Other',
]

// ── Component ──────────────────────────────────────────────────────────────────
export function CreateProjectDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setServerError(body.error ?? 'Something went wrong. Please try again.')
      return
    }

    // Close dialog, reset form, and refresh the page data
    reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          reset()
          setServerError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            A project represents a certificate campaign or event. You can upload a CSV
            and generate certificates once the project is created.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-project-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 pt-2"
        >
          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project name <span className="text-destructive">*</span></Label>
            <Input
              id="project-name"
              placeholder="e.g. Annual DevCon 2025"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-1.5">
            <Label htmlFor="event-type">Event type <span className="text-destructive">*</span></Label>
            <Select onValueChange={(val) => setValue('event_type', val, { shouldValidate: true })}>
              <SelectTrigger id="event-type" aria-invalid={!!errors.event_type}>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.event_type && (
              <p className="text-xs text-destructive" role="alert">
                {errors.event_type.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="project-description">
              Description <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Textarea
              id="project-description"
              placeholder="A brief description of this project..."
              rows={3}
              className="resize-none"
              {...register('description')}
            />
          </div>

          {/* Server error */}
          {serverError && (
            <p className="text-sm text-destructive" role="alert">
              {serverError}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-project-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
