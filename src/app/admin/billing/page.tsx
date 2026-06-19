import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, DollarSign, TrendingDown, Users } from 'lucide-react'

// ── Plan pricing ──────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 199,
  pro: 599,
  enterprise: 1499,
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-100 text-slate-700',
  starter: 'bg-blue-50 text-blue-700',
  pro: 'bg-violet-50 text-violet-700',
  enterprise: 'bg-amber-50 text-amber-700',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminBillingPage() {
  // ── Auth & role guard ──────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const db = supabaseAdmin

  // ── Fetch all users with billing-relevant fields ───────────────────────────
  const { data: allUsers } = await db
    .from('users')
    .select('id, full_name, email, plan, plan_expires_at, created_at')
    .order('plan', { ascending: false })

  const users = allUsers ?? []
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // ── Metrics ───────────────────────────────────────────────────────────────
  const paidUsers = users.filter((u) => u.plan !== 'free')

  const mrr = paidUsers.reduce((sum, u) => sum + (PLAN_PRICES[u.plan] ?? 0), 0)

  const planBreakdownRevenue = Object.entries(PLAN_PRICES)
    .filter(([plan]) => plan !== 'free')
    .map(([plan, price]) => {
      const count = users.filter((u) => u.plan === plan).length
      return { plan, price, count, total: count * price }
    })
    .sort((a, b) => b.total - a.total)

  const churnedUsers = users.filter((u) => {
    if (!u.plan_expires_at) return false
    const expiry = new Date(u.plan_expires_at)
    return expiry < now && expiry >= thirtyDaysAgo && u.plan === 'free'
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing"
        subtitle="Revenue estimates based on current plan assignments."
      />

      {/* ── Important disclaimer ───────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm font-medium text-amber-900">
          Billing data is calculated from current plan assignments. Payment
          processor integration is not yet connected. All revenue figures are
          estimates only.
        </p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Est. Monthly Revenue"
          value={`₱${mrr.toLocaleString()}`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          label="Paid Subscribers"
          value={paidUsers.length}
          icon={Users}
          variant="success"
        />
        <StatCard
          label="Churned (Last 30 Days)"
          value={churnedUsers.length}
          icon={TrendingDown}
          variant={churnedUsers.length > 0 ? 'destructive' : 'default'}
        />
      </div>

      {/* ── Revenue by Plan ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">
            Revenue Breakdown by Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {planBreakdownRevenue.map(({ plan, price, count, total }) => (
            <div key={plan} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-32">
                <Badge
                  variant="outline"
                  className={`capitalize font-semibold ${PLAN_COLORS[plan]}`}
                >
                  {plan}
                </Badge>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>{count} users × ₱{price.toLocaleString()}</span>
                  <span className="font-bold text-slate-800">
                    ₱{total.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: mrr > 0 ? `${(total / mrr) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          ))}
          {planBreakdownRevenue.every((p) => p.count === 0) && (
            <p className="text-center text-sm text-slate-400 py-4">
              No paid subscribers yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Paid Users Table ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">
            Paid Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paidUsers.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-12">
              No paid subscribers yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidUsers.map((u) => {
                  const expiry = u.plan_expires_at
                    ? new Date(u.plan_expires_at)
                    : null
                  const isActive = expiry ? expiry > now : true
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-slate-800">
                        {u.full_name ?? '—'}
                      </TableCell>
                      <TableCell className="text-slate-600">{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize font-semibold ${PLAN_COLORS[u.plan]}`}
                        >
                          {u.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {expiry ? expiry.toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }
                        >
                          {isActive ? 'Active' : 'Expired'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Churned Users ─────────────────────────────────────────────────── */}
      {churnedUsers.length > 0 && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Churned Users (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-red-50/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan Expired</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churnedUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name ?? '—'}</TableCell>
                    <TableCell className="text-slate-600">{u.email}</TableCell>
                    <TableCell className="text-red-600 text-sm font-medium">
                      {u.plan_expires_at
                        ? new Date(u.plan_expires_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
