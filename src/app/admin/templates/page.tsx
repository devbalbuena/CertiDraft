import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function AdminTemplatesPage() {
  return (
    <>
      <PageHeader title="Global Templates" subtitle="Manage default templates available to all users." />
      <EmptyState
        title="Coming Soon"
        description="The global templates management interface is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
