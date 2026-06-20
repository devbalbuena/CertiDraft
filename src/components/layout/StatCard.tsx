import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardTrend {
  value: number | string
  label: string
  isPositive?: boolean
  showPlus?: boolean
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ElementType
  trend?: StatCardTrend
  variant?: 'default' | 'primary' | 'destructive' | 'success' | 'violet'
  children?: React.ReactNode
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  children,
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-slate-50 text-slate-500',
    primary: 'bg-blue-50 text-blue-600',
    destructive: 'bg-red-50 text-red-500',
    success: 'bg-emerald-50 text-emerald-500',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <Card className="overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
        <CardTitle className="text-[13px] font-bold tracking-wide text-slate-500 uppercase">
          {label}
        </CardTitle>
        {Icon && (
          <div className={cn(
            "p-2.5 rounded-xl flex items-center justify-center shrink-0",
            variantStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1 mb-2">
          {value}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-extrabold tracking-wider',
                trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              )}
            >
              {trend.showPlus && trend.isPositive ? '+' : ''}{trend.value}
            </span>
            <span className="text-[12px] text-slate-500 font-semibold">{trend.label}</span>
          </div>
        )}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
