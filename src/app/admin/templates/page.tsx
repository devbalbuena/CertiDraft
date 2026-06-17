import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AdminTemplatesClient } from './AdminTemplatesClient'

export default async function AdminTemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Verify admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all templates with creator info using admin client (bypasses RLS)
  const adminSupabase = supabaseAdmin
  const { data: templates } = await adminSupabase
    .from('templates')
    .select('*, users(email)')
    .order('created_at', { ascending: false })

  return <AdminTemplatesClient templates={templates ?? []} />
}
