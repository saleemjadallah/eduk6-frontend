import { useState } from 'react';
import { JeffreyChat } from './JeffreyChat';

interface JeffreyChatWidgetProps {
  visaContext?: {
    visaType?: string;
    destinationCountry?: string;
    nationality?: string;
    stage?: 'initial' | 'document_upload' | 'photo_generation' | 'form_filling' | 'review' | 'submitted';
    packageId?: number;
  };
  alwaysOpen?: boolean;
}

/**
 * Floating chat widget that can be used throughout the visa application process
 */
export function JeffreyChatWidget({ visaContext, alwaysOpen = false }: JeffreyChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(alwaysOpen);

  if (alwaysOpen) {
    return (
      <div className="w-full h-full">
        <JeffreyChat visaContext={visaContext} className="h-full" />
      </div>
    );
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl">
          <JeffreyChat
            visaContext={visaContext}
            minimized={false}
            onMinimize={() => setIsOpen(false)}
            className="h-full"
          />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50 group"
          aria-label="Open Jeffrey Chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>

          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></span>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Ask Jeffrey 💬
              <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          </div>

          {/* Badge for new users */}
          {!visaContext?.packageId && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              ✨
            </span>
          )}
        </button>
      )}
    </>
  );
}
