'use client'

import * as React from 'react'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
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
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt'

interface CitationGeneratorProps {
  onAccept: (citation: string) => void
  currentPlan: string
}

export function CitationGenerator({ onAccept, currentPlan }: CitationGeneratorProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isForbidden, setIsForbidden] = React.useState(false)
  const [generatedCitation, setGeneratedCitation] = React.useState<string | null>(null)

  // Form state
  const [recipientName, setRecipientName] = React.useState('')
  const [achievement, setAchievement] = React.useState('')
  const [eventType, setEventType] = React.useState('')
  const [organizationName, setOrganizationName] = React.useState('')
  const [tone, setTone] = React.useState('formal')

  const handleGenerate = async () => {
    if (!recipientName || !achievement || !eventType) {
      setError('Please fill in the required fields (Name, Achievement, Event Type).')
      return
    }

    setIsGenerating(true)
    setError(null)
    setIsForbidden(false)

    try {
      const res = await fetch('/api/ai/citation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          achievement,
          eventType,
          organizationName,
          tone,
        }),
      })

      if (res.status === 403) {
        setIsForbidden(true)
        return
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate citation')
      }

      setGeneratedCitation(data.citation)
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isForbidden) {
    return <UpgradePrompt feature="AI Citation Generation" currentPlan={currentPlan} />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Recipient Name (Example) <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="e.g. Jane Doe" 
            value={recipientName} 
            onChange={(e) => setRecipientName(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label>Achievement <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="e.g. Advanced Leadership Training" 
            value={achievement} 
            onChange={(e) => setAchievement(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label>Event Type <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="e.g. Workshop, Course, Summit" 
            value={eventType} 
            onChange={(e) => setEventType(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label>Organization Name</Label>
          <Input 
            placeholder="e.g. CertiDraft Institute" 
            value={organizationName} 
            onChange={(e) => setOrganizationName(e.target.value)} 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal & Professional</SelectItem>
              <SelectItem value="warm">Warm & Appreciative</SelectItem>
              <SelectItem value="inspiring">Inspiring & Motivational</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex justify-start">
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {generatedCitation ? 'Regenerate Citation' : 'Generate with AI'}
        </Button>
      </div>

      {generatedCitation && (
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Generated Citation</Label>
            <Textarea 
              readOnly 
              value={generatedCitation} 
              className="min-h-[100px] resize-none" 
            />
          </div>
          <Button variant="secondary" onClick={() => onAccept(generatedCitation)}>
            Use this citation
          </Button>
        </div>
      )}
    </div>
  )
}
