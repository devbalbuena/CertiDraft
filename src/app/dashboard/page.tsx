import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome back. Here's an overview of your activity." />
      <EmptyState
        title="Coming Soon"
        description="The dashboard overview is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
