import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Sparkles, Share2, ArrowRight, CheckCircle } from 'lucide-react';

const TeacherHowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: PenTool,
      title: 'Choose Your Topic',
      description: 'Select subject, grade level, and content type. Tell Jeffrey what you need—be as specific or general as you like.',
      color: '#2D5A4A', // chalk
      details: [
        'Pick from any subject area',
        'Set appropriate grade level',
        'Choose content format',
      ],
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI Creates Content',
      description: 'Jeffrey instantly generates professional, standards-aligned content tailored to your specifications.',
      color: '#D4A853', // gold
      details: [
        'Generated in seconds',
        'Aligned to standards',
        'Fully customizable output',
      ],
    },
    {
      number: '03',
      icon: Share2,
      title: 'Use & Share',
      description: 'Review, customize if needed, then download, print, or share directly with your students.',
      color: '#7BAE7F', // sage
      details: [
        'Export to PDF or DOCX',
        'Print-ready formatting',
        'Share with one click',
      ],
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-teacher-paper via-teacher-cream to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,168,83,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,168,83,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-32 left-[5%] w-16 h-16 bg-teacher-gold/20 rounded-2xl border-2 border-teacher-gold/30 hidden lg:block"
      />
      <motion.div
        animate={{ y: [8, -8, 8] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-40 right-[8%] w-12 h-12 bg-teacher-chalk/15 rounded-full border-2 border-teacher-chalk/25 hidden lg:block"
      />

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 bg-teacher-terracotta/10 text-teacher-terracotta px-4 py-2 rounded-full font-bold text-sm border border-teacher-terracotta/20 mb-6">
            <Sparkles className="w-4 h-4" />
            Simple 3-Step Process
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display mb-4">
            <span className="text-teacher-ink">How It </span>
            <span className="text-teacher-chalk">Works</span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-teacher-inkLight max-w-xl mx-auto">
            From idea to classroom-ready content in under 2 minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-24 left-[16.5%] right-[16.5%] h-1 bg-gradient-to-r from-teacher-chalk via-teacher-gold to-teacher-sage rounded-full" />

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-white rounded-2xl md:rounded-3xl border-3 md:border-4 border-black p-5 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-all duration-300 h-full">
                  {/* Number Badge */}
                  <div
                    className="absolute -top-4 md:-top-5 left-6 md:left-8 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-3 md:border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="text-white font-black text-sm md:text-lg">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="mt-4 md:mt-6 mb-4 md:mb-6">
                    <div
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 md:border-3 border-black flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg md:text-xl font-black font-display text-teacher-ink mb-2 md:mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm md:text-base text-teacher-inkLight mb-4 md:mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details list */}
                  <ul className="space-y-1.5 md:space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-1.5 md:gap-2">
                        <CheckCircle
                          className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0"
                          style={{ color: step.color }}
                        />
                        <span className="text-xs md:text-sm text-teacher-ink font-medium">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow connector - mobile only (between cards) */}
                {index < steps.length - 1 && (
                  <div className="sm:hidden flex justify-center my-4">
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6 text-teacher-chalk rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 md:mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-teacher-chalk/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 border-2 border-teacher-chalk/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-teacher-sage animate-pulse" />
              <span className="font-bold text-teacher-ink text-sm md:text-base">Average time:</span>
            </div>
            <span className="text-xl md:text-2xl font-black text-teacher-chalk">47 seconds</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeacherHowItWorksSection;
