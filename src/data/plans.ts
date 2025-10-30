import { Sparkles, Zap, Crown } from 'lucide-react';

export type PlanTier = 'starter' | 'pro' | 'enterprise';

export interface PlanDetails {
  tier: PlanTier;
  name: string;
  price: number | null;
  period: 'month' | 'custom';
  description: string;
  features: string[];
  gradient: string;
  popular: boolean;
}

export interface PricingPlan extends PlanDetails {
  icon: typeof Sparkles;
}

export const subscriptionPlans: Record<PlanTier, PlanDetails> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    price: 99,
    period: 'month',
    description: 'Perfect for small restaurants and cafes',
    features: [
      '30 dishes per month',
      '3 image variations per dish',
      'All 4 photography styles',
      'High-resolution downloads',
      'Commercial usage rights',
      'Email support',
    ],
    gradient: 'from-blue-500 to-cyan-500',
    popular: false,
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 299,
    period: 'month',
    description: 'For growing food businesses',
    features: [
      '150 dishes per month',
      '3 image variations per dish',
      'All 4 photography styles',
      'High-resolution downloads',
      'Commercial usage rights',
      'Priority support',
      'Custom brand watermarks',
      'Bulk export',
    ],
    gradient: 'from-purple-500 to-pink-500',
    popular: true,
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large chains and franchises',
    features: [
      'Unlimited dishes',
      '3+ image variations',
      'Custom photography styles',
      'API access',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom integrations',
      'White-label options',
    ],
    gradient: 'from-orange-500 to-red-500',
    popular: false,
  },
};

export const pricingPlans: PricingPlan[] = [
  { icon: Sparkles, ...subscriptionPlans.starter },
  { icon: Zap, ...subscriptionPlans.pro },
  { icon: Crown, ...subscriptionPlans.enterprise },
];
