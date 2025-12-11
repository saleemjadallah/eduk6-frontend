import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Layers, Image, Target, ArrowRight, Clock, Sparkles } from 'lucide-react';
import AIGeneratedImage from '../../Landing/AIGeneratedImage';

const TeacherFeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'AI Lesson Creator',
      description: 'Generate complete, standards-aligned lesson plans in minutes. Include objectives, activities, assessments, and differentiation strategies.',
      color: '#2D5A4A', // chalk
      shadowColor: 'rgba(45,90,74,0.4)',
      tags: ['AI-Powered', 'Customizable', 'Standards-Aligned'],
      imagePrompt: 'A beautifully designed digital lesson plan document displayed on a modern tablet. The document has colorful section headers in green and gold, organized bullet points, learning objectives with checkmarks, and small educational illustrations. Clean, professional design with warm paper-like background texture.',
      status: 'active',
    },
    {
      icon: ClipboardCheck,
      title: 'Quiz Generator',
      description: 'Create engaging assessments with multiple choice, short answer, and open-ended questions. Auto-generate answer keys and rubrics.',
      color: '#7BAE7F', // sage
      shadowColor: 'rgba(123,174,127,0.4)',
      tags: ['Auto-Grading', 'Multiple Formats', 'Answer Keys'],
      imagePrompt: 'A colorful interactive quiz interface on a tablet screen showing multiple choice questions with labeled options A, B, C, D. Some questions have green checkmarks indicating correct answers. Modern, clean design with sage green accents. Friendly educational aesthetic.',
      status: 'active',
    },
    {
      icon: Layers,
      title: 'Flashcard Maker',
      description: 'Build study decks automatically from any content. Support for images, definitions, and spaced repetition learning.',
      color: '#D4A853', // gold
      shadowColor: 'rgba(212,168,83,0.4)',
      tags: ['Study Decks', 'Spaced Repetition', 'Export Ready'],
      imagePrompt: 'A fan of colorful educational flashcards spread out on a wooden desk surface. Each card has a different warm color (gold, orange, cream) with vocabulary words and definitions visible. Some cards show simple illustrations. Cozy, organized study aesthetic.',
      status: 'active',
    },
    {
      icon: Image,
      title: 'Infographic Generation',
      description: 'Transform complex topics into visual learning materials. Create diagrams, flowcharts, and illustrated concepts students love.',
      color: '#C75B39', // terracotta
      shadowColor: 'rgba(199,91,57,0.4)',
      tags: ['Visual Learning', 'Diagrams', 'Print Ready'],
      imagePrompt: 'A beautiful educational infographic about the water cycle displayed on a screen. Features colorful illustrated clouds, rain, rivers, and arrows showing the cycle flow. Labels and explanations in clean typography. Professional yet engaging for students. Terracotta and blue color scheme.',
      status: 'active',
    },
  ];

  const comingSoon = {
    icon: Target,
    title: 'Grading Center',
    description: 'AI-powered paper grading with rubric-based feedback. Upload student work, get detailed assessments, and generate personalized feedback in seconds.',
    color: '#7B5EA7', // plum
    shadowColor: 'rgba(123,94,167,0.4)',
    tags: ['Rubric-Based', 'Batch Grading', 'Feedback Generation'],
    status: 'coming_soon',
  };

  return (
    <section id="features" className="py-24 bg-teacher-paper relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(45,90,74,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(45,90,74,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-teacher-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-teacher-chalk/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-teacher-chalk/10 text-teacher-chalk px-4 py-2 rounded-full font-bold text-sm border border-teacher-chalk/20 mb-6">
            <Sparkles className="w-4 h-4" />
            Powerful Teaching Tools
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display mb-4">
            <span className="text-teacher-ink">Everything You Need to</span>
            <br className="hidden sm:block" />
            <span className="text-teacher-chalk"> Teach Smarter</span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-teacher-inkLight max-w-2xl mx-auto">
            Five AI-powered tools to transform hours of prep work into minutes.
          </p>
        </motion.div>

        {/* Features Grid - 2x2 */}
        <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-2xl md:rounded-3xl border-3 md:border-4 border-black overflow-hidden transition-all duration-300"
              style={{ boxShadow: `6px 6px 0px 0px ${feature.shadowColor}` }}
            >
              {/* Image Section */}
              <div className="relative h-36 md:h-48 overflow-hidden border-b-3 md:border-b-4 border-black">
                <AIGeneratedImage
                  prompt={feature.imagePrompt}
                  style="educational"
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  aspectRatio="landscape"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Icon badge */}
                <div
                  className="absolute top-3 left-3 md:top-4 md:left-4 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 md:border-3 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-black font-display text-teacher-ink mb-1.5 md:mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-teacher-inkLight mb-3 md:mb-4 leading-relaxed line-clamp-3">
                  {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border-2 border-black"
                      style={{
                        backgroundColor: `${feature.color}15`,
                        color: feature.color,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl md:rounded-3xl border-3 md:border-4 border-black overflow-hidden relative"
          style={{ boxShadow: `6px 6px 0px 0px ${comingSoon.shadowColor}` }}
        >
          {/* Coming Soon Banner */}
          <div className="absolute top-0 right-0 bg-teacher-plum text-white px-4 md:px-6 py-1.5 md:py-2 rounded-bl-xl md:rounded-bl-2xl border-l-3 md:border-l-4 border-b-3 md:border-b-4 border-black font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            Coming Soon
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-5 md:p-8">
            {/* Left - Content */}
            <div className="flex flex-col justify-center">
              <div
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-3 md:border-4 border-black flex items-center justify-center mb-4 md:mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ backgroundColor: comingSoon.color }}
              >
                <comingSoon.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className="text-xl md:text-2xl lg:text-3xl font-black font-display text-teacher-ink mb-3 md:mb-4">
                {comingSoon.title}
              </h3>

              <p className="text-sm md:text-base lg:text-lg text-teacher-inkLight mb-4 md:mb-6 leading-relaxed">
                {comingSoon.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                {comingSoon.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border-2 border-black"
                    style={{
                      backgroundColor: `${comingSoon.color}15`,
                      color: comingSoon.color,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Waitlist CTA */}
              <Link
                to="/teacher/signup"
                className="inline-flex items-center gap-2 text-sm md:text-base text-teacher-plum font-bold hover:gap-3 transition-all group"
              >
                Join the waitlist for early access
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right - Placeholder Visual */}
            <div className="relative hidden md:block">
              <div className="bg-gradient-to-br from-teacher-plum/10 via-teacher-plum/5 to-transparent rounded-xl md:rounded-2xl border-2 border-teacher-plum/20 p-6 md:p-8 h-full min-h-[200px] md:min-h-[250px] flex flex-col items-center justify-center">
                {/* Decorative mockup */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      className="w-12 h-9 md:w-16 md:h-12 rounded-lg bg-teacher-plum/20 border border-teacher-plum/30"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-teacher-plum font-bold text-sm md:text-base mb-1 md:mb-2">Batch Grading Preview</p>
                  <p className="text-xs md:text-sm text-teacher-inkLight">
                    Grade 30 papers in under 5 minutes
                  </p>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-5, 5, -5], rotate: [-3, 3, -3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-3 right-3 md:top-4 md:right-4 bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] md:text-xs font-bold text-teacher-sage"
                >
                  A+ 98%
                </motion.div>

                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] md:text-xs font-bold text-teacher-gold"
                >
                  B+ 87%
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeacherFeaturesSection;
