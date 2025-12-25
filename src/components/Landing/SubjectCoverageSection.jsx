import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, FlaskConical, BookOpen, Pencil, Globe, Palette, Music, Dumbbell } from 'lucide-react';

const SubjectCoverageSection = () => {
  const subjects = [
    {
      icon: Calculator,
      name: 'Math',
      color: '#4169E1',
      description: 'Numbers, shapes, and problem-solving',
    },
    {
      icon: FlaskConical,
      name: 'Science',
      color: '#32CD32',
      description: 'Explore the world around us',
    },
    {
      icon: BookOpen,
      name: 'Reading',
      color: '#FF69B4',
      description: 'Stories, comprehension, and vocabulary',
    },
    {
      icon: Pencil,
      name: 'Writing',
      color: '#FFD700',
      description: 'Express ideas clearly and creatively',
    },
    {
      icon: Globe,
      name: 'Social Studies',
      color: '#9B59B6',
      description: 'History, geography, and culture',
    },
    {
      icon: Palette,
      name: 'Art',
      color: '#E74C3C',
      description: 'Creativity and visual expression',
    },
    {
      icon: Music,
      name: 'Music',
      color: '#3498DB',
      description: 'Rhythm, melody, and instruments',
    },
    {
      icon: Dumbbell,
      name: 'Health',
      color: '#1ABC9C',
      description: 'Wellness and healthy habits',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-nanobanana-yellow/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-nanobanana-blue/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
            Every <span className="text-nanobanana-blue">Subject</span> Covered
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Works with any K-8 curriculum and learning material
          </p>
        </motion.div>

        {/* Subject grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, rotate: index % 2 === 0 ? 2 : -2 }}
              className="group"
            >
              <div
                className="bg-white p-4 md:p-6 rounded-3xl border-4 border-black text-center transition-all duration-300"
                style={{
                  boxShadow: `6px 6px 0px 0px ${subject.color}`,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl border-4 border-black flex items-center justify-center mb-3 md:mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: subject.color }}
                >
                  <subject.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </motion.div>
                <h3 className="font-bold font-comic text-lg md:text-xl mb-1">{subject.name}</h3>
                <p className="text-gray-600 text-xs md:text-sm hidden md:block">{subject.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-3 bg-nanobanana-yellow/20 px-6 py-3 rounded-full border-2 border-nanobanana-yellow">
            <span className="text-2xl">+</span>
            <span className="font-bold text-gray-700">
              Upload any topic and Ollie will help!
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubjectCoverageSection;
