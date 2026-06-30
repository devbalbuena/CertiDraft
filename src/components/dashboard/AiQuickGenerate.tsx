'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { cn } from '@/lib/utils'

interface AiQuickGenerateProps {
  isOnboarding?: boolean
}

export function AiQuickGenerate({ isOnboarding = false }: AiQuickGenerateProps) {
  const [description, setDescription] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (localStorage.getItem('certidraft_onboarding_dismissed') === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('certidraft_onboarding_dismissed', 'true')
  }

  const handleGenerate = async () => {
    if (!description.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate project')
      }

      // Redirect to the newly created project's design page
      if (data.projectId) {
        router.push(`/dashboard/projects/${data.projectId}/design`)
      }
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  if (isOnboarding && !isDismissed) {
    return (
      <div className="mb-10 relative overflow-hidden rounded-3xl bg-white p-8 sm:p-10 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-indigo-100 flex flex-col gap-8">
        {/* Skip Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-sm font-medium z-20 transition-colors"
        >
          Skip for now
        </button>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-white pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-4 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Getting Started
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-3">
            Generate your first certificate with AI
          </h2>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
            CertiDraft uses Gemini AI to instantly draft citations, pick templates, and format your certificates. Just describe what you need below.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">1</div>
            <div>
              <h4 className="font-bold text-slate-900">Describe</h4>
              <p className="text-xs text-slate-500 mt-1">Tell us who and what the certificate is for.</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-3 relative">
            <div className="hidden md:block absolute top-6 left-[-50%] w-full h-[2px] bg-indigo-100 -z-10" />
            <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">2</div>
            <div>
              <h4 className="font-bold text-slate-900">Customize</h4>
              <p className="text-xs text-slate-500 mt-1">Tweak the design and AI-generated citation.</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-3 relative">
            <div className="hidden md:block absolute top-6 left-[-50%] w-full h-[2px] bg-indigo-100 -z-10" />
            <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">3</div>
            <div>
              <h4 className="font-bold text-slate-900">Send</h4>
              <p className="text-xs text-slate-500 mt-1">Batch generate and email to recipients.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto w-full bg-white rounded-2xl p-4 shadow-xl shadow-indigo-900/5 border border-indigo-50">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your certificate... e.g. Award for completing Advanced React course, academic style, formal tone"
            className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-base placeholder:text-slate-400 min-h-[100px] p-2"
          />
          {error && <p className="text-red-500 text-sm mt-2 px-2">{error}</p>}
          <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 ml-2 uppercase tracking-wider">
              Powered by Gemini AI
            </span>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl shadow-md transition-all active:scale-95 h-11"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <>Generate with AI <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10 relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-indigo-100/50">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 tracking-tight">AI Quick Generate</h3>
            <p className="text-xs text-slate-500">Describe what you need, and Gemini will draft it instantly.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your certificate... e.g. Award for completing Advanced React course, academic style, formal tone"
            className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-slate-400 min-h-[80px] p-1"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all h-10"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <>Generate with AI <Sparkles className="ml-2 h-3.5 w-3.5" /></>
            )}
          </Button>
          
          <CreateProjectDialog
            trigger={
              <Button variant="outline" className="w-full sm:w-auto font-medium rounded-lg h-10">
                Start from scratch
              </Button>
            }
          />

          <div className="flex-1" />
          <span className="hidden sm:inline-flex text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 sm:mt-0">
            Powered by Gemini AI
          </span>
        </div>
      </div>
    </div>
  )
}
