import React from 'react';
import { motion } from 'framer-motion';

const SocialProofBar = () => {
  const valueProps = [
    {
      image: '/assets/images/landing/value-props/ai-tutor.jpg',
      title: 'No More Homework Struggles',
      description: 'AI tutor available 24/7',
      bgColor: '#4169E1',
    },
    {
      image: '/assets/images/landing/value-props/save-time.jpg',
      title: 'Save Hours Weekly',
      description: 'Instant quizzes, flashcards & study guides',
      bgColor: '#32CD32',
    },
    {
      image: '/assets/images/landing/value-props/parent-tracking.jpg',
      title: 'Parents Stay in the Loop',
      description: 'Track progress without hovering',
      bgColor: '#FFD700',
    },
  ];

  return (
    <section className="py-10 bg-gradient-to-r from-gray-50 to-gray-100 border-y-4 border-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
              >
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div>
                <h3 className="text-lg md:text-xl font-black font-comic text-gray-900 leading-tight">
                  {prop.title}
                </h3>
                <p className="text-gray-600 font-medium text-sm md:text-base">
                  {prop.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
