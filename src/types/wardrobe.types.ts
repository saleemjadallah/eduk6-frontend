/**
 * Virtual Wardrobe Type Definitions
 * Defines types for the professional outfit catalog and wardrobe features
 */

export type OutfitCategory =
  | 'business-formal'
  | 'business-casual'
  | 'creative'
  | 'executive'
  | 'industry-specific';

export type OutfitGender = 'male' | 'female' | 'unisex';

export interface ProfessionalOutfit {
  id: string;
  name: string;
  category: OutfitCategory;
  description: string;

  // Visual details
  attire: string; // Full description
  colors: string[]; // Available color options
  formality: number; // 1-10 scale

  // Metadata
  gender: OutfitGender;
  occasions: string[];
  thumbnail: string; // Preview image URL
  premium: boolean;

  // Gemini-specific
  geminiPrompt: string; // Detailed outfit description for AI
  styleModifiers: string[]; // Additional style hints

  // Compatibility
  compatibleTemplates: string[]; // Which style templates work best
  incompatibleTemplates?: string[]; // Templates to avoid
}

export interface OutfitSelection {
  outfitId: string;
  colorVariant?: string;
}

export interface WardrobePreview {
  outfitId: string;
  previewImage: string; // Base64 or URL
  loading: boolean;
  error?: string;
}

export interface OutfitFilter {
  category?: OutfitCategory;
  gender?: OutfitGender | 'all';
  minFormality?: number;
  premiumOnly?: boolean;
}

export interface WardrobeApiResponse {
  outfits: ProfessionalOutfit[];
  total: number;
  categories: OutfitCategory[];
}
