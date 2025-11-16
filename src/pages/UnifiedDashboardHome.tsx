import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Camera, Plane } from 'lucide-react';
import { useJeffrey } from '../contexts/JeffreyContext';
import { ServiceCard } from '../components/dashboard/ServiceCard';
import { ProgressBar } from '../components/dashboard/ProgressBar';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { JeffreyRecommendations } from '../components/dashboard/JeffreyRecommendations';
import { ProgressStat } from '../components/dashboard/ProgressStats';
import { CompletionBadge } from '../components/ui/CompletionBadge';
import { ActivityItem, JeffreyRecommendation } from '../types/unified';
import { User } from '../types';

interface UnifiedDashboardHomeProps {
  user: User;
}

export const UnifiedDashboardHome: React.FC<UnifiedDashboardHomeProps> = ({ user }) => {
  const { updateWorkflow, addRecentAction } = useJeffrey();

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

  // Update Jeffrey's context when entering dashboard
  useEffect(() => {
    updateWorkflow('dashboard');
    addRecentAction('Viewed dashboard');
    loadDashboardData();
  }, [updateWorkflow, addRecentAction]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // For now, set initial empty state
      // These will be populated as user interacts with the services
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
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToWorkflow = (workflow: string) => {
    addRecentAction(`Navigated to ${workflow}`);
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

      {/* Overall Progress Card */}
      <div
        className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50
                   border border-indigo-100 rounded-2xl"
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
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 mb-8">
        <h3 className="text-2xl font-bold mb-6 text-neutral-900">Recent Activity</h3>
        <ActivityTimeline activities={recentActivity} maxItems={5} />
      </div>

      {/* Jeffrey's Smart Recommendations */}
      <JeffreyRecommendations recommendations={recommendations} />
    </div>
  );
};
