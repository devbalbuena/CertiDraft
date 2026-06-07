'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    // Attach the error to the confirmPassword field so it appears inline.
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof schema>

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    router.push('/auth/login')
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
            <CardTitle>Choose a new password</CardTitle>
            <CardDescription>
              Your new password must be at least 8 characters
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="reset-password-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* New password */}
              <div className="space-y-1.5">
                <Label htmlFor="reset-password">New password</Label>
                <Input
                  id="reset-password"
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

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="reset-confirm-password">Confirm new password</Label>
                <Input
                  id="reset-confirm-password"
                  type="password"
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.confirmPassword.message}
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
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              form="reset-password-form"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving…' : 'Save new password'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
