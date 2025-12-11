import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Zap, Crown, Check, Sparkles, ArrowRight } from 'lucide-react';

const TeacherPricingSection = () => {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out the platform',
      icon: Star,
      color: '#7BAE7F', // sage
      shadowColor: 'rgba(123,174,127,0.5)',
      credits: '100',
      creditsLabel: 'credits/month',
      features: [
        'All 4 creation tools',
        'Export to PDF & DOCX',
        'Standards alignment',
        'Email support',
        'Up to 200 credits rollover',
      ],
      limitations: [
        'Basic generation speed',
      ],
      cta: 'Start Free',
      ctaLink: '/teacher/signup',
      popular: false,
    },
    {
      name: 'Basic',
      price: '$9.99',
      period: '/month',
      annualPrice: '$95.90/year',
      description: 'For active individual teachers',
      icon: Zap,
      color: '#2D5A4A', // chalk
      shadowColor: 'rgba(45,90,74,0.5)',
      credits: '500',
      creditsLabel: 'credits/month',
      features: [
        'Everything in Free',
        '5x more content creation',
        'Priority generation speed',
        'Advanced customization',
        'Priority email support',
        'Up to 1,000 credits rollover',
      ],
      limitations: [],
      cta: 'Start 7-Day Trial',
      ctaLink: '/teacher/signup?plan=basic',
      popular: true,
    },
    {
      name: 'Professional',
      price: '$24.99',
      period: '/month',
      annualPrice: '$239.90/year',
      description: 'For power users & departments',
      icon: Crown,
      color: '#D4A853', // gold
      shadowColor: 'rgba(212,168,83,0.5)',
      credits: '2,000',
      creditsLabel: 'credits/month',
      features: [
        'Everything in Basic',
        '20x content creation',
        'Fastest generation speed',
        'Early access to new features',
        'Grading Center beta access',
        'Premium phone support',
        'Up to 4,000 credits rollover',
      ],
      limitations: [],
      cta: 'Start 7-Day Trial',
      ctaLink: '/teacher/signup?plan=professional',
      popular: false,
    },
  ];

  const allPlansInclude = [
    'Unlimited exports',
    'No watermarks',
    'All content types',
    'Cancel anytime',
    '7-day free trial on paid plans',
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-white via-teacher-cream to-teacher-paper relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teacher-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teacher-chalk/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-teacher-gold/15 text-teacher-gold px-4 py-2 rounded-full font-bold text-sm border border-teacher-gold/25 mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display mb-4">
            <span className="text-teacher-ink">Start Free, </span>
            <span className="text-teacher-chalk">Upgrade Anytime</span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-teacher-inkLight max-w-2xl mx-auto">
            No hidden fees, no credit card required. Try all features free, then choose the plan that fits.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative ${tier.popular ? 'lg:-mt-4 lg:mb-4 sm:col-span-2 lg:col-span-1' : ''}`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className="px-4 py-1.5 rounded-full font-bold text-sm text-white border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: tier.color }}
                  >
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`bg-white rounded-3xl border-4 border-black h-full flex flex-col transition-all duration-300 ${
                  tier.popular ? 'ring-4 ring-teacher-chalk/20' : ''
                }`}
                style={{ boxShadow: `8px 8px 0px 0px ${tier.shadowColor}` }}
              >
                {/* Header */}
                <div className="p-4 md:p-6 pb-0">
                  <div className="text-center">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-xl md:rounded-2xl border-3 md:border-4 border-black flex items-center justify-center mb-3 md:mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: tier.color }}
                    >
                      <tier.icon
                        className={`w-6 h-6 md:w-8 md:h-8 ${tier.color === '#D4A853' ? 'text-teacher-ink' : 'text-white'}`}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-xl md:text-2xl font-black font-display text-teacher-ink mb-1">
                      {tier.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-3xl md:text-4xl lg:text-5xl font-black text-teacher-ink">
                        {tier.price}
                      </span>
                      <span className="text-teacher-inkLight font-medium text-sm md:text-base">{tier.period}</span>
                    </div>
                    {tier.annualPrice && (
                      <p className="text-xs text-teacher-inkLight mb-2">
                        or {tier.annualPrice} <span className="text-teacher-sage font-medium">(save 20%)</span>
                      </p>
                    )}

                    {/* Credits */}
                    <div
                      className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border-2 mb-3 md:mb-4"
                      style={{
                        backgroundColor: `${tier.color}10`,
                        borderColor: `${tier.color}30`,
                      }}
                    >
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4" style={{ color: tier.color }} />
                      <span className="font-bold text-sm md:text-base" style={{ color: tier.color }}>
                        {tier.credits}
                      </span>
                      <span className="text-xs md:text-sm text-teacher-inkLight">{tier.creditsLabel}</span>
                    </div>

                    <p className="text-xs md:text-sm text-teacher-inkLight">{tier.description}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="px-4 md:px-6 py-3 md:py-4">
                  <div className="h-px bg-teacher-ink/10" />
                </div>

                {/* Features */}
                <div className="px-4 md:px-6 flex-1">
                  <ul className="space-y-2 md:space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 md:gap-3">
                        <div
                          className="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: `${tier.color}20` }}
                        >
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3" style={{ color: tier.color }} />
                        </div>
                        <span className="text-xs md:text-sm text-teacher-ink">{feature}</span>
                      </li>
                    ))}
                    {tier.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-2 md:gap-3 text-teacher-inkLight/60">
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 bg-gray-100">
                          <span className="text-[10px] md:text-xs text-gray-400">-</span>
                        </div>
                        <span className="text-xs md:text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-4 md:p-6">
                  <Link
                    to={tier.ctaLink}
                    className={`group w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg border-3 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                      tier.popular
                        ? 'bg-teacher-chalk text-white'
                        : 'bg-white text-teacher-ink hover:bg-gray-50'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* All Plans Include */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-bold text-teacher-inkLight mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {allPlansInclude.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-teacher-ink/10"
              >
                <Check className="w-4 h-4 text-teacher-sage" />
                <span className="text-sm font-medium text-teacher-ink">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* School/Organization CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-teacher-plum/10 rounded-2xl border-2 border-teacher-plum/20 px-8 py-6">
            <p className="text-lg font-bold text-teacher-ink mb-2">
              Need organization-wide access?
            </p>
            <p className="text-teacher-inkLight mb-4">
              We offer special pricing for schools and districts with shared quotas.
            </p>
            <a
              href="mailto:schools@orbitlearn.com"
              className="inline-flex items-center gap-2 text-teacher-plum font-bold hover:gap-3 transition-all"
            >
              Contact us for school pricing
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeacherPricingSection;
