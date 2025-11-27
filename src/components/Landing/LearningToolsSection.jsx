import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ClipboardCheck, BookOpen, Image, Sparkles } from 'lucide-react';
import AIGeneratedImage from './AIGeneratedImage';

const LearningToolsSection = () => {
  const tools = [
    {
      icon: Layers,
      title: 'Smart Flashcards',
      description: 'AI automatically creates flashcards from any lesson. Study smarter, not harder!',
      color: '#4169E1',
      shadowColor: 'rgba(65,105,225,1)',
      imagePrompt: 'Colorful stack of digital flashcards floating in space with sparkles, educational icons, bright cheerful cartoon style, kid-friendly design',
    },
    {
      icon: ClipboardCheck,
      title: 'Interactive Quizzes',
      description: 'Test knowledge with adaptive quizzes that adjust to your child\'s level.',
      color: '#32CD32',
      shadowColor: 'rgba(50,205,50,1)',
      imagePrompt: 'Fun quiz game interface with checkmarks and stars, happy cartoon characters celebrating correct answers, bright educational game style',
    },
    {
      icon: BookOpen,
      title: 'Study Guides',
      description: 'Get organized summaries with key points highlighted for easy review.',
      color: '#FFD700',
      shadowColor: 'rgba(255,215,0,1)',
      imagePrompt: 'Open colorful study guide book with highlighted text and sticky notes, magical glowing pages, cartoon educational style',
    },
    {
      icon: Image,
      title: 'Visual Infographics',
      description: 'Complex topics become clear with AI-generated visual explanations.',
      color: '#FF69B4',
      shadowColor: 'rgba(255,105,180,1)',
      imagePrompt: 'Beautiful colorful infographic poster with icons and diagrams explaining science concepts, kid-friendly educational design, bright colors',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-nanobanana-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-nanobanana-green/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-nanobanana-green/10 text-nanobanana-green px-4 py-2 rounded-full font-bold text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Powerful Learning Tools
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
            Magic <span className="text-nanobanana-green">Learning</span> Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Everything your child needs to master any subject, all in one place
          </p>
        </motion.div>

        {/* Tools grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <div
                className="bg-white p-6 rounded-3xl border-4 border-black transition-shadow duration-300"
                style={{
                  boxShadow: `8px 8px 0px 0px ${tool.shadowColor}`,
                }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  <div className="lg:w-2/5 flex-shrink-0">
                    <div
                      className="rounded-2xl border-4 border-black overflow-hidden"
                      style={{ backgroundColor: `${tool.color}10` }}
                    >
                      <AIGeneratedImage
                        prompt={tool.imagePrompt}
                        style="cartoon"
                        alt={tool.title}
                        aspectRatio="square"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div
                      className="w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: tool.color }}
                    >
                      <tool.icon className={`w-7 h-7 ${tool.color === '#FFD700' ? 'text-black' : 'text-white'}`} />
                    </div>
                    <h3 className="text-2xl font-bold font-comic mb-2">{tool.title}</h3>
                    <p className="text-gray-600 font-medium">{tool.description}</p>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full border-2 border-black bg-gray-50">
                        AI-Powered
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full border-2 border-black bg-gray-50">
                        Instant
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningToolsSection;
