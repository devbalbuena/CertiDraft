'use client'

import * as React from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Clock, AlertTriangle, Download, Eye } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type BatchStatus = 'pending' | 'processing' | 'completed' | 'completed_with_errors' | 'failed' | 'retrying'

interface BatchJobData {
  id: string
  status: BatchStatus
  processed_count: number
  total_count: number
  errors: any[]
  started_at: string | null
  completed_at: string | null
}

const TERMINAL_STATUSES: BatchStatus[] = ['completed', 'completed_with_errors', 'failed']

export default function BatchProgressPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = params.id
  const batchJobId = searchParams.get('batchJobId')

  const [jobData, setJobData] = React.useState<BatchJobData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const fetchStatus = React.useCallback(async () => {
    if (!batchJobId) return
    try {
      const res = await fetch(`/api/projects/${projectId}/batch/${batchJobId}/status`)
      if (!res.ok) throw new Error('Failed to fetch batch status')
      const data: BatchJobData = await res.json()
      setJobData(data)

      // Stop polling once we reach a terminal state
      if (TERMINAL_STATUSES.includes(data.status)) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    } catch (e: any) {
      setError(e.message)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [batchJobId, projectId])

  React.useEffect(() => {
    if (!batchJobId) {
      setError('No batch job ID provided.')
      return
    }
    fetchStatus() // Immediate first fetch
    intervalRef.current = setInterval(fetchStatus, 2000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchStatus, batchJobId])

  if (!batchJobId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No batch job ID specified.</div>
      </div>
    )
  }

  const progressPercent = jobData && jobData.total_count > 0
    ? Math.round((jobData.processed_count / jobData.total_count) * 100)
    : 0

  const isTerminal = jobData && TERMINAL_STATUSES.includes(jobData.status)
  const isCompleted = jobData?.status === 'completed' || jobData?.status === 'completed_with_errors'
  const isFailed = jobData?.status === 'failed'

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generating Certificates</h1>
        <p className="text-muted-foreground mt-1">
          Your certificates are being generated in the background. You can leave this page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Batch Job Progress</CardTitle>
            {jobData && <StatusBadge status={jobData.status} />}
          </div>
          {jobData && (
            <CardDescription>
              {jobData.processed_count} of {jobData.total_count} certificates processed
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          ) : !jobData ? (
            <div className="flex items-center gap-4 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Connecting to job...</span>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={progressPercent} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{progressPercent}% complete</span>
                  <span>{jobData.processed_count} / {jobData.total_count}</span>
                </div>
              </div>

              {/* Timestamps */}
              {jobData.started_at && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Started: {new Date(jobData.started_at).toLocaleTimeString()}
                  {jobData.completed_at && (
                    <> · Finished: {new Date(jobData.completed_at).toLocaleTimeString()}</>
                  )}
                </div>
              )}

              {/* Errors */}
              {jobData.errors && jobData.errors.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {jobData.errors.length} recipient(s) failed
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {jobData.errors.map((e: any, i) => (
                      <div key={i} className="text-xs text-yellow-600 dark:text-yellow-500 font-mono">
                        {typeof e === 'string' ? e : JSON.stringify(e)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion state */}
              {isTerminal && (
                <div className={`rounded-md p-4 ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-destructive/10 border border-destructive/30'}`}>
                  <div className={`flex items-center gap-2 font-medium text-sm ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {isCompleted
                      ? `Successfully generated ${jobData.processed_count - (jobData.errors?.length ?? 0)} certificate(s)${jobData.errors?.length ? ` (${jobData.errors.length} failed)` : ''}`
                      : 'The batch job encountered a fatal error and could not complete.'}
                  </div>
                </div>
              )}

              {/* Actions */}
              {isTerminal && (
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => router.push(`/dashboard/projects/${projectId}`)}>
                    Back to Project
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: BatchStatus }) {
  const variants: Record<BatchStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    processing: { variant: 'default', label: 'Processing' },
    retrying: { variant: 'secondary', label: 'Retrying' },
    completed: { variant: 'outline', label: 'Completed' },
    completed_with_errors: { variant: 'outline', label: 'Completed w/ Errors' },
    failed: { variant: 'destructive', label: 'Failed' },
  }
  const { variant, label } = variants[status]
  return <Badge variant={variant}>{label}</Badge>
}
