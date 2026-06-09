import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendCertificateEmail } from '@/lib/email/sendgrid'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: certificateId } = await params
    const supabase = await createClient()

    // ── Auth ─────────────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Fetch Certificate ───────────────────────────────────────────────────
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select('*, projects(name)')
      .eq('id', certificateId)
      .eq('user_id', user.id)
      .single()

    if (certError || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    if (!certificate.recipient_email) {
      return NextResponse.json({ error: 'No email address on file for this recipient.' }, { status: 400 })
    }

    // ── Rate Limiting (24 hours) ────────────────────────────────────────────
    if (certificate.last_email_sent_at) {
      const lastSent = new Date(certificate.last_email_sent_at).getTime()
      const now = Date.now()
      const hoursSinceLastSent = (now - lastSent) / (1000 * 60 * 60)
      
      if (hoursSinceLastSent < 24) {
        return NextResponse.json({ 
          error: 'An email was already sent for this certificate recently. Please wait 24 hours before sending another.' 
        }, { status: 429 })
      }
    }

    // ── Build URLs ──────────────────────────────────────────────────────────
    const verificationUrl = `${SITE_URL}/verify/${certificate.verification_token}`
    
    let downloadUrl = ''
    if (certificate.storage_bucket && certificate.storage_path) {
      const { data: urlData } = supabaseAdmin.storage
        .from(certificate.storage_bucket)
        .getPublicUrl(certificate.storage_path)
      downloadUrl = urlData?.publicUrl ?? ''
    }

    const projectName = (certificate.projects as { name: string } | null)?.name

    // ── Send Email ──────────────────────────────────────────────────────────
    await sendCertificateEmail(
      certificate.recipient_email,
      certificate.recipient_name,
      certificate.achievement,
      verificationUrl,
      downloadUrl,
      projectName
    )

    // ── Update timestamp ────────────────────────────────────────────────────
    await supabaseAdmin
      .from('certificates')
      .update({ last_email_sent_at: new Date().toISOString() })
      .eq('id', certificateId)

    return NextResponse.json({ success: true, message: 'Email sent successfully.' })
  } catch (error: any) {
    console.error('Error in email API route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
