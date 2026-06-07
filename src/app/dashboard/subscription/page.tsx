import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function SubscriptionPage() {
  return (
    <>
      <PageHeader title="Subscription" subtitle="Manage your billing and plan details." />
      <EmptyState
        title="Coming Soon"
        description="The subscription management page is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
