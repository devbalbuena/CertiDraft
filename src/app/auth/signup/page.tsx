'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
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
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      {/* Left Side: Form Area */}
      <div className="flex-1 flex flex-col relative z-10 shadow-2xl lg:shadow-none bg-white">
        {/* Header */}
        <div className="p-6 md:p-10 flex items-center">
          <Link href="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md">
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CertiDraft</span>
          </Link>
        </div>
        
        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-[380px] space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
              <p className="text-sm text-slate-500">Start issuing certificates in minutes — no credit card required.</p>
            </div>

            {successMessage ? (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800 shadow-sm"
              >
                <h3 className="font-semibold text-base mb-2">Check your email</h3>
                <p>{successMessage}</p>
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Return to Sign In</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <form
                  id="signup-form"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-5"
                >
                  {/* Full name */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="signup-fullname" className="text-sm font-semibold text-slate-700">Full name</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Jane Smith"
                      autoComplete="name"
                      aria-invalid={!!errors.fullName}
                      className="h-11 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
                      {...register('fullName')}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive mt-1" role="alert">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      className="h-11 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      className="h-11 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive mt-1" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3" role="alert">
                      {serverError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base transition-colors shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-slate-500 font-medium tracking-wide">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="currentColor"><path d="M10 0H0v10h10V0z" fill="#f25022"/><path d="M21 0H11v10h10V0z" fill="#7fba00"/><path d="M10 11H0v10h10V11z" fill="#00a4ef"/><path d="M21 11H11v10h10V11z" fill="#ffb900"/></svg>
                    Microsoft
                  </Button>
                </div>

                <p className="text-sm text-slate-500 text-center pt-4">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors outline-none focus-visible:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Brand/Context Area */}
      <div className="hidden lg:flex flex-1 flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex-1 flex flex-col justify-center items-center p-12 relative z-10">
          {/* Abstract Dashboard Mockup Placeholder */}
          <div className="w-full max-w-lg mb-12 transform hover:-translate-y-2 transition-transform duration-500 ease-out">
            <div className="aspect-[4/3] bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm p-2 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30 pointer-events-none"></div>
              
              {/* Inner UI mock */}
              <div className="w-full h-full border border-white/10 rounded-xl flex flex-col overflow-hidden bg-slate-900/60 shadow-inner">
                {/* Window Controls */}
                <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-slate-900/40">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                {/* UI Content */}
                <div className="flex-1 p-6 flex flex-col gap-6">
                  {/* Header mock */}
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-1/3 bg-white/10 rounded-md"></div>
                    <div className="h-8 w-8 bg-blue-500/20 rounded-full"></div>
                  </div>
                  {/* Stats Row mock */}
                  <div className="flex gap-4">
                    <div className="h-24 w-1/3 bg-blue-500/20 rounded-xl border border-blue-500/30"></div>
                    <div className="h-24 w-1/3 bg-white/5 rounded-xl border border-white/10"></div>
                    <div className="h-24 w-1/3 bg-white/5 rounded-xl border border-white/10"></div>
                  </div>
                  {/* List mock */}
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
                     <div className="h-4 w-full bg-white/5 rounded"></div>
                     <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                     <div className="h-4 w-4/6 bg-white/5 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg text-white space-y-3 px-2">
            <h2 className="text-3xl font-bold font-sans tracking-tight">Scale your credibility with automated credentials.</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Join thousands of organizations using CertiDraft to create beautiful, cryptographically verifiable certificates in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
