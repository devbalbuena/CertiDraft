import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// ── Validation schema ──────────────────────────────────────────────────────────
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  event_type: z.string().min(1, 'Event type is required'),
  description: z.string().optional(),
  template_id: z.string().uuid().optional(),
})

// ── GET /api/projects ──────────────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// ── POST /api/projects ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, event_type, description, template_id } = parsed.data

  let elements: string | null = null

  if (template_id) {
    // 1. Fetch template
    const { data: template } = await supabase
      .from('templates')
      .select('creator_id, price, canvas_state')
      .eq('id', template_id)
      .single()

    if (template) {
      // 2. Check if premium
      if (template.price && template.price > 0 && template.creator_id !== user.id) {
        // Need to check if user purchased it
        const { data: purchase } = await supabaseAdmin
          .from('template_purchases')
          .select('id')
          .eq('buyer_id', user.id)
          .eq('template_id', template_id)
          .maybeSingle()

        if (!purchase) {
          return NextResponse.json(
            { error: 'Premium template requires purchase before use.' },
            { status: 402 }
          )
        }
      }
      
      elements = template.canvas_state
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      event_type,
      description: description ?? null,
      status: 'draft',
      template_id,
      elements,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
