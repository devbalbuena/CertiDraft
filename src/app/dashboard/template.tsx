import { ReactNode } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
