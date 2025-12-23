import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import {
  Crown,
  Zap,
  Coffee,
  CheckCircle2,
  Sparkles,
  CreditCard,
  RefreshCw,
  ChevronRight,
  Package,
  AlertCircle,
  ExternalLink,
  Gift,
  TrendingUp,
  Shield,
  Clock,
  Star,
  PartyPopper,
} from 'lucide-react';

// Plan configuration matching backend
const PLANS = {
  FREE: {
    name: 'Teacher Starter',
    tier: 'FREE',
    icon: Coffee,
    credits: 100,
    rolloverCap: 200,
    priceMonthly: 0,
    priceAnnual: 0,
    color: 'teacher-inkLight',
    bgGradient: 'from-teacher-ink/5 to-teacher-ink/10',
    features: [
      '100 credits per month',
      'Basic content generation',
      'Quiz & flashcard creation',
      'Community support',
      'Rollover up to 200 credits',
    ],
    limitations: [
      'No AI-powered grading',
      'No infographic generation',
      'Standard processing speed',
    ],
  },
  BASIC: {
    name: 'Teacher Plus',
    tier: 'BASIC',
    icon: Zap,
    credits: 500,
    rolloverCap: 1000,
    priceMonthly: 9.99,
    priceAnnual: 95.90,
    color: 'teacher-sage',
    bgGradient: 'from-teacher-sage/10 to-teacher-sageLight/10',
    popular: false,
    features: [
      '500 credits per month',
      'All content types',
      'Full lesson generation',
      'Email support',
      'Rollover up to 1,000 credits',
    ],
    trialDays: 7,
  },
  PROFESSIONAL: {
    name: 'Teacher Pro',
    tier: 'PROFESSIONAL',
    icon: Crown,
    credits: 2000,
    rolloverCap: 4000,
    priceMonthly: 24.99,
    priceAnnual: 239.90,
    color: 'teacher-gold',
    bgGradient: 'from-teacher-gold/10 to-teacher-goldLight/10',
    popular: true,
    features: [
      '2,000 credits per month',
      'All content types',
      'Priority processing',
      'AI-powered grading',
      'Infographic generation',
      'Rollover up to 4,000 credits',
      'Priority email support',
    ],
    trialDays: 7,
  },
};

// Credit pack configuration
const CREDIT_PACKS = [
  {
    id: 'teacher_pack_100',
    credits: 100,
    price: 4.99,
    pricePerCredit: 0.05,
    savings: null,
  },
  {
    id: 'teacher_pack_300',
    credits: 300,
    price: 12.99,
    pricePerCredit: 0.043,
    savings: 'Save 13%',
    popular: true,
  },
  {
    id: 'teacher_pack_500',
    credits: 500,
    price: 19.99,
    pricePerCredit: 0.04,
    savings: 'Save 20%',
  },
];

