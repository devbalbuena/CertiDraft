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
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-zinc-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              CertiDraft
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#templates"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Templates
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 text-center">
          <div className="container mx-auto max-w-4xl flex flex-col items-center">
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/50">
              Trusted by educators and organizations
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 text-balance leading-tight">
              Issue beautiful certificates at scale
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl text-balance">
              Design once, generate hundreds. CertiDraft automates your entire
              certificate workflow — from CSV upload to verified PDF delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base" asChild>
                <Link href="/auth/signup">Start for free</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base bg-white dark:bg-zinc-950" asChild>
                <Link href="/templates">See templates</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Features Section ────────────────────────────────────────────── */}
        <section id="features" className="py-20 bg-white dark:bg-zinc-950 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
                Everything you need to issue certificates
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Visual Builder
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Design stunning certificates with our drag and drop canvas. Add custom fonts, logos, and signatures with ease.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Batch Generation
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Upload a CSV file and map your columns. Generate hundreds of personalized PDFs in seconds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  AI Citations
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Use Gemini-powered AI to automatically draft unique, personalized citation text for every recipient.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  QR Verification
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Every certificate includes a unique QR code and token for instant, fraud-proof public verification.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="flex flex-col gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Email Delivery
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Send certificates directly to recipients with customizable email templates and tracking.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="flex flex-col gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Certificate Wallet
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Give recipients a beautiful, public shareable credential page to showcase their achievements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing Section ─────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-4 bg-zinc-50 dark:bg-black border-t border-zinc-100 dark:border-zinc-800">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
                Simple, transparent pricing
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {/* Free */}
              <Card className="flex flex-col h-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Free</CardTitle>
                  <CardDescription>Perfect for trying it out</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₱0</span>
                    <span className="text-zinc-500 font-medium">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">5 certificates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">Basic templates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">Standard support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Starter */}
              <Card className="flex flex-col h-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Starter</CardTitle>
                  <CardDescription>For small events</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₱199</span>
                    <span className="text-zinc-500 font-medium">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">50 certificates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">All templates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">QR Verification</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro */}
              <Card className="flex flex-col h-full bg-white dark:bg-zinc-950 border-primary ring-1 ring-primary shadow-lg relative transform lg:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                  Most popular
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Pro</CardTitle>
                  <CardDescription>For growing organizations</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₱599</span>
                    <span className="text-zinc-500 font-medium">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-zinc-600 dark:text-zinc-300 font-medium">300 certificates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-zinc-600 dark:text-zinc-300">Custom branding</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-zinc-600 dark:text-zinc-300">Email delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-zinc-600 dark:text-zinc-300">AI Citations</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise */}
              <Card className="flex flex-col h-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Enterprise</CardTitle>
                  <CardDescription>For large scale operations</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₱1499</span>
                    <span className="text-zinc-500 font-medium">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">1000+ certificates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">API Access</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              CertiDraft
            </span>
            <span className="text-sm text-zinc-500">
              Professional certificates, simplified.
            </span>
          </div>
          <div className="text-sm text-zinc-500">
            © 2025 CertiDraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
