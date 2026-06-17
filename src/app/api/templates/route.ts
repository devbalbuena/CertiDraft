import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['Corporate', 'Academic', 'Sports', 'Recognition', 'Other']),
  description: z.string().optional(),
  accent_color: z.string().min(1, 'Accent color is required'),
  secondary_color: z.string().min(1, 'Secondary color is required'),
  style: z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('templates')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (user) {
    // Authenticated: system templates + user's own + public ones
    query = query.or(`creator_id.is.null,creator_id.eq.${user.id},is_public.eq.true`)
  } else {
    // Unauthenticated: system templates + public ones
    query = query.or(`creator_id.is.null,is_public.eq.true`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = templateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('templates')
    .insert({
      ...parsed.data,
      creator_id: user.id,
      is_public: false,
      is_featured: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
