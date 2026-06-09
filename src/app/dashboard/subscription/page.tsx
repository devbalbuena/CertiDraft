'use client'

import * as React from 'react'
import { CheckCircle2, Crown, Zap, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLAN_LIMITS, PlanType, checkPlanLimit } from '@/lib/subscriptions'

const PLANS = [
  {
    id: 'free' as PlanType,
    name: 'Free',
    price: '₱0',
    description: 'Perfect for getting started.',
    icon: Shield,
    features: [
      '5 certificates per month',
      'Basic templates',
      'CertiDraft watermark on PDFs',
    ]
  },
  {
    id: 'starter' as PlanType,
    name: 'Starter',
    price: '₱199',
    period: '/month',
    description: 'For small events and workshops.',
    icon: Zap,
    features: [
      '50 certificates per month',
      'No watermarks',
      'CSV bulk upload',
      'Email delivery via SendGrid',
    ]
  },
  {
    id: 'pro' as PlanType,
    name: 'Pro',
    price: '₱599',
    period: '/month',
    description: 'For organizations and schools.',
    icon: Crown,
    features: [
      '300 certificates per month',
      'Everything in Starter',
      'AI Citation Generator (Gemini 2.0)',
      'Priority processing',
    ],
    popular: true,
  },
  {
    id: 'enterprise' as PlanType,
    name: 'Enterprise',
    price: '₱1499',
    period: '/month',
    description: 'For high-volume institutional issuers.',
    icon: Shield,
    features: [
      '1000 certificates per month',
      'Everything in Pro',
      'API Access (Coming soon)',
      'Custom branding',
    ]
  }
]

export default function SubscriptionPage() {
  const supabase = createClient()
  const [currentPlan, setCurrentPlan] = React.useState<PlanType>('free')
  const [usedThisMonth, setUsedThisMonth] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('plan, certificates_this_month')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setCurrentPlan((profile.plan as PlanType) || 'free')
          setUsedThisMonth(profile.certificates_this_month || 0)
        }
      }
      setIsLoading(false)
    }
    loadPlan()
  }, [])

  const handleUpgrade = (planName: string) => {
    toast.info('Payment Integration Coming Soon', {
      description: `Please contact support to upgrade to the ${planName} plan.`
    })
  }

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const limitData = checkPlanLimit(currentPlan, usedThisMonth)
  const progressPercent = Math.min(100, Math.round((usedThisMonth / limitData.limit) * 100))

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Subscription & Billing" 
        subtitle="Manage your plan and view your usage."
      />

      {/* Usage Bar */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Current Usage</CardTitle>
          <CardDescription>
            You are on the <span className="font-semibold capitalize">{currentPlan}</span> plan.
            Your limits reset at the start of every billing cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Certificates Generated</span>
            <span>{usedThisMonth} / {limitData.limit}</span>
          </div>
          <Progress value={progressPercent} className={`h-2 ${progressPercent >= 100 ? 'bg-destructive/20' : ''}`} />
          {progressPercent >= 100 && (
            <p className="text-sm text-destructive mt-2">
              You have reached your monthly limit. Please upgrade your plan to continue generating certificates.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id
          const Icon = plan.icon
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col relative ${isActive ? 'border-primary shadow-md' : ''} ${plan.popular ? 'border-blue-500 shadow-sm' : ''}`}
            >
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="shadow-sm">Current Plan</Badge>
                </div>
              )}
              {!isActive && plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 shadow-sm">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex items-baseline text-3xl font-bold">
                  {plan.price}
                  {plan.period && <span className="text-sm font-normal text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="pt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant={isActive ? 'outline' : plan.popular ? 'default' : 'secondary'} 
                  className="w-full"
                  disabled={isActive}
                  onClick={() => !isActive && handleUpgrade(plan.name)}
                >
                  {isActive ? 'Active' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
