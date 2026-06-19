'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
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
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Loader2, ShieldCheck, ShieldOff, UserCog } from 'lucide-react'
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
}

const PLAN_COLORS: Record<Plan, string> = {
  free: 'bg-slate-100 text-slate-700 border-slate-200',
  starter: 'bg-blue-50 text-blue-700 border-blue-200',
  pro: 'bg-violet-50 text-violet-700 border-violet-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
}

const ROLE_COLORS: Record<Role, string> = {
  user: 'bg-slate-100 text-slate-600',
  admin: 'bg-emerald-50 text-emerald-700',
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
}: AdminUsersClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Data state
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [totalCount, setTotalCount] = useState(total)
  const [page, setPage] = useState(1)

  // UI state
  const [search, setSearch] = useState('')
  const [dialogUser, setDialogUser] = useState<AdminUser | null>(null)
  const [dialogMode, setDialogMode] = useState<'plan' | 'role' | null>(null)
  const [newPlan, setNewPlan] = useState<Plan>('free')
  const [isSaving, setIsSaving] = useState(false)

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // ── Fetch users from API ───────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (p: number, q: string) => {
      startTransition(async () => {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(PAGE_SIZE),
          q,
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
    fetchUsers(1, q)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchUsers(newPage, search)
  }

  // ── Open dialogs ──────────────────────────────────────────────────────────
  const openPlanDialog = (u: AdminUser) => {
    setDialogUser(u)
    setNewPlan(u.plan)
    setDialogMode('plan')
  }

  const openRoleDialog = (u: AdminUser) => {
    setDialogUser(u)
    setDialogMode('role')
  }

  // ── Submit changes ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!dialogUser || !dialogMode) return
    setIsSaving(true)

    const body =
      dialogMode === 'plan'
        ? { plan: newPlan }
        : { role: dialogUser.role === 'admin' ? 'user' : 'admin' }

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
        setDialogMode(null)
        fetchUsers(page, search)
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
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
                <TableRow key={u.id} className="hover:bg-slate-50/60">
                  <TableCell>
                    <UserInitials name={u.full_name} email={u.email} />
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    {u.full_name ?? '—'}
                    {u.id === currentUserId && (
                      <span className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize font-semibold ${PLAN_COLORS[u.plan ?? 'free']}`}
                    >
                      {u.plan ?? 'free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`capitalize font-semibold ${ROLE_COLORS[u.role ?? 'user']}`}
                    >
                      {u.role ?? 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openPlanDialog(u)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.id === currentUserId ? (
                          <DropdownMenuItem disabled className="text-slate-400">
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Cannot edit self role
                          </DropdownMenuItem>
                        ) : u.role === 'admin' ? (
                          <DropdownMenuItem
                            onClick={() => openRoleDialog(u)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                          >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Remove Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => openRoleDialog(u)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Change Plan Dialog */}
      <Dialog open={dialogMode === 'plan'} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan for{' '}
              <strong>{dialogUser?.full_name ?? dialogUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || newPlan === dialogUser?.plan}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={dialogMode === 'role'} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogUser?.role === 'admin' ? 'Remove Admin Access' : 'Grant Admin Access'}
            </DialogTitle>
            <DialogDescription>
              {dialogUser?.role === 'admin'
                ? `This will revoke admin privileges from ${dialogUser?.full_name ?? dialogUser?.email}.`
                : `This will grant full admin access to ${dialogUser?.full_name ?? dialogUser?.email}. They will be able to manage all users, templates, and platform data.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant={dialogUser?.role === 'admin' ? 'destructive' : 'default'}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {dialogUser?.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
