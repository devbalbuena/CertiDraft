/**
 * Email delivery via Resend.
 *
 * The filename is intentionally kept as sendgrid.ts so that all existing
 * import paths in the codebase continue to work without any changes.
 *
 * Required env var: RESEND_API_KEY
 */
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY

// Use onboarding@resend.dev for local dev / unverified domains.
// Swap this for your own verified domain address in production.
const FROM_EMAIL = 'CertiDraft <onboarding@resend.dev>'

let resend: Resend | null = null

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY)
} else {
  console.warn('⚠️  RESEND_API_KEY is not set. Emails will not be sent.')
}

export async function sendCertificateEmail(
  recipientEmail: string,
  recipientName: string,
  achievement: string,
  verificationUrl: string,
  downloadUrl: string,
  issuerName?: string
) {
  if (!resend) {
    console.warn(`[email] Skipping — no Resend client. Would have sent to ${recipientEmail} for "${achievement}".`)
    return
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #10b981; text-align: center;">Congratulations, ${recipientName}!</h1>
      <p style="font-size: 16px;">
        Your certificate for <strong>${achievement}</strong> is ready.
        ${issuerName ? `This certificate was proudly issued by <strong>${issuerName}</strong>.` : ''}
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a
          href="${downloadUrl}"
          style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;"
        >
          Download Your Certificate
        </a>
      </div>

      <p style="font-size: 14px; color: #666;">
        You can verify the authenticity of this certificate at any time:
        <br />
        <a href="${verificationUrl}" style="color: #3b82f6;">${verificationUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />

      <p style="font-size: 12px; color: #999; text-align: center;">
        Powered by CertiDraft<br />
        The modern certificate generation platform.
      </p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Your Certificate is Ready — ${achievement}`,
      html,
    })

    if (error) {
      console.error('[email] Resend API error:', error)
    } else {
      console.log(`[email] Sent successfully to ${recipientEmail}`)
    }
  } catch (err) {
    // Don't throw — a failed email must never crash the certificate worker.
    console.error('[email] Unexpected error sending via Resend:', err)
  }
}
