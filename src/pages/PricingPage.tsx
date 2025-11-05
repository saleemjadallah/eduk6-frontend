import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pricingPlans, type PlanTier } from '@/data/plans';
import { api } from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useEffect } from 'react';

type CheckoutTier = Extract<PlanTier, 'starter' | 'pro'>;

export function PricingPage() {
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();

  // Track ViewContent event when pricing page loads
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: 'Pricing Page',
        content_category: 'pricing'
      });
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getCurrentSubscription(),
    enabled: Boolean(user),
  });

  const handleSelectPlan = (tier: CheckoutTier) => {
    // Track InitiateCheckout event when user selects a plan
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const plan = pricingPlans.find(p => p.tier === tier);
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: plan?.name,
        content_category: 'subscription',
        value: plan?.price || 0,
        currency: 'AED'
      });
    }

    if (!user) {
      navigate('/register', { state: { redirectTo: `/checkout?tier=${tier}` } });
      return;
    }

    if (subscription?.status === 'active' && subscription.tier === tier) {
      navigate('/dashboard');
      return;
    }

    navigate(`/checkout?tier=${tier}`);
  };

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </span>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose the perfect plan for your business
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All plans include commercial usage rights and high-resolution downloads
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => {
            const isCurrentPlan =
              subscription?.status === 'active' && subscription.tier === plan.tier;

            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl bg-white border-2 p-8 ${
                  plan.popular ? 'border-primary-600 shadow-2xl scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 text-white text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} text-white mb-4`}>
                  <plan.icon className="w-6 h-6" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  {plan.price ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Billed monthly</p>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">Custom</span>
                    </div>
                  )}
                </div>

                {plan.tier === 'enterprise' ? (
                  <Link
                    to="mailto:hello@mydscvr.com"
                    className="block w-full py-3 rounded-lg text-center font-semibold transition-all bg-gray-100 text-gray-900 hover:bg-gray-200"
                  >
                    Contact Sales
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.tier as CheckoutTier)}
                    className={`block w-full py-3 rounded-lg text-center font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isCurrentPlan ? 'Manage in Dashboard' : 'Get Started'}
                  </button>
                )}

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, Amex) and process payments securely through Stripe.',
              },
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What are AI photo enhancements?',
                a: 'Our AI enhancement feature transforms your existing dish photos into professional-quality images. Upload any photo and choose from vibrant, natural, or dramatic enhancement styles - perfect for elevating photos taken on your phone or improving older menu images.',
              },
              {
                q: 'Do unused dishes and enhancements roll over?',
                a: 'No, unused dishes and enhancements reset at the start of each billing period. We recommend choosing a plan that matches your monthly needs.',
              },
              {
                q: 'What are commercial usage rights?',
                a: 'You have full rights to use generated images for commercial purposes, including menus, websites, social media, and marketing materials.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
