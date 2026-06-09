import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCertificateQueue } from '@/lib/queue'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  // ── Auth ─────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Validate Project Ownership ────────────────────────────────────────────
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, elements, user_id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (!project.elements) {
    return NextResponse.json(
      { error: 'Please save a certificate design before generating.' },
      { status: 400 }
    )
  }

  // ── Validate Request Body ─────────────────────────────────────────────────
  let csv_data: any[]
  let column_mapping: Record<string, string>
  let default_citation_text: string | undefined

  try {
    const body = await req.json()
    csv_data = body.csv_data
    column_mapping = body.column_mapping
    default_citation_text = body.default_citation_text

    if (!Array.isArray(csv_data) || csv_data.length === 0) {
      throw new Error('csv_data must be a non-empty array')
    }
    if (!column_mapping || typeof column_mapping !== 'object') {
      throw new Error('column_mapping must be an object')
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid request body' }, { status: 400 })
  }

  // ── Create Batch Job in Database ──────────────────────────────────────────
  const { data: batchJob, error: insertError } = await supabase
    .from('batch_jobs')
    .insert({
      project_id: projectId,
      user_id: user.id,
      status: 'pending',
      csv_data,
      column_mapping,
      design_snapshot: project.elements,
      total_count: csv_data.length,
      processed_count: 0,
    })
    .select('id')
    .single()

  if (insertError || !batchJob) {
    console.error('Batch job insert error:', insertError)
    return NextResponse.json({ error: 'Failed to create batch job' }, { status: 500 })
  }

  // ── Update Project Status to Active ───────────────────────────────────────
  await supabase
    .from('projects')
    .update({ status: 'active' })
    .eq('id', projectId)

  // ── Enqueue the Job ───────────────────────────────────────────────────────
  try {
    const queue = getCertificateQueue()
    await queue.add(batchJob.id, { 
      batchJobId: batchJob.id,
      defaultCitationText: default_citation_text
    })
  } catch (e: any) {
    console.error('Failed to add job to queue:', e)
    // Don't fail the whole request — the job exists in the DB and can be retried
  }

  return NextResponse.json({ batchJobId: batchJob.id }, { status: 202 })
}
