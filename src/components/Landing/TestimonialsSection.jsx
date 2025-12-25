import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: "My daughter used to dread homework time. Now she can't wait to chat with Ollie! Her math grades have improved so much.",
      author: 'Sarah M.',
      role: 'Parent of Emma, 3rd Grade',
      rating: 5,
      color: '#4169E1',
    },
    {
      quote: "Finally, an educational app that's actually safe for kids. I love being able to see exactly what my son is learning.",
      author: 'Michael T.',
      role: 'Parent of Jake, 1st Grade',
      rating: 5,
      color: '#32CD32',
    },
    {
      quote: "The flashcard feature is amazing! It saves me so much time and my kids actually enjoy studying with them.",
      author: 'Jennifer L.',
      role: 'Parent of twins, 5th Grade',
      rating: 5,
      color: '#FFD700',
    },
    {
      quote: "Ollie explains things in a way that just clicks with my son. He went from struggling to confident in reading!",
      author: 'David R.',
      role: 'Parent of Liam, 2nd Grade',
      rating: 5,
      color: '#FF69B4',
    },
    {
      quote: "Worth every penny. The progress reports help me understand exactly where my daughter needs extra support.",
      author: 'Amanda K.',
      role: 'Parent of Sofia, 4th Grade',
      rating: 5,
      color: '#9B59B6',
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nanobanana-yellow/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
            Families <span className="text-nanobanana-yellow">Love</span> Orbit Learn
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Join thousands of happy families on their learning journey
          </p>
        </motion.div>

        {/* Testimonials carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-12 h-12 bg-white rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-12 h-12 bg-white rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Testimonial card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 md:p-12 rounded-3xl border-4 border-black relative"
              style={{
                boxShadow: `8px 8px 0px 0px ${testimonials[currentIndex].color}`,
              }}
            >
              {/* Quote icon */}
              <div
                className="absolute -top-6 left-8 w-12 h-12 rounded-2xl border-4 border-black flex items-center justify-center"
                style={{ backgroundColor: testimonials[currentIndex].color }}
              >
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-nanobanana-yellow fill-current"
                  />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-xl md:text-2xl font-medium text-gray-800 mb-8 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full border-4 border-black flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: testimonials[currentIndex].color }}
                >
                  {testimonials[currentIndex].author.charAt(0)}
                </div>
                <div>
                  <div className="font-bold font-comic text-lg">
                    {testimonials[currentIndex].author}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full border-2 border-black transition-all ${
                  index === currentIndex
                    ? 'bg-nanobanana-yellow w-8'
                    : 'bg-white hover:bg-gray-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
