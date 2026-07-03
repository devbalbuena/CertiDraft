import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Wallet,
  CheckCircle2,
  BarChart3,
  CreditCard,
} from 'lucide-react'

// ── Plan pricing ──────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 199,
  pro: 599,
  enterprise: 1499,
}

const PLAN_BADGE_COLORS: Record<string, string> = {
  free:       'bg-slate-100 text-slate-600 border-slate-200',
  starter:    'bg-blue-50 text-blue-700 border-blue-200',
  pro:        'bg-violet-50 text-violet-700 border-violet-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
}

const PLAN_BAR_COLORS: Record<string, string> = {
  starter:    'bg-gradient-to-r from-blue-500 to-blue-400',
  pro:        'bg-gradient-to-r from-violet-500 to-violet-400',
  enterprise: 'bg-gradient-to-r from-amber-500 to-amber-400',
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
    <div className="space-y-8 pb-10">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Billing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revenue estimates based on current plan assignments.</p>
      </div>

      {/* ── Disclaimer banner ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
          Billing data is calculated from current plan assignments. Payment processor integration is not yet connected. All revenue figures are estimates only.
        </p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* MRR — Hero card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 p-6 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/40">
          <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Est. Monthly Revenue</p>
              <div className="p-2 rounded-xl bg-white/15">
                <Wallet className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-4xl font-extrabold tracking-tight">₱{mrr.toLocaleString()}</p>
            <p className="text-xs text-indigo-300 mt-2 font-medium">
              {paidUsers.length} active paid subscriber{paidUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Paid Subscribers */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Paid Subscribers</p>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{paidUsers.length}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Across all paid plans</p>
        </div>

        {/* Churned — green when zero, red when has data */}
        <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow ${
          churnedUsers.length > 0
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-bold uppercase tracking-widest ${
              churnedUsers.length > 0 ? 'text-red-400' : 'text-slate-400'
            }`}>
              Churned (Last 30 Days)
            </p>
            <div className={`p-2 rounded-xl ${
              churnedUsers.length > 0
                ? 'bg-red-100 dark:bg-red-500/10'
                : 'bg-emerald-50 dark:bg-emerald-500/10'
            }`}>
              {churnedUsers.length > 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
            </div>
          </div>
          <p className={`text-4xl font-extrabold tracking-tight ${
            churnedUsers.length > 0
              ? 'text-red-700 dark:text-red-400'
              : 'text-slate-900 dark:text-slate-50'
          }`}>
            {churnedUsers.length}
          </p>
          <p className={`text-xs mt-2 font-medium ${
            churnedUsers.length > 0 ? 'text-red-400' : 'text-emerald-500'
          }`}>
            {churnedUsers.length > 0 ? 'Users churned this month' : 'No churn this month 🎉'}
          </p>
        </div>
      </div>

      {/* ── Revenue by Plan ───────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <BarChart3 className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Revenue Breakdown by Plan</h2>
        </div>
        <div className="px-6 py-5 space-y-5">
          {planBreakdownRevenue.map(({ plan, price, count, total }) => (
            <div key={plan} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`capitalize font-bold text-xs px-3 py-0.5 ${PLAN_BADGE_COLORS[plan]}`}
                  >
                    {plan}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {count} user{count !== 1 ? 's' : ''} × ₱{price.toLocaleString()}
                  </span>
                </div>
                <span className={`text-sm font-extrabold ${total > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                  ₱{total.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${PLAN_BAR_COLORS[plan] ?? 'bg-slate-300'}`}
                  style={{ width: mrr > 0 ? `${(total / mrr) * 100}%` : count > 0 ? '100%' : '0%' }}
                />
              </div>
            </div>
          ))}
          {planBreakdownRevenue.every((p) => p.count === 0) && (
            <p className="text-center text-sm text-slate-400 py-6">
              No paid subscribers yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Paid Users Table ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Paid Subscribers</h2>
          <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {paidUsers.length}
          </span>
        </div>
        {paidUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-8 w-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No paid subscribers yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Name</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Expires</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paidUsers.map((u) => {
                const expiry = u.plan_expires_at ? new Date(u.plan_expires_at) : null
                const isActive = expiry ? expiry > now : true
                return (
                  <TableRow key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {u.full_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize font-bold text-xs ${PLAN_BADGE_COLORS[u.plan]}`}
                      >
                        {u.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                      {expiry ? expiry.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`font-bold text-xs border-0 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {isActive ? '● Active' : '● Expired'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Churned Users ─────────────────────────────────────────────────── */}
      {churnedUsers.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-bold text-red-700 dark:text-red-400">Churned Users (Last 30 Days)</h2>
            <span className="ml-auto text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              {churnedUsers.length}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50/50">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Name</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan Expired</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {churnedUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10">
                  <TableCell className="font-semibold dark:text-slate-200">{u.full_name ?? '—'}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{u.email}</TableCell>
                  <TableCell className="text-red-600 dark:text-red-400 text-sm font-semibold">
                    {u.plan_expires_at
                      ? new Date(u.plan_expires_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
