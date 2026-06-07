import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Users Management" subtitle="View and manage platform users." />
      <EmptyState
        title="Coming Soon"
        description="The user management interface is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
