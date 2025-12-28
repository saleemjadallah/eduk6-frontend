import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const TeacherTestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: "This has completely changed how I prepare for class. What used to take me 2-3 hours on Sunday nights now takes 15 minutes. My students love the quizzes and flashcards!",
      name: 'Sarah Mitchell',
      role: '5th Grade Teacher',
      school: 'Lincoln Elementary, Austin TX',
      avatar: 'SM',
      avatarBg: '#2D5A4A',
      rating: 5,
    },
    {
      quote: "The quiz generator is a game-changer for formative assessment. I can create targeted quizzes for every unit in minutes. The auto-generated answer keys save me hours every week.",
      name: 'Michael Rodriguez',
      role: 'Middle School Science',
      school: 'Jefferson Middle School, Denver CO',
      avatar: 'MR',
      avatarBg: '#D4A853',
      rating: 5,
    },
    {
      quote: "I was skeptical about AI tools, but Ollie feels like having a teaching assistant. The lessons are actually good—aligned to standards and engaging. My prep time dropped by 70%.",
      name: 'Jennifer Lee',
      role: 'Special Education Teacher',
      school: 'Oak Park Academy, Chicago IL',
      avatar: 'JL',
      avatarBg: '#C75B39',
      rating: 5,
    },
    {
      quote: "My students are more engaged than ever with the infographics and visual materials. I used to spend hours making them in Canva. Now Ollie does it in 30 seconds.",
      name: 'David Kim',
      role: 'High School History',
      school: 'Central High School, Seattle WA',
      avatar: 'DK',
      avatarBg: '#7BAE7F',
      rating: 5,
    },
    {
      quote: "As a first-year teacher, this has been a lifesaver. I can create professional-quality materials that veteran teachers are impressed by. It's leveled the playing field.",
      name: 'Amanda Torres',
      role: '3rd Grade Teacher',
      school: 'Riverside Elementary, Miami FL',
      avatar: 'AT',
      avatarBg: '#7B5EA7',
      rating: 5,
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-teacher-paper relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teacher-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teacher-chalk/10 rounded-full blur-3xl" />

      {/* Decorative quote marks */}
      <div className="absolute top-20 left-[10%] opacity-5">
        <Quote className="w-32 h-32 text-teacher-ink" />
      </div>
      <div className="absolute bottom-20 right-[10%] opacity-5 rotate-180">
        <Quote className="w-32 h-32 text-teacher-ink" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-teacher-sage/15 text-teacher-sage px-4 py-2 rounded-full font-bold text-sm border border-teacher-sage/25 mb-6">
            <Star className="w-4 h-4 fill-current" />
            Loved by Teachers
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display mb-4">
            <span className="text-teacher-ink">Teachers </span>
            <span className="text-teacher-chalk">Love</span>
            <span className="text-teacher-ink"> Orbit Learn</span>
          </h2>

          <p className="text-lg md:text-xl text-teacher-inkLight max-w-xl mx-auto">
            Join thousands of educators who've transformed their teaching workflow.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-10 w-12 h-12 bg-white rounded-full border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-calc(50%+2px)] active:translate-y-[-calc(50%-2px)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-teacher-ink" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-10 w-12 h-12 bg-white rounded-full border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-calc(50%+2px)] active:translate-y-[-calc(50%-2px)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-teacher-ink" />
          </button>

          {/* Testimonial Card */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12"
              >
                {/* Rating Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-6 h-6 text-teacher-gold fill-teacher-gold"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-teacher-ink text-center font-medium leading-relaxed mb-8 max-w-3xl mx-auto">
                  "{testimonials[currentIndex].quote}"
                </blockquote>

                {/* Author */}
                <div className="flex flex-col items-center">
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center text-white font-bold text-xl mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: testimonials[currentIndex].avatarBg }}
                  >
                    {testimonials[currentIndex].avatar}
                  </div>

                  {/* Name & Role */}
                  <h4 className="font-bold text-lg text-teacher-ink">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-teacher-inkLight">{testimonials[currentIndex].role}</p>
                  <p className="text-sm text-teacher-inkLight/70">
                    {testimonials[currentIndex].school}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full border-2 border-black transition-all ${
                  index === currentIndex
                    ? 'bg-teacher-chalk w-8'
                    : 'bg-white hover:bg-teacher-chalk/20'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TeacherTestimonialsSection;
