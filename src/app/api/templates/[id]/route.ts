import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ── PATCH /api/templates/[id] — rename a template ────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = z.object({ name: z.string().min(1).max(100) }).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Name is required (max 100 chars).' }, { status: 400 })
  }

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('templates')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  if (existing.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('templates')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select('id, name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
