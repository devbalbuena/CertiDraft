'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CSVUploader } from '@/components/uploads/CSVUploader'
import { ColumnMapper } from '@/components/uploads/ColumnMapper'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // React.use() wrapper not strictly necessary for simple async params but good practice in Next 16
  const { id } = React.use(params)

  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  
  // Data state
  const [csvData, setCsvData] = React.useState<any[]>([])
  const [columns, setColumns] = React.useState<string[]>([])
  const [mapping, setMapping] = React.useState<Record<string, string>>({})
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleCsvUpload = (data: any[], cols: string[]) => {
    setCsvData(data)
    setColumns(cols)
    setStep(2)
  }

  const handleMapping = (mapped: Record<string, string>) => {
    setMapping(mapped)
    setStep(3)
  }

  const startGeneration = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${id}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv_data: csvData,
          column_mapping: mapping
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to start generation')
      }

      toast.success('Batch generation started successfully!')
      router.push(`/dashboard/projects/${id}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/projects/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Recipients</h1>
          <p className="text-muted-foreground">Upload your CSV and map fields to generate certificates.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold ${
              step === s 
                ? 'border-primary bg-primary text-primary-foreground' 
                : step > s 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-muted text-muted-foreground'
            }`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span className={`text-sm font-medium ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s === 1 ? 'Upload CSV' : s === 2 ? 'Map Columns' : 'Confirm'}
            </span>
            {s < 3 && <div className={`h-0.5 w-16 sm:w-32 mx-4 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <CSVUploader onUpload={handleCsvUpload} />
          )}

          {step === 2 && (
            <div className="space-y-6">
              <ColumnMapper columns={columns} onMap={handleMapping} />
              <div className="flex justify-start">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back to Upload
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Ready to Generate</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You are about to generate {csvData.length} certificates. Please review the mapped data preview below.
                </p>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(mapping).map((certField) => (
                        <TableHead key={certField} className="font-semibold capitalize">
                          {certField.replace('_', ' ')}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 3).map((row, i) => (
                      <TableRow key={i}>
                        {Object.entries(mapping).map(([certField, csvCol]) => (
                          <TableCell key={certField}>
                            {row[csvCol] || <span className="text-muted-foreground italic">empty</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Showing preview of first 3 rows
              </p>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting}>
                  Back to Mapping
                </Button>
                <Button size="lg" onClick={startGeneration} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Job...
                    </>
                  ) : (
                    'Start Generation'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
