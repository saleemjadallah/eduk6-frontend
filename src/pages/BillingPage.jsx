import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../services/api/subscriptionAPI';
import './BillingPage.css';

// Plan feature icons
const FEATURE_ICONS = {
  children: '👨‍👩‍👧‍👦',
  lessons: '📚',
  tutoring: '🤖',
  analytics: '📊',
  support: '💬',
  features: '✨',
  priority: '⚡',
};

// Tier badge colors
const TIER_COLORS = {
  FREE: { bg: '#f5f5f5', text: '#666', border: '#e0e0e0' },
  FAMILY: { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
  FAMILY_PLUS: { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' },
};

const BillingPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch subscription data
  const fetchSubscriptionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [subscriptionRes, plansRes] = await Promise.all([
        subscriptionAPI.getSubscription(),
        subscriptionAPI.getPlans(),
      ]);

      if (subscriptionRes.success) {
        setSubscriptionData(subscriptionRes.data);
      }

      if (plansRes.success) {
        setPlans(plansRes.data.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscription data:', err);
      setError(err.message || 'Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Handle checkout
  const handleUpgrade = async (tier) => {
    try {
      setIsProcessing(true);
      setActionMessage(null);

      const isAnnual = billingCycle === 'annual';
      const baseUrl = window.location.origin;

      const response = await subscriptionAPI.createCheckoutSession(
        tier,
        isAnnual,
        `${baseUrl}/parent/billing?success=true`,
        `${baseUrl}/parent/billing?cancelled=true`
      );

      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to start checkout. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manage subscription (portal)
  const handleManageSubscription = async () => {
    try {
      setIsProcessing(true);
      setActionMessage(null);

      const response = await subscriptionAPI.createPortalSession(
        `${window.location.origin}/parent/billing`
      );

      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to open billing portal');
      }
    } catch (err) {
      console.error('Portal error:', err);
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to open billing portal. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    try {
      setIsProcessing(true);
      setActionMessage(null);

      const response = await subscriptionAPI.cancelSubscription();

      if (response.success) {
        setActionMessage({
          type: 'success',
          text: 'Your subscription will be cancelled at the end of the billing period.',
        });
        fetchSubscriptionData();
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to cancel subscription. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle resume subscription
  const handleResumeSubscription = async () => {
    try {
      setIsProcessing(true);
      setActionMessage(null);

      const response = await subscriptionAPI.resumeSubscription();

      if (response.success) {
        setActionMessage({
          type: 'success',
          text: 'Your subscription has been resumed!',
        });
        fetchSubscriptionData();
      }
    } catch (err) {
      console.error('Resume error:', err);
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to resume subscription. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check for URL params (success/cancel from Stripe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setActionMessage({
        type: 'success',
        text: 'Welcome to your new plan! Your subscription is now active.',
      });
      // Clear the URL params
      window.history.replaceState({}, '', '/parent/billing');
      fetchSubscriptionData();
    } else if (params.get('cancelled') === 'true') {
      setActionMessage({
        type: 'info',
        text: 'Checkout was cancelled. No changes were made.',
      });
      window.history.replaceState({}, '', '/parent/billing');
    }
  }, [fetchSubscriptionData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="billing-page">
        <div className="billing-loading">
          <div className="loading-spinner"></div>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="billing-page">
        <div className="billing-error">
          <div className="error-icon">⚠️</div>
          <h2>Unable to load subscription</h2>
          <p>{error}</p>
          <button onClick={fetchSubscriptionData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { subscription, usage, limits } = subscriptionData || {};
  const currentTier = subscription?.tier || 'FREE';
  const isOnPaidPlan = currentTier !== 'FREE';
  const isCancelled = subscription?.cancelAtPeriodEnd;
  const isInTrial = subscription?.isInTrial;

  // Parse subscription period dates
  const trialEndsAt = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const currentPeriodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;

  // Calculate days until trial ends
  const daysUntilTrialEnd = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Format reset/renewal date text
  const getResetDateText = () => {
    if (isInTrial && trialEndsAt && daysUntilTrialEnd !== null) {
      if (daysUntilTrialEnd <= 0) return 'Trial ended';
      if (daysUntilTrialEnd === 1) return 'Trial ends tomorrow';
      return `Trial ends in ${daysUntilTrialEnd} days (${trialEndsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    }
    if (currentPeriodEnd && currentTier !== 'FREE') {
      return `Renews on ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
    // Fallback for FREE tier - monthly reset
    if (usage?.resetDate) {
      return `Resets on ${new Date(usage.resetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return `Resets on ${nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
  };

  // Calculate usage percentage
  const usagePercent = usage?.percentUsed || 0;
  const lessonsRemaining = usage?.lessonsRemaining;
  const isUnlimited = usage?.isUnlimited;

  return (
    <div className="billing-page">
      {/* Page Header */}
      <header className="billing-header">
        <div className="header-content">
          <h1>Subscription & Billing</h1>
          <p>Manage your family's learning journey</p>
        </div>
        <div className="header-decoration">
          <span className="deco-star">✨</span>
          <span className="deco-book">📚</span>
          <span className="deco-rocket">🚀</span>
        </div>
      </header>

      {/* Action Message */}
      {actionMessage && (
        <div className={`action-message ${actionMessage.type}`}>
          <span className="message-icon">
            {actionMessage.type === 'success' ? '✅' : actionMessage.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <p>{actionMessage.text}</p>
          <button onClick={() => setActionMessage(null)} className="dismiss-btn">×</button>
        </div>
      )}

      {/* Current Plan Card */}
      <section className="current-plan-section">
        <div className="current-plan-card">
          <div className="plan-status">
            <div className="plan-badge-wrapper">
              <span
                className="plan-badge"
                style={{
                  background: TIER_COLORS[currentTier]?.bg,
                  color: TIER_COLORS[currentTier]?.text,
                  borderColor: TIER_COLORS[currentTier]?.border,
                }}
              >
                {currentTier === 'FREE' ? 'Free Plan' : currentTier === 'FAMILY' ? 'Family Plan' : 'Family Plus'}
              </span>
              {isInTrial && daysUntilTrialEnd > 0 && (
                <span className="trial-badge">
                  <span className="trial-icon">🎁</span>
                  {daysUntilTrialEnd} day{daysUntilTrialEnd !== 1 ? 's' : ''} left in trial
                </span>
              )}
              {isCancelled && (
                <span className="cancelled-badge">
                  Cancels {new Date(subscription?.currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="plan-actions">
              {isOnPaidPlan && (
                <>
                  <button
                    onClick={handleManageSubscription}
                    className="manage-btn"
                    disabled={isProcessing}
                  >
                    <span className="btn-icon">⚙️</span>
                    Manage Billing
                  </button>
                  {isCancelled ? (
                    <button
                      onClick={handleResumeSubscription}
                      className="resume-btn"
                      disabled={isProcessing}
                    >
                      Resume Plan
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      className="cancel-sub-btn"
                      disabled={isProcessing}
                    >
                      Cancel Plan
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="plan-details-grid">
            {/* Usage Stats */}
            <div className="usage-card">
              <div className="usage-header">
                <span className="usage-icon">📖</span>
                <h3>Lesson Usage</h3>
              </div>
              {isUnlimited ? (
                <div className="unlimited-badge">
                  <span className="infinity">∞</span>
                  <span>Unlimited Lessons</span>
                </div>
              ) : (
                <>
                  <div className="usage-bar-container">
                    <div
                      className="usage-bar-fill"
                      style={{
                        width: `${Math.min(usagePercent, 100)}%`,
                        background: usagePercent >= 90 ? '#ef5350' : usagePercent >= 75 ? '#ffa726' : '#66bb6a',
                      }}
                    ></div>
                  </div>
                  <div className="usage-stats">
                    <span className="usage-count">
                      <strong>{usage?.lessonsThisMonth || 0}</strong> / {usage?.lessonsLimit || 10} lessons used
                    </span>
                    <span className="usage-remaining">
                      {lessonsRemaining} remaining
                    </span>
                  </div>
                  {usagePercent >= 75 && (
                    <div className="usage-warning">
                      {usagePercent >= 90
                        ? "You're almost out of lessons! Upgrade for unlimited access."
                        : "You've used most of your monthly lessons."}
                    </div>
                  )}
                </>
              )}
              <div className="reset-info">
                {getResetDateText()}
              </div>
            </div>

            {/* Child Profiles */}
            <div className="limits-card">
              <div className="limits-header">
                <span className="limits-icon">👨‍👩‍👧‍👦</span>
                <h3>Child Profiles</h3>
              </div>
              <div className="limits-visual">
                <div className="child-slots">
                  {[...Array(limits?.childLimit || 1)].map((_, i) => (
                    <div
                      key={i}
                      className={`child-slot ${i < (limits?.childrenUsed || 0) ? 'filled' : 'empty'}`}
                    >
                      {i < (limits?.childrenUsed || 0) ? '🧒' : '+'}
                    </div>
                  ))}
                </div>
                <span className="limits-count">
                  {limits?.childrenUsed || 0} of {limits?.childLimit || 1} profiles used
                </span>
              </div>
              {!limits?.canAddChild && currentTier === 'FREE' && (
                <div className="upgrade-hint">
                  Upgrade to add more children!
                </div>
              )}
            </div>

            {/* Next Billing */}
            {isOnPaidPlan && currentPeriodEnd && (
              <div className="billing-info-card">
                <div className="billing-info-header">
                  <span className="billing-icon">📅</span>
                  <h3>{isInTrial ? 'Trial Period' : 'Next Billing Date'}</h3>
                </div>
                {isInTrial && trialEndsAt ? (
                  <>
                    <div className="billing-date">
                      {trialEndsAt.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="trial-info">
                      {daysUntilTrialEnd <= 0
                        ? 'Trial ended'
                        : daysUntilTrialEnd === 1
                          ? 'Trial ends tomorrow'
                          : `${daysUntilTrialEnd} days remaining in trial`}
                    </div>
                  </>
                ) : (
                  <div className="billing-date">
                    {currentPeriodEnd.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="pricing-section">
        <div className="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Unlock unlimited learning for your family</p>
        </div>

        <div className="billing-toggle">
          <button
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
            <span className="save-badge">Save 20%</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          {plans.map((plan) => {
            const isCurrentPlan = currentTier === plan.tier;
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const monthlyEquivalent = billingCycle === 'annual' ? (plan.priceAnnual / 12).toFixed(2) : null;
            const isFree = plan.tier === 'FREE';
            const isPopular = plan.tier === 'FAMILY';

            return (
              <div
                key={plan.tier}
                className={`pricing-card ${isCurrentPlan ? 'current' : ''} ${isPopular ? 'popular' : ''} ${plan.tier.toLowerCase()}`}
              >
                {isPopular && <div className="popular-tag">Most Popular</div>}
                {isCurrentPlan && <div className="current-tag">Current Plan</div>}

                <div className="card-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    {isFree ? (
                      <span className="price-amount">Free</span>
                    ) : (
                      <>
                        <span className="currency">$</span>
                        <span className="price-amount">
                          {billingCycle === 'annual' ? monthlyEquivalent : price.toFixed(2)}
                        </span>
                        <span className="price-period">/month</span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'annual' && !isFree && (
                    <div className="annual-total">
                      Billed ${price.toFixed(2)}/year
                    </div>
                  )}
                </div>

                <ul className="plan-features">
                  <li>
                    <span className="feature-icon">{FEATURE_ICONS.children}</span>
                    <span>{plan.childLimit} child profile{plan.childLimit > 1 ? 's' : ''}</span>
                  </li>
                  <li>
                    <span className="feature-icon">{FEATURE_ICONS.lessons}</span>
                    <span>{plan.lessonsPerMonth === null ? 'Unlimited lessons' : `${plan.lessonsPerMonth} lessons/month`}</span>
                  </li>
                  {plan.features?.slice(2).map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-icon">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-action">
                  {isCurrentPlan ? (
                    <button className="plan-btn current-btn" disabled>
                      <span className="check-icon">✓</span>
                      Current Plan
                    </button>
                  ) : isFree ? (
                    <button className="plan-btn free-btn" disabled>
                      Included
                    </button>
                  ) : (
                    <button
                      className={`plan-btn upgrade-btn ${plan.tier.toLowerCase()}`}
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="btn-loading">Processing...</span>
                      ) : currentTier === 'FREE' ? (
                        <>
                          Start Free Trial
                          <span className="trial-note">7 days free</span>
                        </>
                      ) : (
                        'Upgrade Now'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Signals */}
      <section className="trust-section">
        <div className="trust-items">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🎁</span>
            <span>7-Day Free Trial</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">❌</span>
            <span>Cancel Anytime</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">💳</span>
            <span>Powered by Stripe</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>What happens when I upgrade?</h4>
            <p>You'll get immediate access to your new plan's features. Your trial starts right away, and you won't be charged until it ends.</p>
          </div>
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Yes! You can cancel your subscription at any time. You'll keep access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h4>What happens to my lessons if I downgrade?</h4>
            <p>All your completed lessons and progress are saved forever. You'll just have monthly lesson limits on the Free plan.</p>
          </div>
          <div className="faq-item">
            <h4>Is my payment information secure?</h4>
            <p>Absolutely! We use Stripe for payment processing. We never store your card details on our servers.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BillingPage;
