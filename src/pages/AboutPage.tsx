import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Users, Zap, HelpCircle } from 'lucide-react';

type Tab = 'about' | 'faq';

export function AboutPage() {
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const faqs = [
    {
      question: 'What is Mydscvr?',
      answer:
        'Mydscvr is an AI-powered food photography platform that helps restaurants, cafes, and food businesses create stunning, professional-quality images for their menus, delivery apps, and social media - without the need for expensive photoshoots.',
    },
    {
      question: 'How does the AI image generation work?',
      answer:
        'Our advanced AI technology analyzes your dish descriptions, ingredients, and style preferences to generate realistic, mouth-watering food photography. Simply provide details about your dish, choose a style, and our AI creates multiple high-quality images in seconds.',
    },
    {
      question: 'What is the AI Photo Enhancement feature?',
      answer:
        'Our AI enhancement feature transforms your existing dish photos into professional-quality images. Upload any photo taken on your phone or camera, and choose from vibrant, natural, or dramatic enhancement styles to make your food look its absolute best.',
    },
    {
      question: 'Can I use the generated images commercially?',
      answer:
        'Yes! All images generated through Mydscvr come with full commercial usage rights. You can use them on your menus, websites, social media, delivery platforms, and any other marketing materials without restrictions.',
    },
    {
      question: 'How many images can I generate?',
      answer:
        'The number of images depends on your subscription plan. Our Free Trial includes 3 dishes, Starter plan offers 30 dishes per month, Pro plan provides 100 dishes per month, and Enterprise plans offer unlimited generation. Each dish generation creates multiple image variations.',
    },
    {
      question: 'What formats and resolutions are available?',
      answer:
        'All generated images are available in high-resolution PNG format, optimized for both digital and print use. Images are suitable for websites, social media, menus, and promotional materials.',
    },
    {
      question: 'Do I need professional photos to start?',
      answer:
        'Not at all! You can generate images from descriptions alone. However, if you have existing photos you\'d like to improve, our AI Enhancement feature can transform them into professional-quality images.',
    },
    {
      question: 'Can I customize the style of images?',
      answer:
        'Yes! We offer multiple style options including Rustic/Dark, Bright/Modern, Social Media optimized, and Delivery App optimized. You can also choose from different enhancement styles: Vibrant, Natural, or Dramatic.',
    },
    {
      question: 'How long does it take to generate images?',
      answer:
        'Image generation typically takes 30-60 seconds. Enhancement processing is even faster, usually completing in under 30 seconds per image.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. All transactions are encrypted and secure.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        'Yes, you can cancel your subscription at any time from your account settings. If you cancel, you\'ll continue to have access until the end of your current billing period.',
    },
    {
      question: 'Do unused dishes roll over to the next month?',
      answer:
        'No, unused dish generations reset at the start of each billing period. We recommend choosing a plan that matches your monthly needs.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        'Yes! New users get 3 free dish generations to try the platform. No credit card required for the trial.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer:
        'Absolutely! You can upgrade or downgrade your subscription plan at any time from your dashboard. Changes take effect immediately.',
    },
    {
      question: 'How do I share my menu with customers?',
      answer:
        'Once you\'ve saved dishes to your menu, you can generate a QR code from your dashboard. Customers can scan this QR code to view your digital menu in our beautiful, interactive menu book format.',
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron-100 text-saffron-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Discover Mydscvr
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About Mydscvr
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforming the way restaurants showcase their culinary creations
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-white text-saffron-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'faq'
                  ? 'bg-white text-saffron-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              FAQ
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'about' ? (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Mission */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white flex-shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Our Mission
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      At Mydscvr, we believe every restaurant deserves stunning food
                      photography - regardless of budget. Our mission is to democratize
                      professional food photography using cutting-edge AI technology,
                      helping restaurants, cafes, and food businesses showcase their
                      culinary creations in the best possible light.
                    </p>
                  </div>
                </div>
              </div>

              {/* What We Do */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      What We Do
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Mydscvr combines advanced artificial intelligence with deep
                      understanding of food photography to generate professional-quality
                      images in seconds. Whether you're launching a new menu item,
                      updating your delivery app listings, or refreshing your social
                      media presence, we've got you covered.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-saffron-600 mt-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            AI Image Generation
                          </h3>
                          <p className="text-sm text-gray-600">
                            Create stunning food photos from descriptions alone
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-saffron-600 mt-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Photo Enhancement
                          </h3>
                          <p className="text-sm text-gray-600">
                            Transform existing photos into professional quality
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-saffron-600 mt-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Digital Menu Book
                          </h3>
                          <p className="text-sm text-gray-600">
                            Share interactive menus with QR codes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-saffron-600 mt-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Multiple Styles
                          </h3>
                          <p className="text-sm text-gray-600">
                            Choose from various photography and enhancement styles
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Who We Serve */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Who We Serve
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Mydscvr is trusted by restaurants, cafes, cloud kitchens, and food
                      businesses across the UAE and beyond. Whether you're a small
                      family-run restaurant or a growing food brand, our platform scales
                      with your needs.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Restaurants', 'Cafes', 'Cloud Kitchens', 'Catering Services'].map(
                        (category) => (
                          <div
                            key={category}
                            className="text-center p-4 rounded-lg bg-gradient-to-br from-cream to-saffron-50 border border-saffron-100"
                          >
                            <p className="font-semibold text-gray-900 text-sm">
                              {category}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-gradient-to-br from-saffron-50 to-cream rounded-2xl p-8 border border-saffron-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Get in Touch
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Have questions or need help? We're here for you.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-saffron-700">
                      support@mydscvr.ai
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="text-lg font-semibold text-gray-900">
                      Jasmine Entertainment FZE
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-saffron-100 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-saffron-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Still have questions? */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 text-center bg-gradient-to-br from-saffron-50 to-cream rounded-2xl p-8 border border-saffron-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-6">
                  Can't find the answer you're looking for? Our support team is here to
                  help.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('support@mydscvr.ai');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg transition-all"
                >
                  Contact Support
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
