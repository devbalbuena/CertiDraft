import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ElementType
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  variant?: 'default' | 'primary' | 'destructive' | 'success'
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
  const iconColors = {
    default: 'text-slate-400',
    primary: 'text-blue-600',
    destructive: 'text-red-500',
    success: 'text-emerald-500',
  }

  return (
    <Card className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {label}
        </CardTitle>
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg flex items-center justify-center shrink-0",
            variant === 'primary' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
          )}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
          {value}
        </div>
        {trend && (
          <p className="mt-1 flex items-center text-xs">
            <span
              className={cn(
                'font-semibold mr-1.5',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-slate-500 font-medium">{trend.label}</span>
          </p>
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
