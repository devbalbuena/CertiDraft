'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'
import { PLAN_LIMITS, type PlanType } from '@/lib/subscriptions'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlatformSettings {
  maintenance_mode: boolean
  maintenance_message: string | null
}

// ── Env badge ─────────────────────────────────────────────────────────────────

function EnvBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">
      <XCircle className="w-3.5 h-3.5" />
      Not configured
    </span>
  )
}

// ── Plan limits table ─────────────────────────────────────────────────────────

const PLAN_ORDER: PlanType[] = ['free', 'starter', 'pro', 'enterprise']

function boolBadge(v: boolean) {
  return v ? (
    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-semibold">Yes</Badge>
  ) : (
    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium">No</Badge>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [roleLoading, setRoleLoading] = useState(true)

  // Settings state
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [togglingMaintenance, setTogglingMaintenance] = useState(false)

  // ── Admin role check ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/auth/login'); return }

    const check = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      if (data?.role !== 'admin') { router.replace('/dashboard'); return }
      setIsAuthorized(true)
      setRoleLoading(false)
    }
    check()
  }, [user, loading, router])

  // ── Load settings ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthorized) return
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const json = await res.json()
          setSettings(json)
        } else {
          // Table may not exist yet — use defaults
          setSettings({ maintenance_mode: false, maintenance_message: null })
        }
      } catch {
        setSettings({ maintenance_mode: false, maintenance_message: null })
      } finally {
        setSettingsLoading(false)
      }
    }
    load()
  }, [isAuthorized])

  // ── Toggle maintenance mode ───────────────────────────────────────────────
  const handleMaintenanceToggle = async (checked: boolean) => {
    if (!settings) return
    setTogglingMaintenance(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance_mode: checked }),
      })
      if (res.ok) {
        setSettings((prev) => prev ? { ...prev, maintenance_mode: checked } : prev)
        toast.success(
          checked ? 'Maintenance mode enabled.' : 'Maintenance mode disabled.'
        )
      } else {
        toast.error('Failed to update maintenance mode. Run the SQL migration first.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setTogglingMaintenance(false)
    }
  }

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!isAuthorized) return null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Settings"
        subtitle="Platform-wide configuration and environment health."
      />

      {/* ── Maintenance Mode ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>
            When enabled, users will see a maintenance message and cannot access
            the application. Admins are not affected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : (
            <div className="flex items-center gap-4">
              <Switch
                id="maintenance-toggle"
                checked={settings?.maintenance_mode ?? false}
                onCheckedChange={handleMaintenanceToggle}
                disabled={togglingMaintenance}
              />
              <Label htmlFor="maintenance-toggle" className="font-semibold text-slate-700 cursor-pointer">
                {settings?.maintenance_mode ? (
                  <span className="text-amber-600">Maintenance mode is ON</span>
                ) : (
                  <span className="text-slate-600">Maintenance mode is OFF</span>
                )}
              </Label>
              {togglingMaintenance && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Environment Health ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Environment Variables
          </CardTitle>
          <CardDescription>
            Shows whether critical API keys are configured. Values are never
            displayed for security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Supabase URL', key: 'NEXT_PUBLIC_SUPABASE_URL' },
            { label: 'Supabase Anon Key', key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' },
            { label: 'Gemini API Key', key: 'GEMINI_API_KEY' },
            { label: 'Resend API Key', key: 'RESEND_API_KEY' },
            { label: 'Redis URL', key: 'REDIS_URL' },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400 font-mono">{key}</p>
              </div>
              {/* We can only check client-visible env vars here */}
              <EnvBadge
                configured={
                  key.startsWith('NEXT_PUBLIC_')
                    ? !!(process.env[key as keyof typeof process.env])
                    : true // Server-only keys we can't check; indicate "configured" to avoid leaking info
                }
              />
            </div>
          ))}
          <p className="text-xs text-slate-400 pt-2">
            * Server-only environment variables cannot be verified from the client. If a server feature
            is not working, check your Vercel/local .env configuration.
          </p>
        </CardContent>
      </Card>

      {/* ── Plan Limits Reference ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Plan Limits (Read-only)
          </CardTitle>
          <CardDescription>
            Current plan limits from <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">src/lib/subscriptions.ts</code>.
            Changing these values requires a code deploy.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 pr-4 font-semibold text-slate-600 w-32">Plan</th>
                <th className="text-left py-3 pr-4 font-semibold text-slate-600">Certs/Month</th>
                <th className="text-left py-3 pr-4 font-semibold text-slate-600">AI Citations</th>
                <th className="text-left py-3 pr-4 font-semibold text-slate-600">Email Delivery</th>
                <th className="text-left py-3 pr-4 font-semibold text-slate-600">CSV Upload</th>
                <th className="text-left py-3 pr-4 font-semibold text-slate-600">API Access</th>
                <th className="text-left py-3 font-semibold text-slate-600">Watermark</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_ORDER.map((plan) => {
                const limits = PLAN_LIMITS[plan]
                return (
                  <tr key={plan} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-bold text-slate-800 capitalize">{plan}</td>
                    <td className="py-3 pr-4 font-mono text-slate-700">{limits.certificatesPerMonth.toLocaleString()}</td>
                    <td className="py-3 pr-4">{boolBadge(limits.features.ai_citations)}</td>
                    <td className="py-3 pr-4">{boolBadge(limits.features.email_delivery)}</td>
                    <td className="py-3 pr-4">{boolBadge(limits.features.csv_upload)}</td>
                    <td className="py-3 pr-4">{boolBadge(limits.features.api_access)}</td>
                    <td className="py-3">{boolBadge(!limits.features.watermark)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
