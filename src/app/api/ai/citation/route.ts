import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateCitation } from '@/lib/gemini'
import { canUseFeature } from '@/lib/subscriptions'

const CitationSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  achievement: z.string().min(1, 'Achievement is required'),
  eventType: z.string().min(1, 'Event type is required'),
  organizationName: z.string().optional(),
  tone: z.enum(['formal', 'warm', 'inspiring']).default('formal'),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription plan
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan || 'free'
    if (!canUseFeature(plan, 'ai_citations')) {
      return NextResponse.json(
        { error: 'AI citations are available on Pro and Enterprise plans. Please upgrade to continue.' },
        { status: 403 }
      )
    }

    // Validate payload
    const body = await req.json()
    const result = CitationSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.issues }, { status: 400 })
    }

    const { recipientName, achievement, eventType, organizationName, tone } = result.data

    // Generate citation
    const citation = await generateCitation(recipientName, achievement, eventType, organizationName, tone)

    return NextResponse.json({ citation })
  } catch (error: any) {
    console.error('Citation API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
