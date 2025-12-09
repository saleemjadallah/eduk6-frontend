import React, { useLayoutEffect, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  HeroSection,
  SocialProofBar,
  MeetJeffreySection,
  HowItWorksSection,
  LearningToolsSection,
  ParentDashboardSection,
  SafetyTrustSection,
  SubjectCoverageSection,
  TestimonialsSection,
  PricingSection,
  FinalCTASection,
  TeacherCTASection,
  LandingFooter,
} from '../components/Landing';

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);

  // Ensure page starts at top when navigating here
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Track scroll for header visibility/style changes
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* iPad-Optimized Floating Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-4 md:top-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
      >
        <div
          className={`
            flex justify-between items-center px-4 md:px-6 py-3 md:py-4
            rounded-2xl md:rounded-[1.25rem]
            transition-all duration-300 ease-out
            border-2 border-black/10
            ${scrolled
              ? 'bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]'
              : 'bg-white/90 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
            }
          `}
        >
          {/* Logo - Compact for iPad */}
          <Link to="/" className="flex items-center">
            <img
              src="/assets/orbit-learn-logo-hires.png"
              alt="OrbitLearn"
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          {/* Right side - Minimal CTAs */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/teacher/login"
              className="hidden sm:inline-flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 font-bold text-gray-500 hover:text-[#2D5A4A] transition-colors rounded-xl hover:bg-[#2D5A4A]/5 text-sm"
            >
              For Teachers
            </Link>
            <Link
              to="/login"
              reloadDocument
              className="inline-flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 font-bold text-gray-700 hover:text-nanobanana-blue transition-colors rounded-xl hover:bg-black/5 text-sm md:text-base"
            >
              Sign In
            </Link>
            <Link
              to="/onboarding"
              reloadDocument
              className="inline-flex items-center justify-center bg-nanobanana-blue text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[1px] active:shadow-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Social Proof Stats */}
        <SocialProofBar />

        {/* Meet Jeffrey - AI Tutor */}
        <MeetJeffreySection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Learning Tools */}
        <LearningToolsSection />

        {/* Parent Dashboard */}
        <ParentDashboardSection />

        {/* Safety & Trust */}
        <SafetyTrustSection />

        {/* Subject Coverage */}
        <SubjectCoverageSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Pricing */}
        <PricingSection />

        {/* Final CTA */}
        <FinalCTASection />

        {/* Teacher Portal CTA */}
        <TeacherCTASection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default HomePage;
