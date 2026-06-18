import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Check, ChevronRight, Award } from 'lucide-react'

// Load the serif font for headings
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700', '800'] })

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* ── Navigation Bar ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CertiDraft
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden sm:inline-flex text-sm font-semibold text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-semibold shadow-sm h-10">
              <Link href="/auth/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section className="pt-20 pb-32 px-6 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Column: Content */}
              <div className="flex flex-col items-start text-left max-w-xl">
                {/* Badge */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  <span className="text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase">
                    Trusted by educators & organizations
                  </span>
                </div>

                {/* Typography */}
                <h1 className={`${playfair.className} text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-slate-900 mb-6 leading-[1.05] tracking-tight`}>
                  Issue beautiful certificates <span className="text-blue-600">at scale.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                  Design once, generate hundreds. CertiDraft automates your entire credential workflow — from CSV upload to verified PDF delivery in seconds.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-sm transition-transform hover:-translate-y-0.5 group" asChild>
                    <Link href="/auth/signup">
                      Start generating free 
                      <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-white border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 hover:text-slate-900 transition-transform hover:-translate-y-0.5" asChild>
                    <Link href="#features">Explore features</Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: 3D Certificate Mockup */}
              <div className="relative w-full h-[500px] flex items-center justify-center lg:justify-end perspective-1000 hidden md:flex">
                {/* Floating Certificate Canvas */}
                <div className="w-[450px] aspect-[1.414] bg-white rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-slate-100 transform rotate-[-8deg] rotate-x-[15deg] rotate-y-[-15deg] transition-transform duration-700 hover:rotate-[-5deg] hover:rotate-y-0 hover:scale-105 p-8 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-2 border-2 border-slate-100 rounded-lg"></div>
                  
                  {/* Decorative Elements on Certificate */}
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                    <Award className="w-8 h-8" />
                  </div>
                  
                  <div className="h-4 w-3/4 bg-slate-200 rounded-full mb-8"></div>
                  
                  <div className="h-8 w-1/2 border border-blue-200 bg-blue-50/50 rounded flex items-center justify-center mb-8 relative">
                    <span className="text-blue-600 font-mono text-xs font-semibold">{"{{name}}"}</span>
                    {/* UI Handles */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 rounded-sm"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 rounded-sm"></div>
                  </div>
                  
                  <div className="h-2 w-5/6 bg-slate-100 rounded-full mb-3"></div>
                  <div className="h-2 w-4/6 bg-slate-100 rounded-full mb-12"></div>
                  
                  <div className="w-full flex justify-between items-end px-8">
                     <div className="flex flex-col gap-2">
                        <div className="h-0.5 w-24 bg-slate-300"></div>
                        <div className="h-2 w-12 bg-slate-100 rounded-full mx-auto"></div>
                     </div>
                     <div className="w-14 h-14 bg-slate-100 rounded-md"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Features Section (Zig-Zag Layout) ─────────────────────────── */}
        <section id="features" className="py-32 bg-white px-6">
          <div className="container mx-auto max-w-6xl flex flex-col gap-32">
            
            {/* Feature 1: Visual Builder */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h2 className={`${playfair.className} text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight`}>
                  Visual Builder
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-md">
                  Design stunning certificates with our drag and drop canvas. Add custom fonts, logos, and signatures with ease.
                </p>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                  {/* Browser top */}
                  <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                    </div>
                  </div>
                  {/* Builder UI Mockup */}
                  <div className="flex-1 flex p-4 gap-4">
                    {/* Sidebar */}
                    <div className="w-1/4 flex flex-col gap-3">
                      <div className="h-6 bg-slate-800 rounded"></div>
                      <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
                      <div className="h-10 bg-blue-600/20 border border-blue-500/50 rounded mt-4 flex items-center justify-center">
                         <span className="text-[10px] text-blue-400 font-mono">{"{{name}}"}</span>
                      </div>
                    </div>
                    {/* Canvas */}
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center p-8">
                      <div className="w-full aspect-[1.414] bg-white rounded shadow-lg flex items-center justify-center relative">
                         <div className="w-3/4 h-12 border-2 border-blue-400 bg-blue-50/50"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Batch Generation */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-1 lg:order-1">
                <div className="rounded-xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden aspect-[4/3] flex flex-col">
                  {/* Browser top */}
                  <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    </div>
                  </div>
                  {/* CSV UI Mockup */}
                  <div className="flex-1 p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="font-bold text-slate-800 text-lg">CSV upload</h3>
                       <div className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold">Start upload</div>
                    </div>
                    <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                       <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-4">
                          <div className="w-4 h-4 rounded border border-slate-300 bg-white"></div>
                          <div className="h-3 w-16 bg-slate-300 rounded-full"></div>
                          <div className="h-3 w-24 bg-slate-300 rounded-full ml-auto"></div>
                       </div>
                       <div className="flex-1 p-4 flex flex-col gap-4">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="w-4 h-4 rounded border border-slate-200"></div>
                              <div className="h-2 w-32 bg-slate-100 rounded-full"></div>
                              <div className="h-2 w-20 bg-slate-100 rounded-full ml-auto"></div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-2 lg:order-2">
                <h2 className={`${playfair.className} text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight`}>
                  Batch Generation
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-md">
                  Upload a CSV file and map your columns. Generate hundreds of personalized PDFs in seconds.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Pricing Section ─────────────────────────────────────────────── */}
        <section id="pricing" className="py-32 px-6 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className={`${playfair.className} text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight`}>
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
                Start for free, upgrade when you need to scale. No hidden fees.
              </p>
            </div>

            {/* Visual Timeline (Top) */}
            <div className="relative w-full max-w-4xl mx-auto mb-10 hidden md:block">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
               {/* Blue progress line up to 300 */}
               <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-blue-600 -translate-y-1/2 rounded-full"></div>
               
               <div className="relative flex justify-between w-full px-8">
                  {/* Nodes */}
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mb-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500">0</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mb-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500">50</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mb-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500">300</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm mb-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500">1000+</span>
                  </div>
               </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-5xl mx-auto">
              
              {/* Free */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-2xl p-2 pt-6">
                <CardHeader className="p-6 pt-0 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Free</CardTitle>
                  <CardDescription className="text-slate-500 font-medium h-5">Perfect for trying it out</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">0</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-2 pb-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3 h-3 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">5 certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3 h-3 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">Basic templates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3 h-3 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">Standard support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button variant="outline" className="w-full h-11 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold" asChild>
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
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">199</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-2 pb-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3 h-3 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">50 certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3 h-3 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">All templates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3 h-3 text-blue-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">QR Verification</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button variant="outline" className="w-full h-11 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro (Highlighted) */}
              <div className="relative h-full flex flex-col lg:-mt-4 lg:mb-[-1rem]">
                <div className="absolute top-0 inset-x-0 flex justify-center z-10 -translate-y-1/2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow-sm">
                    Most popular
                  </span>
                </div>
                
                <Card className="flex flex-col h-full bg-white border-2 border-blue-600 shadow-md rounded-2xl p-2 pt-8 relative z-0">
                  <CardHeader className="p-6 pt-0 pb-4">
                    <CardTitle className="text-xl font-bold text-blue-600 tracking-tight">Pro</CardTitle>
                    <CardDescription className="text-slate-500 font-medium h-5">For growing organizations</CardDescription>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                      <span className="text-5xl font-extrabold text-slate-900 tracking-tight">599</span>
                      <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6 pt-2 pb-6">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                         <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3 h-3 text-blue-600 stroke-[3]" /></div>
                         <span className="text-slate-900 font-bold text-sm">300 certificates</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3 h-3 text-blue-600 stroke-[3]" /></div>
                         <span className="text-slate-700 font-medium text-sm">Custom branding</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="bg-blue-50 p-1 rounded-md"><Check className="w-3 h-3 text-blue-600 stroke-[3]" /></div>
                         <span className="text-slate-700 font-medium text-sm">Email delivery</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="bg-indigo-50 p-1 rounded-md"><Check className="w-3 h-3 text-indigo-600 stroke-[3]" /></div>
                         <span className="text-indigo-700 font-bold text-sm">AI Citations</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 mt-auto">
                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm" asChild>
                      <Link href="/auth/signup">Get started</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Enterprise */}
              <Card className="flex flex-col h-full bg-white border-slate-200 shadow-sm rounded-2xl p-2 pt-6">
                <CardHeader className="p-6 pt-0 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Enterprise</CardTitle>
                  <CardDescription className="text-slate-500 font-medium h-5">For huge scale ops</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">1499</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-2 pb-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3 h-3 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">1000+ certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3 h-3 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">API Access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-slate-100 p-1 rounded-md"><Check className="w-3 h-3 text-slate-600 stroke-[3]" /></div>
                      <span className="text-slate-600 font-medium text-sm">Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button variant="outline" className="w-full h-11 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Visual Timeline (Bottom) */}
            <div className="relative w-full max-w-4xl mx-auto mt-10 hidden md:block">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
               {/* Blue progress line up to 300 */}
               <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-blue-600 -translate-y-1/2 rounded-full"></div>
               
               <div className="relative flex justify-between w-full px-8">
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mt-2 order-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500 order-1 mb-2">0</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mt-2 order-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500 order-1 mb-2">50</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm mt-2 order-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500 order-1 mb-2">300</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm mt-2 order-2 relative z-10"></div>
                     <span className="text-xs font-bold text-slate-500 order-1 mb-2">1000+</span>
                  </div>
               </div>
            </div>

          </div>
        </section>
      </main>

      {/* ── Footer (Dark Mode) ────────────────────────────────────────────── */}
      <footer className="bg-slate-950 pt-20 pb-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            
            {/* Column 1: Logo & Description */}
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                 </div>
                 <span className="text-xl font-bold tracking-tight text-white">CertiDraft</span>
              </div>
              <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xs">
                Design once, generate hundreds. The modern platform for professional, verifiable credentials.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Product</h4>
              <Link href="#features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Features</Link>
              <Link href="#pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
              <Link href="/templates" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Templates</Link>
            </div>

            {/* Column 3: Company */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Company</h4>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Terms of Service</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Contact Support</Link>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} CertiDraft. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
