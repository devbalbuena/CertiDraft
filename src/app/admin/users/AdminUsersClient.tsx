'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Loader2, ShieldCheck, ShieldOff, UserCog, Users, TrendingUp, DollarSign, Crown, CheckCircle, Pencil } from 'lucide-react'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = 'free' | 'starter' | 'pro' | 'enterprise'
type Role = 'user' | 'admin'

interface AdminUser {
  id: string
  full_name: string | null
  email: string
  plan: Plan
  role: Role
  created_at: string
  avatar_url: string | null
}

interface AdminUsersClientProps {
  initialUsers: AdminUser[]
  total: number
  currentUserId: string
  stats: {
    total: number
    newThisWeek: number
    paid: number
  }
}

const PLAN_COLORS: Record<Plan, string> = {
  free: 'bg-slate-100 text-slate-700 border-slate-200',
  starter: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pro: 'bg-blue-50 text-blue-700 border-blue-200',
  enterprise: 'bg-violet-50 text-violet-700 border-violet-200',
}

const ROLE_COLORS: Record<Role, string> = {
  user: 'bg-slate-100 text-slate-600',
  admin: 'bg-amber-50 text-amber-700 border-amber-200',
}

const PAGE_SIZE = 20

function UserInitials({ name, email }: { name: string | null; email: string }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email.slice(0, 2).toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminUsersClient({
  initialUsers,
  total,
  currentUserId,
  stats,
}: AdminUsersClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Data state
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [totalCount, setTotalCount] = useState(total)
  const [page, setPage] = useState(1)

  // UI state
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Dialog state
  const [dialogUser, setDialogUser] = useState<AdminUser | null>(null)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)
  const [newPlan, setNewPlan] = useState<Plan>('free')
  const [newRole, setNewRole] = useState<Role>('user')
  const [isSaving, setIsSaving] = useState(false)

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // ── Fetch users from API ───────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (p: number, q: string, pf: string, rf: string) => {
      startTransition(async () => {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(PAGE_SIZE),
          q,
          plan: pf,
          role: rf
        })
        const res = await fetch(`/api/admin/users?${params}`)
        if (res.ok) {
          const json = await res.json()
          setUsers(json.users)
          setTotalCount(json.total)
        }
      })
    },
    []
  )

  const handleSearch = (q: string) => {
    setSearch(q)
    setPage(1)
    fetchUsers(1, q, planFilter, roleFilter)
  }

  const handlePlanFilterChange = (val: string) => {
    setPlanFilter(val)
    setPage(1)
    fetchUsers(1, search, val, roleFilter)
  }

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val)
    setPage(1)
    fetchUsers(1, search, planFilter, val)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchUsers(newPage, search, planFilter, roleFilter)
  }

  // ── Open dialogs ──────────────────────────────────────────────────────────
  const openManageDialog = (u: AdminUser) => {
    setDialogUser(u)
    setNewPlan(u.plan)
    setNewRole(u.role)
    setIsManageDialogOpen(true)
  }

  // ── Submit changes ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!dialogUser) return
    setIsSaving(true)

    const body = { plan: newPlan, role: newRole }

    try {
      const res = await fetch(`/api/admin/users/${dialogUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'Failed to update user')
      } else {
        toast.success('User updated successfully.')
        setDialogUser(null)
        setIsManageDialogOpen(false)
        fetchUsers(page, search, planFilter, roleFilter)
        router.refresh()
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Manage all registered users across CertiDraft." />

      {/* ── Summary Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={stats.total.toLocaleString()}
          icon={Users}
          variant="default"
        />
        <StatCard
          label="New This Week"
          value={stats.newThisWeek.toLocaleString()}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 'Last 7 days', label: '', isPositive: true }}
        />
        <StatCard
          label="Paid Users"
          value={stats.paid.toLocaleString()}
          icon={DollarSign}
          variant="primary"
        />
      </div>

      {/* ── Filters & Search ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={planFilter} onValueChange={handlePlanFilterChange}>
            <SelectTrigger className="w-[140px] h-10 bg-white">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-[140px] h-10 bg-white">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-10"></TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-sm text-slate-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/60 group">
                  <TableCell>
                    <UserInitials name={u.full_name} email={u.email} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        {u.full_name ?? '—'}
                        {u.id === currentUserId && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize font-semibold inline-flex items-center gap-1 border ${PLAN_COLORS[u.plan ?? 'free']}`}
                    >
                      {u.plan !== 'free' && <CheckCircle className="h-3 w-3" />}
                      {u.plan ?? 'free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`capitalize font-semibold inline-flex items-center gap-1 border ${ROLE_COLORS[u.role ?? 'user']}`}
                    >
                      {u.role === 'admin' ? <Crown className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                      {u.role ?? 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openManageDialog(u)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 text-slate-500 hover:text-slate-900"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Manage
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openManageDialog(u)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Manage User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of{' '}
            {totalCount} users
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Manage User Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              Update the subscription plan and role for{' '}
              <strong>{dialogUser?.full_name ?? dialogUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Subscription Plan</label>
              <Select value={newPlan} onValueChange={(v) => setNewPlan(v as Plan)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {(['free', 'starter', 'pro', 'enterprise'] as Plan[]).map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">User Role</label>
              <Select 
                value={newRole} 
                onValueChange={(v) => setNewRole(v as Role)}
                disabled={dialogUser?.id === currentUserId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {dialogUser?.id === currentUserId && (
                <p className="text-xs text-slate-500 mt-1">You cannot change your own role.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || (newPlan === dialogUser?.plan && newRole === dialogUser?.role)}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
