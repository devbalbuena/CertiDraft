import { type ReactNode } from 'react'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Topbar } from '@/components/layout/Topbar'
import { AdminRouteGuard } from '@/components/layout/AdminRouteGuard'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AdminRouteGuard>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
