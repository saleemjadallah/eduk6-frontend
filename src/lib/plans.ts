import { PlanConfig } from '@/types';

export const HEADSHOT_PLANS: { [key: string]: PlanConfig } = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 2900, // $29 in cents
    headshots: 10,
    backgrounds: 2,
    outfits: 2,
    editCredits: 2,
    turnaroundHours: 3,
    stripePriceId: 'price_1SSshHFWxz5KcBumXJYDPGKR',
    canChangeOutfits: false,
    virtualOutfits: 0,
    premiumOutfits: 0,
    features: [
      '10 professional headshots',
      '2 unique backgrounds',
      '2 outfit styles',
      '2 edit credits',
      '3-hour turnaround',
      'High-resolution downloads',
      'Full commercial rights',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    price: 3900, // $39
    headshots: 15,
    backgrounds: 3,
    outfits: 3,
    editCredits: 10, // Increased to 10
    turnaroundHours: 2,
    stripePriceId: 'price_1SSshnFWxz5KcBum7txi7fbR',
    popular: true, // Show "Most Popular" badge
    canChangeOutfits: true,
    virtualOutfits: 5,
    premiumOutfits: 2,
    features: [
      '15 professional headshots',
      '3 unique backgrounds',
      '3 outfit styles',
      '10 edit credits',
      'Virtual wardrobe changes (5 outfits)',
      '2 premium virtual outfits',
      '2-hour turnaround',
      'High-resolution downloads',
      'Full commercial rights',
      'Priority support',
    ],
  },
  executive: {
    id: 'executive',
    name: 'Executive Plan',
    price: 5900, // $59
    headshots: 20,
    backgrounds: 5,
    outfits: 5,
    editCredits: 20, // Increased to 20
    turnaroundHours: 1,
    stripePriceId: 'price_1SSsiUFWxz5KcBumOYWig3AR',
    canChangeOutfits: true,
    virtualOutfits: Infinity,
    premiumOutfits: Infinity,
    features: [
      '20 professional headshots',
      '5 unique backgrounds',
      '5 outfit styles',
      '20 edit credits',
      'Unlimited virtual wardrobe changes',
      'All premium outfits included',
      '1-hour turnaround',
      'High-resolution downloads',
      'Full commercial rights',
      'Priority support',
      'Satisfaction guarantee',
    ],
  },
};

// Get plan by ID
export const getPlan = (id: string): PlanConfig | undefined => {
  return HEADSHOT_PLANS[id];
};

// Get all plans as array
export const getAllPlans = (): PlanConfig[] => {
  return Object.values(HEADSHOT_PLANS);
};

// Format price for display
export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(0)}`;
};

// Calculate headshots per template
export const calculateHeadshotsPerTemplate = (
  totalHeadshots: number,
  templateCount: number
): number => {
  return Math.floor(totalHeadshots / templateCount);
};
