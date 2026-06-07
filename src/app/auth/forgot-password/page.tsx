'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof schema>

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null)
    setSuccessMessage(null)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    setSuccessMessage(
      "If that email is registered, you'll receive a password reset link shortly. Check your inbox and spam folder."
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Wordmark */}
        <div className="text-center">
          <span className="text-2xl font-semibold tracking-tight">CertiDraft</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            {successMessage ? (
              <div
                role="status"
                className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground"
              >
                {successMessage}
              </div>
            ) : (
              <form
                id="forgot-password-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p className="text-sm text-destructive" role="alert">
                    {serverError}
                  </p>
                )}
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {!successMessage && (
              <Button
                type="submit"
                form="forgot-password-form"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending link…' : 'Send reset link'}
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="text-foreground hover:underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
