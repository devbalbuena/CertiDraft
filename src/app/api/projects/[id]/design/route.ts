import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── PATCH /api/projects/[id]/design ──────────────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: { elements?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.elements || typeof body.elements !== 'string') {
    return NextResponse.json({ error: '`elements` field (string) is required' }, { status: 400 })
  }

  // Verify the project exists and belongs to this user
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (fetchError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update elements (stored as text / JSONB in Supabase)
  const { data: updated, error: updateError } = await supabase
    .from('projects')
    .update({ elements: body.elements, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
