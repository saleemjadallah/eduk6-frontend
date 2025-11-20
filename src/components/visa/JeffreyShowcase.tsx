import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../gamma/Button';
import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  delay?: number;
}

const conversationSequence: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'What documents do I need for a UAE work visa?',
    delay: 1000,
  },
  {
    id: '2',
    role: 'assistant',
    content: 'For a UAE work visa, you\'ll need: 1) Valid passport, 2) Photo (white bg), 3) Attested degree, 4) Offer letter. I can validate these for you instantly! ⚡️',
    delay: 2500,
  },
  {
    id: '3',
    role: 'user',
    content: 'Can you check my passport photo?',
    delay: 4500,
  },
  {
    id: '4',
    role: 'assistant',
    content: 'Sure! Upload it here. I\'ll check the background, size (4x6cm), and lighting. 📸✅',
    delay: 6000,
  },
];

export default function JeffreyShowcase() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    // Reset and restart animation loop
    const runAnimation = () => {
      setMessages([]);
      setIsTyping(false);

      let currentTime = 0;

      conversationSequence.forEach((msg) => {
        // Typing indicator before assistant messages
        if (msg.role === 'assistant') {
          const typingStart = currentTime + (msg.delay || 0) - 800;
          const t1 = setTimeout(() => setIsTyping(true), typingStart);
          timeouts.push(t1);
        }

        const t2 = setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, msg]);
        }, currentTime + (msg.delay || 0));
        timeouts.push(t2);
      });

      // Loop the animation
      const totalDuration = 9000;
      const t3 = setTimeout(runAnimation, totalDuration);
      timeouts.push(t3);
    };

    runAnimation();

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Side: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Your AI Visa Companion</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight text-neutral-900">
              Say Hello to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400">
                Jeffrey AI
              </span>
            </h2>

            <p className="text-xl text-neutral-600 mb-10 leading-relaxed max-w-lg">
              More than just a chatbot. Jeffrey is an intelligent assistant that validates your documents, answers complex visa queries, and guides you to approval.
            </p>

            <div className="space-y-6 mb-10">
              {[
                { icon: Zap, title: 'Instant Answers', desc: 'Real-time responses for GCC visa rules' },
                { icon: Shield, title: 'Smart Validation', desc: 'AI checks your documents for errors' },
                { icon: CheckCircle2, title: '99% Accuracy', desc: 'Trained on official immigration data' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-lg">{item.title}</h3>
                    <p className="text-neutral-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all">
                  Chat with Jeffrey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-600">Trusted by 10k+ users</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Immersive Chat Experience */}
          <div className="relative h-[600px] flex items-center justify-center">

            {/* Large Jeffrey Avatar (Floating) */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 1, -1, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }}
              className="absolute -right-12 top-0 w-80 z-20 pointer-events-none hidden lg:block"
            >
              <img
                src="/assets/new-jeffrey-removebg-preview.png"
                alt="Jeffrey AI Avatar"
                className="w-full h-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-neutral-100 bg-white/50 backdrop-blur-md flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 p-0.5">
                    <img
                      src="/assets/new-jeffrey-removebg-preview.png"
                      alt="Jeffrey"
                      className="w-full h-full object-cover rounded-full bg-white"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Jeffrey AI</h3>
                  <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Always Online
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="p-6 h-[400px] flex flex-col gap-4 overflow-hidden relative">
                <AnimatePresence mode='popLayout'>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                          ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-neutral-700 border border-neutral-100 rounded-bl-none'
                          }
                        `}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-neutral-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Area (Visual only) */}
              <div className="p-4 bg-white/50 border-t border-neutral-100 backdrop-blur-sm">
                <div className="w-full h-12 bg-white rounded-xl border border-neutral-200 flex items-center px-4 text-neutral-400 text-sm shadow-inner">
                  Ask Jeffrey anything...
                </div>
              </div>
            </motion.div>

            {/* Decorative Elements behind chat */}
            <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-blue-100/50 to-cyan-100/50 rounded-[3rem] transform rotate-3 scale-105 blur-xl opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
}
