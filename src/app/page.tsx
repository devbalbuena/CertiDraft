import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  LayoutTemplate,
  Layers,
  Sparkles,
  QrCode,
  Mail,
  Award,
  Check,
  ChevronRight,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Ultra-subtle radial mesh background glow */}
      <div className="absolute top-0 inset-x-0 h-[800px] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50/20 to-transparent pointer-events-none z-0"></div>

      {/* ── Navigation Bar ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md transition-all">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CertiDraft
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 font-medium">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 rounded-full px-6 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30">
              <Link href="/auth/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 text-center">
          <div className="container mx-auto max-w-5xl flex flex-col items-center relative">
            
            {/* Hero Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
                Trusted by educators & organizations
              </span>
            </div>

            {/* Typography */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 text-balance leading-[1.1]">
              Issue beautiful <br className="hidden md:block"/> certificates <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">at scale.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl text-balance leading-relaxed">
              Design once, generate hundreds. CertiDraft automates your entire credential workflow — from CSV upload to verified PDF delivery in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-20">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 group" asChild>
                <Link href="/auth/signup">
                  Start generating free 
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-white border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1" asChild>
                <Link href="#features">Explore features</Link>
              </Button>
            </div>

            {/* Floating Mockup Preview */}
            <div className="w-full max-w-4xl mx-auto relative group perspective">
              {/* Decorative glow behind mockup */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              
              <div className="relative rounded-[2rem] border border-slate-200/50 bg-white/40 backdrop-blur-xl shadow-2xl p-2 transform transition-all duration-500 ease-in-out group-hover:-translate-y-2">
                <div className="rounded-[1.5rem] bg-slate-900 overflow-hidden border border-slate-800 shadow-inner flex flex-col">
                  {/* Browser Window Controls */}
                  <div className="h-12 bg-slate-950/50 flex items-center px-4 gap-2 border-b border-slate-800">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    </div>
                    <div className="mx-auto bg-slate-900 rounded-md py-1 px-32 text-xs text-slate-500 font-mono border border-slate-800 hidden md:block">
                      app.certidraft.com/builder
                    </div>
                  </div>
                  
                  {/* Abstract Canvas UI */}
                  <div className="flex-1 flex aspect-video relative overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 bg-slate-900 border-r border-slate-800 p-4 hidden sm:flex flex-col gap-4">
                      <div className="h-8 w-full rounded bg-slate-800/50 border border-slate-700/50 flex items-center px-3"><div className="h-2 w-16 bg-blue-500 rounded"></div></div>
                      <div className="h-8 w-full rounded bg-slate-800/30 flex items-center px-3"><div className="h-2 w-12 bg-slate-700 rounded"></div></div>
                      <div className="h-8 w-full rounded bg-slate-800/30 flex items-center px-3"><div className="h-2 w-20 bg-slate-700 rounded"></div></div>
                    </div>
                    
                    {/* Main Canvas Area */}
                    <div className="flex-1 bg-slate-950 flex items-center justify-center p-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90 relative">
                      {/* Certificate Mockup */}
                      <div className="aspect-[1.414] w-full max-w-lg bg-white rounded-md shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 border-4 border-slate-100">
                        {/* Mock design elements */}
                        <div className="absolute inset-2 border-2 border-slate-200"></div>
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                           <Award className="w-8 h-8" />
                        </div>
                        <div className="h-6 w-3/4 bg-slate-200 rounded mb-8"></div>
                        <div className="h-4 w-1/3 bg-slate-100 rounded mb-12 text-center relative"><span className="absolute inset-0 text-slate-400 font-mono text-[10px] flex items-center justify-center">{"{{recipient_name}}"}</span></div>
                        <div className="h-3 w-5/6 bg-slate-100 rounded mb-2"></div>
                        <div className="h-3 w-4/6 bg-slate-100 rounded mb-12"></div>
                        
                        <div className="w-full flex justify-between items-end px-8">
                           <div className="flex flex-col gap-2 items-center">
                              <div className="h-1 w-24 bg-slate-300"></div>
                              <div className="h-2 w-12 bg-slate-100 rounded"></div>
                           </div>
                           <div className="w-16 h-16 bg-slate-100 rounded-sm"></div>
                        </div>
                      </div>
                      
                      {/* Selection UI box (Floating UI) */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 border border-blue-500 bg-blue-500/10 pointer-events-none hidden sm:block">
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500"></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-mono shadow-lg">Text Variable</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Features Section (Bento Grid) ───────────────────────────────── */}
        <section id="features" className="py-24 bg-white px-4 border-t border-slate-100">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight text-balance">
                Everything you need to issue certificates
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                A complete suite of tools designed to remove the friction from creating, sending, and verifying professional credentials.
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Visual Builder (Wide - 2 columns) */}
              <div className="md:col-span-2 group bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col justify-end min-h-[320px]">
                {/* Decorative background visual */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
                <div className="relative z-10 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100">
                    <LayoutTemplate className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    Visual Builder
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Design stunning certificates with our drag and drop canvas. Add custom fonts, logos, and signatures with ease.
                  </p>
                </div>
              </div>

              {/* QR Verification (Single column) */}
              <div className="group bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out relative min-h-[320px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 shadow-sm border border-emerald-100">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                  QR Verification
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Every certificate includes a unique QR code and token for instant, fraud-proof public verification.
                </p>
              </div>

              {/* AI Citations (Single column) */}
              <div className="group bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out relative min-h-[320px]">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 shadow-sm border border-purple-100">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                  AI Citations
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Use Gemini-powered AI to automatically draft unique, personalized citation text for every recipient.
                </p>
              </div>

              {/* Batch Generation (Wide - 2 columns) */}
              <div className="md:col-span-2 group bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out relative overflow-hidden flex flex-col justify-end min-h-[320px]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
                <div className="relative z-10 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-sm border border-indigo-100">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    Batch Generation
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Upload a CSV file and map your columns. Generate hundreds of personalized PDFs in seconds.
                  </p>
                </div>
              </div>

              {/* Email Delivery (Single column) */}
              <div className="group bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out relative min-h-[320px]">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 shadow-sm border border-amber-100">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                  Email Delivery
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Send certificates directly to recipients with customizable email templates and tracking.
                </p>
              </div>

              {/* Certificate Wallet (Single column) */}
              <div className="group bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out relative min-h-[320px]">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6 shadow-sm border border-rose-100">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                  Certificate Wallet
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Give recipients a beautiful, public shareable credential page to showcase their achievements.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Pricing Section ─────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-4 bg-slate-50 border-t border-slate-200/60">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight text-balance">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Start for free, upgrade when you need to scale. No hidden fees or surprise charges.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              {/* Free */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-3xl hover:shadow-md transition-shadow duration-300 p-2">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Free</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Perfect for trying it out</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-2xl -translate-y-2">₱</span>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">0</span>
                    <span className="text-slate-500 font-medium ml-1">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-0">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium">5 certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600">Basic templates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600">Standard support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="outline" className="w-full h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-semibold transition-all" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Starter */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-3xl hover:shadow-md transition-shadow duration-300 p-2">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Starter</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">For small events</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-2xl -translate-y-2">₱</span>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">199</span>
                    <span className="text-slate-500 font-medium ml-1">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-0">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium">50 certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600">All templates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600">QR Verification</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="outline" className="w-full h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-semibold transition-all" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro (Highlighted) */}
              <div className="relative h-full flex flex-col transform lg:-translate-y-4 transition-transform duration-300">
                {/* Most Popular Badge Nested Cleanly */}
                <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-md shadow-blue-600/20">
                    Most popular
                  </span>
                </div>
                
                <Card className="flex flex-col h-full bg-white border-2 border-blue-600 shadow-xl shadow-blue-900/5 rounded-3xl p-2 relative z-0">
                  <CardHeader className="p-6 mt-4">
                    <CardTitle className="text-xl font-bold text-blue-600 tracking-tight">Pro</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">For growing organizations</CardDescription>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-slate-400 font-bold text-2xl -translate-y-2">₱</span>
                      <span className="text-5xl font-extrabold text-slate-900 tracking-tight">599</span>
                      <span className="text-slate-500 font-medium ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6 pt-0">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="bg-blue-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-blue-700 stroke-[3]" /></div>
                        <span className="text-slate-900 font-bold">300 certificates</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-blue-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-blue-700 stroke-[3]" /></div>
                        <span className="text-slate-700 font-medium">Custom branding</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-blue-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-blue-700 stroke-[3]" /></div>
                        <span className="text-slate-700 font-medium">Email delivery</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-indigo-100 p-1 rounded-full"><Sparkles className="w-3.5 h-3.5 text-indigo-700 stroke-[3]" /></div>
                        <span className="text-indigo-700 font-bold">AI Citations</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5" asChild>
                      <Link href="/auth/signup">Get started free</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Enterprise */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-3xl hover:shadow-md transition-shadow duration-300 p-2">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Enterprise</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">For large scale ops</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-2xl -translate-y-2">₱</span>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">1499</span>
                    <span className="text-slate-500 font-medium ml-1">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-0">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium">1000+ certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600">API Access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600">Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="outline" className="w-full h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-semibold transition-all" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 mb-2">
               <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
               </div>
               <span className="text-lg font-bold tracking-tight text-slate-900">CertiDraft</span>
            </div>
            <span className="text-sm text-slate-500 font-medium">
              Professional credentials, simplified.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
             <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            © {new Date().getFullYear()} CertiDraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
