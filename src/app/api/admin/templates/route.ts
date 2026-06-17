import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['Corporate', 'Academic', 'Sports', 'Recognition', 'Other']).optional(),
  description: z.string().optional(),
  accent_color: z.string().optional(),
  secondary_color: z.string().optional(),
  style: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
  creator_id: z.string().nullable().optional(),
})

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('templates')
    .select('*, users(email)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = templateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('templates')
    .insert({
      ...parsed.data,
      creator_id: null, // System template
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
