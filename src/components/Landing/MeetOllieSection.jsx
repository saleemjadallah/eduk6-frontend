import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Brain, Shield, Clock, Heart, Sparkles } from 'lucide-react';
import ChatInterface from '../Chat/ChatInterface';

const MeetOllieSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'Personalized Learning',
      description: 'Adapts to your child\'s grade level and learning style',
      color: '#4169E1',
    },
    {
      icon: MessageCircle,
      title: 'Any Question Answered',
      description: 'From homework help to curious wonderings',
      color: '#32CD32',
    },
    {
      icon: Shield,
      title: 'Safe & Encouraging',
      description: 'Built with child safety as the top priority',
      color: '#FFD700',
    },
    {
      icon: Clock,
      title: 'Available 24/7',
      description: 'Ready to help whenever learning happens',
      color: '#FF69B4',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-nanobanana-yellow/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-nanobanana-blue/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-nanobanana-blue/10 text-nanobanana-blue px-4 py-2 rounded-full font-bold text-sm mb-4">
            <Heart className="w-4 h-4" />
            Your Child's Learning Companion
          </span>
          <h2 className="text-4xl md:text-6xl font-black font-comic mb-4">
            Meet <span className="text-nanobanana-yellow">Ollie!</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            A friendly AI tutor who makes learning feel like an adventure
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Ollie Image and Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Ollie Image */}
            <div className="relative mb-8">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="bg-nanobanana-yellow p-4 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
                  <img
                    src="/assets/images/landing/meet-ollie.png"
                    alt="Ollie the AI Tutor"
                    className="w-full rounded-xl border-4 border-black"
                  />
                </div>
              </motion.div>

              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="font-comic font-bold text-sm">
                  Hi! I'm Ollie! <span className="text-nanobanana-yellow">Ready to learn?</span>
                </p>
              </motion.div>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center mb-2"
                    style={{ backgroundColor: feature.color }}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold font-comic text-sm mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-xs">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-nanobanana-blue p-4 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-white rounded-[1.5rem] border-4 border-black overflow-hidden h-[500px]">
                <ChatInterface demoMode={true} />
              </div>
            </div>

            {/* Floating label */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 bg-nanobanana-green text-white px-4 py-2 rounded-full border-4 border-black font-bold text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Try it out!
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MeetOllieSection;
