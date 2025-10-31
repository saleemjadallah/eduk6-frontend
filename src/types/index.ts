export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type SubscriptionTier = "starter" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing";

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UsageRecord {
  id: string;
  userId: string;
  subscriptionId: string | null;
  dishesGenerated: number;
  imagesGenerated: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type StyleOption = "Rustic/Dark" | "Bright/Modern" | "Social Media" | "Delivery App";
export type AllergenOption = "Nuts" | "Dairy" | "Gluten" | "Soy" | "Eggs" | "Shellfish" | "Fish" | "Wheat";
export type MenuCategory = "Appetizers" | "Soups" | "Salads" | "Mains" | "Sides" | "Desserts" | "Beverages";
export type DietaryOption = "Vegetarian" | "Vegan" | "Gluten-Free" | "Dairy-Free" | "Nut-Free" | "Spicy";

export interface MenuItem {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  category: MenuCategory;
  ingredients: string[] | null;
  allergens: string[] | null;
  dietaryInfo: DietaryOption[] | null;
  price: string | null;
  displayOrder: number;
  isAvailable: boolean;
  generatedImages: string[] | null;
  selectedStyle: string | null;
  editCount?: number;
  createdAt: Date | null;
}

// Menu Book Types
export type CoverStyle = "classic" | "modern" | "rustic";
export type FontFamily = "serif" | "sans-serif" | "modern";

export interface EstablishmentSettings {
  id: string;
  userId: string;
  establishmentName: string;
  tagline: string | null;
  logoUrl: string | null;
  coverStyle: CoverStyle;
  accentColor: string;
  fontFamily: FontFamily;
  itemsPerPage: number;
  showPageNumbers: boolean;
  showEstablishmentOnEveryPage: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MenuPage {
  pageNumber: number;
  items: MenuItem[];
}

export interface PaginatedMenu {
  totalPages: number;
  pages: MenuPage[];
  establishmentSettings: EstablishmentSettings;
}

export interface TierLimits {
  dishesPerMonth: number;
  imagesPerDish: number;
  priceAED: number;
  overagePricePerDish: number;
}

export interface UsageInfo {
  usage: UsageRecord | null;
  limits: TierLimits;
  tier: SubscriptionTier;
  dishesUsed: number;
  imagesUsed: number;
  dishesRemaining: number;
  hasReachedLimit: boolean;
  limitType: 'trial' | 'plan';
  trialLimit?: number;
}
