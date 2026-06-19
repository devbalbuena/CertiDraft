'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'

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

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-blue-600 font-bold">{payload[0].value}</p>
    </div>
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
  const totalBatch = batchStatus.reduce((s, b) => s + b.count, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        subtitle="Platform-wide usage metrics for the last 30 days."
      />

      {/* ── Row 1: Certificates + Signups ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              Certificates Generated (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certsByDay.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={certsByDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => v.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              New User Signups (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signupsByDay.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={signupsByDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => v.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Batch Status + Avg Processing Time ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              Batch Job Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalBatch === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">No batch jobs yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={batchStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {batchStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={PIE_COLORS[entry.status] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600 capitalize">{value}</span>
                    )}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              Avg. Batch Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[260px] gap-4">
            {avgProcessingMinutes === null ? (
              <p className="text-sm text-slate-400">
                No completed batch jobs with timing data yet.
              </p>
            ) : (
              <>
                <div className="text-7xl font-extrabold text-slate-900 tracking-tight">
                  {avgProcessingMinutes < 1
                    ? `${Math.round(avgProcessingMinutes * 60)}s`
                    : `${avgProcessingMinutes.toFixed(1)}m`}
                </div>
                <p className="text-sm font-medium text-slate-500">
                  average time from start to completion
                </p>
                <p className="text-xs text-slate-400">
                  Based on {totalBatch} total batch job{totalBatch !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Template Usage ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">
            Most Used Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templateUsage.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-12">No template usage data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={templateUsage.slice(0, 10)}
                margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="template_name"
                  width={120}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {templateUsage.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={TEMPLATE_COLORS[i % TEMPLATE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
