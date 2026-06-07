import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Platform Settings" subtitle="Configure global application settings and integrations." />
      <EmptyState
        title="Coming Soon"
        description="The platform settings interface is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
