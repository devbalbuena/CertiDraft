'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ColumnMapperProps {
  columns: string[]
  onMap: (mapping: Record<string, string>) => void
}

const REQUIRED_FIELDS = [
  { key: 'recipient_name', label: 'Recipient Name', required: true },
  { key: 'achievement', label: 'Achievement / Course', required: true },
  { key: 'recipient_email', label: 'Recipient Email', required: false },
  { key: 'grade', label: 'Grade / Score', required: false },
  { key: 'issued_date', label: 'Issued Date', required: false },
]

export function ColumnMapper({ columns, onMap }: ColumnMapperProps) {
  const [mapping, setMapping] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState<string | null>(null)

  // Auto-guess columns on mount
  React.useEffect(() => {
    const initialMapping: Record<string, string> = {}
    
    REQUIRED_FIELDS.forEach(field => {
      // Very basic fuzzy match
      const match = columns.find(c => 
        c.toLowerCase().replace(/[^a-z0-9]/g, '').includes(field.key.replace('_', '')) ||
        field.key.replace('_', '').includes(c.toLowerCase().replace(/[^a-z0-9]/g, ''))
      )
      if (match) {
        initialMapping[field.key] = match
      }
    })
    
    setMapping(initialMapping)
  }, [columns])

  const handleSelect = (fieldKey: string, value: string) => {
    setError(null)
    setMapping(prev => {
      const next = { ...prev }
      if (value === 'skip') {
        delete next[fieldKey]
      } else {
        next[fieldKey] = value
      }
      return next
    })
  }

  const handleConfirm = () => {
    const missing = REQUIRED_FIELDS.filter(f => f.required && !mapping[f.key])
    
    if (missing.length > 0) {
      setError(`Please map the required fields: ${missing.map(m => m.label).join(', ')}`)
      return
    }

    onMap(mapping)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Map CSV Columns</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Match the columns from your uploaded CSV file to the standard CertiDraft fields used in your templates.
        </p>
      </div>

      <div className="grid gap-6 p-6 border rounded-xl bg-card">
        {REQUIRED_FIELDS.map((field) => (
          <div key={field.key} className="grid sm:grid-cols-[200px_1fr] items-center gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              <p className="text-xs text-muted-foreground">
                {field.required ? 'Required for generation' : 'Optional field'}
              </p>
            </div>
            
            <Select 
              value={mapping[field.key] || 'skip'} 
              onValueChange={(val) => handleSelect(field.key, val)}
            >
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Select column..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip" className="text-muted-foreground italic">
                  -- Skip this field --
                </SelectItem>
                {columns.map(col => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleConfirm} size="lg">
          Confirm Mapping
        </Button>
      </div>
    </div>
  )
}
