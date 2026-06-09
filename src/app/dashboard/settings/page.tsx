'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle } from 'lucide-react'

// Schema
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

const walletSchema = z.object({
  wallet_slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.').min(3, 'At least 3 characters').max(50, 'Max 50 characters'),
  wallet_title: z.string().max(100).optional(),
  wallet_is_public: z.boolean(),
})

export default function SettingsPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState(true)
  const [userEmail, setUserEmail] = React.useState('')

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '' }
  })

  const walletForm = useForm<z.infer<typeof walletSchema>>({
    resolver: zodResolver(walletSchema),
    defaultValues: { wallet_slug: '', wallet_title: '', wallet_is_public: false }
  })

  React.useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
        if (profile) {
          profileForm.reset({ full_name: profile.full_name || '' })
          walletForm.reset({
            wallet_slug: profile.wallet_slug || '',
            wallet_title: profile.wallet_title || '',
            wallet_is_public: profile.wallet_is_public || false
          })
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const onWalletSubmit = async (values: z.infer<typeof walletSchema>) => {
    try {
      const res = await fetch('/api/users/wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Wallet settings updated successfully')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <PageHeader title="Settings" subtitle="Manage your account profile and public wallet." />

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={userEmail} disabled />
              <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input {...profileForm.register('full_name')} />
              {profileForm.formState.errors.full_name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Wallet Section */}
      <Card>
        <CardHeader>
          <CardTitle>Public Wallet</CardTitle>
          <CardDescription>Configure how your certificates are displayed publicly.</CardDescription>
        </CardHeader>
        <form onSubmit={walletForm.handleSubmit(onWalletSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="space-y-0.5">
                <Label>Public Visibility</Label>
                <p className="text-sm text-muted-foreground">Allow others to view your certificate wallet.</p>
              </div>
              <Switch 
                checked={walletForm.watch('wallet_is_public')}
                onCheckedChange={(val) => walletForm.setValue('wallet_is_public', val, { shouldDirty: true })}
              />
            </div>

            <div className="space-y-2">
              <Label>Wallet Slug</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  certidraft.com/wallet/
                </span>
                <Input className="rounded-l-none" {...walletForm.register('wallet_slug')} />
              </div>
              {walletForm.formState.errors.wallet_slug && (
                <p className="text-sm text-destructive">{walletForm.formState.errors.wallet_slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Wallet Title</Label>
              <Input placeholder="e.g. My Professional Portfolio" {...walletForm.register('wallet_title')} />
              <p className="text-xs text-muted-foreground">Displayed at the top of your public wallet page. Defaults to your name if empty.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={walletForm.formState.isSubmitting}>
              {walletForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Wallet Settings
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive" onClick={() => toast.error('Account deletion must be processed through support currently.')}>
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
