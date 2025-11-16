import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import JeffreyAvatar from './JeffreyAvatar';
import { onboardingApi } from '@/lib/api';

interface Message {
  id: string;
  role: 'jeffrey' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
}

interface TravelProfile {
  destinationCountry: string;
  travelPurpose: string;
  nationality: string;
  travelDates: { start: string; end: string };
  specialConcerns: string[];
}

interface OnboardingChatProps {
  userName: string;
  onComplete: (profile: TravelProfile, recommendations: any[]) => void;
  onSkip: () => void;
}

// Conversation stages
type Stage = 'welcome' | 'destination' | 'purpose' | 'nationality' | 'dates' | 'concerns' | 'summary' | 'researching' | 'complete';

const TRAVEL_PURPOSES = [
  'Tourism/Holiday',
  'Business',
  'Study/Education',
  'Work/Employment',
  'Family Visit',
  'Medical Treatment',
];

const COMMON_CONCERNS = [
  'First-time visa applicant',
  'Previous visa rejection',
  'Tight deadline/urgent',
  'Multiple destinations',
  'Traveling with family',
  'None of these',
];

export default function OnboardingChat({ userName, onComplete, onSkip }: OnboardingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStage, setCurrentStage] = useState<Stage>('welcome');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [jeffreyMood, setJeffreyMood] = useState<'happy' | 'thinking' | 'excited' | 'waving' | 'neutral'>('waving');
  const [isProcessing, setIsProcessing] = useState(false);

  // Collected data
  const [travelProfile, setTravelProfile] = useState<TravelProfile>({
    destinationCountry: '',
    travelPurpose: '',
    nationality: '',
    travelDates: { start: '', end: '' },
    specialConcerns: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      addJeffreyMessage(
        `Hey ${userName}! 🎉 I'm Jeffrey, your AI visa expert!\n\nI'm here to make your visa journey super smooth. Let me learn about your travel plans so I can research everything you need.\n\nReady to get started?`,
        ['Yes, let\'s go!', 'Tell me more first']
      );
      setJeffreyMood('waving');
    }, 500);
    return () => clearTimeout(timer);
  }, [userName]);

  const addJeffreyMessage = (content: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `jeffrey-${Date.now()}`,
          role: 'jeffrey',
          content,
          timestamp: new Date(),
          options,
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    processUserInput(option);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isTyping || isProcessing) return;

    const message = inputValue.trim();
    setInputValue('');
    addUserMessage(message);
    processUserInput(message);
  };

  const processUserInput = async (input: string) => {
    setJeffreyMood('thinking');

    switch (currentStage) {
      case 'welcome':
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('go')) {
          setCurrentStage('destination');
          setTimeout(() => {
            addJeffreyMessage(
              'Awesome! First things first - where are you planning to travel?\n\nYou can type any country or region (e.g., "USA", "Germany", "Schengen", "UAE", "UK").'
            );
            setJeffreyMood('happy');
          }, 500);
        } else {
          setTimeout(() => {
            addJeffreyMessage(
              'No problem! Here\'s what I do:\n\n✅ Research visa requirements for your destination\n✅ Create document checklists\n✅ Identify photo specifications\n✅ Suggest travel itineraries\n✅ Answer any visa questions\n\nAll powered by AI to save you hours of research! Ready now?',
              ['Yes, let\'s start!']
            );
            setJeffreyMood('happy');
          }, 500);
        }
        break;

      case 'destination':
        setTravelProfile((prev) => ({ ...prev, destinationCountry: input }));
        setCurrentStage('purpose');
        setTimeout(() => {
          addJeffreyMessage(
            `Great choice! ${input} it is! 🌍\n\nWhat's the main purpose of your trip?`,
            TRAVEL_PURPOSES
          );
          setJeffreyMood('happy');
        }, 500);
        break;

      case 'purpose':
        setTravelProfile((prev) => ({ ...prev, travelPurpose: input }));
        setCurrentStage('nationality');
        setTimeout(() => {
          addJeffreyMessage(
            'Got it! Now, what passport/nationality do you hold?\n\nThis is important because visa requirements vary significantly based on your nationality.'
          );
          setJeffreyMood('neutral');
        }, 500);
        break;

      case 'nationality':
        setTravelProfile((prev) => ({ ...prev, nationality: input }));
        setCurrentStage('dates');
        setTimeout(() => {
          addJeffreyMessage(
            'Perfect! When are you planning to travel?\n\nPlease enter your approximate travel dates.\n\n📅 Format: Start date - End date\n(e.g., "March 15, 2025 - March 30, 2025" or "2025-03-15 to 2025-03-30")'
          );
          setJeffreyMood('neutral');
        }, 500);
        break;

      case 'dates':
        // Parse dates (simple parsing, backend will validate)
        const dateMatch = input.match(/(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/g);
        let startDate = '';
        let endDate = '';

        if (dateMatch && dateMatch.length >= 2) {
          startDate = dateMatch[0];
          endDate = dateMatch[1];
        } else if (dateMatch && dateMatch.length === 1) {
          startDate = dateMatch[0];
          // Add 14 days default
          const start = new Date(startDate);
          start.setDate(start.getDate() + 14);
          endDate = start.toISOString().split('T')[0];
        } else {
          // Default to 30 days from now
          const start = new Date();
          start.setDate(start.getDate() + 30);
          startDate = start.toISOString().split('T')[0];
          const end = new Date(start);
          end.setDate(end.getDate() + 14);
          endDate = end.toISOString().split('T')[0];
        }

        setTravelProfile((prev) => ({
          ...prev,
          travelDates: { start: startDate, end: endDate },
        }));
        setCurrentStage('concerns');
        setTimeout(() => {
          addJeffreyMessage(
            'Great! Almost done! 🎯\n\nDo you have any special concerns or circumstances?\n\n(Select all that apply, or type your own)',
            COMMON_CONCERNS
          );
          setJeffreyMood('happy');
        }, 500);
        break;

      case 'concerns':
        const concerns = input === 'None of these' ? [] : [input];
        setTravelProfile((prev) => ({
          ...prev,
          specialConcerns: [...prev.specialConcerns, ...concerns],
        }));
        setCurrentStage('summary');

        const updatedProfile = {
          ...travelProfile,
          specialConcerns: [...travelProfile.specialConcerns, ...concerns],
        };

        setTimeout(() => {
          addJeffreyMessage(
            `Perfect! Here's what I've got:\n\n🌍 **Destination:** ${updatedProfile.destinationCountry}\n🎯 **Purpose:** ${updatedProfile.travelPurpose}\n🛂 **Your Nationality:** ${updatedProfile.nationality}\n📅 **Travel Dates:** ${updatedProfile.travelDates.start} to ${updatedProfile.travelDates.end}\n${updatedProfile.specialConcerns.length > 0 ? `⚠️ **Concerns:** ${updatedProfile.specialConcerns.join(', ')}` : ''}\n\nDoes this look correct?`,
            ['Yes, research my visa!', 'Let me make changes']
          );
          setJeffreyMood('excited');
        }, 500);
        break;

      case 'summary':
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('research')) {
          setCurrentStage('researching');
          setJeffreyMood('thinking');

          setTimeout(() => {
            addJeffreyMessage(
              '🔍 Excellent! Let me research everything for your visa application...\n\nI\'m checking:\n• Official visa requirements\n• Required documents\n• Photo specifications\n• Processing times\n• Fees and validity\n\nThis will just take a moment...'
            );
          }, 500);

          // Call the API
          setIsProcessing(true);
          try {
            const response = await onboardingApi.complete(travelProfile);

            if (response.success && response.data) {
              const responseData = response.data;
              setCurrentStage('complete');
              setJeffreyMood('excited');

              setTimeout(() => {
                const requirements = responseData.travelProfile.visaRequirements;
                addJeffreyMessage(
                  `🎉 **Great news!** I've found everything you need!\n\n**${requirements.visaType}**\n\n⏱️ **Processing Time:** ${requirements.processingTime}\n💰 **Fees:** ${requirements.fees}\n📋 **Documents Needed:** ${requirements.requiredDocuments.length} items\n📸 **Photo Size:** ${requirements.photoRequirements.dimensions}\n\nI've set up your dashboard with personalized recommendations. Ready to see it?`,
                  ['Take me to my dashboard!']
                );
              }, 2000);

              // Complete after showing results
              setTimeout(() => {
                onComplete(responseData.travelProfile, responseData.recommendations);
              }, 5000);
            } else {
              throw new Error('Failed to complete onboarding');
            }
          } catch (error) {
            console.error('Onboarding error:', error);
            setJeffreyMood('neutral');
            addJeffreyMessage(
              'Oops! I had a little trouble researching. But don\'t worry - your information has been saved and I\'ll complete the research shortly.\n\nLet\'s head to your dashboard!',
              ['Go to dashboard']
            );
            setTimeout(() => {
              onComplete(travelProfile, []);
            }, 2000);
          } finally {
            setIsProcessing(false);
          }
        } else {
          setCurrentStage('destination');
          setTimeout(() => {
            addJeffreyMessage(
              'No problem! Let\'s start over. Where are you planning to travel?'
            );
            setJeffreyMood('neutral');
          }, 500);
        }
        break;

      case 'complete':
        onComplete(travelProfile, []);
        break;

      default:
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Progress indicator
  const getProgress = () => {
    const stages: Stage[] = ['welcome', 'destination', 'purpose', 'nationality', 'dates', 'concerns', 'summary', 'researching', 'complete'];
    const currentIndex = stages.indexOf(currentStage);
    return Math.round((currentIndex / (stages.length - 1)) * 100);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Setting up your profile</span>
          <span className="text-sm font-medium text-indigo-600">{getProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'jeffrey' && (
              <div className="flex-shrink-0 mr-3">
                <JeffreyAvatar size="sm" mood={jeffreyMood} animate={false} showPulse={false} />
              </div>
            )}

            <div
              className={`
                max-w-[80%] rounded-2xl px-5 py-4
                ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-br from-gray-50 to-indigo-50 border border-indigo-100'
                }
              `}
            >
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {line.split('**').map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="font-semibold">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>

              {/* Quick options */}
              {message.options && message.role === 'jeffrey' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      disabled={isTyping || isProcessing}
                      className="
                        px-4 py-2 rounded-full text-sm font-medium
                        bg-white border border-indigo-200 text-indigo-700
                        hover:bg-indigo-50 hover:border-indigo-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        transform hover:scale-105
                      "
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 mr-3">
              <JeffreyAvatar size="sm" mood="thinking" animate showPulse={false} />
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-3 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Jeffrey is researching your visa requirements...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isTyping || isProcessing}
              rows={2}
              className="
                w-full px-4 py-3 rounded-xl
                border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                resize-none
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-all duration-200
              "
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping || isProcessing}
            className="
              p-3 rounded-xl
              bg-gradient-to-r from-indigo-500 to-purple-600
              text-white
              hover:from-indigo-600 hover:to-purple-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              transform hover:scale-105
            "
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Skip option */}
        <div className="mt-3 text-center">
          <button
            onClick={onSkip}
            disabled={isProcessing}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now (you can complete this later)
          </button>
        </div>
      </div>
    </div>
  );
}
