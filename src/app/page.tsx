'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Check, ChevronRight, Award, Zap, Layout, Shield, FileText, Settings, Send, Mail, Sparkles, Mic, RefreshCw, Plus } from 'lucide-react'

// Fonts managed via global styles now

// Logos for infinite marquee
const LOGOS = [
  "Acme Corp", "GlobalTech", "Pied Piper", "Hooli", "Initech", "Stark Ind.", "Wayne Ent.", "Umbrella Corp", "Massive Dynamic"
]

export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setIsGenerating(true)
    // Simulate a brief loading state before redirect for effect
    setTimeout(() => {
      router.push(`/auth/signup?prompt=${encodeURIComponent(prompt)}`)
    }, 600)
  }
  
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
            <Link href="#builders" className="text-[13px] font-extrabold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">Builders</Link>
            <Link href="#templates" className="text-[13px] font-extrabold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">Templates</Link>
            <Link href="#resources" className="text-[13px] font-extrabold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">Resources</Link>
            <Link href="#pricing" className="text-[13px] font-extrabold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">Pricing</Link>
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
              className={`font-sans text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight max-w-4xl`}
            >
              Free AI Certificate Generator
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-600 mb-12 leading-relaxed font-medium max-w-2xl"
            >
              Prompt text and our AI generates editable, professional certificates instantly. Create awards, recognition, or course completion certificates in seconds.
            </motion.p>

            {/* AI Prompt Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 overflow-hidden"
            >
              <form onSubmit={handleGenerate}>
                {/* Fake Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Upgrade</span>
                    <span className="text-xs font-medium text-slate-500 hidden sm:inline">for best quality and full control.</span>
                  </div>
                </div>
                
                {/* Text Area */}
                <div className="p-4 relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the award or certificate details..."
                    className="w-full h-24 resize-none outline-none text-slate-700 text-lg placeholder:text-slate-300 font-medium bg-transparent"
                    autoFocus
                  />
                  
                  {/* Bottom Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button type="button" className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                        <Plus className="w-4 h-4" /> Certificate
                      </button>
                      <select className="text-sm font-bold text-slate-600 bg-transparent outline-none cursor-pointer hover:text-indigo-600">
                        <option>Light AI</option>
                        <option>Pro AI</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button type="button" className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <Mic className="w-5 h-5" />
                      </button>
                      <Button 
                        type="submit" 
                        disabled={!prompt.trim() || isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold shadow-md shadow-indigo-600/20 transition-all h-12 flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
            
            {/* Template Previews Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-16 w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex-shrink-0 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm font-bold cursor-pointer">All Templates</div>
                <div className="flex-shrink-0 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full text-sm font-bold cursor-pointer hover:bg-slate-50">Corporate</div>
                <div className="flex-shrink-0 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full text-sm font-bold cursor-pointer hover:bg-slate-50">Academic</div>
                <div className="flex-shrink-0 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full text-sm font-bold cursor-pointer hover:bg-slate-50">Modern</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Template 1 */}
                <div className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-[4/3] shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 mb-4 border-2 border-indigo-600 rounded-full flex items-center justify-center text-indigo-600">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className={`font-sans text-xl font-bold text-slate-900 mb-2`}>Certificate of Completion</h4>
                    <p className="text-xs text-slate-500 font-medium">Modern corporate design</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </div>
                {/* Template 2 */}
                <div className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[4/3] shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center text-amber-400">
                      <Award className="w-12 h-12" strokeWidth={1} />
                    </div>
                    <h4 className={`font-sans text-xl font-bold text-white mb-2`}>Certificate of Appreciation</h4>
                    <p className="text-xs text-slate-400 font-medium">Classic dark theme</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </div>
                {/* Template 3 */}
                <div className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-[4/3] shadow-sm hover:shadow-xl transition-all cursor-pointer hidden sm:block">
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white">
                    <div className="w-12 h-12 mb-4 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Layout className="w-6 h-6" />
                    </div>
                    <h4 className={`font-sans text-xl font-bold text-slate-900 mb-2`}>Excellence Award</h4>
                    <p className="text-xs text-slate-500 font-medium">Geometric & bold</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </div>
              </div>
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
              <h2 className={`font-sans text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight`}>
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
              <h2 className={`font-sans text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight`}>
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
              <h2 className={`font-sans text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight`}>
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
        <section id="pricing" className="py-32 px-6 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className={`font-sans text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight`}>
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
                Start generating for free. Upgrade when you need to scale. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              
              {/* Starter */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Starter</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">For small events</p>
                <div className="mt-6 flex items-baseline gap-1 mb-8">
                  <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">199</span>
                  <span className="text-slate-500 font-medium text-sm ml-1">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-500 stroke-[3]" />
                    <span className="text-slate-700 font-medium text-sm">50 certificates / mo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-500 stroke-[3]" />
                    <span className="text-slate-700 font-medium text-sm">Basic templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-500 stroke-[3]" />
                    <span className="text-slate-700 font-medium text-sm">Standard support</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full h-12 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-colors" asChild>
                  <Link href="/auth/signup">Get started</Link>
                </Button>
              </div>

              {/* Pro (Highlighted) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transform md:scale-105 relative z-10">
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-extrabold tracking-widest uppercase px-6 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
                
                <h3 className="text-2xl font-extrabold text-white tracking-tight">Pro</h3>
                <p className="text-slate-400 font-medium text-sm mt-2">For growing organizations</p>
                <div className="mt-6 flex items-baseline gap-1 mb-8 text-white">
                  <span className="text-slate-500 font-bold text-xl -translate-y-2">₱</span>
                  <span className="text-6xl font-extrabold tracking-tight">599</span>
                  <span className="text-slate-500 font-medium text-sm ml-1">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-white">
                     <Check className="w-5 h-5 text-blue-400 stroke-[3]" />
                     <span className="font-bold text-sm">300 certificates / mo</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                     <Check className="w-5 h-5 text-blue-400 stroke-[3]" />
                     <span className="font-medium text-sm">AI Template Generator</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                     <Check className="w-5 h-5 text-blue-400 stroke-[3]" />
                     <span className="font-medium text-sm">Custom branding & logos</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                     <Check className="w-5 h-5 text-blue-400 stroke-[3]" />
                     <span className="font-medium text-sm">Automated email delivery</span>
                  </li>
                </ul>
                
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-colors" asChild>
                  <Link href="/auth/signup">Get started</Link>
                </Button>
              </div>

              {/* Enterprise */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">For huge scale operations</p>
                <div className="mt-6 flex items-baseline gap-1 mb-8">
                  <span className="text-slate-400 font-bold text-xl -translate-y-2">₱</span>
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">1499</span>
                  <span className="text-slate-500 font-medium text-sm ml-1">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-500 stroke-[3]" />
                    <span className="text-slate-700 font-bold text-sm">1000+ certificates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-500 stroke-[3]" />
                    <span className="text-slate-700 font-medium text-sm">Full API Access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-500 stroke-[3]" />
                    <span className="text-slate-700 font-medium text-sm">Dedicated account manager</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full h-12 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-colors" asChild>
                  <Link href="/auth/signup">Contact Sales</Link>
                </Button>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#1e293b] pt-20 pb-10 border-t border-slate-800">
        <div className="container mx-auto px-6 max-w-6xl">
          
          {/* Top Footer: Brand & Description */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-700 pb-12 mb-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                 </div>
                 <span className="text-xl font-bold tracking-tight text-white">CertiDraft</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                CertiDraft's AI Certificate Builder and professional templates are designed to empower organizations, schools, and event organizers to create perfect credentials instantly.
              </p>
            </div>
            
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 font-bold shadow-lg transition-transform hover:-translate-y-1 h-12" asChild>
               <Link href="/auth/signup">Build a certificate</Link>
            </Button>
          </div>

          {/* Middle Footer: Link Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16 mb-16">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-extrabold text-sm tracking-wider uppercase mb-2">Builders</h4>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">AI Certificate Generator</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Visual Drag & Drop</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Bulk CSV Importer</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Verifiable Credentials</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">API Access</Link>
            </div>
            
            {/* Column 2 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-extrabold text-sm tracking-wider uppercase mb-2">Templates</h4>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Corporate Certificates</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Academic Diplomas</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Awards of Excellence</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Course Completion</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Custom Formats</Link>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-extrabold text-sm tracking-wider uppercase mb-2">Resources</h4>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Template Gallery</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Certificate Guide</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Help Center</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">API Documentation</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Blog</Link>
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-extrabold text-sm tracking-wider uppercase mb-2">Support</h4>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">About Us</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Contact Sales</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Terms of Service</Link>
              <Link href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Privacy Policy</Link>
            </div>

          </div>

          {/* Bottom Footer: Trust & Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-800">
            
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1">
                 {[...Array(5)].map((_, i) => <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>)}
               </div>
               <span className="text-slate-400 text-sm font-medium">Excellent reviews on <span className="font-bold text-white">Trustpilot</span></span>
            </div>

            <div className="text-slate-500 text-sm font-medium text-center md:text-right">
              © {new Date().getFullYear()} CertiDraft. All rights reserved.
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
