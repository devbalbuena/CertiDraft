import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Hammer } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <>
      <PageHeader title="Templates" subtitle="Design and manage your certificate templates." />
      <EmptyState
        title="Coming Soon"
        description="The template builder is currently under construction."
        icon={Hammer}
      />
    </>
  )
}
