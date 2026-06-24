'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, ArrowRight } from 'lucide-react'

interface UseTemplateDialogProps {
  templateId: string
  templateCategory: string
  trigger: React.ReactNode
}

export function UseTemplateDialog({ templateId, templateCategory, trigger }: UseTemplateDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [description, setDescription] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!description.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      // Append context so Gemini knows the category
      const fullDescription = `Context: This is for a ${templateCategory} certificate.\n\n${description}`
      
      const res = await fetch('/api/ai/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: fullDescription,
          baseTemplateId: templateId 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate project')
      }

      if (data.projectId) {
        router.push(`/dashboard/projects/${data.projectId}/design`)
      }
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-indigo-100 rounded-2xl shadow-2xl">
        <div className="bg-indigo-50/50 p-6 pb-4 border-b border-indigo-100/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </div>
            <DialogTitle className="text-xl text-slate-900 tracking-tight">Generate with AI</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500 ml-10">
            What is this certificate for? Describe it, and Gemini will draft the content for you.
          </DialogDescription>
        </div>

        <div className="p-6 pt-4 bg-white flex flex-col gap-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. A certificate of participation for the 2026 Annual Hackathon."
            className="min-h-[100px] resize-none text-sm border-slate-200 focus-visible:ring-indigo-500 bg-slate-50 p-3 rounded-xl"
            disabled={isGenerating}
          />
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !description.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-md transition-all active:scale-95"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting content...</>
            ) : (
              <>Generate & Use Template <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>

          <div className="text-center mt-2">
            <Link 
              href={`/dashboard/projects?template=${templateId}`}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
              onClick={() => setOpen(false)}
            >
              Use without AI (Start blank)
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
