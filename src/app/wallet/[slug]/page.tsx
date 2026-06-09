import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Award, Download, CheckCircle2, Lock } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('full_name, wallet_title, wallet_is_public')
    .eq('wallet_slug', slug)
    .single()

  if (!user || !user.wallet_is_public) {
    return { title: 'Wallet Not Found - CertiDraft' }
  }

  const title = user.wallet_title || user.full_name || 'Certificate Portfolio'
  
  return {
    title: `${title} - CertiDraft Wallet`,
    description: `View verified certificates and achievements for ${title}.`,
    openGraph: {
      title: `${title} - CertiDraft Wallet`,
      description: `View verified certificates and achievements for ${title}.`,
      type: 'profile',
    }
  }
}

export default async function WalletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 1. Fetch user by slug (must be public)
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, full_name, wallet_title, wallet_is_public')
    .eq('wallet_slug', slug)
    .single()

  if (userError || !user) {
    notFound()
  }

  if (!user.wallet_is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12 space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold">This wallet is private</h1>
            <p className="text-sm text-muted-foreground">
              The owner has chosen to keep their certificate portfolio private.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 2. Fetch all certificates for this user
  const { data: certificates } = await supabaseAdmin
    .from('certificates')
    .select('id, achievement, issued_at, verification_token, storage_bucket, storage_path')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('issued_at', { ascending: false })

  const title = user.wallet_title || user.full_name || 'Certificate Portfolio'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">Verified Certificate Portfolio</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Achievements</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {certificates?.length || 0} Total
          </span>
        </div>

        {!certificates || certificates.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Award className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No certificates yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This wallet doesn't have any public certificates right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => {
              let downloadUrl = ''
              if (cert.storage_bucket && cert.storage_path) {
                const { data } = supabaseAdmin.storage
                  .from(cert.storage_bucket)
                  .getPublicUrl(cert.storage_path)
                downloadUrl = data.publicUrl
              }

              const date = cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'Unknown Date'

              return (
                <Card key={cert.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base leading-snug line-clamp-2">
                      {cert.achievement}
                    </CardTitle>
                    <CardDescription>{date}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/verify/${cert.verification_token}`}>
                        Verify
                      </Link>
                    </Button>
                    {downloadUrl && (
                      <Button variant="secondary" size="sm" className="flex-1" asChild>
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-3.5 w-3.5" /> PDF
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
