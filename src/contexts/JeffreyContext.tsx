import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { JeffreyContextState, WorkflowType, JeffreyMessage } from '../types/unified';
import { visaDocsApi } from '../lib/api';
import { ChatSession } from '../types';

// Cache types for form search results
interface FormSearchCache {
  forms: Array<{
    name: string;
    description: string;
    officialUrl: string;
    source: string;
    formType: string;
    instructions?: string;
  }>;
  additionalResources: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  processingNotes: string;
  cacheKey: string; // To invalidate when destination/visa type changes
  cachedAt: Date;
}

interface JeffreyContextValue {
  // State
  context: JeffreyContextState;
  messages: JeffreyMessage[];
  isTyping: boolean;
  sessionId: string | null;
  suggestions: string[];
  formSearchCache: FormSearchCache | null;

  // Actions
  updateWorkflow: (workflow: WorkflowType) => void;
  updatePackageContext: (packageId: number, context: JeffreyContextState['packageContext']) => void;
  updateUserState: (state: Partial<JeffreyContextState['userState']>) => void;
  addRecentAction: (action: string, details?: Record<string, unknown>) => void;
  sendMessage: (message: string) => Promise<void>;
  askJeffrey: (question: string) => Promise<void>;
  clearMessages: () => void;
  setFormSearchCache: (cache: FormSearchCache) => void;
  clearFormSearchCache: () => void;
}

const JeffreyContext = createContext<JeffreyContextValue | null>(null);

export const useJeffrey = () => {
  const context = useContext(JeffreyContext);
  if (!context) {
    throw new Error('useJeffrey must be used within a JeffreyProvider');
  }
  return context;
};

interface JeffreyProviderProps {
  children: React.ReactNode;
}

