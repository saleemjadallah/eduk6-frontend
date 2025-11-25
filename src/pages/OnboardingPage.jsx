import React from 'react';
import { useLocation } from 'react-router-dom';
import { OnboardingFlow } from '../components/Onboarding';

const OnboardingPage = ({ initialStep }) => {
  const location = useLocation();

  // Get initial step from props, location state, or default
  const step = initialStep || location.state?.step || 'signup';

  return <OnboardingFlow initialStep={step} />;
};

export default OnboardingPage;
