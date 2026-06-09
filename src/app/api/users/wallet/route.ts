import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const WalletSchema = z.object({
  wallet_slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.').min(3).max(50).optional(),
  wallet_title: z.string().max(100).optional(),
  wallet_is_public: z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = WalletSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.issues }, { status: 400 })
    }

    const updates: any = {}
    if (result.data.wallet_slug !== undefined) updates.wallet_slug = result.data.wallet_slug
    if (result.data.wallet_title !== undefined) updates.wallet_title = result.data.wallet_title
    if (result.data.wallet_is_public !== undefined) updates.wallet_is_public = result.data.wallet_is_public

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No updates provided' })
    }

    // Check slug uniqueness if it's being updated
    if (updates.wallet_slug) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_slug', updates.wallet_slug)
        .neq('id', user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: 'This wallet slug is already taken. Please choose another.' }, { status: 409 })
      }
      
      // PGRST116 means zero rows returned (which is good, slug is unique)
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
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
    console.error('Wallet Update API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
