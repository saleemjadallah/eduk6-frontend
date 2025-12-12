/**
 * Subscription API Service
 * Handles all parent/family subscription-related API calls
 */

import { api } from './apiClient';

export const subscriptionAPI = {
  /**
   * Get available subscription plans (public)
   */
  getPlans: async () => {
    return api.get('/parent/subscription/plans');
  },

  /**
   * Get current subscription status and usage
   */
  getSubscription: async () => {
    return api.get('/parent/subscription');
  },

  /**
   * Get detailed usage stats
   */
  getUsage: async () => {
    return api.get('/parent/subscription/usage');
  },

  /**
   * Create a Stripe checkout session
   * @param {string} tier - FAMILY or FAMILY_PLUS
   * @param {boolean} isAnnual - Whether to use annual pricing
   * @param {string} successUrl - URL to redirect on success
   * @param {string} cancelUrl - URL to redirect on cancel
   */
  createCheckoutSession: async (tier, isAnnual, successUrl, cancelUrl) => {
    return api.post('/parent/subscription/checkout', {
      tier,
      isAnnual,
      successUrl,
      cancelUrl,
    });
  },

  /**
   * Create a Stripe customer portal session
   * @param {string} returnUrl - URL to return to after portal
   */
  createPortalSession: async (returnUrl) => {
    return api.post('/parent/subscription/portal', {
      returnUrl,
    });
  },

  /**
   * Cancel subscription at period end
   */
  cancelSubscription: async () => {
    return api.post('/parent/subscription/cancel', {});
  },

  /**
   * Resume a cancelled subscription
   */
  resumeSubscription: async () => {
    return api.post('/parent/subscription/resume', {});
  },

  /**
   * Check Stripe configuration status (debug)
   */
  getConfigStatus: async () => {
    return api.get('/parent/subscription/config-status');
  },
};

export default subscriptionAPI;
