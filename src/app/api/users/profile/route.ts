import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const ProfileSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = ProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.issues }, { status: 400 })
    }

    const updates: any = {}
    if (result.data.full_name !== undefined) updates.full_name = result.data.full_name
    if (result.data.avatar_url !== undefined) updates.avatar_url = result.data.avatar_url

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No updates provided' })
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('Profile Update API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
