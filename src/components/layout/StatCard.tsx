import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
  const variantStyles: Record<string, string> = {
    default: 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400',
    primary: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    destructive: 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400',
    success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  }

  const variantBorders: Record<string, string> = {
    default: 'border-t-slate-200',
    primary: 'border-t-blue-500',
    destructive: 'border-t-red-500',
    success: 'border-t-emerald-500',
    violet: 'border-t-violet-500',
  }

  return (
    <Card className={cn(
      "relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 border-t-[3px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md group",
      variantBorders[variant]
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
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
        <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-2 mb-3">
          {value}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold tracking-wider',
                trend.isPositive 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 stroke-[3]" />
              ) : (
                <ArrowDownRight className="h-3 w-3 stroke-[3]" />
              )}
              {trend.showPlus && trend.isPositive ? '+' : ''}{trend.value}
            </span>
            <span className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold">{trend.label}</span>
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
