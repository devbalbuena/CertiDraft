'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  FolderOpen,
  LayoutTemplate,
  Award,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const PRIMARY_NAV = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { title: 'Templates', href: '/dashboard/templates', icon: LayoutTemplate },
]

const SECONDARY_NAV = [
  { title: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const { user } = useAuth()

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('certidraft:sidebar-collapsed')
    if (stored === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  React.useEffect(() => {
    if (user) {
      const fetchRole = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (data?.role === 'admin') {
          setIsAdmin(true)
        }
      }
      fetchRole()
    }
  }, [user])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('certidraft:sidebar-collapsed', String(newState))
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out relative z-40',
        isCollapsed ? 'w-[64px]' : 'w-[260px]'
      )}
    >
      {/* ── Logo Area ────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <div className="h-7 w-7 bg-blue-600 rounded flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white animate-in fade-in duration-200">
              CertiDraft
            </span>
          )}
        </div>
      </div>

      {/* ── Toggle Button ────────────────────────────────────────────────── */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-200 shadow-sm bg-white hidden md:flex z-50 hover:bg-slate-50 text-slate-500"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* ── Primary Navigation ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
        {PRIMARY_NAV.map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}
              <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          )
        })}

        {/* Section Label: Certificates */}
        {!isCollapsed ? (
          <div className="mt-6 mb-2 px-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Certificates
          </div>
        ) : (
          <div className="mt-6 mb-2 mx-auto h-px w-6 bg-slate-200 dark:bg-slate-700" />
        )}

        <Link
          href="/dashboard/certificates"
          title={isCollapsed ? 'All Certificates' : undefined}
          className={cn(
            'group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200',
            pathname === '/dashboard/certificates'
              ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          {pathname === '/dashboard/certificates' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
          )}
          <Award className={cn("h-4 w-4 shrink-0 transition-colors", pathname === '/dashboard/certificates' ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
          {!isCollapsed && <span className="truncate">All Certificates</span>}
        </Link>
      </div>

      {/* ── Secondary Navigation ─────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 bg-slate-50/50 dark:bg-slate-900/50">
        {SECONDARY_NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}
              <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            title={isCollapsed ? 'Admin Panel' : undefined}
            className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200 text-emerald-600 hover:bg-emerald-50"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            {!isCollapsed && <span className="truncate">Admin Panel</span>}
          </Link>
        )}
        
        <button
          onClick={handleSignOut}
          title={isCollapsed ? 'Log out' : undefined}
          className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 w-full text-left"
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-red-500 transition-colors" />
          {!isCollapsed && <span className="truncate">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
