'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Users,
  LineChart,
  CreditCard,
  LayoutTemplate,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const ADMIN_NAV = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Analytics', href: '/admin/analytics', icon: LineChart },
  { title: 'Billing', href: '/admin/billing', icon: CreditCard },
  { title: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('certidraft:admin-sidebar-collapsed')
    if (stored === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('certidraft:admin-sidebar-collapsed', String(newState))
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out relative text-slate-300',
        isCollapsed ? 'w-[64px]' : 'w-[260px]'
      )}
    >
      {/* ── Logo Area ────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <ShieldAlert className="h-6 w-6 shrink-0 text-emerald-500" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-white animate-in fade-in duration-200">
              Admin Panel
            </span>
          )}
        </div>
      </div>

      {/* ── Toggle Button ────────────────────────────────────────────────── */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-700 shadow-sm bg-slate-800 text-slate-300 hover:text-white hidden md:flex z-10"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          )
        })}
      </div>

      {/* ── Secondary Navigation ─────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-800 flex flex-col gap-1">
        <Link
          href="/dashboard"
          title={isCollapsed ? 'Back to Dashboard' : undefined}
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Back to Dashboard</span>}
        </Link>
        
        <button
          onClick={handleSignOut}
          title={isCollapsed ? 'Log out' : undefined}
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
