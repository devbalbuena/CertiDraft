'use client'

import * as React from 'react'
import { CheckCircle2, Crown, Zap, Shield, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
    ],
    colorClass: 'border-slate-200 dark:border-slate-800 hover:border-slate-300',
    iconClass: 'text-slate-500',
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
    ],
    colorClass: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-300 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20',
    iconClass: 'text-blue-500',
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
    colorClass: 'border-violet-200 dark:border-violet-900/50 hover:border-violet-300 shadow-md bg-gradient-to-b from-violet-50/50 to-transparent dark:from-violet-950/20',
    iconClass: 'text-violet-500',
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
    ],
    colorClass: 'border-amber-200 dark:border-amber-900/50 hover:border-amber-300 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20',
    iconClass: 'text-amber-500',
  }
]

const PLAN_ORDER = ['free', 'starter', 'pro', 'enterprise']

export default function SubscriptionPage() {
  const supabase = createClient()
  const [currentPlan, setCurrentPlan] = React.useState<PlanType>('free')
  const [usedThisMonth, setUsedThisMonth] = React.useState(0)
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [upgradeDialogPlan, setUpgradeDialogPlan] = React.useState<PlanType | null>(null)
  const [paymentMethod, setPaymentMethod] = React.useState('card')
  const [isProcessing, setIsProcessing] = React.useState(false)

  React.useEffect(() => {
    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('plan, certificates_this_month, plan_expires_at')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setCurrentPlan((profile.plan as PlanType) || 'free')
          setUsedThisMonth(profile.certificates_this_month || 0)
          setExpiresAt(profile.plan_expires_at)
        }
      }
      setIsLoading(false)
    }
    loadPlan()
  }, [])

  const handleUpgrade = (planId: PlanType) => {
    setUpgradeDialogPlan(planId)
    setPaymentMethod('card')
  }

  const handleMockPurchase = async () => {
    if (!upgradeDialogPlan) return
    setIsProcessing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsProcessing(false)
      return
    }

    // Set plan_expires_at to 30 days from now for paid plans
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    const { error } = await supabase.from('users').update({ 
      plan: upgradeDialogPlan,
      plan_expires_at: upgradeDialogPlan === 'free' ? null : expiryDate.toISOString()
    }).eq('id', user.id)
    
    setIsProcessing(false)
    if (error) {
      toast.error('Failed to process upgrade', { description: error.message })
    } else {
      toast.success(`Successfully upgraded to ${upgradeDialogPlan}!`)
      setCurrentPlan(upgradeDialogPlan)
      setExpiresAt(upgradeDialogPlan === 'free' ? null : expiryDate.toISOString())
      setUpgradeDialogPlan(null)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const limitData = checkPlanLimit(currentPlan, usedThisMonth)
  const progressPercent = Math.min(100, Math.round((usedThisMonth / limitData.limit) * 100))

  const expiryDate = expiresAt ? new Date(expiresAt) : null
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Subscription & Billing" 
        subtitle="Manage your plan and view your usage."
      />

      {/* Usage Bar */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Current Usage</CardTitle>
            {expiryDate && (
              <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'default' : 'secondary'} className={isExpiringSoon && !isExpired ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100' : ''}>
                {isExpired ? 'Plan Expired' : isExpiringSoon ? `Expires in ${daysUntilExpiry} days` : `Renews ${expiryDate.toLocaleDateString()}`}
              </Badge>
            )}
          </div>
          <CardDescription>
            You are on the <span className="font-semibold capitalize">{currentPlan}</span> plan.
            Your limits reset at the start of every billing cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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
          </div>

          {isExpiringSoon && !isExpired && (
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Your subscription is expiring soon. Please contact your administrator or support to renew.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 pt-4">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id
          const currentIndex = PLAN_ORDER.indexOf(currentPlan)
          const thisIndex = PLAN_ORDER.indexOf(plan.id)
          const isDowngrade = thisIndex < currentIndex
          
          const Icon = plan.icon
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col relative transition-all ${plan.colorClass} ${isActive ? 'ring-2 ring-primary border-primary shadow-lg dark:ring-primary dark:border-primary' : ''}`}
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
                  <Icon className={`h-5 w-5 ${plan.iconClass}`} />
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
              
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  variant={isActive ? 'outline' : plan.popular ? 'default' : 'secondary'} 
                  className="w-full"
                  disabled={isActive || isDowngrade}
                  onClick={() => !isActive && !isDowngrade && handleUpgrade(plan.id)}
                >
                  {isActive ? 'Active' : isDowngrade ? 'Included in current plan' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!upgradeDialogPlan} onOpenChange={(open) => !open && !isProcessing && setUpgradeDialogPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">Upgrade to {upgradeDialogPlan}</DialogTitle>
            <DialogDescription>
              Select a payment method to complete your purchase for testing purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
              <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => setPaymentMethod('card')}>
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer font-medium">Credit / Debit Card</Label>
              </div>
              <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => setPaymentMethod('gcash')}>
                <RadioGroupItem value="gcash" id="gcash" />
                <Label htmlFor="gcash" className="flex-1 cursor-pointer font-medium">GCash</Label>
              </div>
              <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => setPaymentMethod('paypal')}>
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex-1 cursor-pointer font-medium">PayPal</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter className="sm:justify-between gap-3">
            <Button variant="outline" onClick={() => setUpgradeDialogPlan(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleMockPurchase} disabled={isProcessing} className="w-full sm:w-auto">
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
