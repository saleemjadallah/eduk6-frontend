import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import {
  TeacherLandingNav,
  TeacherHeroSection,
  TeacherMeetJeffreySection,
  TeacherFeaturesSection,
  TeacherHowItWorksSection,
  TeacherPricingSection,
  TeacherTestimonialsSection,
  TeacherFAQSection,
  TeacherFinalCTASection,
  TeacherExitIntentPopup,
} from '../../components/teacher/landing';
import LandingFooter from '../../components/Landing/LandingFooter';

const TeacherLandingPage = () => {
  const { isAuthenticated, isReady } = useTeacherAuth();
  const navigate = useNavigate();

  // Redirect authenticated teachers to dashboard
  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [isAuthenticated, isReady, navigate]);

  // Show loading state while checking auth
  if (!isReady) {
    return (
      <div className="min-h-screen bg-teacher-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teacher-chalk border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-teacher-inkLight font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page for authenticated users (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-teacher-cream overflow-x-hidden">
      {/* Navigation */}
      <TeacherLandingNav />

      {/* Hero Section */}
      <TeacherHeroSection />

      {/* Meet Jeffrey Section */}
      <TeacherMeetJeffreySection />

      {/* Features Section */}
      <TeacherFeaturesSection />

      {/* How It Works Section */}
      <TeacherHowItWorksSection />

      {/* Pricing Section */}
      <TeacherPricingSection />

      {/* Testimonials Section */}
      <TeacherTestimonialsSection />

      {/* FAQ Section */}
      <TeacherFAQSection />

      {/* Final CTA Section */}
      <TeacherFinalCTASection />

      {/* Footer */}
      <LandingFooter />

      {/* Exit Intent Popup - Teacher Toolkit Lead Capture */}
      <TeacherExitIntentPopup />
    </div>
  );
};

export default TeacherLandingPage;
