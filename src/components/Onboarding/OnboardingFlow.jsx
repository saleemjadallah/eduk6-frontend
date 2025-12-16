import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SignUpStep from './SignUpStep';
import EmailVerificationStep from './EmailVerificationStep';
import ConsentMethodStep from './ConsentMethodStep';
import CreditCardVerificationStep from './CreditCardVerificationStep';
import KBQVerificationStep from './KBQVerificationStep';
import CreateProfileStep from './CreateProfileStep';
import WelcomeStep from './WelcomeStep';
import { ExitIntentPopup } from '../Landing';
import './OnboardingFlow.css';

const STEPS = {
  SIGNUP: 'signup',
  SIGNIN: 'signin',
  EMAIL_VERIFICATION: 'email_verification',
  CONSENT_METHOD: 'consent_method',
  CREDIT_CARD: 'credit_card',
  KBQ: 'kbq',
  CREATE_PROFILE: 'create_profile',
  WELCOME: 'welcome',
};

const OnboardingFlow = ({ initialStep = STEPS.SIGNUP }) => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    hasConsent,
    children,
    needsEmailVerification,
    needsConsent,
    needsChildProfile,
  } = useAuth();

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [consentMethod, setConsentMethod] = useState(null);
  const [consentId, setConsentId] = useState(null);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);

  // Determine initial step based on user state
  // This only sets the step on initial load or when auth state changes significantly
  useEffect(() => {
    // Allow email verification step even when not authenticated
    // (user just signed up but hasn't verified email yet)
    if (currentStep === STEPS.EMAIL_VERIFICATION && pendingVerificationEmail) {
      return; // Stay on email verification
    }

    // Allow consent verification sub-steps (KBQ or Credit Card)
    if (currentStep === STEPS.KBQ || currentStep === STEPS.CREDIT_CARD) {
      return; // Stay on consent verification sub-step
    }

    if (!isAuthenticated) {
      if (currentStep !== STEPS.SIGNUP && currentStep !== STEPS.SIGNIN && currentStep !== STEPS.EMAIL_VERIFICATION) {
        setCurrentStep(STEPS.SIGNUP);
      }
      return;
    }

    if (needsEmailVerification) {
      setCurrentStep(STEPS.EMAIL_VERIFICATION);
      return;
    }

    // Only redirect to consent method if we're not already in consent flow
    if (needsConsent && currentStep !== STEPS.CONSENT_METHOD && currentStep !== STEPS.KBQ && currentStep !== STEPS.CREDIT_CARD) {
      setCurrentStep(STEPS.CONSENT_METHOD);
      return;
    }

    if (needsChildProfile && currentStep !== STEPS.CREATE_PROFILE) {
      setCurrentStep(STEPS.CREATE_PROFILE);
      return;
    }

    // All steps complete - show welcome or redirect
    if (hasConsent && children.length > 0) {
      if (currentStep === STEPS.CREATE_PROFILE) {
        setCurrentStep(STEPS.WELCOME);
      } else if (currentStep === STEPS.WELCOME) {
        // Stay on welcome
      } else if (currentStep !== STEPS.CONSENT_METHOD && currentStep !== STEPS.KBQ && currentStep !== STEPS.CREDIT_CARD && currentStep !== STEPS.CREATE_PROFILE) {
        // User is fully set up, redirect to learning dashboard
        navigate('/learn');
      }
    }
  }, [
    isAuthenticated,
    needsEmailVerification,
    needsConsent,
    needsChildProfile,
    hasConsent,
    children.length,
    navigate,
    currentStep,
    pendingVerificationEmail,
  ]);

  const goToStep = (step) => {
    const stepOrder = Object.values(STEPS);
    const currentIndex = stepOrder.indexOf(currentStep);
    const newIndex = stepOrder.indexOf(step);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentStep(step);
  };

  const handleSignUpComplete = (result) => {
    // Handle Google Sign-In (result is an object with isGoogleAuth flag)
    if (result && typeof result === 'object' && result.isGoogleAuth) {
      // Google users have verified email - skip email verification
      // For new Google users, go to consent; for existing users, useEffect handles redirect
      if (result.isNewUser) {
        // New Google user - go directly to consent (email already verified by Google)
        goToStep(STEPS.CONSENT_METHOD);
      }
      // For returning Google users, the useEffect will handle based on their state
      return;
    }

    // Regular email sign-up - store the email for the verification step
    if (result) {
      setPendingVerificationEmail(result);
    }
    goToStep(STEPS.EMAIL_VERIFICATION);
  };

  const handleSignInComplete = (result) => {
    // Handle Google Sign-In from sign-in form
    if (result && typeof result === 'object' && result.isGoogleAuth) {
      // For returning Google users, useEffect handles redirect based on state
      // For new users who signed up via Google from sign-in form, go to consent
      if (result.isNewUser) {
        goToStep(STEPS.CONSENT_METHOD);
      }
      return;
    }
    // After regular sign in, the useEffect will handle redirecting based on user state
  };

  const handleSwitchToSignIn = () => {
    goToStep(STEPS.SIGNIN);
  };

  const handleSwitchToSignUp = () => {
    goToStep(STEPS.SIGNUP);
  };

  const handleEmailVerified = () => {
    goToStep(STEPS.CONSENT_METHOD);
  };

  const handleConsentMethodSelected = (method, id) => {
    setConsentMethod(method);
    setConsentId(id);
    goToStep(method === 'credit_card' ? STEPS.CREDIT_CARD : STEPS.KBQ);
  };

  const handleConsentVerified = () => {
    goToStep(STEPS.CREATE_PROFILE);
  };

  const handleConsentBack = () => {
    goToStep(STEPS.CONSENT_METHOD);
  };

  const handleProfileCreated = () => {
    goToStep(STEPS.WELCOME);
  };

  const handleWelcomeComplete = () => {
    // Navigate to child learning dashboard after onboarding
    navigate('/learn');
  };

  const getCurrentStepNumber = () => {
    const stepGroups = {
      [STEPS.SIGNUP]: 1,
      [STEPS.SIGNIN]: 1,
      [STEPS.EMAIL_VERIFICATION]: 2,
      [STEPS.CONSENT_METHOD]: 3,
      [STEPS.CREDIT_CARD]: 3,
      [STEPS.KBQ]: 3,
      [STEPS.CREATE_PROFILE]: 4,
      [STEPS.WELCOME]: 5,
    };
    return stepGroups[currentStep] || 1;
  };

  const stepNumber = getCurrentStepNumber();

  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="onboarding-flow">
      <div className="onboarding-container">
        {/* Logo/Branding */}
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <img src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png" alt="OrbitLearn" className="logo-image" style={{ height: '80px', width: 'auto', borderRadius: '16px' }} />
          </div>
        </div>

        {/* Progress indicator */}
        <div className="onboarding-progress">
          <div className={`progress-step ${stepNumber >= 1 ? 'active' : ''} ${stepNumber > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {stepNumber > 1 ? '✓' : '1'}
            </div>
            <span className="step-label">Account</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${stepNumber >= 2 ? 'active' : ''} ${stepNumber > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {stepNumber > 2 ? '✓' : '2'}
            </div>
            <span className="step-label">Verify</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${stepNumber >= 3 ? 'active' : ''} ${stepNumber > 3 ? 'completed' : ''}`}>
            <div className="step-circle">
              {stepNumber > 3 ? '✓' : '3'}
            </div>
            <span className="step-label">Consent</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${stepNumber >= 4 ? 'active' : ''} ${stepNumber > 4 ? 'completed' : ''}`}>
            <div className="step-circle">
              {stepNumber > 4 ? '✓' : '4'}
            </div>
            <span className="step-label">Profile</span>
          </div>
        </div>

        {/* Step content */}
        <div className="onboarding-content">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="step-wrapper"
            >
              {currentStep === STEPS.SIGNUP && (
                <SignUpStep
                  onComplete={handleSignUpComplete}
                  onSwitchToSignIn={handleSwitchToSignIn}
                />
              )}

              {currentStep === STEPS.SIGNIN && (
                <SignUpStep
                  isSignIn
                  onComplete={handleSignInComplete}
                  onSwitchToSignUp={handleSwitchToSignUp}
                />
              )}

              {currentStep === STEPS.EMAIL_VERIFICATION && (
                <EmailVerificationStep
                  email={pendingVerificationEmail || user?.email}
                  onVerified={handleEmailVerified}
                />
              )}

              {currentStep === STEPS.CONSENT_METHOD && (
                <ConsentMethodStep onMethodSelected={handleConsentMethodSelected} />
              )}

              {currentStep === STEPS.CREDIT_CARD && (
                <CreditCardVerificationStep
                  consentId={consentId}
                  onVerified={handleConsentVerified}
                  onBack={handleConsentBack}
                />
              )}

              {currentStep === STEPS.KBQ && (
                <KBQVerificationStep
                  consentId={consentId}
                  onVerified={handleConsentVerified}
                  onBack={handleConsentBack}
                />
              )}

              {currentStep === STEPS.CREATE_PROFILE && (
                <CreateProfileStep onComplete={handleProfileCreated} />
              )}

              {currentStep === STEPS.WELCOME && (
                <WelcomeStep onComplete={handleWelcomeComplete} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <p className="privacy-text">
            By creating an account, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </p>
          <p className="coppa-text">
            We take your child's privacy seriously.{' '}
            <a href="/coppa" target="_blank" rel="noopener noreferrer">Learn about our COPPA compliance</a>.
          </p>
        </div>
      </div>

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
};

export default OnboardingFlow;
