import { useEffect, useMemo, useState, useCallback } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { stripePromise } from '@/lib/stripe';
import { subscriptionPlans, type PlanTier } from '@/data/plans';

type CheckoutTier = Extract<PlanTier, 'starter' | 'pro'>;

interface CheckoutFormProps {
  tier: CheckoutTier;
}

function isCheckoutTier(value: string | null): value is CheckoutTier {
  return value === 'starter' || value === 'pro';
}

function CheckoutForm({ tier }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!stripe || !elements) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const { error: validationError } = await elements.submit();
      if (validationError) {
        setSubmitError(validationError.message ?? 'Your payment details are incomplete.');
        setIsSubmitting(false);
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setSubmitError(result.error.message ?? 'Payment failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'processing') {
        await queryClient.invalidateQueries({ queryKey: ['subscription'] });
        await queryClient.invalidateQueries({ queryKey: ['usage'] });
        navigate('/dashboard', { replace: true });
        return;
      }

      setSubmitError('We could not confirm your payment. Please contact support if this continues.');
      setIsSubmitting(false);
    },
    [elements, navigate, queryClient, stripe]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <PaymentElement options={{ layout: 'tabs' }} />
        <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4" />
          Payments are securely processed in Stripe&apos;s sandbox environment.
        </p>
      </div>

      {submitError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-3 text-base font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Confirm {subscriptionPlans[tier].name} plan
          </>
        )}
      </button>
    </form>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tierParam = (searchParams.get('tier') || '').toLowerCase();
  const tier = isCheckoutTier(tierParam) ? (tierParam as CheckoutTier) : null;

  const plan = tier ? subscriptionPlans[tier] : null;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
  });

  const {
    data: subscription,
    isLoading: subscriptionLoading,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getCurrentSubscription(),
    enabled: Boolean(user),
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentRequestId, setIntentRequestId] = useState(0);
  const [wasResumed, setWasResumed] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login', {
        replace: true,
        state: { redirectTo: tier ? `/checkout?tier=${tier}` : '/pricing' },
      });
    }
  }, [navigate, tier, user, userLoading]);

  useEffect(() => {
    if (!tier || !user || subscriptionLoading) {
      return;
    }

    if (subscription?.status === 'active') {
      return;
    }

    if (clientSecret) {
      return;
    }

    if (!stripePromise) {
      setIntentError('Stripe publishable key is not configured. Contact support to complete checkout.');
      return;
    }

    let cancelled = false;
    setIntentLoading(true);
    setIntentError(null);

    api
      .createSubscriptionIntent(tier)
      .then((intent) => {
        if (!cancelled) {
          setClientSecret(intent.clientSecret);
          setWasResumed(Boolean(intent.resumed));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setIntentError(
            error instanceof Error ? error.message : 'Failed to initialize checkout. Please try again.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIntentLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientSecret, subscription, subscriptionLoading, tier, user, intentRequestId]);

  if (!tier || !plan) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <AlertTriangle className="mb-4 h-10 w-10 text-red-500" />
        <h1 className="text-3xl font-bold text-gray-900">Choose a plan to continue</h1>
        <p className="mt-3 text-gray-600">
          We couldn&apos;t determine which subscription tier you selected. Please return to pricing and
          choose a plan.
        </p>
        <Link
          to="/pricing"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Link>
      </div>
    );
  }

  if (subscription && subscription.status === 'active') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <ShieldCheck className="mb-4 h-12 w-12 text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-900">You already have an active plan</h1>
        <p className="mt-3 text-gray-600">
          Your {subscription.tier} subscription is active. Visit your dashboard to keep creating stunning
          dishes or manage your plan.
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            to="/dashboard"
            className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/pricing"
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-primary-600 hover:text-primary-600"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const priceDisplay =
    plan.price !== null ? `AED ${plan.price.toLocaleString()} / ${plan.period}` : 'Contact sales';

  const elementsOptions = useMemo<StripeElementsOptions | undefined>(() => {
    if (!clientSecret) {
      return undefined;
    }

    return {
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#F05A28',
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      },
    };
  }, [clientSecret]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-gray-200 bg-white p-10 shadow-xl"
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Complete your {plan.name} subscription
            </h1>
            <p className="mt-2 text-gray-600">
              Enter your payment details below to activate your plan and start generating AI-crafted food
              photography.
            </p>

            {intentError && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p>{intentError}</p>
                  <button
                    onClick={() => {
                      setIntentError(null);
                      setClientSecret(null);
                      setWasResumed(false);
                      setIntentRequestId((id) => id + 1);
                    }}
                    className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {intentLoading && (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Initializing secure payment form...
              </div>
            )}

            {!intentLoading && elementsOptions && stripePromise && (
              <div className="mt-8">
                {wasResumed && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p>We found an unfinished payment and re-opened it here. Review your details and submit to finish checkout.</p>
                    </div>
                  </div>
                )}
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <CheckoutForm tier={tier} />
                </Elements>
              </div>
            )}
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-fit rounded-3xl border border-gray-200 bg-white p-8 shadow-lg"
          >
            <div className={`inline-flex rounded-2xl bg-gradient-to-br ${plan.gradient} p-4 text-white`}>
              <CreditCard className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-gray-900">{plan.name} Plan</h2>
            <p className="mt-2 text-sm text-gray-600">{plan.description}</p>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-sm font-medium text-gray-500">Total due now</p>
              <p className="mt-2 text-4xl font-bold text-gray-900">{priceDisplay}</p>
              <p className="mt-1 text-xs text-gray-500">
                Recurring monthly billing. Cancel anytime prior to renewal.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">What&apos;s included</p>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                    <ShieldCheck className="h-4 w-4 text-primary-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
