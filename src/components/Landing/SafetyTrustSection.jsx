import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Ban, Heart, CheckCircle } from 'lucide-react';
import AIGeneratedImage from './AIGeneratedImage';

const SafetyTrustSection = () => {
  const safetyFeatures = [
    {
      icon: Shield,
      title: 'COPPA Compliant',
      description: 'We follow all children\'s online privacy protection regulations',
    },
    {
      icon: Lock,
      title: 'Content Filtering',
      description: 'AI-powered safety filters ensure age-appropriate responses',
    },
    {
      icon: Eye,
      title: 'Parent Oversight',
      description: 'Full visibility into all conversations and learning activities',
    },
    {
      icon: Ban,
      title: 'No Ads, Ever',
      description: 'Your child\'s attention is for learning, not advertising',
    },
  ];

  const trustBadges = [
    'SOC 2 Compliant',
    'FERPA Ready',
    'Data Encryption',
    'No Data Selling',
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white relative overflow-hidden">
      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          className="relative block w-full h-[50px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-purple-50"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-4">
            <Heart className="w-4 h-4" />
            Built for Families
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
            Safety <span className="text-nanobanana-green">First</span>, Always
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Your child's safety and privacy are our top priorities
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - AI Generated Safety Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="bg-nanobanana-green p-4 rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <AIGeneratedImage
                  prompt="Protective glowing shield around a happy diverse family using tablets and laptops together, safe digital learning environment, warm cozy home setting, bright cheerful cartoon style, feeling of security and trust"
                  style="cartoon"
                  alt="Safe Family Learning"
                  aspectRatio="landscape"
                  className="w-full rounded-xl"
                />
              </div>
            </motion.div>

            {/* Shield badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="w-16 h-16 bg-nanobanana-green rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Safety Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="space-y-4 mb-8">
              {safetyFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(50,205,50,1)]"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold font-comic mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border-2 border-black"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold">{badge}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SafetyTrustSection;
