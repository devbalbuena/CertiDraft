import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Platform usage and certificate generation statistics." />
      <EmptyState
        title="Coming Soon"
        description="The analytics dashboard is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
