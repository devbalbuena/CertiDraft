'use client'

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, CheckCircle2, Timer, Trophy } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DailyCount {
  date: string
  count: number
}

interface TemplateUsage {
  template_name: string
  count: number
}

interface BatchStatusBreakdown {
  status: string
  count: number
}

interface AdminAnalyticsClientProps {
  certsByDay: DailyCount[]
  signupsByDay: DailyCount[]
  templateUsage: TemplateUsage[]
  batchStatus: BatchStatusBreakdown[]
  avgProcessingMinutes: number | null
}

// ── Date range options ────────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 },
]

// ── Colors ────────────────────────────────────────────────────────────────────

const PIE_COLORS: Record<string, string> = {
  completed: '#10b981',
  failed: '#ef4444',
  completed_with_errors: '#f59e0b',
  processing: '#3b82f6',
  pending: '#94a3b8',
}

const TEMPLATE_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
]

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, color = '#3b82f6' }: {
  active?: boolean
  payload?: { value: number; name?: string }[]
  label?: string
  color?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-xl px-4 py-3 text-sm pointer-events-none">
      <p className="text-slate-500 text-xs font-medium mb-1.5">{label}</p>
      <p className="font-extrabold text-slate-900 text-lg leading-tight" style={{ color }}>
        {payload[0].value}
      </p>
    </div>
  )
}

// ── Template Tooltip ──────────────────────────────────────────────────────────

function TemplateTooltip({ active, payload }: {
  active?: boolean
  payload?: { value: number; payload: TemplateUsage }[]
}) {
  if (!active || !payload?.length) return null
  const { template_name, count } = payload[0].payload
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-xl px-4 py-3 text-sm pointer-events-none">
      <p className="text-slate-600 font-semibold mb-1">{template_name}</p>
      <p className="font-extrabold text-blue-600 text-lg">{count} uses</p>
    </div>
  )
}

// ── Gradient Defs ─────────────────────────────────────────────────────────────

function GradientDefs() {
  return (
    <defs>
      <linearGradient id="certGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminAnalyticsClient({
  certsByDay,
  signupsByDay,
  templateUsage,
  batchStatus,
  avgProcessingMinutes,
}: AdminAnalyticsClientProps) {
  const [selectedDays, setSelectedDays] = useState(30)

  const totalBatch = batchStatus.reduce((s, b) => s + b.count, 0)
  const completedBatch = batchStatus.find(b => b.status === 'completed')?.count ?? 0
  const successRate = totalBatch > 0 ? Math.round((completedBatch / totalBatch) * 100) : null

  // Slice data to the selected date range
  const filteredCerts = useMemo(
    () => certsByDay.slice(-selectedDays),
    [certsByDay, selectedDays]
  )
  const filteredSignups = useMemo(
    () => signupsByDay.slice(-selectedDays),
    [signupsByDay, selectedDays]
  )

  const totalCerts = filteredCerts.reduce((s, d) => s + d.count, 0)
  const totalSignups = filteredSignups.reduce((s, d) => s + d.count, 0)

  const avgTime = avgProcessingMinutes === null ? null : (
    avgProcessingMinutes < 1
      ? `${Math.round(avgProcessingMinutes * 60)}s`
      : `${avgProcessingMinutes.toFixed(1)}m`
  )

  // Circumference for the success ring
  const RING_R = 42
  const CIRCUMFERENCE = 2 * Math.PI * RING_R
  const ringOffset = successRate !== null
    ? CIRCUMFERENCE * (1 - successRate / 100)
    : CIRCUMFERENCE

  return (
    <div className="space-y-6">
      {/* ── Header + Date Range Picker ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Analytics"
          subtitle={`Platform-wide usage metrics for the last ${selectedDays} days.`}
        />
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start sm:self-auto">
          <Calendar className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
          {DATE_RANGES.map(({ label, days }) => (
            <Button
              key={days}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDays(days)}
              className={
                selectedDays === days
                  ? 'h-8 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-600 font-semibold text-xs'
                  : 'h-8 px-3 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-xs'
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Summary stat pills ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: FileText,
            label: 'Certs Generated',
            value: totalCerts,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-t-blue-500',
          },
          {
            icon: Trophy,
            label: 'New Signups',
            value: totalSignups,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            border: 'border-t-violet-500',
          },
          {
            icon: CheckCircle2,
            label: 'Batch Success Rate',
            value: successRate !== null ? `${successRate}%` : '—',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-t-emerald-500',
          },
          {
            icon: Timer,
            label: 'Avg Processing Time',
            value: avgTime ?? '—',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-t-amber-500',
          },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <Card key={label} className={`border-t-[3px] ${border} shadow-sm hover:-translate-y-1 transition-transform duration-200`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-2.5 rounded-xl ${bg} shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 1: Certificates + Signups (Area Charts) ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
              Certificates Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCerts.every(d => d.count === 0) ? (
              <p className="text-center text-sm text-slate-400 py-12">No certificate data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={filteredCerts} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => v.slice(5)}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip color="#3b82f6" />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#certGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500 inline-block" />
              New User Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSignups.every(d => d.count === 0) ? (
              <p className="text-center text-sm text-slate-400 py-12">No signup data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={filteredSignups} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => v.slice(5)}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip color="#8b5cf6" />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#signupGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: System Health + Top Templates ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* System Health card */}
        <Card className="shadow-sm border-t-[3px] border-t-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            {totalBatch === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">No batch jobs yet.</p>
            ) : (
              <div className="flex items-center gap-8 py-4">
                {/* SVG Ring */}
                <div className="relative shrink-0">
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r={RING_R} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    <circle
                      cx="55" cy="55" r={RING_R}
                      fill="none"
                      stroke={successRate === 100 ? '#10b981' : successRate !== null && successRate >= 80 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={ringOffset}
                      transform="rotate(-90 55 55)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                    <text x="55" y="51" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">
                      {successRate}%
                    </text>
                    <text x="55" y="67" textAnchor="middle" fontSize="10" fill="#94a3b8">
                      success
                    </text>
                  </svg>
                </div>

                {/* Breakdown list */}
                <div className="flex-1 space-y-3">
                  {batchStatus.map((b) => (
                    <div key={b.status} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[b.status] ?? '#94a3b8' }}
                        />
                        <span className="text-sm text-slate-600 capitalize truncate">
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 shrink-0">{b.count}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Avg. processing time</span>
                      <span className="text-sm font-extrabold text-slate-900">{avgTime ?? '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Templates mini-table */}
        <Card className="shadow-sm border-t-[3px] border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {templateUsage.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">No template usage data yet.</p>
            ) : (
              <div className="space-y-3">
                {templateUsage.slice(0, 5).map((t, i) => {
                  const maxCount = templateUsage[0].count
                  const pct = maxCount > 0 ? (t.count / maxCount) * 100 : 0
                  return (
                    <div key={t.template_name} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: TEMPLATE_COLORS[i % TEMPLATE_COLORS.length] }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 truncate">{t.template_name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 shrink-0 ml-2">{t.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: TEMPLATE_COLORS[i % TEMPLATE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Full-width Template Bar Chart ─────────────────────────────── */}
      {templateUsage.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">Template Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={templateUsage.slice(0, 10)}
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="template_name"
                  width={130}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<TemplateTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {templateUsage.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={TEMPLATE_COLORS[i % TEMPLATE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
