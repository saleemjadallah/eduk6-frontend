import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Age group definitions
 * - young-learner: 4-6 years (larger UI, more playful)
 * - middle-learner: 7-9 years (balanced)
 * - older-learner: 10-12 years (more sophisticated)
 */
const AGE_GROUPS = {
  YOUNG: 'young-learner',
  MIDDLE: 'middle-learner',
  OLDER: 'older-learner'
};

/**
 * UI configurations per age group
 */
const UI_CONFIG = {
  [AGE_GROUPS.YOUNG]: {
    buttonSize: 64,
    fontSize: 20,
    iconSize: 48,
    spacing: 24,
    borderRadius: 24,
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#ffe66d'
    },
    features: {
      showEmoji: true,
      useSimpleLanguage: true,
      showFloatingHelper: true,
      allowUpload: false,
      maxChatLength: 100,
      showProgressBadges: true,
      animationsLevel: 'high'
    },
    navigation: {
      items: ['home', 'learn', 'play', 'rewards'],
      showLabels: true,
      iconOnly: false
    }
  },
  [AGE_GROUPS.MIDDLE]: {
    buttonSize: 52,
    fontSize: 17,
    iconSize: 32,
    spacing: 18,
    borderRadius: 18,
    colors: {
      primary: '#5c7cfa',
      secondary: '#20c997',
      accent: '#ffa94d'
    },
    features: {
      showEmoji: true,
      useSimpleLanguage: false,
      showFloatingHelper: true,
      allowUpload: true,
      maxChatLength: 200,
      showProgressBadges: true,
      animationsLevel: 'medium'
    },
    navigation: {
      items: ['home', 'learn', 'explore', 'upload', 'rewards'],
      showLabels: true,
      iconOnly: false
    }
  },
  [AGE_GROUPS.OLDER]: {
    buttonSize: 44,
    fontSize: 15,
    iconSize: 24,
    spacing: 14,
    borderRadius: 12,
    colors: {
      primary: '#4263eb',
      secondary: '#15aabf',
      accent: '#fa5252'
    },
    features: {
      showEmoji: false,
      useSimpleLanguage: false,
      showFloatingHelper: false,
      allowUpload: true,
      maxChatLength: 500,
      showProgressBadges: true,
      animationsLevel: 'low'
    },
    navigation: {
      items: ['home', 'learn', 'explore', 'upload', 'tools', 'rewards'],
      showLabels: true,
      iconOnly: false
    }
  }
};

/**
 * Reading level configurations
 */
const READING_LEVELS = {
  [AGE_GROUPS.YOUNG]: {
    maxWordsPerSentence: 8,
    maxSyllablesPerWord: 2,
    vocabulary: 'basic',
    fontSize: '1.25rem',
    lineHeight: 1.8
  },
  [AGE_GROUPS.MIDDLE]: {
    maxWordsPerSentence: 15,
    maxSyllablesPerWord: 3,
    vocabulary: 'intermediate',
    fontSize: '1rem',
    lineHeight: 1.6
  },
  [AGE_GROUPS.OLDER]: {
    maxWordsPerSentence: 20,
    maxSyllablesPerWord: 4,
    vocabulary: 'advanced',
    fontSize: '0.9375rem',
    lineHeight: 1.5
  }
};

/**
 * Get age group from age
 */
function getAgeGroup(age) {
  if (age <= 6) return AGE_GROUPS.YOUNG;
  if (age <= 9) return AGE_GROUPS.MIDDLE;
  return AGE_GROUPS.OLDER;
}

/**
 * Hook for age-appropriate UI configuration
 */
export function useAgeAppropriate() {
  // Try to get current profile from auth context
  let currentProfile = null;
  try {
    const authContext = useAuth();
    currentProfile = authContext?.currentProfile;
  } catch (e) {
    // AuthProvider not available
  }

  const age = currentProfile?.age || 8; // Default to middle age
  const ageGroup = getAgeGroup(age);

  const config = useMemo(() => {
    return {
      age,
      ageGroup,
      ui: UI_CONFIG[ageGroup],
      reading: READING_LEVELS[ageGroup],

      // Helper methods
      getLayoutClass: () => `child-layout ${ageGroup}`,

      shouldShowFeature: (feature) => {
        return UI_CONFIG[ageGroup].features[feature] ?? true;
      },

      getNavItems: () => {
        return UI_CONFIG[ageGroup].navigation.items;
      },

      getButtonStyle: () => ({
        minWidth: `${UI_CONFIG[ageGroup].buttonSize}px`,
        minHeight: `${UI_CONFIG[ageGroup].buttonSize}px`,
        borderRadius: `${UI_CONFIG[ageGroup].borderRadius}px`,
        fontSize: `${UI_CONFIG[ageGroup].fontSize}px`
      }),

      getIconSize: () => UI_CONFIG[ageGroup].iconSize,

      getMaxChatLength: () => UI_CONFIG[ageGroup].features.maxChatLength,

      // Check if content is appropriate for age
      isAgeAppropriate: (contentAge) => {
        return contentAge <= age;
      },

      // Get age-appropriate greeting
      getGreeting: (name) => {
        switch (ageGroup) {
          case AGE_GROUPS.YOUNG:
            return `Hi ${name}! 🎉 Ready to learn?`;
          case AGE_GROUPS.MIDDLE:
            return `Hey ${name}! What would you like to explore today?`;
          case AGE_GROUPS.OLDER:
            return `Welcome back, ${name}. What are you working on?`;
          default:
            return `Hello ${name}!`;
        }
      },

      // Get age-appropriate error message
      getErrorMessage: (errorType) => {
        const messages = {
          network: {
            [AGE_GROUPS.YOUNG]: "Oops! Something went wrong. Let's try again! 🔄",
            [AGE_GROUPS.MIDDLE]: "We're having trouble connecting. Please try again.",
            [AGE_GROUPS.OLDER]: "Network error. Please check your connection and retry."
          },
          notFound: {
            [AGE_GROUPS.YOUNG]: "Hmm, we can't find that. Let's look for something else! 🔍",
            [AGE_GROUPS.MIDDLE]: "We couldn't find what you're looking for.",
            [AGE_GROUPS.OLDER]: "The requested content was not found."
          },
          generic: {
            [AGE_GROUPS.YOUNG]: "Something went wrong. Don't worry, we'll fix it! 🛠️",
            [AGE_GROUPS.MIDDLE]: "Something unexpected happened. Please try again.",
            [AGE_GROUPS.OLDER]: "An error occurred. Please try again or contact support."
          }
        };
        return messages[errorType]?.[ageGroup] || messages.generic[ageGroup];
      }
    };
  }, [age, ageGroup]);

  return config;
}

/**
 * Hook for getting CSS custom properties based on age
 */
export function useAgeStyles() {
  const { ui } = useAgeAppropriate();

  const cssVariables = useMemo(() => ({
    '--button-min-size': `${ui.buttonSize}px`,
    '--font-size-base': `${ui.fontSize}px`,
    '--icon-size': `${ui.iconSize}px`,
    '--spacing-unit': `${ui.spacing}px`,
    '--border-radius': `${ui.borderRadius}px`,
    '--primary-color': ui.colors.primary,
    '--secondary-color': ui.colors.secondary,
    '--accent-color': ui.colors.accent
  }), [ui]);

  return cssVariables;
}

export { AGE_GROUPS, UI_CONFIG, READING_LEVELS, getAgeGroup };
export default useAgeAppropriate;
