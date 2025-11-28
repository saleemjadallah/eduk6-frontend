import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const navigate = useNavigate();
  const [showFAQ, setShowFAQ] = useState({});

  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (e) {
      window.location.assign(path);
    }
  };

  // Pricing tiers - values to be filled in by user
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Get started with basic features',
      icon: Star,
      color: '#32CD32',
      shadowColor: 'rgba(50,205,50,1)',
      features: [
        '5 lessons per month',
        'Basic chat with Jeffrey',
        '10 flashcards per lesson',
        'Email support',
      ],
      limitations: [
        'Limited AI features',
        'No parent dashboard',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Premium',
      price: '$XX',
      period: '/month',
      description: 'Everything your child needs to excel',
      icon: Zap,
      color: '#4169E1',
      shadowColor: 'rgba(65,105,225,1)',
      features: [
        'Unlimited lessons',
        'Advanced Jeffrey AI',
        'Unlimited flashcards & quizzes',
        'Full parent dashboard',
        'Progress analytics',
        'Priority support',
        'Weekly progress reports',
      ],
      limitations: [],
      cta: 'Get Premium',
      popular: true,
    },
    {
      name: 'Family',
      price: '$XX',
      period: '/month',
      description: 'Perfect for families with multiple children',
      icon: Crown,
      color: '#FFD700',
      shadowColor: 'rgba(255,215,0,1)',
      features: [
        'Everything in Premium',
        'Up to 5 child profiles',
        'Family progress overview',
        'Shared flashcard library',
        'Premium phone support',
        'Early access to new features',
      ],
      limitations: [],
      cta: 'Get Family Plan',
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      question: 'Is there a free trial for Premium?',
      answer: 'Yes! All paid plans come with a 7-day free trial. No credit card required to start.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and Apple Pay. All payments are securely processed.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
    },
    {
      question: 'Do you offer discounts for schools?',
      answer: 'Yes! We have special pricing for schools and educational institutions. Contact us for details.',
    },
  ];

  const toggleFAQ = (index) => {
    setShowFAQ((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-nanobanana-yellow/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-nanobanana-blue/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
            Simple, <span className="text-nanobanana-blue">Fair</span> Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Start free and upgrade when you're ready. No hidden fees, ever.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-nanobanana-blue text-white px-4 py-1 rounded-full font-bold text-sm border-2 border-black">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`bg-white p-6 md:p-8 rounded-3xl border-4 border-black h-full flex flex-col ${
                  tier.popular ? 'ring-4 ring-nanobanana-blue/30' : ''
                }`}
                style={{
                  boxShadow: `8px 8px 0px 0px ${tier.shadowColor}`,
                }}
              >
                {/* Tier header */}
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 mx-auto rounded-2xl border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: tier.color }}
                  >
                    <tier.icon className={`w-8 h-8 ${tier.color === '#FFD700' ? 'text-black' : 'text-white'}`} />
                  </div>
                  <h3 className="text-2xl font-bold font-comic mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-black">{tier.price}</span>
                    <span className="text-gray-500 font-medium">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{tier.description}</p>
                </div>

                {/* Features */}
                <div className="flex-1 mb-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: `${tier.color}20` }}
                        >
                          <Check className="w-3 h-3" style={{ color: tier.color }} />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                    {tier.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-3 text-gray-400">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 bg-gray-100">
                          <span className="text-xs">-</span>
                        </div>
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  onClick={() => safeNavigate('/onboarding')}
                  className={`w-full py-4 rounded-2xl font-bold text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all ${
                    tier.popular
                      ? 'bg-nanobanana-blue text-white'
                      : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-2xl md:text-3xl font-bold font-comic text-center mb-8">
            Frequently Asked Questions
          </h3>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold">{faq.question}</span>
                  {showFAQ[index] ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
                {showFAQ[index] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