export const JeffreyProvider: React.FC<JeffreyProviderProps> = ({ children }) => {
  const [context, setContext] = useState<JeffreyContextState>({
    workflow: null,
    packageId: null,
    packageContext: {},
    userState: {},
    recentActions: [],
  });

  const [messages, setMessages] = useState<JeffreyMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [formSearchCache, setFormSearchCacheState] = useState<FormSearchCache | null>(null);

  const lastWorkflowRef = useRef<WorkflowType>(null);

  // Restore last chat session for the user (keeps chats across refresh/navigation)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionsResponse = await visaDocsApi.getChatSessions();
        if (!sessionsResponse.success || !sessionsResponse.data?.length) return;

        const sessions = sessionsResponse.data as ChatSession[];

        // Prefer a form-filler session, otherwise most recent
        const preferredSession =
          sessions.find((s) => (s as any).visaContext?.stage === 'form-filler') ||
          sessions[0];

        if (!preferredSession?.id) return;

        const sessionResponse = await visaDocsApi.getChatSession(preferredSession.id);
        if (!sessionResponse.success || !sessionResponse.data) return;

        const session = sessionResponse.data as ChatSession;
        const messages = (session.messages || []).map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));

        setMessages(messages);
        setSessionId(String(session.id));

        // Seed context with the stored visa context if present
        const savedContext: JeffreyContextState['packageContext'] = {};
        const storedContext = (session as any).visaContext as any;
        if (storedContext) {
          savedContext.destinationCountry =
            storedContext.destinationCountry || storedContext.country;
          savedContext.visaType = storedContext.visaType;
          savedContext.nationality = storedContext.nationality;
        }

        setContext((prev) => ({
          ...prev,
          packageContext: {
            ...prev.packageContext,
            ...savedContext,
          },
        }));
      } catch (error) {
        // Swallow errors so the UI can still load
        console.warn('[Jeffrey] Failed to restore previous session:', error);
      }
    };

    restoreSession();
  }, []);

  // Get context-aware suggestions when workflow changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (context.workflow && context.workflow !== lastWorkflowRef.current) {
        lastWorkflowRef.current = context.workflow;
        try {
          const response = await visaDocsApi.getSuggestedQuestions(
            context.workflow,
            context.packageContext.visaType,
            context.packageContext.destinationCountry
          );
          if (response.data?.questions) {
            setSuggestions(response.data.questions.slice(0, 4));
          }
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          // Set default suggestions based on workflow
          setSuggestions(getDefaultSuggestions(context.workflow));
        }
      }
    };

    fetchSuggestions();
  }, [context.workflow, context.packageContext]);

  const getDefaultSuggestions = (workflow: WorkflowType): string[] => {
    switch (workflow) {
      case 'form-filler':
        return [
          'What fields do I still need to fill?',
          'How do I format the passport issue date?',
          'Where do I find my Emirates ID number?',
        ];
      case 'validator':
        return [
          'What documents are still missing?',
          'Do I need to attest my degree?',
          'Is my passport photo acceptable?',
        ];
      case 'photo':
        return [
          'What are the photo requirements?',
          'Can I wear glasses in the photo?',
          'What background color do I need?',
        ];
      case 'travel':
        return [
          'What\'s the cheapest flight option?',
          'Do I need travel insurance?',
          'How many days should I book hotels for?',
        ];
      default:
        return [
          'Show my overall progress',
          'What should I do next?',
          'What documents do I need?',
        ];
    }
  };

  const updateWorkflow = useCallback((workflow: WorkflowType) => {
    setContext((prev) => ({
      ...prev,
      workflow,
    }));

    // Add to recent actions
    if (workflow) {
      addRecentAction(`Switched to ${workflow} workflow`);
    }
  }, []);

  const updatePackageContext = useCallback(
    (packageId: number, packageContext: JeffreyContextState['packageContext']) => {
      setContext((prev) => ({
        ...prev,
        packageId,
        packageContext,
      }));
    },
    []
  );

  const updateUserState = useCallback((state: Partial<JeffreyContextState['userState']>) => {
    setContext((prev) => ({
      ...prev,
      userState: {
        ...prev.userState,
        ...state,
      },
    }));
  }, []);

  const addRecentAction = useCallback((action: string, details?: Record<string, unknown>) => {
    setContext((prev) => ({
      ...prev,
      recentActions: [
        {
          timestamp: new Date(),
          action,
          details,
        },
        ...prev.recentActions.slice(0, 19), // Keep last 20 actions
      ],
    }));
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      // Add user message immediately
      const userMessage: JeffreyMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await visaDocsApi.sendMessage(message, {
          sessionId: sessionId || undefined,
          visaContext: {
            visaType: context.packageContext.visaType,
            destinationCountry: context.packageContext.destinationCountry,
            nationality: context.packageContext.nationality,
            stage: context.workflow || 'initial',
          },
        });

        if (response.data) {
          // Update session ID if new
          if (response.data.sessionId && !sessionId) {
            setSessionId(response.data.sessionId);
          }

          // Add assistant message
          const assistantMessage: JeffreyMessage = {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date(),
            sources: response.data.sources,
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Update suggestions if provided
          if (response.data.suggestions) {
            setSuggestions(response.data.suggestions);
          }
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        // Add error message
        const errorMessage: JeffreyMessage = {
          role: 'assistant',
          content: 'I apologize, but I encountered an issue. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, context.packageContext, context.workflow]
  );

  const askJeffrey = useCallback(
    async (question: string) => {
      await sendMessage(question);
      addRecentAction('Asked Jeffrey', { question });
    },
    [sendMessage, addRecentAction]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const setFormSearchCache = useCallback((cache: FormSearchCache) => {
    setFormSearchCacheState(cache);
  }, []);

  const clearFormSearchCache = useCallback(() => {
    setFormSearchCacheState(null);
  }, []);

  const value: JeffreyContextValue = {
    context,
    messages,
    isTyping,
    sessionId,
    suggestions,
    formSearchCache,
    updateWorkflow,
    updatePackageContext,
    updateUserState,
    addRecentAction,
    sendMessage,
    askJeffrey,
    clearMessages,
    setFormSearchCache,
    clearFormSearchCache,
  };

  return <JeffreyContext.Provider value={value}>{children}</JeffreyContext.Provider>;
};

export default JeffreyContext;
