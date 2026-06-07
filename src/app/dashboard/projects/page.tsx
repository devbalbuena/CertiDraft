import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" subtitle="Manage your certificate generation projects." />
      <EmptyState
        title="Coming Soon"
        description="The projects area is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
