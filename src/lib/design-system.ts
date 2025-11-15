/**
 * Gamma.app-inspired Design System
 * Comprehensive design tokens and utilities
 */

export const colors = {
  // Primary: Discovery Purple-to-Blue Gradient
  primary: {
    start: '#6366F1',
    end: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  },
  // Secondary: Professional Blue
  secondary: {
    start: '#3B82F6',
    end: '#2563EB',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  },
  // Accent: Success Green
  accent: {
    start: '#10B981',
    end: '#059669',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
  // Neutrals
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
  '6xl': '12rem',  // 192px
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  // Colored shadows (Gamma-style)
  primary: '0 10px 30px -5px rgba(99, 102, 241, 0.3)',
  secondary: '0 10px 30px -5px rgba(59, 130, 246, 0.3)',
  accent: '0 10px 30px -5px rgba(16, 185, 129, 0.3)',
} as const;

export const animations = {
  // Gamma uses butter-smooth 300-400ms transitions
  transition: {
    fast: '200ms ease-out',
    normal: '300ms ease-out',
    slow: '400ms ease-out',
    slowest: '500ms ease-out',
  },
} as const;

// Utility function for gradient mesh background
export const gradientMesh = {
  background: `
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%)
  `,
};

// CSS class utilities
export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};
