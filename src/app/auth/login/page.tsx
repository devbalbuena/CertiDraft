'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Quote, ChevronRight, Award } from 'lucide-react'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof schema>

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="h-screen w-full flex bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* ── 1. Slim Sidebar (Hidden on Mobile) ──────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between items-center w-28 bg-[#0a1526] py-8 z-30 shadow-2xl flex-shrink-0">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1">
          <div className="h-10 w-10 bg-white rounded flex items-center justify-center transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#0a1526]"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">CertiDraft</span>
        </Link>

        {/* Social Icons */}
        <div className="flex flex-col gap-4">
          <a href="#" className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#0a1526] hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="#" className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#0a1526] hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          </a>
          <a href="#" className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#0a1526] hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
        </div>
      </div>

      {/* ── 2. Form Area ────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[480px] lg:w-[500px] flex-shrink-0 z-20 bg-white shadow-2xl h-full overflow-y-auto relative">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden p-6 flex items-center border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md">
            <div className="h-8 w-8 bg-[#0a1526] rounded flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CertiDraft</span>
          </Link>
        </div>

        <div className="flex flex-col justify-center min-h-full p-8 sm:p-12 md:p-16">
          <div className="w-full max-w-[360px] mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0a1526]">Sign In</h1>
              <p className="text-slate-600 text-[15px] font-medium">Welcome back to CertiDraft.</p>
            </div>

            <form
              id="login-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-6 pt-2"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm font-semibold text-[#0a1526]">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className="h-12 pl-10 border-2 border-slate-800 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-blue-600 shadow-sm transition-colors text-base"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1 font-medium" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-sm font-semibold text-[#0a1526]">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    className="h-12 pl-10 border-2 border-slate-800 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-blue-600 shadow-sm transition-colors text-base"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1 font-medium" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 font-medium" role="alert">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#122c54] hover:bg-[#0a1526] text-white font-bold text-base transition-colors rounded-lg shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <div className="flex flex-col items-center gap-3 pt-2">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-slate-600 hover:text-[#0a1526] transition-colors underline decoration-slate-300 underline-offset-4"
              >
                Forgot Password?
              </Link>
              <div className="text-sm font-medium text-slate-600">
                New to CertiDraft?{' '}
                <Link
                  href="/auth/signup"
                  className="font-bold text-[#0a1526] hover:text-blue-700 transition-colors underline decoration-slate-300 underline-offset-4"
                >
                  Create an Account.
                </Link>
              </div>
            </div>

            {/* Social Logins Retained per user request */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-slate-500 font-medium tracking-wide">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="h-11 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </Button>
              <Button type="button" variant="outline" className="h-11 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="currentColor"><path d="M10 0H0v10h10V0z" fill="#f25022"/><path d="M21 0H11v10h10V0z" fill="#7fba00"/><path d="M10 11H0v10h10V11z" fill="#00a4ef"/><path d="M21 11H11v10h10V11z" fill="#ffb900"/></svg>
                Microsoft
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* ── 3. Showcase Area (Hidden on Mobile) ─────────────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#9dcbf8] to-[#bde0fe] relative z-10 items-center justify-between pl-0 pr-16 py-12">
        
        {/* Floating Certificates Showcase */}
        <div className="relative w-1/2 h-full flex items-center justify-center -ml-8 perspective-[1200px]">
          
          {/* Back Card - Dark */}
          <div className="absolute w-[280px] aspect-[1.4] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 transform rotate-y-[-20deg] rotate-z-[-6deg] translate-x-[-60px] translate-y-[-40px] opacity-70 flex flex-col items-center justify-center p-6">
            <div className="w-10 h-10 rounded-full bg-slate-800 mb-2 border border-slate-700"></div>
            <div className="w-32 h-2 bg-slate-800 rounded-full mb-2"></div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full mb-1"></div>
            <div className="w-20 h-1 bg-slate-800 rounded-full"></div>
            <div className="w-8 h-8 text-slate-700 mt-5"><Award className="w-full h-full" /></div>
          </div>

          {/* Middle Card - Modern Gradient */}
          <div className="absolute w-[300px] aspect-[1.4] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] border border-white/20 transform rotate-y-[-15deg] rotate-z-[4deg] translate-x-[40px] translate-y-[-10px] flex flex-col items-center justify-center p-6">
            <div className="absolute inset-[6px] border border-white/20 rounded-xl"></div>
            <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Recognition</div>
            <div className="text-xl font-extrabold text-white text-center leading-tight">Innovation Award</div>
            <div className="w-8 h-8 text-amber-300 mt-4"><Award className="w-full h-full" /></div>
          </div>

          {/* Front Card - Classic Minimal */}
          <div className="absolute w-[340px] aspect-[1.4] bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200 transform rotate-y-[-10deg] rotate-z-[-2deg] translate-x-[-10px] translate-y-[30px] flex flex-col items-center justify-center p-6 hover:translate-y-[25px] hover:rotate-y-0 hover:rotate-z-0 hover:scale-105 transition-all duration-500 cursor-default">
            <div className="absolute inset-[8px] border-[1.5px] border-slate-100 rounded-xl"></div>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-sm border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Certificate of</div>
            <div className="text-2xl font-extrabold text-slate-800">Completion</div>
            <div className="w-16 h-px bg-slate-200 my-4"></div>
            <div className="w-10 h-10 rounded-full bg-amber-400 shadow-md border-4 border-amber-200 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-700" />
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="flex-1 max-w-lg pl-16 flex flex-col justify-center">
           <Quote className="w-16 h-16 text-[#0a1526]/20 mb-6 fill-[#0a1526]/20" />
           <h3 className="text-3xl font-extrabold text-[#0a1526] tracking-tight leading-tight mb-8">
             CertiDraft streamlined our entire certification process.
           </h3>
           
           <div className="flex items-center gap-4">
             {/* Avatar placeholder */}
             <div className="w-14 h-14 rounded-full bg-slate-300 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-500 font-bold">
               JD
             </div>
             <div>
               <p className="font-bold text-[#0a1526] text-lg">Jane Doe</p>
               <p className="text-[#0a1526]/70 font-medium">CEO, Global Solutions</p>
             </div>
           </div>
        </div>

        {/* Carousel Arrow */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-pointer text-[#0a1526] hover:bg-[#0a1526]/5 rounded-full transition-colors">
           <ChevronRight className="w-8 h-8" />
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 pl-48">
           <div className="w-6 h-2 bg-[#0a1526] rounded-full"></div>
           <div className="w-2 h-2 bg-[#0a1526]/30 rounded-full"></div>
           <div className="w-2 h-2 bg-[#0a1526]/30 rounded-full"></div>
        </div>

      </div>
    </div>
  )
}
