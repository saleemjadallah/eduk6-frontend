import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Clock,
  DollarSign,
  Shield,
  Users,
  Check,
  Linkedin,
  Building2,
  Palette,
  Briefcase,
  CheckCircle,
  Eye,
} from 'lucide-react';
import FloatingOrb from '../components/gamma/FloatingOrb';
import GradientMesh from '../components/gamma/GradientMesh';
import Badge from '../components/gamma/Badge';
import Button from '../components/gamma/Button';
import Card from '../components/gamma/Card';
import SectionHeader from '../components/gamma/SectionHeader';
import BeforeAfterSlider from '../components/gamma/BeforeAfterSlider';
import { STYLE_TEMPLATES } from '../lib/templates';
import { HEADSHOT_PLANS } from '../lib/plans';

export default function HomePageNew() {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient mesh background */}
        <GradientMesh className="z-0" />

        {/* Floating gradient orbs */}
        <FloatingOrb
          color="primary"
          size="600px"
          position="top-left"
          blur="120px"
          opacity={0.4}
          animate
        />
        <FloatingOrb
          color="secondary"
          size="500px"
          position="top-right"
          blur="100px"
          opacity={0.3}
          animate
          delay={2}
        />

        {/* Content */}
        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl py-20">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="gradient"
              size="lg"
              className="mb-6 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </Badge>
          </motion.div>

          {/* Main headline - HUGE like Gamma */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-7xl md:text-8xl font-extrabold mb-6 leading-tight tracking-tight"
          >
            <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Professional Headshots
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              In Minutes, Not Weeks
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Upload your selfies. Get 40-200 studio-quality headshots optimized for LinkedIn,
            resumes, and every platform you need.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link to="/register">
              <Button size="xl" variant="gradient" className="group">
                Create Your Headshots
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/pricing">
              <Button size="xl" variant="outline">
                View Examples
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 text-gray-600"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-cyan-600"
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                Trusted by <strong className="text-gray-900">100,000+</strong> professionals
              </span>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">
                <strong className="text-gray-900">4.9/5</strong> rating
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sample Headshots Showcase */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeader className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Real Results
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              See the{' '}
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                transformation
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From casual selfies to professional headshots in minutes
            </p>
          </SectionHeader>

          {/* Before/After Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BeforeAfterSlider
                key={i}
                beforeImage={`https://via.placeholder.com/400x500/e5e7eb/6b7280?text=Before+${i}`}
                afterImage={`https://via.placeholder.com/400x500/6366f1/ffffff?text=After+${i}`}
                label={i === 1 ? 'LinkedIn Professional' : `Style ${i}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Style Templates Showcase */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <SectionHeader className="text-center mb-20">
            <Badge variant="gradient" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Platform-Optimized
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              One Click.{' '}
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                Eight Platforms.
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Each style template is specifically designed for where you'll use it. See exactly how
              your headshot will look on LinkedIn, your resume, and more.
            </p>
          </SectionHeader>

          {/* Template Cards - Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* LinkedIn Template - Large featured card */}
            <motion.div
              whileHover={{ y: -8 }}
              className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-3xl
                         bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100
                         shadow-xl hover:shadow-2xl hover:shadow-blue-500/20
                         transition-all duration-500"
            >
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Linkedin className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">LinkedIn Professional</h3>
                </div>
                <p className="text-gray-600 mb-4">Business formal, neutral background, direct gaze</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    1:1 Square
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    1024×1024
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Studio Lighting
                  </span>
                </div>

                <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl mb-4" />

                <Badge variant="secondary">Most Popular</Badge>
              </div>
            </motion.div>

            {/* Corporate Template */}
            <Card className="p-6">
              <Building2 className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Corporate Website</h3>
              <p className="text-gray-600 text-sm mb-4">Formal, trustworthy, team consistency</p>
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" />
            </Card>

            {/* Creative Template */}
            <Card className="p-6 bg-gradient-to-br from-cyan-50 to-sky-50">
              <Palette className="w-8 h-8 text-cyan-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Creative Portfolio</h3>
              <p className="text-gray-600 text-sm mb-4">Modern, approachable, personality-forward</p>
              <div className="aspect-[3/4] bg-gradient-to-br from-cyan-100 to-sky-200 rounded-xl" />
            </Card>

            {/* Executive Template - Large featured */}
            <motion.div
              whileHover={{ y: -8 }}
              className="lg:col-span-2 group relative overflow-hidden rounded-3xl
                         bg-gradient-to-br from-gray-900 to-gray-800 text-white
                         shadow-2xl hover:shadow-3xl transition-all duration-500 p-8"
            >
              <Briefcase className="w-10 h-10 mb-4" />
              <h3 className="text-3xl font-bold mb-2">Executive Leadership</h3>
              <p className="text-gray-300 mb-6">Authoritative, premium, high-end</p>
              <div className="aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl" />
            </motion.div>

            {/* Remaining templates */}
            {Object.entries(STYLE_TEMPLATES)
              .slice(4, 8)
              .map(([id, template]) => (
                <Card key={id} className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl" />
                </Card>
              ))}
          </div>

          {/* View all templates CTA */}
          <div className="mt-16 text-center">
            <Link to="/upload">
              <Button size="xl" variant="gradient" className="shadow-xl shadow-blue-500/30">
                Explore All 8 Templates
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeader className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple as{' '}
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                1-2-3
              </span>
            </h2>
            <p className="text-xl text-gray-600">Professional headshots in three easy steps</p>
          </SectionHeader>

          {/* Steps */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 opacity-20 -translate-y-1/2 hidden lg:block" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
              {[
                {
                  number: 1,
                  title: 'Upload Photos',
                  desc: 'Upload 12-20 selfies with different angles, expressions, and lighting',
                  gradient: 'from-blue-500 to-blue-600',
                  items: ['Clear, front-facing photos', 'Good lighting, no sunglasses', 'Mix of expressions & angles'],
                },
                {
                  number: 2,
                  title: 'Choose Templates',
                  desc: 'Select from 8 platform-optimized templates and pick your plan',
                  gradient: 'from-cyan-500 to-cyan-600',
                  items: ['LinkedIn, Corporate, Creative', 'Resume, Social, Executive', '40-200 headshots per plan'],
                },
                {
                  number: 3,
                  title: 'Download & Use',
                  desc: 'Get your headshots in 1-3 hours, optimized for every platform',
                  gradient: 'from-emerald-500 to-emerald-600',
                  items: ['Lightning-fast delivery', 'High-resolution downloads', 'Full commercial rights'],
                },
              ].map((step) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: step.number * 0.1 }}
                >
                  <Card>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.gradient}
                                   text-white font-bold text-xl flex items-center justify-center
                                   shadow-lg`}
                      >
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>

                    <p className="text-gray-600 text-lg leading-relaxed mb-4">{step.desc}</p>

                    <ul className="space-y-2">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600">
                          <Check className="w-5 h-5 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Bento Style */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeader className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything you need.{' '}
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                Nothing you don't.
              </span>
            </h2>
          </SectionHeader>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large feature - Platform Previews */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-500 to-cyan-600
                         text-white rounded-3xl p-12 shadow-2xl overflow-hidden relative group"
            >
              <Badge variant="white" className="mb-6">
                <Eye className="w-4 h-4 mr-2" />
                See Before You Use
              </Badge>
              <h3 className="text-4xl font-bold mb-4">Platform Previews</h3>
              <p className="text-blue-100 text-lg mb-8 max-w-xl">
                See exactly how your headshot will look on LinkedIn, your resume, Instagram, and
                more before you download.
              </p>

              <FloatingOrb
                className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-radial from-white/20 to-transparent blur-3xl"
                animate={false}
              />
            </motion.div>

            {/* Small feature cards */}
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Get your headshots in 1-3 hours, not days', gradient: 'from-amber-400 to-orange-500' },
              { icon: DollarSign, title: 'Save 90%', desc: '$29-59 vs $300+ for traditional photography', gradient: 'from-emerald-400 to-green-500' },
              { icon: Users, title: 'Team Ready', desc: 'Bulk discounts & consistent styling for entire teams', gradient: 'from-blue-400 to-cyan-500' },
              { icon: Shield, title: 'Full Rights', desc: 'Use your headshots anywhere - full commercial license included', gradient: 'from-blue-400 to-cyan-500' },
            ].map((feature, i) => (
              <Card key={i} className="p-8">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient}
                             flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-lg">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <FloatingOrb color="primary" position="top-left" blur="150px" opacity={0.1} animate={false} />
        <FloatingOrb color="accent" position="bottom-right" blur="150px" opacity={0.1} animate={false} />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <SectionHeader className="text-center mb-20">
            <Badge variant="gradient" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Simple, Transparent Pricing
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Choose your{' '}
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                perfect plan
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One-time payment. No subscriptions. Full commercial rights included.
            </p>
          </SectionHeader>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(HEADSHOT_PLANS).map(([key, plan]) => {
              const isFeatured = key === 'professional';
              const displayPrice = Math.floor(plan.price / 100);

              return (
                <motion.div
                  key={key}
                  whileHover={{ y: -8, scale: isFeatured ? 1.05 : 1.02 }}
                  className={`rounded-3xl p-8 transition-all duration-500 ${isFeatured
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-500/50 scale-105'
                      : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl'
                    }`}
                >
                  {isFeatured && (
                    <Badge variant="white" className="absolute top-6 right-6">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  )}

                  <div className="mb-8">
                    <h3
                      className={`text-2xl font-bold mb-2 ${isFeatured ? 'text-white' : 'text-gray-900'}`}
                    >
                      {plan.name}
                    </h3>
                    <p className={`mb-6 ${isFeatured ? 'text-blue-100' : 'text-gray-600'}`}>
                      {key === 'basic' ? 'Perfect for updating your LinkedIn' :
                        key === 'professional' ? 'Best for job seekers & professionals' :
                          'Premium variety for executives'}
                    </p>

                    <div className="flex items-baseline gap-2 mb-6">
                      <span className={`text-5xl font-bold ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                        ${displayPrice}
                      </span>
                      <span className={isFeatured ? 'text-blue-100' : 'text-gray-500'}>one-time</span>
                    </div>

                    <Link to="/register">
                      <Button
                        variant={isFeatured ? 'white' : 'outline'}
                        size="lg"
                        className="w-full"
                      >
                        Get Started
                        {isFeatured && <ArrowRight className="ml-2 w-5 h-5" />}
                      </Button>
                    </Link>
                  </div>

                  <div className={`h-px my-8 ${isFeatured ? 'bg-white/20' : 'bg-gray-200'}`} />

                  <ul className="space-y-3">
                    {plan.features.slice(0, 6).map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <Check className={`w-5 h-5 ${isFeatured ? 'text-white' : 'text-emerald-500'}`} />
                        <span className={isFeatured ? 'text-white' : 'text-gray-600'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Trust badges */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-gray-500">
            {[
              { icon: Shield, text: 'Secure Payment' },
              { icon: CheckCircle, text: 'Money-back Guarantee' },
              { icon: Clock, text: '1-3 Hour Delivery' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Stats */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeader className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                100,000+ professionals
              </span>
            </h2>
          </SectionHeader>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
            {[
              { number: '100K+', label: 'Headshots Generated' },
              { number: '4.9/5', label: 'Average Rating' },
              { number: '2 hrs', label: 'Avg. Turnaround' },
              { number: '90%', label: 'Cost Savings' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Martinez',
                role: 'Marketing Manager',
                text: 'Got 100 amazing headshots for less than the cost of one photographer session!',
              },
              {
                name: 'James Kim',
                role: 'Software Engineer',
                text: 'My LinkedIn profile views increased 3x after updating with my AI headshot.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Real Estate Agent',
                text: 'The platform previews were a game-changer. I knew exactly how they would look.',
              },
            ].map((testimonial, i) => (
              <Card key={i}>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 text-white relative overflow-hidden">
        {/* Animated background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <FloatingOrb
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-radial from-white/20 to-transparent blur-3xl animate-pulse"
          animate={false}
        />
        <FloatingOrb
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-radial from-white/20 to-transparent blur-3xl animate-pulse"
          animate={false}
        />

        <div className="container mx-auto px-6 text-center relative z-10 max-w-4xl">
          <Badge variant="white" className="mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Ready in Minutes
          </Badge>

          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            Get Your Professional
            <br />
            Headshots Today
          </h2>

          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 100,000+ professionals who upgraded their online presence with AI-powered headshots
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button size="xl" variant="white" className="group">
                Start Creating
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/pricing">
              <Button
                size="xl"
                className="bg-transparent text-white border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 hover:border-white"
              >
                View Examples
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100">
            {[
              { icon: CheckCircle, text: 'No credit card required' },
              { icon: Shield, text: '100% secure' },
              { icon: Zap, text: 'Instant access' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
