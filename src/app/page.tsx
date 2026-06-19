'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Playfair_Display } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Check, ChevronRight, Award, Zap, Layout, Shield, FileText, Settings, Send, Mail } from 'lucide-react'

// Load the serif font for headings
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700', '800'] })

// Logos for infinite marquee
const LOGOS = [
  "Acme Corp", "GlobalTech", "Pied Piper", "Hooli", "Initech", "Stark Ind.", "Wayne Ent.", "Umbrella Corp", "Massive Dynamic"
]

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)
  
  const tabs = [
    { title: "1. Design", icon: Layout, desc: "Drag and drop builder" },
    { title: "2. Map Data", icon: FileText, desc: "Upload CSV rows" },
    { title: "3. Generate", icon: Zap, desc: "Create 1000s instantly" },
    { title: "4. Automate", icon: Send, desc: "Email automatically" },
  ]

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* ── Navigation Bar ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
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
            <Link href="#features" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">How it works</Link>
            <Link href="#pricing" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden sm:inline-flex text-sm font-bold text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-md transition-transform hover:scale-105 h-11">
              <Link href="/auth/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        
        {/* ── 1. Animated Hero Section ────────────────────────────────────── */}
        <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-white border-b border-slate-200">
          {/* Subtle animated background gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <motion.div 
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px]" 
            />
            <motion.div 
              animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-40 right-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-[100px]" 
            />
          </div>

          <div className="container mx-auto max-w-5xl relative z-10 text-center flex flex-col items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs uppercase tracking-widest mb-8 shadow-sm"
            >
              <Zap className="w-4 h-4" fill="currentColor" />
              The new standard for credentials
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`${playfair.className} text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight max-w-4xl`}
            >
              Issue beautiful certificates <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">at scale.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed font-medium max-w-2xl"
            >
              Design once, generate hundreds. CertiDraft automates your entire credential workflow — from CSV upload to verified PDF delivery in seconds.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-xl transition-all hover:shadow-blue-500/25 hover:-translate-y-1 group" asChild>
                <Link href="/auth/signup">
                  Start generating free 
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── 2. Infinite Trust Band ──────────────────────────────────────── */}
        <section className="py-12 bg-white border-b border-slate-100 overflow-hidden flex flex-col items-center">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Trusted by forward-thinking teams</p>
           
           <div className="relative w-full flex overflow-hidden group">
             <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
             <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
             
             <motion.div 
                className="flex items-center gap-16 whitespace-nowrap px-8"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
             >
                {/* Double the logos for seamless loop */}
                {[...LOGOS, ...LOGOS].map((logo, i) => (
                  <div key={i} className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                      {logo.charAt(0)}
                    </div>
                    <span className="font-extrabold text-xl text-slate-800 tracking-tight">{logo}</span>
                  </div>
                ))}
             </motion.div>
           </div>
        </section>

        {/* ── 3. Bento Box Features Grid ──────────────────────────────────── */}
        <section id="features" className="py-32 px-6 bg-slate-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className={`${playfair.className} text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight`}>
                Everything you need.
              </h2>
              <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                A complete toolkit to design, map, and distribute professional credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              
              {/* Card 1: Visual Builder (Large) */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:col-span-2 md:row-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
                 <div className="p-10 relative z-10">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                     <Layout className="w-6 h-6" />
                   </div>
                   <h3 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Visual Builder</h3>
                   <p className="text-slate-600 font-medium text-lg max-w-sm">Design pixel-perfect templates with our intuitive drag-and-drop canvas. Add custom fonts, dynamic variables, and logos.</p>
                 </div>
                 
                 {/* Abstract UI Mockup */}
                 <div className="absolute right-0 bottom-0 w-[70%] h-[60%] bg-white border-t border-l border-slate-200 shadow-2xl rounded-tl-2xl p-6 transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2">
                    <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 relative overflow-hidden">
                       {/* Floating elements */}
                       <motion.div 
                          animate={{ y: [0, -10, 0] }} 
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-1/4 left-1/4 px-4 py-2 bg-white shadow-lg border border-blue-200 rounded text-blue-600 font-mono font-bold text-sm"
                        >
                         {"{{first_name}}"}
                       </motion.div>
                       <motion.div 
                          animate={{ y: [0, 10, 0] }} 
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute bottom-1/4 right-1/4 px-4 py-2 bg-white shadow-lg border border-indigo-200 rounded text-indigo-600 font-mono font-bold text-sm"
                        >
                         {"{{course_name}}"}
                       </motion.div>
                    </div>
                 </div>
              </motion.div>

              {/* Card 2: Batch Processing */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative group text-white p-10 flex flex-col"
              >
                 <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6">
                   <FileText className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-extrabold mb-3 tracking-tight">Batch Generation</h3>
                 <p className="text-slate-400 font-medium leading-relaxed">Upload a CSV and let our engine map data to your template instantly. 1,000 PDFs in seconds.</p>
                 
                 <div className="mt-auto pt-8">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         className="h-full bg-blue-500 rounded-full" 
                         initial={{ width: "0%" }} 
                         whileInView={{ width: "100%" }} 
                         transition={{ duration: 2, repeat: Infinity }}
                       />
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-2 text-right">Processing 1000/1000</p>
                 </div>
              </motion.div>

              {/* Card 3: Verifiable Security */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group p-10 flex flex-col"
              >
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                   <Shield className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Verifiable QR</h3>
                 <p className="text-slate-600 font-medium leading-relaxed">Every certificate gets a unique, cryptographically secure QR code for instant authenticity verification.</p>
                 
                 <div className="mt-auto self-center p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                    <div className="grid grid-cols-4 gap-1">
                      {[...Array(16)].map((_, i) => (
                        <motion.div 
                          key={i} 
                          className="w-4 h-4 bg-slate-800 rounded-sm"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                        />
                      ))}
                    </div>
                 </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── 4. Interactive "How it Works" Tabs ──────────────────────────── */}
        <section id="how-it-works" className="py-32 px-6 bg-white border-y border-slate-100">
          <div className="container mx-auto max-w-6xl">
            
            <div className="text-center mb-16">
              <h2 className={`${playfair.className} text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight`}>
                How it works
              </h2>
              <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                A seamless workflow from design to delivery.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Tabs List */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {tabs.map((tab, idx) => {
                  const isActive = activeTab === idx
                  const Icon = tab.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`text-left p-6 rounded-2xl transition-all duration-300 border-2 ${
                        isActive 
                        ? 'bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]' 
                        : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold tracking-tight ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                            {tab.title}
                          </h3>
                          <p className={`font-medium mt-1 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                            {tab.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Display Area */}
              <div className="lg:col-span-7 h-[450px] relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col"
                  >
                    {/* Topbar mock */}
                    <div className="h-12 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                       <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                       <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    </div>
                    
                    {/* Content mock based on active tab */}
                    <div className="flex-1 p-8 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                      {activeTab === 0 && (
                        <div className="w-full h-full border-2 border-blue-500/50 bg-blue-500/10 rounded-xl flex items-center justify-center relative">
                           <div className="text-blue-400 font-mono font-bold text-xl border border-blue-400 px-6 py-3 bg-slate-900/50 backdrop-blur-sm rounded">{"{{ Certificate Title }}"}</div>
                           <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                           <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                        </div>
                      )}
                      {activeTab === 1 && (
                        <div className="w-full flex flex-col gap-4">
                          <div className="h-10 w-full bg-white/10 rounded-lg flex items-center px-4 gap-4">
                            <div className="w-4 h-4 bg-slate-400 rounded-sm"></div>
                            <div className="h-4 w-32 bg-slate-500 rounded"></div>
                          </div>
                          {[1,2,3].map(i => (
                            <div key={i} className="h-12 w-full bg-white/5 border border-white/10 rounded-lg flex items-center px-4 gap-4">
                              <div className="h-4 w-24 bg-slate-600 rounded"></div>
                              <div className="h-4 w-48 bg-slate-700 rounded ml-auto"></div>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeTab === 2 && (
                        <div className="flex flex-col items-center gap-6">
                           <motion.div 
                             animate={{ rotate: 360 }} 
                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           >
                             <Settings className="w-16 h-16 text-blue-500" />
                           </motion.div>
                           <div className="text-white font-bold text-2xl tracking-tight">Generating 500 PDFs...</div>
                           <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-blue-500" animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} />
                           </div>
                        </div>
                      )}
                      {activeTab === 3 && (
                        <div className="w-full h-full flex items-center justify-center">
                           <div className="bg-white rounded-xl p-6 w-80 shadow-2xl transform rotate-3">
                             <div className="flex items-center gap-4 border-b pb-4 mb-4">
                               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Mail className="w-5 h-5"/></div>
                               <div>
                                 <div className="font-bold text-slate-800 text-sm">To: jane@example.com</div>
                                 <div className="text-xs text-slate-500">Your Certificate is ready!</div>
                               </div>
                             </div>
                             <div className="h-20 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">PDF Attachment</div>
                           </div>
                           <motion.div 
                             className="absolute"
                             animate={{ x: [0, 100], opacity: [1, 0] }}
                             transition={{ duration: 1.5, repeat: Infinity }}
                           >
                             <Send className="w-8 h-8 text-blue-400 ml-32" />
                           </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </section>

        {/* ── 5. Before & After Slider ────────────────────────────────────── */}
        <section className="py-32 bg-slate-50 border-b border-slate-200 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className={`${playfair.className} text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight`}>
                The CertiDraft Difference
              </h2>
              <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                Stop wasting hours on manual formatting. See the transformation.
              </p>
            </div>

            <div className="relative w-full aspect-video bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 select-none">
              
              {/* "Before" Layer (Always at bottom) */}
              <div className="absolute inset-0 bg-slate-100 p-8 flex flex-col font-mono text-sm text-slate-500">
                <div className="font-bold text-slate-800 text-2xl mb-6 font-sans">The Old Way (Manual)</div>
                <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl bg-white p-4 flex flex-col gap-2">
                   {[...Array(6)].map((_, i) => (
                     <div key={i} className="flex gap-2">
                       <div className="h-6 w-24 bg-red-100 rounded border border-red-200 flex items-center px-2 text-red-800 text-xs">Error</div>
                       <div className="h-6 w-48 bg-slate-200 rounded"></div>
                       <div className="h-6 w-full bg-slate-100 rounded"></div>
                     </div>
                   ))}
                </div>
              </div>

              {/* "After" Layer (Clipped by slider) */}
              <div 
                className="absolute inset-0 bg-slate-900 p-8 flex flex-col text-white shadow-[10px_0_20px_rgba(0,0,0,0.5)]"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <div className="font-bold text-white text-2xl mb-6 font-sans">The CertiDraft Way</div>
                <div className="flex-1 rounded-xl bg-slate-800 border border-slate-700 p-6 flex flex-col justify-center items-center gap-6">
                   <div className="flex items-center gap-4 text-green-400 font-bold text-xl">
                      <Check className="w-8 h-8" />
                      Data Mapped Perfectly
                   </div>
                   <div className="flex gap-4">
                     <div className="w-24 h-32 bg-white rounded shadow-lg"></div>
                     <div className="w-24 h-32 bg-white rounded shadow-lg transform translate-y-4"></div>
                     <div className="w-24 h-32 bg-white rounded shadow-lg"></div>
                   </div>
                </div>
              </div>

              {/* Slider Handle overlay */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-slate-200 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-slate-300 rounded-full"></div>
                    <div className="w-1 h-3 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Native range input hidden on top for actual dragging interaction */}
              <input 
                type="range" 
                min="0" max="100" 
                value={sliderPosition} 
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          </div>
        </section>

        {/* ── 6. Pricing Section ──────────────────────────────────────────── */}
        <section id="pricing" className="py-32 px-6 bg-white border-b border-slate-200">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className={`${playfair.className} text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight`}>
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
                Start for free, upgrade when you need to scale. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              
              {/* Starter */}
              <Card className="flex flex-col h-full bg-slate-50 border-slate-200 shadow-sm rounded-3xl p-4">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">Starter</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-base mt-2">For small events</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-2xl -translate-y-2">₱</span>
                    <span className="text-6xl font-extrabold text-slate-900 tracking-tight">199</span>
                    <span className="text-slate-500 font-medium ml-1">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600 stroke-[3]" />
                      <span className="text-slate-700 font-medium text-base">50 certificates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600 stroke-[3]" />
                      <span className="text-slate-700 font-medium text-base">Basic templates</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 mt-auto">
                  <Button variant="outline" className="w-full h-14 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-lg transition-colors" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro (Highlighted) */}
              <Card className="flex flex-col h-full bg-slate-900 border-slate-800 shadow-2xl rounded-3xl p-4 relative transform md:-translate-y-4">
                <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                  <span className="bg-blue-500 text-white text-xs font-extrabold tracking-widest uppercase px-6 py-2 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
                
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-extrabold text-white tracking-tight">Pro</CardTitle>
                  <CardDescription className="text-slate-400 font-medium text-base mt-2">For growing organizations</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1 text-white">
                    <span className="text-slate-500 font-bold text-2xl -translate-y-2">₱</span>
                    <span className="text-6xl font-extrabold tracking-tight">599</span>
                    <span className="text-slate-500 font-medium ml-1">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-white">
                       <Check className="w-5 h-5 text-blue-400 stroke-[3]" />
                       <span className="font-bold text-base">300 certificates</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                       <Check className="w-5 h-5 text-blue-400 stroke-[3]" />
                       <span className="font-medium text-base">Custom branding</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                       <Check className="w-5 h-5 text-blue-400 stroke-[3]" />
                       <span className="font-medium text-base">Email delivery</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 mt-auto">
                  <Button className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/50 transition-colors" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise */}
              <Card className="flex flex-col h-full bg-slate-50 border-slate-200 shadow-sm rounded-3xl p-4">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-base mt-2">For huge scale ops</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-slate-400 font-bold text-2xl -translate-y-2">₱</span>
                    <span className="text-6xl font-extrabold text-slate-900 tracking-tight">1499</span>
                    <span className="text-slate-500 font-medium ml-1">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-slate-400 stroke-[3]" />
                      <span className="text-slate-700 font-medium text-base">1000+ certificates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-slate-400 stroke-[3]" />
                      <span className="text-slate-700 font-medium text-base">API Access</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6 mt-auto">
                  <Button variant="outline" className="w-full h-14 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-lg transition-colors" asChild>
                    <Link href="/auth/signup">Contact Sales</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-50 pt-20 pb-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 bg-slate-900 rounded flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
               </div>
               <span className="font-bold tracking-tight text-slate-900">CertiDraft</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900">Privacy</a>
              <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900">Terms</a>
            </div>
            <div className="text-sm text-slate-400 font-medium">
              © {new Date().getFullYear()} CertiDraft. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
