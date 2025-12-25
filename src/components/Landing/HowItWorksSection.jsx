import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Wand2, MessageCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      icon: Upload,
      title: 'Upload Any Lesson',
      description: 'Snap a photo or upload a PDF. We handle it all!',
      color: '#FF69B4',
      image: '/assets/images/landing/how-it-works-upload.png',
    },
    {
      number: 2,
      icon: Wand2,
      title: 'AI Magic Happens',
      description: 'Our AI instantly analyzes and structures the content for optimal learning.',
      color: '#4169E1',
      image: '/assets/images/landing/how-it-works-ai-magic.png',
    },
    {
      number: 3,
      icon: MessageCircle,
      title: 'Learn with Ollie',
      description: 'Chat, ask questions, create flashcards, and master the material!',
      color: '#32CD32',
      image: '/assets/images/landing/how-it-works-learn.png',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-yellow-50 relative">
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
            className="fill-blue-50"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
            How It <span className="text-nanobanana-blue">Works</span>
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            Getting started is as easy as 1, 2, 3!
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-black/10 -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -8, rotate: index % 2 === 0 ? -2 : 2 }}
                  className="bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  {/* Step number badge */}
                  <div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center text-white font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>

                  {/* Static illustration */}
                  <div className="mt-6 mb-4">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full rounded-xl border-4 border-black aspect-video object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <div
                      className="w-12 h-12 mx-auto rounded-xl border-2 border-black flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>
                    <h3 className="text-xl font-bold font-comic mb-2">{step.title}</h3>
                    <p className="text-gray-600 font-medium text-sm">{step.description}</p>
                  </div>
                </motion.div>

                {/* Arrow connector (mobile hidden) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-8 h-8 bg-nanobanana-yellow rounded-full border-2 border-black flex items-center justify-center"
                    >
                      <span className="text-black font-bold">&rarr;</span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-[50px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
};

export default HowItWorksSection;
