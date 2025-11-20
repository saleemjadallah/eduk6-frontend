import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Camera, Plane, Globe, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useJeffrey } from '../contexts/JeffreyContext';
import { useLocation } from 'react-router-dom';
import { ServiceCard } from '../components/dashboard/ServiceCard';
import { ProgressBar } from '../components/dashboard/ProgressBar';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { JeffreyRecommendations } from '../components/dashboard/JeffreyRecommendations';
import { ProgressStat } from '../components/dashboard/ProgressStats';
import { CompletionBadge } from '../components/ui/CompletionBadge';
import { ActivityItem, JeffreyRecommendation } from '../types/unified';
import { User } from '../types';
import { onboardingApi } from '../lib/api';

interface UnifiedDashboardHomeProps {
  user: User;
}

interface TravelProfile {
  destinationCountry: string;
  travelPurpose: string;
  nationality: string;
  travelDates: { start: string; end: string };
  specialConcerns: string[];
  visaRequirements?: {
    visaType: string;
    processingTime: string;
    requiredDocuments: string[];
    photoRequirements: {
      dimensions: string;
      background: string;
      specifications: string[];
    };
    fees: string;
    validity: string;
    additionalNotes: string[];
  };
  lastUpdated: string;
}

export const UnifiedDashboardHome: React.FC<UnifiedDashboardHomeProps> = ({ user }) => {
  const { updateWorkflow, addRecentAction } = useJeffrey();
  const location = useLocation();

  // Real data state - starts empty, will be populated from API or user actions
  const [overallCompleteness, setOverallCompleteness] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [validatedDocs, setValidatedDocs] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [requiredPhotos, setRequiredPhotos] = useState(0);
  const [travelProgress, setTravelProgress] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [recommendations, setRecommendations] = useState<JeffreyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [travelProfile, setTravelProfile] = useState<TravelProfile | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const [checkedDocuments, setCheckedDocuments] = useState<Set<string>>(new Set());

  // Update Jeffrey's context when entering dashboard
  useEffect(() => {
    updateWorkflow('dashboard');
    addRecentAction('Viewed dashboard');
    loadDashboardData();

    // Check if user just completed onboarding
    if (location.state?.justOnboarded) {
      setShowWelcomeBanner(true);
      setTimeout(() => setShowWelcomeBanner(false), 10000);
    }
  }, [updateWorkflow, addRecentAction, location.state]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch onboarding status and travel profile
      const onboardingResponse = await onboardingApi.getStatus();

      if (onboardingResponse.success && onboardingResponse.data?.travelProfile) {
        const profile = onboardingResponse.data.travelProfile;
        setTravelProfile(profile);

        // Set progress based on visa requirements
        if (profile.visaRequirements) {
          const docs = profile.visaRequirements.requiredDocuments;
          setTotalDocs(docs.length);
          setValidatedDocs(0); // User hasn't validated any yet
          setTotalForms(1); // At least 1 form to fill
          setFormProgress(0);
          setRequiredPhotos(1); // At least 1 photo set needed
          setPhotoProgress(0);
          setTravelProgress(0);

          // Calculate overall completeness (starts at 10% for completing onboarding)
          setOverallCompleteness(10);
        }

        // Fetch personalized recommendations
        const recsResponse = await onboardingApi.getRecommendations();
        if (recsResponse.success && recsResponse.data?.recommendations) {
          setRecommendations(
            recsResponse.data.recommendations.map((rec, index) => ({
              id: String(index + 1),
              ...rec,
            }))
          );
        }

        // Add onboarding completion to activity
        setRecentActivity([
          {
            id: '1',
            type: 'milestone',
            icon: CheckCircle,
            title: 'Completed onboarding with Jeffrey',
            description: `Set destination to ${profile.destinationCountry} for ${profile.travelPurpose}`,
            timestamp: new Date(profile.lastUpdated),
          },
        ]);
      } else {
        // No onboarding data, set defaults
        setTotalForms(0);
        setFormProgress(0);
        setTotalDocs(0);
        setValidatedDocs(0);
        setRequiredPhotos(0);
        setPhotoProgress(0);
        setTravelProgress(0);
        setOverallCompleteness(0);

        // Default recommendations for new users
        setRecommendations([
          {
            id: '1',
            priority: 'high',
            title: 'Start with Document Validation',
            description:
              'Upload and validate your documents to ensure they meet visa requirements. This is the first step in your visa journey.',
            action: {
              label: 'Validate Documents',
              href: '/app/validator',
            },
          },
          {
            id: '2',
            priority: 'high',
            title: 'Generate Visa-Compliant Photos',
            description:
              'Create professional photos that meet specific visa requirements for your destination country.',
            action: {
              label: 'Generate Photos',
              href: '/app/photo-compliance',
            },
          },
          {
            id: '3',
            priority: 'medium',
            title: 'Plan Your Travel Itinerary',
            description:
              'A detailed travel itinerary strengthens your visa application. Let AI help you create one.',
            action: {
              label: 'Create Itinerary',
              href: '/app/travel-planner',
            },
          },
        ]);

        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set defaults on error
      setTotalForms(0);
      setFormProgress(0);
      setTotalDocs(0);
      setValidatedDocs(0);
      setRequiredPhotos(0);
      setPhotoProgress(0);
      setTravelProgress(0);
      setOverallCompleteness(0);
      setRecommendations([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToWorkflow = (workflow: string) => {
    addRecentAction(`Navigated to ${workflow}`);
  };

  const handleDocumentCheck = (document: string) => {
    setCheckedDocuments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(document)) {
        newSet.delete(document);
      } else {
        newSet.add(document);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner - shown after onboarding */}
      {showWelcomeBanner && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-800">Onboarding Complete!</h3>
              <p className="text-green-600">
                Jeffrey has researched your visa requirements. Your personalized dashboard is ready!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {user.firstName || user.name || 'there'}
          </span>
        </h1>
        <p className="text-xl text-neutral-600">Continue your visa application journey</p>
      </div>

      {/* Travel Profile Summary - shown if onboarding completed */}
      {travelProfile && travelProfile.visaRequirements && (
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-indigo-600" />
              Your Travel Profile
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                Destination
              </div>
              <p className="font-semibold text-gray-900">{travelProfile.destinationCountry}</p>
              <p className="text-sm text-indigo-600">{travelProfile.visaRequirements.visaType}</p>
            </div>
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                Travel Dates
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(travelProfile.travelDates.start).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-600">
                to{' '}
                {new Date(travelProfile.travelDates.end).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <FileText className="w-4 h-4 mr-1" />
                Requirements
              </div>
              <button
                onClick={() => setIsDocumentsExpanded(!isDocumentsExpanded)}
                className="flex items-center gap-2 font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {travelProfile.visaRequirements.requiredDocuments.length} documents
                {isDocumentsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <p className="text-sm text-gray-600">
                Processing: {travelProfile.visaRequirements.processingTime}
              </p>
            </div>
          </div>

          {/* Expandable Documents List */}
          {isDocumentsExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Required Documents:</h3>
              <div className="space-y-2">
                {travelProfile.visaRequirements.requiredDocuments.map((doc, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={checkedDocuments.has(doc)}
                      onChange={() => handleDocumentCheck(doc)}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        checkedDocuments.has(doc)
                          ? 'text-gray-500 line-through'
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}
                    >
                      {doc}
                    </span>
                    {checkedDocuments.has(doc) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {checkedDocuments.size} of {travelProfile.visaRequirements.requiredDocuments.length}{' '}
                documents checked
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overall Progress Card */}
      <div
        className="mb-8 p-6 bg-white/80 backdrop-blur-xl
                   border border-white/50 rounded-2xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">Overall Application Progress</h2>
          <CompletionBadge value={overallCompleteness} className="text-lg px-4 py-2" />
        </div>

        <ProgressBar value={overallCompleteness} className="mb-6" size="lg" />

        <div className="grid grid-cols-4 gap-4">
          <ProgressStat icon={FileText} label="Forms" value={formProgress} total={totalForms} />
          <ProgressStat
            icon={CheckCircle}
            label="Documents"
            value={validatedDocs}
            total={totalDocs}
          />
          <ProgressStat icon={Camera} label="Photos" value={photoProgress} total={requiredPhotos} />
          <ProgressStat icon={Plane} label="Travel" value={travelProgress} total={1} />
        </div>
      </div>

      {/* 4 Service Cards - Entry points to each workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 1. AI Form Filler */}
        <ServiceCard
          icon={FileText}
          title="AI Form Filler"
          description="Auto-fill visa application forms with AI"
          gradient="from-blue-500 to-indigo-600"
          stats={{
            total: formProgress,
            label: 'forms filled',
            completeness: Math.round((formProgress / totalForms) * 100),
          }}
          cta={{
            label: formProgress < totalForms ? 'Continue Filling' : 'View Forms',
            href: '/app/form-filler',
          }}
          onClick={() => handleNavigateToWorkflow('form-filler')}
        />

        {/* 2. Document Validator */}
        <ServiceCard
          icon={CheckCircle}
          title="Document Validator"
          description="AI-powered document verification & validation"
          gradient="from-green-500 to-emerald-600"
          stats={{
            total: validatedDocs,
            label: 'docs validated',
            completeness: Math.round((validatedDocs / totalDocs) * 100),
          }}
          cta={{
            label: validatedDocs < totalDocs ? 'Validate Documents' : 'Review Documents',
            href: '/app/validator',
          }}
          onClick={() => handleNavigateToWorkflow('validator')}
        />

        {/* 3. AI Photo Compliance */}
        <ServiceCard
          icon={Camera}
          title="AI Photo Compliance"
          description="Generate visa-compliant photos for any country"
          gradient="from-purple-500 to-pink-600"
          stats={{
            total: photoProgress,
            label: 'visa photos',
            completeness: Math.round((photoProgress / requiredPhotos) * 100),
          }}
          cta={{
            label: photoProgress === 0 ? 'Generate Photos' : 'View Photos',
            href: '/app/photo-compliance',
          }}
          onClick={() => handleNavigateToWorkflow('photo')}
        />

        {/* 4. AI Travel Itinerary */}
        <ServiceCard
          icon={Plane}
          title="AI Travel Planner"
          description="Smart itinerary generation for visa applications"
          gradient="from-orange-500 to-red-600"
          stats={{
            total: travelProgress,
            label: 'itinerary ready',
            completeness: travelProgress * 100,
          }}
          cta={{
            label: travelProgress === 0 ? 'Create Itinerary' : 'View Itinerary',
            href: '/app/travel-planner',
          }}
          onClick={() => handleNavigateToWorkflow('travel')}
        />
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/50 mb-8 shadow-sm">
        <h3 className="text-2xl font-bold mb-6 text-neutral-900">Recent Activity</h3>
        <ActivityTimeline activities={recentActivity} maxItems={5} />
      </div>

      {/* Jeffrey's Smart Recommendations */}
      <JeffreyRecommendations recommendations={recommendations} />
    </div>
  );
};
