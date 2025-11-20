import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Users, ChevronRight, Check, SkipForward, Sparkles, Globe } from 'lucide-react';
import { profileApi, UserProfile, PassportProfile } from '../lib/api-profile';
import { onboardingApi } from '../lib/api';
import { cn } from '../utils/cn';

type OnboardingStep = 'welcome' | 'personal' | 'passport' | 'travel' | 'employment' | 'family' | 'complete';

export const ProfileOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [personalData, setPersonalData] = useState<Partial<UserProfile>>({});
  const [passportData, setPassportData] = useState<Partial<PassportProfile>>({});
  const [travelData, setTravelData] = useState({
    destinationCountry: '',
    travelPurpose: '',
    nationality: '',
    travelDates: { start: '', end: '' },
    specialConcerns: [] as string[],
  });
  const [wantsToAddEmployment, setWantsToAddEmployment] = useState(false);
  const [wantsToAddFamily, setWantsToAddFamily] = useState(false);

  // Progress tracking
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());

  const steps = [
    { id: 'personal', label: 'Personal Info', icon: User, required: true },
    { id: 'passport', label: 'Passport', icon: BookOpen, required: true },
    { id: 'travel', label: 'Travel Plans', icon: Globe, required: true },
    { id: 'employment', label: 'Employment', icon: Briefcase, required: false },
    { id: 'family', label: 'Family', icon: Users, required: false },
  ];

  const handleSkipAll = () => {
    navigate('/app');
  };

  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      const response = await profileApi.saveProfile(personalData as UserProfile);
      if (response.success) {
        setCompletedSteps(prev => new Set(prev).add('personal'));
        setCurrentStep('passport');
      }
    } catch (error) {
      console.error('Error saving personal data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassport = async () => {
    setIsSaving(true);
    try {
      const response = await profileApi.savePassport({
        ...passportData,
        isActive: true
      } as PassportProfile);
      if (response.success) {
        setCompletedSteps(prev => new Set(prev).add('passport'));
        // Use nationality from personal data for travel data
        setTravelData(prev => ({ ...prev, nationality: personalData.nationality || '' }));
        setCurrentStep('travel');
      }
    } catch (error) {
      console.error('Error saving passport data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTravel = async () => {
    setIsSaving(true);
    try {
      // Save travel profile through onboarding API (Jeffrey research)
      const response = await onboardingApi.complete(travelData);
      if (response.success) {
        setCompletedSteps(prev => new Set(prev).add('travel'));
        setCurrentStep(wantsToAddEmployment ? 'employment' : 'complete');
      }
    } catch (error) {
      console.error('Error saving travel data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = () => {
    navigate('/app', { state: { justOnboarded: true } });
  };

  const getProgressPercentage = () => {
    const requiredCompleted = ['personal', 'passport', 'travel'].filter(s =>
      completedSteps.has(s as OnboardingStep)
    ).length;
    return (requiredCompleted / 3) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        {currentStep !== 'welcome' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Profile Setup Progress</span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round(getProgressPercentage())}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    completedSteps.has(step.id as OnboardingStep)
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  )}>
                    {completedSteps.has(step.id as OnboardingStep) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-full h-0.5 mx-2",
                      completedSteps.has(step.id as OnboardingStep)
                        ? "bg-green-500"
                        : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Set Up Your Profile for Faster Applications
              </h1>
              <p className="text-lg text-gray-600">
                Save your information once and auto-fill any visa form in seconds
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Save Hours on Every Application</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your data auto-fills across all visa forms - Singapore, UAE, Schengen, and more
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Check className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Prevent Costly Rejections</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Real-time validation catches errors before you submit
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <Check className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Family Profiles Included</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Add spouse and children for easy family visa applications
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSkipAll}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                Skip for now
              </button>

              <button
                onClick={() => setCurrentStep('personal')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Personal Information Step */}
        {currentStep === 'personal' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            <p className="text-gray-600 mb-6">This basic information will be used across all your visa applications</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={personalData.firstName || ''}
                  onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="As on passport"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={personalData.lastName || ''}
                  onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="As on passport"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={personalData.dateOfBirth || ''}
                  onChange={(e) => setPersonalData({ ...personalData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                <input
                  type="text"
                  value={personalData.nationality || ''}
                  onChange={(e) => setPersonalData({ ...personalData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={personalData.email || ''}
                  onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={personalData.phone || ''}
                  onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSkipAll}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip & do later
              </button>

              <button
                onClick={handleSavePersonal}
                disabled={isSaving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Continue'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Passport Step */}
        {currentStep === 'passport' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Passport Information</h2>
            <p className="text-gray-600 mb-6">Your passport details for visa applications</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number *</label>
                <input
                  type="text"
                  value={passportData.passportNumber || ''}
                  onChange={(e) => setPassportData({ ...passportData, passportNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="A12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={passportData.issueDate || ''}
                  onChange={(e) => setPassportData({ ...passportData, issueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={passportData.expiryDate || ''}
                  onChange={(e) => setPassportData({ ...passportData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Country *</label>
                <input
                  type="text"
                  value={passportData.issuingCountry || ''}
                  onChange={(e) => setPassportData({ ...passportData, issuingCountry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="United States"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSkipAll}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip & do later
              </button>

              <button
                onClick={handleSavePassport}
                disabled={isSaving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Continue'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Travel Plans Step */}
        {currentStep === 'travel' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Travel Plans</h2>
            <p className="text-gray-600 mb-6">Tell us about your upcoming travel so we can prepare everything you need</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Where are you traveling to? *</label>
                <input
                  type="text"
                  value={travelData.destinationCountry}
                  onChange={(e) => setTravelData({ ...travelData, destinationCountry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., United Arab Emirates, Singapore, France"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Travel *</label>
                <select
                  value={travelData.travelPurpose}
                  onChange={(e) => setTravelData({ ...travelData, travelPurpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select purpose</option>
                  <option value="Tourism">Tourism / Vacation</option>
                  <option value="Business">Business</option>
                  <option value="Visit Family">Visit Family/Friends</option>
                  <option value="Medical">Medical Treatment</option>
                  <option value="Study">Study/Education</option>
                  <option value="Work">Work/Employment</option>
                  <option value="Transit">Transit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travel Start Date *</label>
                  <input
                    type="date"
                    value={travelData.travelDates.start}
                    onChange={(e) => setTravelData({ ...travelData, travelDates: { ...travelData.travelDates, start: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travel End Date *</label>
                  <input
                    type="date"
                    value={travelData.travelDates.end}
                    onChange={(e) => setTravelData({ ...travelData, travelDates: { ...travelData.travelDates, end: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900 mb-1">Jeffrey will research your visa requirements</p>
                    <p className="text-xs text-indigo-700">
                      Based on your destination and travel purpose, our AI will analyze visa requirements,
                      required documents, photo specifications, and create a personalized checklist for you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Optional: Would you also like to add?</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wantsToAddEmployment}
                      onChange={(e) => setWantsToAddEmployment(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Employment information (helpful for work visas)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wantsToAddFamily}
                      onChange={(e) => setWantsToAddFamily(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Family members (for family travel)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('passport')}
                className="text-gray-500 hover:text-gray-700"
              >
                Back
              </button>

              <button
                onClick={handleSaveTravel}
                disabled={isSaving || !travelData.destinationCountry || !travelData.travelPurpose || !travelData.travelDates.start || !travelData.travelDates.end}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Researching...' : 'Continue'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Profile Setup Complete!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your profile is ready. You can now auto-fill visa forms in seconds.
            </p>

            <div className="bg-indigo-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-indigo-700">
                <strong>Tip:</strong> You can add more details anytime from your profile settings
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};