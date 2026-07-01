import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const publishSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  name: z.string().min(1, 'Template name is required').max(100),
  category: z.enum(['Corporate', 'Academic', 'Sports', 'Recognition', 'Other']),
  description: z.string().max(300).optional(),
  price: z.number().int().min(0).max(500).default(0),
})

// ── POST /api/templates/publish ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = publishSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { project_id, name, category, description, price } = parsed.data

  // 1. Fetch the project canvas state & verify ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, user_id, elements, template_id')
    .eq('id', project_id)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!project.elements) {
    return NextResponse.json(
      { error: 'Project has no canvas content. Please design your certificate before publishing.' },
      { status: 400 }
    )
  }

  // 2. Fetch the accent/secondary colors from the base template (if any)
  let accent_color = '#6366f1'
  let secondary_color = '#111827'

  if (project.template_id) {
    const { data: baseTemplate } = await supabase
      .from('templates')
      .select('accent_color, secondary_color')
      .eq('id', project.template_id)
      .single()

    if (baseTemplate) {
      accent_color = baseTemplate.accent_color
      secondary_color = baseTemplate.secondary_color
    }
  }

  // 3. Get the creator's display name from user metadata
  const creatorName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Unknown Creator'

  // 4. Insert the new community template
  const { data: template, error: insertError } = await supabase
    .from('templates')
    .insert({
      name,
      category,
      description: description ?? null,
      accent_color,
      secondary_color,
      style: 'Community',
      is_public: true,
      is_featured: false,
      creator_id: user.id,
      creator_name: creatorName,
      price: price ?? 0,
      canvas_state: typeof project.elements === 'string'
        ? project.elements
        : JSON.stringify(project.elements),
    })
    .select('id')
    .single()

  if (insertError || !template) {
    console.error('Template insert error:', insertError)
    return NextResponse.json({ error: 'Failed to publish template' }, { status: 500 })
  }

  return NextResponse.json({ templateId: template.id, creatorName }, { status: 201 })
}
