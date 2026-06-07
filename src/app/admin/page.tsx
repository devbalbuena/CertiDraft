import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="Admin Overview" subtitle="High-level platform metrics and status." />
      <EmptyState
        title="Coming Soon"
        description="The admin overview dashboard is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
