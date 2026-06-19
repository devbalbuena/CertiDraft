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
  const { data: users, count } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email, plan, role, created_at, avatar_url', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(0, 19)

  return (
    <AdminUsersClient
      initialUsers={users ?? []}
      total={count ?? 0}
      currentUserId={user.id}
    />
  )
}
