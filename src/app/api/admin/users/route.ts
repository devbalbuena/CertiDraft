import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// ── Helper ────────────────────────────────────────────────────────────────────

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return user
}

// ── GET /api/admin/users?page=1&limit=20&q=search ────────────────────────────

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
  const q = searchParams.get('q')?.trim() ?? ''
  const plan = searchParams.get('plan')?.trim() ?? 'all'
  const role = searchParams.get('role')?.trim() ?? 'all'
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('users')
    .select('id, full_name, email, plan, role, created_at, avatar_url', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
  }
  if (plan !== 'all') {
    query = query.eq('plan', plan)
  }
  if (role !== 'all') {
    query = query.eq('role', role)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data ?? [], total: count ?? 0, page, limit })
}
