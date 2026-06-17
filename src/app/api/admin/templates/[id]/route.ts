import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['Corporate', 'Academic', 'Sports', 'Recognition', 'Other']).optional(),
  description: z.string().optional(),
  accent_color: z.string().optional(),
  secondary_color: z.string().optional(),
  style: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('templates')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