const TeacherBillingPage = () => {
  const { teacher, quota, refreshAuth } = useTeacherAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle return from Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success');
    const tier = searchParams.get('tier');
    const creditsSuccess = searchParams.get('credits');
    const cancelled = searchParams.get('cancelled');

    if (success === 'true') {
      setSuccessMessage(`Welcome to ${PLANS[tier]?.name || 'your new plan'}! Your subscription is now active.`);
      // Clear URL params
      setSearchParams({});
      // Refresh teacher data to get updated subscription
      refreshAuth();
    } else if (creditsSuccess === 'success') {
      setSuccessMessage('Credit pack purchased successfully! Your bonus credits are now available.');
      setSearchParams({});
      refreshAuth();
    } else if (cancelled === 'true') {
      setError('Checkout was cancelled. No charges were made.');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, refreshAuth]);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await teacherAPI.getSubscription();
        if (response.success) {
          setSubscriptionData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      }
    };
    fetchSubscription();
  }, [teacher?.subscriptionTier]); // Refetch when tier changes

  // Get credit info from quota
  const credits = quota?.credits || { subscription: 100, total: 100, used: 0, remaining: 100, rollover: 0, bonus: 0 };
  const currentTier = teacher?.subscriptionTier || 'FREE';
  const currentPlan = PLANS[currentTier];

  // Handle subscription upgrade
  const handleUpgrade = async (tier, isAnnual = false) => {
    setLoading(true);
    setError(null);

    try {
      const successUrl = `${window.location.origin}/teacher/billing?success=true&tier=${tier}`;
      const cancelUrl = `${window.location.origin}/teacher/billing?cancelled=true`;

      const response = await teacherAPI.createCheckoutSession(
        tier,
        isAnnual,
        successUrl,
        cancelUrl
      );

      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle credit pack purchase
  const handleBuyCredits = async (packId) => {
    setLoading(true);
    setError(null);

    try {
      const successUrl = `${window.location.origin}/teacher/billing?credits=success`;
      const cancelUrl = `${window.location.origin}/teacher/billing?credits=cancelled`;

      const response = await teacherAPI.createCreditPackCheckout(
        packId,
        successUrl,
        cancelUrl
      );

      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manage billing (Stripe portal)
  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);

    try {
      const returnUrl = `${window.location.origin}/teacher/billing`;
      const response = await teacherAPI.createPortalSession(returnUrl);

      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.error || 'Failed to open billing portal');
      }
    } catch (err) {
      setError(err.message || 'Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate annual savings
  const getAnnualSavings = (plan) => {
    const monthlyCost = plan.priceMonthly * 12;
    const annualCost = plan.priceAnnual;
    return ((monthlyCost - annualCost) / monthlyCost * 100).toFixed(0);
  };

  return (
    <TeacherLayout
      title="Plans & Billing"
      subtitle="Manage your subscription and purchase credits"
    >
      {/* Success Alert */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-teacher-sage/10 border-2 border-teacher-sage/30 rounded-xl flex items-start gap-3"
          >
            <PartyPopper className="w-5 h-5 text-teacher-sage flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-teacher-sage font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-teacher-sage/60 hover:text-teacher-sage"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Plan Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="teacher-card p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-${currentPlan.color}/20`}>
              <currentPlan.icon className={`w-8 h-8 text-${currentPlan.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-bold text-teacher-ink">
                  {currentPlan.name}
                </h2>
                <span className={`teacher-badge ${currentTier.toLowerCase()}`}>
                  Current Plan
                </span>
              </div>
              <p className="text-teacher-inkLight">
                {currentPlan.credits.toLocaleString()} credits/month
                {currentTier !== 'FREE' && ` • ${currentPlan.priceMonthly > 0 ? `$${currentPlan.priceMonthly}/mo` : 'Free'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Credit Balance */}
            <div className="text-right">
              <div className="text-sm text-teacher-inkLight mb-1">Credits Available</div>
              <div className="font-display text-2xl font-bold text-teacher-ink">
                {credits.remaining.toLocaleString()}
                <span className="text-sm text-teacher-inkLight font-normal ml-1">
                  / {credits.total.toLocaleString()}
                </span>
              </div>
              {(credits.rollover > 0 || credits.bonus > 0) && (
                <div className="text-xs text-teacher-sage">
                  {credits.rollover > 0 && `+${credits.rollover} rollover`}
                  {credits.rollover > 0 && credits.bonus > 0 && ', '}
                  {credits.bonus > 0 && `+${credits.bonus} bonus`}
                </div>
              )}
            </div>

            {/* Manage Billing Button (for paid users) */}
            {currentTier !== 'FREE' && (
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="teacher-btn-secondary flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Usage Progress */}
        <div className="mt-6 pt-6 border-t border-teacher-ink/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-teacher-inkLight">Monthly Usage</span>
            <span className="text-sm font-medium text-teacher-ink">
              {credits.used.toLocaleString()} / {credits.subscription.toLocaleString()} credits
            </span>
          </div>
          <div className="h-2 bg-teacher-ink/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (credits.used / credits.subscription) * 100)}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${
                credits.used / credits.subscription > 0.9
                  ? 'bg-teacher-coral'
                  : credits.used / credits.subscription > 0.7
                    ? 'bg-teacher-gold'
                    : 'bg-teacher-sage'
              }`}
            />
          </div>
          <p className="text-xs text-teacher-inkLight mt-2">
            Resets on {quota?.quota?.resetDate ? new Date(quota.quota.resetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'the 1st of next month'}
          </p>
        </div>
      </motion.div>

      {/* Subscription Plans */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-xl font-semibold text-teacher-ink">
              Subscription Plans
            </h3>
            <p className="text-teacher-inkLight text-sm mt-1">
              Choose the plan that fits your teaching needs
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center gap-2 p-1 bg-teacher-ink/5 rounded-xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white shadow-sm text-teacher-ink'
                  : 'text-teacher-inkLight hover:text-teacher-ink'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-white shadow-sm text-teacher-ink'
                  : 'text-teacher-inkLight hover:text-teacher-ink'
              }`}
            >
              Annual
              <span className="text-xs px-1.5 py-0.5 bg-teacher-sage/20 text-teacher-sage rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([tier, plan], index) => {
            const isCurrentPlan = tier === currentTier;
            const canUpgrade = !isCurrentPlan && (
              (currentTier === 'FREE') ||
              (currentTier === 'BASIC' && tier === 'PROFESSIONAL')
            );
            const price = billingPeriod === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const PlanIcon = plan.icon;

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative teacher-card p-6 ${
                  plan.popular ? 'ring-2 ring-teacher-gold' : ''
                } ${isCurrentPlan ? 'bg-teacher-paper/50' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-teacher-gold text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`w-12 h-12 rounded-xl bg-${plan.color}/20 flex items-center justify-center mb-4`}>
                  <PlanIcon className={`w-6 h-6 text-${plan.color}`} />
                </div>

                <h4 className="font-display text-lg font-bold text-teacher-ink mb-1">
                  {plan.name}
                </h4>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-display text-3xl font-bold text-teacher-ink">
                    ${billingPeriod === 'annual' ? (price / 12).toFixed(2) : price.toFixed(2)}
                  </span>
                  <span className="text-teacher-inkLight">/month</span>
                </div>

                {billingPeriod === 'annual' && price > 0 && (
                  <p className="text-sm text-teacher-sage mb-4">
                    ${price.toFixed(2)} billed annually (Save {getAnnualSavings(plan)}%)
                  </p>
                )}

                {/* Credits Highlight */}
                <div className="p-3 bg-teacher-ink/5 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teacher-gold" />
                    <span className="font-semibold text-teacher-ink">
                      {plan.credits.toLocaleString()} credits/month
                    </span>
                  </div>
                  <p className="text-xs text-teacher-inkLight mt-1">
                    Rollover up to {plan.rolloverCap.toLocaleString()} credits
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-teacher-ink">
                      <CheckCircle2 className={`w-4 h-4 text-${plan.color} flex-shrink-0 mt-0.5`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-teacher-ink/5 text-teacher-inkLight font-medium cursor-default"
                  >
                    Current Plan
                  </button>
                ) : canUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(tier, billingPeriod === 'annual')}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? 'teacher-btn-gold'
                        : 'teacher-btn-primary'
                    } flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {plan.trialDays ? (
                          <>Start {plan.trialDays}-Day Free Trial</>
                        ) : (
                          <>Upgrade to {plan.name}</>
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-teacher-ink/5 text-teacher-inkLight font-medium cursor-default"
                  >
                    {tier === 'FREE' ? 'Downgrade via Portal' : 'Not Available'}
                  </button>
                )}

                {/* Trial Info */}
                {canUpgrade && plan.trialDays && (
                  <p className="text-center text-xs text-teacher-inkLight mt-2">
                    {plan.trialDays}-day free trial, cancel anytime
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Credit Packs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-teacher-plum/20">
            <Package className="w-5 h-5 text-teacher-plum" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-teacher-ink">
              Credit Packs
            </h3>
            <p className="text-teacher-inkLight text-sm">
              Need more credits? Purchase additional credits that never expire
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`teacher-card p-5 ${pack.popular ? 'ring-2 ring-teacher-plum' : ''}`}
            >
              {pack.popular && (
                <span className="inline-block px-2 py-0.5 bg-teacher-plum/10 text-teacher-plum text-xs font-semibold rounded-full mb-3">
                  Best Value
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-teacher-plum" />
                  <span className="font-display text-xl font-bold text-teacher-ink">
                    {pack.credits}
                  </span>
                  <span className="text-teacher-inkLight">credits</span>
                </div>
                {pack.savings && (
                  <span className="text-xs px-2 py-0.5 bg-teacher-sage/20 text-teacher-sage rounded-full font-medium">
                    {pack.savings}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-2xl font-bold text-teacher-ink">
                  ${pack.price.toFixed(2)}
                </span>
                <span className="text-sm text-teacher-inkLight">
                  (${pack.pricePerCredit.toFixed(3)}/credit)
                </span>
              </div>

              <button
                onClick={() => handleBuyCredits(pack.id)}
                disabled={loading}
                className="w-full teacher-btn-secondary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Purchase
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-teacher-inkLight mt-4">
          <Gift className="w-4 h-4 inline mr-1" />
          Bonus credits never expire and are used after your monthly subscription credits
        </p>
      </motion.div>

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="flex items-center gap-3 p-4 bg-teacher-paper/50 rounded-xl">
          <Shield className="w-8 h-8 text-teacher-sage" />
          <div>
            <div className="font-medium text-teacher-ink">Secure Payments</div>
            <div className="text-xs text-teacher-inkLight">Powered by Stripe</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-teacher-paper/50 rounded-xl">
          <Clock className="w-8 h-8 text-teacher-chalk" />
          <div>
            <div className="font-medium text-teacher-ink">Cancel Anytime</div>
            <div className="text-xs text-teacher-inkLight">No long-term commitment</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-teacher-paper/50 rounded-xl">
          <TrendingUp className="w-8 h-8 text-teacher-gold" />
          <div>
            <div className="font-medium text-teacher-ink">Credits Rollover</div>
            <div className="text-xs text-teacher-inkLight">Unused credits carry over</div>
          </div>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="teacher-card p-6"
      >
        <h3 className="font-display text-lg font-semibold text-teacher-ink mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-teacher-ink mb-1">What are credits?</h4>
            <p className="text-sm text-teacher-inkLight">
              Credits are used to generate AI-powered content like lessons, quizzes, flashcards, and more.
              Different content types use different amounts of credits based on complexity.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-teacher-ink mb-2">What can I create with my credits?</h4>
            <div className="space-y-4">
              {/* Free Tier */}
              <div className="p-4 bg-teacher-ink/5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Coffee className="w-4 h-4 text-teacher-inkLight" />
                  <span className="font-medium text-teacher-ink text-sm">Free (100 credits/month)</span>
                </div>
                <p className="text-sm text-teacher-inkLight">
                  ~20 quiz generations, OR ~10 full lessons, OR ~25 paper gradings, OR ~100 chat messages
                </p>
              </div>

              {/* Basic Tier */}
              <div className="p-4 bg-teacher-sage/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-teacher-sage" />
                  <span className="font-medium text-teacher-ink text-sm">Basic (500 credits/month)</span>
                </div>
                <p className="text-sm text-teacher-inkLight mb-2">
                  A typical active teacher might use per month:
                </p>
                <ul className="text-sm text-teacher-inkLight space-y-1 ml-4">
                  <li>10 content analyses (50 credits)</li>
                  <li>15 quizzes (45 credits)</li>
                  <li>10 flashcard decks (25 credits)</li>
                  <li>5 full lessons (60 credits)</li>
                  <li>50 paper gradings (200 credits)</li>
                  <li>100 chat messages (100 credits)</li>
                </ul>
                <p className="text-xs text-teacher-sage mt-2 font-medium">Total: ~480 credits/month</p>
              </div>

              {/* Pro Tier */}
              <div className="p-4 bg-teacher-gold/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-teacher-gold" />
                  <span className="font-medium text-teacher-ink text-sm">Professional (2,000 credits/month)</span>
                </div>
                <p className="text-sm text-teacher-inkLight mb-2">
                  Power user or teachers with multiple classes:
                </p>
                <ul className="text-sm text-teacher-inkLight space-y-1 ml-4">
                  <li>30 content analyses (150 credits)</li>
                  <li>50 quizzes (150 credits)</li>
                  <li>30 flashcard decks (75 credits)</li>
                  <li>20 full lessons (240 credits)</li>
                  <li>200 paper gradings (800 credits)</li>
                  <li>10 infographics (150 credits)</li>
                  <li>300 chat messages (300 credits)</li>
                </ul>
                <p className="text-xs text-teacher-gold mt-2 font-medium">Total: ~1,865 credits/month</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-teacher-ink mb-1">How does credit rollover work?</h4>
            <p className="text-sm text-teacher-inkLight">
              Unused subscription credits roll over to the next month, up to your plan's rollover cap.
              For example, the Basic plan allows up to 1,000 rollover credits.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-teacher-ink mb-1">Can I downgrade my plan?</h4>
            <p className="text-sm text-teacher-inkLight">
              Yes, you can downgrade through the Stripe customer portal. Click "Manage Billing" to access it.
              Your current plan remains active until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-teacher-ink mb-1">Do purchased credit packs expire?</h4>
            <p className="text-sm text-teacher-inkLight">
              No! Credit packs (bonus credits) never expire. They're used after your monthly subscription
              credits are depleted and carry over indefinitely.
            </p>
          </div>
        </div>
      </motion.div>
    </TeacherLayout>
  );
};

export default TeacherBillingPage;
