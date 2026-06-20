'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DailyCount {
  date: string
  count: number
}

interface DashboardChartsClientProps {
  data: DailyCount[]
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm z-50">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <p className="text-slate-600 font-medium">
          <span className="text-indigo-600 font-extrabold">{payload[0].value}</span>{' '}
          certificates
        </p>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardChartsClient({ data }: DashboardChartsClientProps) {
  // Calculate total for description
  const totalInPeriod = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
              Generation Trends
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-1">
              Certificates drafted over the last 30 days
            </CardDescription>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        
        {data.length > 0 && (
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalInPeriod}
            </span>
            <span className="text-sm font-semibold text-emerald-600 ml-2">Total</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-6 pb-2 flex-1 min-h-[300px]">
        {data.length === 0 || totalInPeriod === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 py-12">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 shadow-sm">
               <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-slate-900 font-extrabold text-[15px] mb-1">No activity yet</p>
            <p className="text-slate-500 text-[13px] font-medium max-w-[250px] text-center leading-relaxed">
              Create your first project to start tracking generation trends.
            </p>
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(v) => v.slice(5)} // Show MM-DD
                  interval="preserveStartEnd"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
