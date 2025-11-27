import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Shield, Users, Bell, TrendingUp, Eye } from 'lucide-react';

const ParentDashboardSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Progress',
      description: 'See exactly what your child is learning and how they\'re improving',
    },
    {
      icon: TrendingUp,
      title: 'Learning Analytics',
      description: 'Detailed insights into strengths, areas for growth, and study habits',
    },
    {
      icon: Shield,
      title: 'Content Controls',
      description: 'Full control over what topics and content your child can access',
    },
    {
      icon: Users,
      title: 'Multiple Profiles',
      description: 'Manage learning for all your children from one account',
    },
    {
      icon: Bell,
      title: 'Weekly Reports',
      description: 'Get email summaries of your child\'s learning achievements',
    },
    {
      icon: Eye,
      title: 'Activity Monitoring',
      description: 'Review chat history and learning sessions anytime',
    },
  ];

  return (
    <section id="for-parents" className="py-20 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm mb-4">
            <Shield className="w-4 h-4" />
            For Parents
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
            Stay <span className="text-purple-600">Connected</span> to Learning
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Complete visibility and control over your child's educational journey
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Features list */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
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
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold font-comic text-sm mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Dashboard Preview Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="bg-purple-600 p-4 rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <img
                  src="/assets/images/landing/parent-dashboard.png"
                  alt="Parent Dashboard Preview"
                  className="w-full rounded-xl border-4 border-black"
                />
              </div>
            </motion.div>

            {/* Floating stats cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              animate={{ y: [-3, 3, -3] }}
              className="absolute -top-4 -left-4 bg-white px-4 py-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="text-xs text-gray-500 font-medium">This Week</div>
              <div className="text-xl font-black text-nanobanana-green">+15 Lessons</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              animate={{ y: [3, -3, 3] }}
              className="absolute -bottom-4 -right-4 bg-white px-4 py-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="text-xs text-gray-500 font-medium">Streak</div>
              <div className="text-xl font-black text-nanobanana-yellow">7 Days</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ParentDashboardSection;
