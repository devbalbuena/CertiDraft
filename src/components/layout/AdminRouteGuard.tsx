'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    // 1. Wait for AuthContext to finish loading the session
    if (loading) return

    // 2. If no user is logged in, redirect to login
    if (!user) {
      router.replace('/auth/login')
      return
    }

    // 3. Check the user's role in the database
    const checkRole = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (error || data?.role !== 'admin') {
        // Not an admin -> send them to the regular dashboard
        router.replace('/dashboard')
      } else {
        setIsAuthorized(true)
      }
      setRoleLoading(false)
    }

    checkRole()
  }, [user, loading, router])

  // Show a full-screen loading spinner while waiting for session and role check
  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Double check authorization before rendering children
  if (!isAuthorized) return null

  return <>{children}</>
}
