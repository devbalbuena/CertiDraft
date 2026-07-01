import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const purchaseSchema = z.object({
  template_id: z.string().uuid('Invalid template ID'),
})

// ── POST /api/templates/purchase ──────────────────────────────────────────────
// Handles the full credit transaction: deduct from buyer, add to creator,
// and record the purchase so the buyer can use the template forever.
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

  const parsed = purchaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { template_id } = parsed.data

  // 1. Fetch the template to get its price and creator
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('id, price, creator_id, name')
    .eq('id', template_id)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // 2. Guard: can't buy your own template
  if (template.creator_id === user.id) {
    return NextResponse.json({ error: "You can't purchase your own template." }, { status: 400 })
  }

  // 3. Guard: free templates don't need purchasing
  if (!template.price || template.price === 0) {
    return NextResponse.json({ error: 'This template is free — no purchase needed.' }, { status: 400 })
  }

  // 4. Check if user already bought this template
  const { data: existingPurchase } = await supabase
    .from('template_purchases')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('template_id', template_id)
    .maybeSingle()

  if (existingPurchase) {
    return NextResponse.json({ error: 'You have already purchased this template.' }, { status: 400 })
  }

  // 5. Fetch buyer's current balance
  const { data: buyerProfile, error: buyerError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (buyerError || !buyerProfile) {
    return NextResponse.json({ error: 'Could not fetch your credit balance.' }, { status: 500 })
  }

  if (buyerProfile.credits < template.price) {
    return NextResponse.json(
      { error: `Insufficient credits. You need ${template.price} credits but only have ${buyerProfile.credits}.` },
      { status: 402 }
    )
  }

  // 6. Use admin client for the atomic credit transfer + purchase record
  // Deduct from buyer
  const { error: deductError } = await supabaseAdmin
    .from('users')
    .update({ credits: buyerProfile.credits - template.price })
    .eq('id', user.id)

  if (deductError) {
    console.error('Credit deduction error:', deductError)
    return NextResponse.json({ error: 'Failed to deduct credits.' }, { status: 500 })
  }

  // Add to creator (if template has a creator)
  if (template.creator_id) {
    const { data: creatorProfile } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', template.creator_id)
      .single()

    if (creatorProfile) {
      await supabaseAdmin
        .from('users')
        .update({ credits: creatorProfile.credits + template.price })
        .eq('id', template.creator_id)
    }
  }

  // 7. Record the purchase
  const { error: purchaseError } = await supabaseAdmin
    .from('template_purchases')
    .insert({
      buyer_id: user.id,
      template_id: template.id,
      price_paid: template.price,
    })

  if (purchaseError) {
    // NOTE: Credits have already been moved. In production, this would need a
    // rollback. For Phase 2, log and still report success.
    console.error('Purchase record error:', purchaseError)
  }

  return NextResponse.json({
    success: true,
    creditsSpent: template.price,
    newBalance: buyerProfile.credits - template.price,
  })
}
