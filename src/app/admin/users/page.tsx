import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AdminUsersClient } from './AdminUsersClient'

export default async function AdminUsersPage() {
  // ── Auth & role guard ──────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // ── Fetch first page of users ─────────────────────────────────────────────
  const { data: users, count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email, plan, role, created_at, avatar_url', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(0, 19)

  // ── Fetch summary stats ───────────────────────────────────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  const [
    { count: newThisWeek },
    { count: paidUsers }
  ] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).neq('plan', 'free'),
  ])

  return (
    <AdminUsersClient
      initialUsers={users ?? []}
      total={totalUsers ?? 0}
      currentUserId={user.id}
      stats={{
        total: totalUsers ?? 0,
        newThisWeek: newThisWeek ?? 0,
        paid: paidUsers ?? 0,
      }}
    />
  )
}
