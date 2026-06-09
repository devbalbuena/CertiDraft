export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise'

export interface PlanLimits {
  certificatesPerMonth: number
  features: {
    ai_citations: boolean
    email_delivery: boolean
    csv_upload: boolean
    watermark: boolean // true means it HAS a watermark (limitation)
    api_access: boolean
  }
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    certificatesPerMonth: 5,
    features: {
      ai_citations: false,
      email_delivery: false,
      csv_upload: false,
      watermark: true,
      api_access: false,
    },
  },
  starter: {
    certificatesPerMonth: 50,
    features: {
      ai_citations: false,
      email_delivery: true,
      csv_upload: true,
      watermark: false,
      api_access: false,
    },
  },
  pro: {
    certificatesPerMonth: 300,
    features: {
      ai_citations: true,
      email_delivery: true,
      csv_upload: true,
      watermark: false,
      api_access: false,
    },
  },
  enterprise: {
    certificatesPerMonth: 1000,
    features: {
      ai_citations: true,
      email_delivery: true,
      csv_upload: true,
      watermark: false,
      api_access: true,
    },
  },
}

export function checkPlanLimit(plan: string, certificatesThisMonth: number) {
  const p = (PLAN_LIMITS[plan as PlanType] ? plan : 'free') as PlanType
  const limit = PLAN_LIMITS[p].certificatesPerMonth
  const remaining = Math.max(0, limit - certificatesThisMonth)
  
  return {
    allowed: certificatesThisMonth < limit,
    remaining,
    limit,
  }
}

export function canUseFeature(plan: string, feature: keyof PlanLimits['features']): boolean {
  const p = (PLAN_LIMITS[plan as PlanType] ? plan : 'free') as PlanType
  return PLAN_LIMITS[p].features[feature]
}
