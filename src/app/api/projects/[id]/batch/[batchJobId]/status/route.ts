import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; batchJobId: string }> }
) {
  const { id: projectId, batchJobId } = await params

  // ── Auth ─────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Fetch Batch Job ───────────────────────────────────────────────────────
  const { data: job, error } = await supabase
    .from('batch_jobs')
    .select('id, status, processed_count, total_count, errors, started_at, completed_at, project_id')
    .eq('id', batchJobId)
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()

  if (error || !job) {
    return NextResponse.json({ error: 'Batch job not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    processed_count: job.processed_count,
    total_count: job.total_count,
    errors: job.errors ?? [],
    started_at: job.started_at,
    completed_at: job.completed_at,
  })
}
