'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS: Record<string, string> = {
  free: '#94a3b8',
  starter: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b',
}

interface PlanChartClientProps {
  data: { name: string; value: number }[]
}

export function PlanChartClient({ data }: PlanChartClientProps) {
  if (data.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-slate-400">
        No users yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
                    {payload[0].name}
                  </p>
                  <p className="text-slate-900 dark:text-white font-bold">
                    {payload[0].value} users
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Legend 
          iconType="circle" 
          formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
