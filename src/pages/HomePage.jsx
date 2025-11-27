import React from 'react';
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
  LandingFooter,
} from '../components/Landing';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-4 border-black">
        <div className="h-20 px-6 flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/assets/orbit-learn-logo-full.png"
              alt="OrbitLearn"
              className="h-14 md:h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="font-bold hover:text-nanobanana-blue transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="font-bold hover:text-nanobanana-blue transition-colors"
            >
              How It Works
            </a>
            <a
              href="#for-parents"
              className="font-bold hover:text-nanobanana-blue transition-colors"
            >
              For Parents
            </a>
            <a
              href="#pricing"
              className="font-bold hover:text-nanobanana-blue transition-colors"
            >
              Pricing
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex font-bold hover:text-nanobanana-blue transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/onboarding"
              className="bg-nanobanana-blue text-white px-5 py-2 rounded-xl font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[1px] active:shadow-none"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

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
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default HomePage;
