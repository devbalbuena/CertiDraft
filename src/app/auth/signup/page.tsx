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
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupFormValues = z.infer<typeof schema>

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: SignupFormValues) {
    setServerError(null)
    setSuccessMessage(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        // Passed through to raw_user_meta_data so the database trigger
        // can populate public.users.full_name automatically.
        data: {
          full_name: values.fullName,
        },
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    setSuccessMessage(
      "We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account."
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
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Start issuing certificates in minutes — no credit card required
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
                id="signup-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                {/* Full name */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-fullname">Full name</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
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

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Server error */}
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
                form="signup-form"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{' '}
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
