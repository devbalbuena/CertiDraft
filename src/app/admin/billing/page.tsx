import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function AdminBillingPage() {
  return (
    <>
      <PageHeader title="Billing & Subscriptions" subtitle="Manage platform revenue and user subscriptions." />
      <EmptyState
        title="Coming Soon"
        description="The billing management interface is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
