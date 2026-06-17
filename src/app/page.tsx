import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 bg-white">
      {/* ── Navigation Bar ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md transition-all">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
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
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-full px-6 font-medium transition-all duration-300">
              <Link href="/auth/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero Section (Split Layout) ─────────────────────────────────── */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-32 px-4 bg-slate-50 relative overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute top-0 inset-x-0 h-[600px] w-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-transparent pointer-events-none"></div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Content */}
              <div className="flex flex-col items-start text-left max-w-2xl">
                {/* Hero Badge */}
                <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    Trusted by educators & organizations
                  </span>
                </div>

                {/* Typography */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                  Issue beautiful certificates <span className="text-blue-600">at scale.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                  Design once, generate hundreds. CertiDraft automates your entire credential workflow — from CSV upload to verified PDF delivery in seconds.
                </p>

                {/* CTA Buttons (Left Aligned) */}
                <div className="flex flex-col sm:flex-row items-center justify-start gap-4 w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm transition-all duration-300 hover:-translate-y-1 group" asChild>
                    <Link href="/auth/signup">
                      Start generating free 
                      <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-white border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1" asChild>
                    <Link href="#features">Explore features</Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: Mockup */}
              <div className="relative w-full perspective lg:pl-10">
                {/* Decorative glow behind mockup */}
                <div className="absolute inset-0 bg-blue-100 rounded-[2rem] blur-3xl opacity-50"></div>
                
                <div className="relative rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-xl shadow-2xl p-2 transform transition-all duration-500 ease-in-out hover:-translate-y-2">
                  <div className="rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shadow-inner flex flex-col w-full h-[450px]">
                    {/* Browser Window Controls */}
                    <div className="h-10 bg-slate-950 flex items-center px-4 gap-2 border-b border-slate-800">
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      </div>
                      <div className="mx-auto bg-slate-900 rounded border border-slate-800 px-24 py-1 text-[10px] text-slate-500 font-mono hidden md:block">
                        app.certidraft.com
                      </div>
                    </div>
                    
                    {/* Abstract Canvas UI */}
                    <div className="flex-1 flex relative overflow-hidden bg-slate-950">
                      {/* Sidebar */}
                      <div className="w-16 md:w-48 bg-slate-900 border-r border-slate-800 p-3 flex flex-col gap-3">
                        <div className="h-6 w-full rounded bg-slate-800/50 border border-slate-700/50 flex items-center px-2"><div className="h-1.5 w-8 md:w-16 bg-blue-500 rounded"></div></div>
                        <div className="h-6 w-full rounded bg-slate-800/30 flex items-center px-2"><div className="h-1.5 w-6 md:w-12 bg-slate-700 rounded"></div></div>
                        <div className="h-6 w-full rounded bg-slate-800/30 flex items-center px-2"><div className="h-1.5 w-10 md:w-20 bg-slate-700 rounded"></div></div>
                      </div>
                      
                      {/* Main Canvas Area */}
                      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90 relative">
                        {/* Certificate Mockup */}
                        <div className="aspect-[1.414] w-full max-w-sm bg-white rounded shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-4 border-2 border-slate-100 transform rotate-1 scale-105">
                          <div className="absolute inset-1.5 border border-slate-200"></div>
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                             <Award className="w-6 h-6" />
                          </div>
                          <div className="h-4 w-3/4 bg-slate-200 rounded mb-4"></div>
                          <div className="h-3 w-1/3 bg-slate-100 rounded mb-8 text-center relative"><span className="absolute inset-0 text-slate-400 font-mono text-[8px] flex items-center justify-center">{"{{name}}"}</span></div>
                          <div className="h-2 w-5/6 bg-slate-100 rounded mb-2"></div>
                          <div className="h-2 w-4/6 bg-slate-100 rounded mb-8"></div>
                          
                          <div className="w-full flex justify-between items-end px-6">
                             <div className="flex flex-col gap-1.5 items-center">
                                <div className="h-0.5 w-16 bg-slate-300"></div>
                                <div className="h-1.5 w-8 bg-slate-100 rounded"></div>
                             </div>
                             <div className="w-10 h-10 bg-slate-100 rounded-sm"></div>
                          </div>
                        </div>
                        
                        {/* Selection UI box (Floating UI) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-10 border border-blue-500 bg-blue-500/10 pointer-events-none hidden sm:block">
                          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-white border border-blue-500"></div>
                          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-white border border-blue-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Features Section (Standardized Grid) ────────────────────────── */}
        <section id="features" className="py-24 bg-white px-4 border-t border-slate-100">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight text-balance">
                Everything you need to issue certificates
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                A complete suite of tools designed to remove the friction from creating, sending, and verifying professional credentials.
              </p>
            </div>

            {/* Standard 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  Visual Builder
                </h3>
                <p className="text-slate-600 leading-relaxed flex-1">
                  Design stunning certificates with our drag and drop canvas. Add custom fonts, logos, and signatures with ease.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  Batch Generation
                </h3>
                <p className="text-slate-600 leading-relaxed flex-1">
                  Upload a CSV file and map your columns. Generate hundreds of personalized PDFs in seconds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  AI Citations
                </h3>
                <p className="text-slate-600 leading-relaxed flex-1">
                  Use Gemini-powered AI to automatically draft unique, personalized citation text for every recipient.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  QR Verification
                </h3>
                <p className="text-slate-600 leading-relaxed flex-1">
                  Every certificate includes a unique QR code and token for instant, fraud-proof public verification.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6 border border-orange-100">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  Email Delivery
                </h3>
                <p className="text-slate-600 leading-relaxed flex-1">
                  Send certificates directly to recipients with customizable email templates and tracking.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6 border border-rose-100">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  Certificate Wallet
                </h3>
                <p className="text-slate-600 leading-relaxed flex-1">
                  Give recipients a beautiful, public shareable credential page to showcase their achievements.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Pricing Section ─────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-4 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight text-balance">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
                Start for free, upgrade when you need to scale. No hidden fees or surprise charges.
              </p>
            </div>

            {/* Pricing Cards aligned closer together */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              
              {/* Free */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-2xl p-2 pt-6">
                <CardHeader className="p-6 pt-0 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Free</CardTitle>
                  <CardDescription className="text-slate-500 font-medium h-5">Perfect for trying it out</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                    <span className="text-6xl font-extrabold text-slate-900 tracking-tight">0</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-2 pb-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">5 certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 text-sm">Basic templates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 text-sm">Standard support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button variant="outline" className="w-full h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-semibold transition-all" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Starter */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-2xl p-2 pt-6">
                <CardHeader className="p-6 pt-0 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Starter</CardTitle>
                  <CardDescription className="text-slate-500 font-medium h-5">For small events</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                    <span className="text-6xl font-extrabold text-slate-900 tracking-tight">199</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-2 pb-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">50 certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600 text-sm">All templates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600 text-sm">QR Verification</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button variant="outline" className="w-full h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-semibold transition-all" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro (Highlighted, physically taller) */}
              <div className="relative h-full flex flex-col lg:-mt-4 lg:mb-[-1rem]">
                {/* Nested Most Popular Badge */}
                <div className="absolute top-0 inset-x-0 flex justify-center z-10 -translate-y-1/2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-blue-500 shadow-sm">
                    Most popular
                  </span>
                </div>
                
                <Card className="flex flex-col h-full bg-white border-2 border-blue-600 shadow-sm rounded-2xl p-2 pt-8 relative z-0">
                  <CardHeader className="p-6 pt-0 pb-4">
                    <CardTitle className="text-xl font-bold text-blue-600 tracking-tight">Pro</CardTitle>
                    <CardDescription className="text-slate-500 font-medium h-5">For growing organizations</CardDescription>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                      <span className="text-6xl font-extrabold text-slate-900 tracking-tight">599</span>
                      <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6 pt-2 pb-6">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                        <span className="text-slate-900 font-bold text-sm">300 certificates</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                        <span className="text-slate-700 font-medium text-sm">Custom branding</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" /></div>
                        <span className="text-slate-700 font-medium text-sm">Email delivery</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-indigo-50 p-1 rounded-md"><Sparkles className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" /></div>
                        <span className="text-indigo-700 font-bold text-sm">AI Citations</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 mt-auto">
                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-all" asChild>
                      <Link href="/auth/signup">Get started free</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Enterprise */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-2xl p-2 pt-6">
                <CardHeader className="p-6 pt-0 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Enterprise</CardTitle>
                  <CardDescription className="text-slate-500 font-medium h-5">For large scale ops</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                    <span className="text-6xl font-extrabold text-slate-900 tracking-tight">1499</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-2 pb-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">1000+ certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 text-sm">API Access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 text-sm">Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
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
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Column 1: Logo & Tagline */}
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                 <div className="h-7 w-7 bg-blue-600 rounded flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                 </div>
                 <span className="text-xl font-bold tracking-tight text-slate-900">CertiDraft</span>
              </div>
              <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">
                Design once, generate hundreds. The modern platform for professional, verifiable credentials.
              </p>
            </div>

            {/* Column 2: Product Links */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-slate-900 mb-2">Product</h4>
              <Link href="#features" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Features</Link>
              <Link href="#pricing" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Pricing</Link>
              <Link href="/templates" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Templates</Link>
            </div>

            {/* Column 3: Legal/Company Links */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-slate-900 mb-2">Company</h4>
              <Link href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Terms of Service</Link>
              <Link href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Contact Support</Link>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400 font-medium">
              © {new Date().getFullYear()} CertiDraft. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
