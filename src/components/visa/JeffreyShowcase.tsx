import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../gamma/Button';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const sampleConversation: ChatMessage[] = [
  {
    role: 'user',
    content: 'What documents do I need for a UAE work visa?',
  },
  {
    role: 'assistant',
    content: 'For a UAE work visa, you\'ll need: 1) Valid passport (6+ months validity), 2) Passport-sized photos (white background), 3) Educational certificates attested by UAE embassy, 4) Employment contract, 5) Medical fitness certificate. I can help you validate all these documents!',
  },
  {
    role: 'user',
    content: 'Can you check if my passport photo meets the requirements?',
  },
  {
    role: 'assistant',
    content: 'Absolutely! Upload your photo and I\'ll check: background color (must be white), dimensions (4x6 cm for UAE), facial expression, lighting, and compliance with biometric standards. I\'ll also auto-correct any issues.',
  },
];

export default function JeffreyShowcase() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Side: Description */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mb-6">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">AI-Powered Assistant</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Meet{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Jeffrey AI
          </span>
        </h2>

        <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
          Your personal visa assistant powered by advanced AI. Jeffrey answers questions about visa requirements,
          validates documents, helps fill forms, and guides you through every step of the application process.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Instant Answers</h3>
              <p className="text-neutral-600">
                Get immediate responses to visa questions for all GCC countries
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Document Intelligence</h3>
              <p className="text-neutral-600">
                AI-powered document validation and compliance checking
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Step-by-Step Guidance</h3>
              <p className="text-neutral-600">
                Personalized assistance through your entire visa journey
              </p>
            </div>
          </div>
        </div>

        <Link to="/register">
          <Button size="lg" className="shadow-lg shadow-primary-500/30">
            Try Jeffrey Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </motion.div>

      {/* Right Side: Chat Demo */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className="relative"
      >
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/assets/new-jeffrey-removebg-preview.png"
                alt="Jeffrey AI"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold">Jeffrey AI</div>
              <div className="text-xs text-blue-100">Your Visa Assistant</div>
            </div>
            <div className="ml-auto">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto bg-neutral-50">
            {sampleConversation.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.3, duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-3
                    ${message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white border-2 border-neutral-200 text-neutral-800'
                    }
                  `}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: sampleConversation.length * 0.3 + 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-white border-2 border-neutral-200 rounded-2xl px-4 py-3 flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-neutral-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-neutral-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-neutral-400"
                />
              </div>
            </motion.div>
          </div>

          {/* Chat Input (Disabled) */}
          <div className="p-4 bg-white border-t-2 border-neutral-200">
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-100 rounded-xl text-neutral-400">
              <MessageCircle className="w-5 h-5" />
              <span>Sign up to start chatting with Jeffrey...</span>
            </div>
          </div>
        </div>

        {/* Floating Badge */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Free to Try!</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
