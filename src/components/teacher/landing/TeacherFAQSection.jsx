import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const TeacherFAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What types of content can I create?',
      answer: 'You can create four types of educational content: complete lesson plans with objectives, activities, and assessments; quizzes with multiple choice, short answer, and open-ended questions (plus auto-generated answer keys); flashcard decks for vocabulary and concept review; and visual infographics that transform complex topics into engaging diagrams and illustrations.',
    },
    {
      question: 'How many lessons can I create with the free tier?',
      answer: 'With 100,000 tokens per month on the free tier, you can typically create 20-50 complete lessons, depending on complexity and length. Shorter content like flashcard decks and quizzes use fewer tokens, so you could create more of those. Your token usage resets at the start of each billing cycle.',
    },
    {
      question: 'Can I export and print my content?',
      answer: 'Yes! All plans include unlimited exports. You can download your content as PDF or DOCX files, which are print-ready with professional formatting. Content includes no watermarks on any plan, so your materials look like you created them yourself.',
    },
    {
      question: 'Is the content aligned to educational standards?',
      answer: 'Ollie creates content aligned to Common Core State Standards and can adapt to state-specific standards. When you specify a grade level and subject, the AI automatically incorporates appropriate learning objectives and assessment criteria. You can also customize standards alignment in your generated content.',
    },
    {
      question: 'When will the Grading Center be available?',
      answer: 'The Grading Center is currently in private beta with select educators. Professional tier subscribers get early access to beta features. We expect a public release in early 2025. Join the waitlist by signing up for any plan, and we\'ll notify you when it launches.',
    },
    {
      question: 'Can I use this for my whole school or district?',
      answer: 'Absolutely! We offer organization-level plans with shared token pools, admin dashboards, and usage analytics across your team. School and district pricing includes volume discounts and dedicated support. Contact us at schools@orbitlearn.com for custom pricing.',
    },
    {
      question: 'How does the AI ensure content quality?',
      answer: 'Ollie is trained specifically for educational content creation and includes built-in quality checks. Content is reviewed for grade-level appropriateness, factual accuracy (using verified educational sources), and pedagogical best practices. You always have full control to edit and customize the generated content before using it.',
    },
    {
      question: 'What if I need to cancel my subscription?',
      answer: 'You can cancel anytime from your account settings with no cancellation fees. Your access continues until the end of your current billing period. All content you\'ve created remains accessible and exportable even after cancellation. We also offer a 30-day money-back guarantee on paid plans.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-teacher-paper via-teacher-cream to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-[5%] w-64 h-64 bg-teacher-chalk/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-[5%] w-72 h-72 bg-teacher-terracotta/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-teacher-chalk/10 text-teacher-chalk px-4 py-2 rounded-full font-bold text-sm border border-teacher-chalk/20 mb-6">
            <HelpCircle className="w-4 h-4" />
            Got Questions?
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display mb-4">
            <span className="text-teacher-ink">Frequently Asked </span>
            <span className="text-teacher-chalk">Questions</span>
          </h2>

          <p className="text-base md:text-lg text-teacher-inkLight max-w-xl mx-auto">
            Everything you need to know about Orbit Learn for teachers.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl md:rounded-2xl border-3 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left hover:bg-teacher-cream/50 transition-colors"
              >
                <span className="font-bold text-sm md:text-base text-teacher-ink pr-3 md:pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-teacher-chalk/10 rounded-full flex items-center justify-center"
                >
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-teacher-chalk" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0">
                      <div className="h-px bg-teacher-ink/10 mb-3 md:mb-4" />
                      <p className="text-sm md:text-base text-teacher-inkLight leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-teacher-chalk/5 rounded-2xl px-8 py-6 border-2 border-teacher-chalk/10">
            <div className="w-12 h-12 bg-teacher-chalk rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-teacher-ink mb-1">Still have questions?</p>
              <p className="text-sm text-teacher-inkLight">
                Email us at{' '}
                <a
                  href="mailto:support@orbitlearn.com"
                  className="text-teacher-chalk font-bold hover:underline"
                >
                  support@orbitlearn.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeacherFAQSection;
