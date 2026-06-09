import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UpgradePromptProps {
  feature: string
  currentPlan: string
  requiredPlan?: string
}

export function UpgradePrompt({ feature, currentPlan, requiredPlan = 'Pro' }: UpgradePromptProps) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="p-4 bg-muted rounded-full">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{feature} is locked</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            You are currently on the <span className="font-medium capitalize">{currentPlan}</span> plan. 
            Upgrade to the <span className="font-medium">{requiredPlan}</span> plan to unlock this feature.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/subscription">
            Upgrade Plan
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
