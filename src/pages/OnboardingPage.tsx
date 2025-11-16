import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Globe, FileCheck, Camera, MapPin } from 'lucide-react';
import OnboardingChat from '@/components/onboarding/OnboardingChat';
import JeffreyAvatar from '@/components/onboarding/JeffreyAvatar';
import { onboardingApi } from '@/lib/api';
import type { User } from '@/types';

interface OnboardingPageProps {
  user: User | null;
}

export default function OnboardingPage({ user }: OnboardingPageProps) {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const response = await onboardingApi.getStatus();
        if (response.success && response.data?.onboardingCompleted) {
          // Already completed, go to dashboard
          navigate('/app');
        } else {
          setIsLoading(false);
          // Show welcome screen first
          setTimeout(() => setShowChat(true), 2000);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setIsLoading(false);
        setShowChat(true);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const handleComplete = (travelProfile: any, recommendations: any[]) => {
    console.log('Onboarding complete:', { travelProfile, recommendations });
    // Navigate to dashboard with confetti or celebration
    navigate('/app', {
      state: {
        justOnboarded: true,
        travelProfile,
        recommendations,
      },
    });
  };

  const handleSkip = async () => {
    try {
      await onboardingApi.skip();
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
    navigate('/app');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <JeffreyAvatar size="xl" mood="thinking" animate showPulse />
          <p className="mt-6 text-lg text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!showChat) {
    // Welcome animation screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Globe className="absolute top-1/4 left-1/4 w-12 h-12 text-indigo-200 animate-float" />
          <Plane className="absolute top-1/3 right-1/4 w-10 h-10 text-purple-200 animate-float-delayed" />
          <FileCheck className="absolute bottom-1/3 left-1/3 w-8 h-8 text-pink-200 animate-float" />
          <Camera className="absolute bottom-1/4 right-1/3 w-9 h-9 text-indigo-200 animate-float-delayed" />
          <MapPin className="absolute top-1/2 left-1/6 w-8 h-8 text-purple-200 animate-float" />
        </div>

        <div className="text-center z-10">
          <div className="animate-bounce-slow">
            <JeffreyAvatar size="xl" mood="waving" animate showPulse />
          </div>
          <h1 className="mt-8 text-4xl font-bold text-gray-900">
            Welcome, {user?.firstName || 'Traveler'}!
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-md mx-auto">
            I'm Jeffrey, your AI visa assistant. Let's make your visa application journey smooth and stress-free.
          </p>
          <div className="mt-8">
            <div className="inline-flex items-center space-x-2 text-indigo-600">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                VisaDocs
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Hi, {user?.firstName || 'there'}!</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <main className="h-[calc(100vh-64px)]">
        <OnboardingChat
          userName={user?.firstName || 'there'}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </main>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}
