import { CheckCircle2, XCircle, Award, Download } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Public page — no auth required. Service role queries the certificates table by token.
export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: certificate, error } = await supabaseAdmin
    .from('certificates')
    .select('id, recipient_name, recipient_email, achievement, grade, issued_at, template_name, storage_bucket, storage_path, verification_token')
    .eq('verification_token', token)
    .single()

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-destructive/10 rounded-full">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-xl font-bold">Certificate Not Found</h1>
            <p className="text-muted-foreground text-sm">
              We could not find a certificate matching this verification link.
              Please check that the URL is correct, or contact the issuer.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Build the public download URL from Supabase Storage
  let downloadUrl: string | null = null
  if (certificate.storage_bucket && certificate.storage_path) {
    const { data: urlData } = supabaseAdmin.storage
      .from(certificate.storage_bucket)
      .getPublicUrl(certificate.storage_path)
    downloadUrl = urlData?.publicUrl ?? null
  }

  const formattedDate = certificate.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/30 to-background p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-green-700 dark:text-green-400">
            Certificate Verified
          </h1>
          <p className="text-sm text-muted-foreground">
            This certificate is authentic and was issued by CertiDraft.
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="text-center py-4 bg-muted/40 rounded-lg">
            <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recipient</p>
            <p className="text-2xl font-bold">{certificate.recipient_name}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <InfoRow label="Achievement" value={certificate.achievement} />
            {certificate.grade && <InfoRow label="Grade / Score" value={certificate.grade} />}
            {formattedDate && <InfoRow label="Issued On" value={formattedDate} />}
            {certificate.template_name && <InfoRow label="Template" value={certificate.template_name} />}
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-xs text-center text-muted-foreground">
              Verification ID:{' '}
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                {certificate.verification_token}
              </code>
            </p>

            {downloadUrl && (
              <div className="flex justify-center">
                <Button asChild>
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate (PDF)
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
