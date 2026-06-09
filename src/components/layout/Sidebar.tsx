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
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  
  // Default to expanded to match SSR, then read localStorage on mount
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

  // Prevent harsh layout shifts on first render by hiding until mounted if we need to.
  // Actually, keeping it expanded for 1 frame is usually fine, or we can use a CSS variable.
  // We will just render it with a transition.

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-zinc-100/50 dark:bg-zinc-900/50 border-r border-border/40 transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-[64px]' : 'w-[260px]'
      )}
    >
      {/* ── Logo Area ────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-4 border-b border-border/40">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <Award className="h-6 w-6 shrink-0 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground animate-in fade-in duration-200">
              CertiDraft
            </span>
          )}
        </div>
      </div>

      {/* ── Toggle Button ────────────────────────────────────────────────── */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border shadow-sm bg-background hidden md:flex z-10"
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
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {PRIMARY_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          )
        })}

        {/* Section Label: Certificates (No Link) */}
        {!isCollapsed ? (
          <div className="mt-4 mb-1 px-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Certificates
          </div>
        ) : (
          <div className="mt-4 mb-2 mx-auto h-px w-4 bg-border/60" />
        )}
        {/* We would place certificate-related links here later */}
      </div>

      {/* ── Secondary Navigation ─────────────────────────────────────────── */}
      <div className="p-3 border-t border-border/40 flex flex-col gap-1">
        {SECONDARY_NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            title={isCollapsed ? 'Admin Panel' : undefined}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Admin Panel</span>}
          </Link>
        )}
        
        <button
          onClick={handleSignOut}
          title={isCollapsed ? 'Log out' : undefined}
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
