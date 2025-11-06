import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, TrendingUp, Camera, Palette, Clock, Settings, LayoutDashboard, Image as ImageIcon, ArrowUp, DollarSign, Brain, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
// import { useCurrency } from '@/contexts/CurrencyContext'; // DISABLED FOR US MARKET TEST
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const features = [
  {
    icon: Camera,
    title: 'Studio-Quality Photos',
    description: 'AI-generated images that look like professional food photography',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Palette,
    title: 'Multiple Styles',
    description: 'Choose from Rustic, Modern, Social Media, or Delivery App styles',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Clock,
    title: 'Instant Results',
    description: 'Get 3 variations of your dish in seconds, not hours',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: TrendingUp,
    title: 'Boost Sales',
    description: 'Professional imagery increases order conversion by up to 40%',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate images 100x faster than traditional photography',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Commercial Rights',
    description: 'Full ownership and commercial usage rights included',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const sampleImages = [
  {
    style: 'Rustic/Dark',
    description: 'Dark moody lighting, perfect for upscale restaurants',
  },
  {
    style: 'Bright/Modern',
    description: 'Clean and minimalist, ideal for health-conscious brands',
  },
  {
    style: 'Social Media',
    description: 'Instagram-ready overhead shots',
  },
  {
    style: 'Delivery App',
    description: 'Optimized for mobile ordering platforms',
  },
];

const carouselImages = [
  {
    src: '/carousel-images/rustic-dark-steak.jpg',
    style: 'Rustic Dark',
    foodItem: 'Grilled Ribeye Steak',
  },
  {
    src: '/carousel-images/bright-modern-avocado-toast.jpg',
    style: 'Bright Modern',
    foodItem: 'Avocado Toast',
  },
  {
    src: '/carousel-images/social-media-acai-bowl.jpg',
    style: 'Social Media',
    foodItem: 'Acai Bowl',
  },
  {
    src: '/carousel-images/delivery-app-burger.jpg',
    style: 'Delivery App',
    foodItem: 'Gourmet Burger',
  },
  {
    src: '/carousel-images/rustic-dark-pasta.jpg',
    style: 'Rustic Dark',
    foodItem: 'Pasta Carbonara',
  },
  {
    src: '/carousel-images/bright-modern-poke-bowl.jpg',
    style: 'Bright Modern',
    foodItem: 'Poke Bowl',
  },
  {
    src: '/carousel-images/social-media-matcha-latte.jpg',
    style: 'Social Media',
    foodItem: 'Matcha Latte',
  },
  {
    src: '/carousel-images/delivery-app-sushi.jpg',
    style: 'Delivery App',
    foodItem: 'Sushi Platter',
  },
  {
    src: '/carousel-images/rustic-dark-ribs.jpg',
    style: 'Rustic Dark',
    foodItem: 'BBQ Ribs',
  },
  {
    src: '/carousel-images/bright-modern-greek-salad.jpg',
    style: 'Bright Modern',
    foodItem: 'Greek Salad',
  },
];

export function HomePage() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
  });

  // const { formatPrice } = useCurrency(); // DISABLED FOR US MARKET TEST
  const formatPrice = (price: number) => `$${price.toFixed(2)}`; // Simple USD formatter

  // Base amount in USD for cost savings statistic (converted from AED)
  const costSavingsInAED = 4050; // ~15000 AED in USD

  const statistics = [
    {
      icon: ShoppingCart,
      value: '35%+',
      label: 'Increase in Total Orders',
      description: 'High-quality food photos boost orders by over 35%',
      source: 'Snappr, Grubhub',
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      icon: TrendingUp,
      value: '40%',
      label: 'Sales Increase',
      description: 'Restaurants using digital menus with great visuals see 40% sales growth',
      source: 'EvergreenHQ',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: ArrowUp,
      value: '25%',
      label: 'Higher Average Order Value',
      description: 'Strategic visuals increase customer spend per order by 25%',
      source: 'WebDiner',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Brain,
      value: '90%',
      label: 'Visual Information Processing',
      description: 'Of all information transmitted to the brain is visual',
      source: 'Cognitive Science',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: DollarSign,
      value: formatPrice(costSavingsInAED),
      label: 'Cost Savings',
      description: 'Average amount saved per photo shoot with AI generation',
      source: 'Market Research',
      gradient: 'from-yellow-500 to-amber-500',
    },
  ];

  const heroTitle = user
    ? 'Welcome back — ready to create your next hero dish?'
    : 'Transform Your Menu Into Stunning Visuals';

  const heroDescription = user
    ? 'Jump straight into your creative workspace to generate new dishes, review past creations, and manage your plan.'
    : 'Generate professional food photography in seconds with AI. Perfect for restaurants, delivery apps, and social media. No photographer needed.';

  const primaryCta = user
    ? { to: '/dashboard', label: 'Go to Dashboard' }
    : { to: '/register', label: 'Start Creating Free' };

  const secondaryCta = user
    ? { to: '/pricing', label: 'Manage Subscription' }
    : { to: '/pricing', label: 'View Pricing' };

  const quickActions = user
    ? [
        {
          to: '/dashboard',
          title: 'Open Dashboard',
          description: 'Review dishes, track usage, and access past generations.',
          icon: LayoutDashboard,
        },
        {
          to: '/generate',
          title: 'Create Images',
          description: 'Launch the generator and craft your next mouth-watering dish.',
          icon: ImageIcon,
        },
        {
          to: '/pricing',
          title: 'Manage Plan',
          description: 'Adjust subscription, update billing, or view plan details.',
          icon: Settings,
        },
      ]
    : [];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 mesh-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                AI-Powered Food Photography
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              {user ? (
                heroTitle
              ) : (
                <>
                  Transform Your Menu Into{' '}
                  <span className="hero-text-gradient">
                    Stunning Visuals
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto text-balance"
            >
              {heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to={primaryCta.to}
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full hero-cta text-white text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                {primaryCta.label}
                <motion.div
                  className="absolute inset-0 rounded-full gradient-saffron opacity-0 group-hover:opacity-20 transition-opacity"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </Link>

              <Link
                to={secondaryCta.to}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white border-2 border-gray-300 text-gray-900 text-lg font-semibold hover:border-saffron-500 hover:text-saffron-500 transition-all"
              >
                {secondaryCta.label}
              </Link>
            </motion.div>

            {!user && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 text-sm text-gray-500"
              >
                No credit card required • 3 free dishes to start
              </motion.p>
            )}
          </div>
        </div>
      </section>

      {/* AI-Generated Food Carousel - HeadshotPro Style */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Professional Food Photography, AI-Generated
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real examples created with our AI. Use text descriptions or enhance your existing images.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                      >
                        <img
                          src={image.src}
                          alt={`AI-generated ${image.foodItem} in ${image.style} style`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Top badge - Always visible */}
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold shadow-lg flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                          AI Generated
                        </div>

                        {/* Bottom info - Visible on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform">
                          <div className="mb-1">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-saffron-500/90 text-xs font-medium">
                              {image.style}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold">{image.foodItem}</h3>
                        </div>
                      </motion.div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-10"
          >
            <p className="text-gray-600 mb-6">
              <span className="font-semibold text-gray-900">10 images created</span> for{' '}
              <span className="font-semibold text-gray-900">thousands</span> of happy restaurant owners
            </p>
            <Link
              to={user ? '/generate' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-saffron-500 text-white font-semibold hover:bg-saffron-600 hover:shadow-lg transition-all"
            >
              <Camera className="w-4 h-4" />
              {user ? 'Create Your Food Photos' : 'Start Creating Free'}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Carousel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Proven Results That Drive Growth
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Data-backed insights showing the power of professional food imagery
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent>
                {statistics.map((stat, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-transparent hover:shadow-xl transition-all h-full"
                      >
                        <div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                        />

                        <div className="relative z-10">
                          <div
                            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-4`}
                          >
                            <stat.icon className="w-5 h-5" />
                          </div>

                          <div className="mb-3">
                            <div className={`text-4xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                              {stat.value}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {stat.label}
                            </h3>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {stat.description}
                          </p>

                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Source: {stat.source}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </motion.div>
        </div>
      </section>

      {user && quickActions.length > 0 && (
        <section className="bg-white/60 backdrop-blur py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Quick actions</h2>
              <p className="mt-2 text-gray-600">
                Pick up where you left off — everything you need is a click away.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-primary-200 hover:shadow-lg transition-all"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3 text-primary-600">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{action.description}</p>
                  <Link
                    to={action.to}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Go now
                    <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Style Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Style
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple photography styles tailored to your brand and platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sampleImages.map((sample, index) => {
              const imageMap: Record<string, string> = {
                'Rustic/Dark': '/sample-images/rustic-dark-sample.png',
                'Bright/Modern': '/sample-images/bright-modern-sample.png',
                'Social Media': '/sample-images/social-media-sample.png',
                'Delivery App': '/sample-images/delivery-app-sample.png',
              };

              return (
                <motion.div
                  key={sample.style}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative aspect-video rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <img
                    src={imageMap[sample.style]}
                    alt={`${sample.style} food photography example`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{sample.style}</h3>
                    <p className="text-white/90">{sample.description}</p>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                    AI Generated
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 mesh-gradient">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for perfect food photos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional features that help restaurants and food businesses stand out
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative p-8 rounded-2xl bg-white border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all"
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                />
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="cta-card relative p-12 rounded-3xl text-charcoal text-center"
          >
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4 text-charcoal">
                Ready to transform your menu?
              </h2>
              <p className="text-lg md:text-xl text-charcoal/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of restaurants creating crave-worthy food photography in minutes, not weeks.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-charcoal text-cream text-lg font-semibold hover:bg-espresso-light hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Start generating images
              </Link>
              <p className="mt-4 text-sm text-charcoal/70">
                No credit card required • Cancel anytime
              </p>
            </div>

            {/* Ambient texture */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ background: 'radial-gradient(120% 140% at 100% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 55%)' }} />
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ background: 'radial-gradient(120% 120% at 10% 100%, rgba(255,248,240,0.85) 0%, rgba(255,248,240,0) 60%)' }} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
