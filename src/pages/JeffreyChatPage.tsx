import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Shield, Zap, FileText, Camera, Plane } from 'lucide-react';
import { JeffreyChat } from '../components/visadocs/JeffreyChat';
import Badge from '../components/gamma/Badge';
import Card from '../components/gamma/Card';
import FloatingOrb from '../components/gamma/FloatingOrb';
import GradientMesh from '../components/gamma/GradientMesh';

export default function JeffreyChatPage() {
  const quickActions = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Document Requirements',
      description: 'What documents do I need?',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: 'Photo Specifications',
      description: 'Photo requirements for my visa',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: <Plane className="w-5 h-5" />,
      title: 'Processing Times',
      description: 'How long will it take?',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Compliance Check',
      description: 'Is my application ready?',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background decoration */}
      <GradientMesh />
      <FloatingOrb color="primary" size="500px" position="top-right" blur="100px" opacity={0.15} />
      <FloatingOrb color="secondary" size="400px" position="bottom-left" blur="80px" opacity={0.12} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Badge variant="gradient" size="lg" className="mb-4 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Assistant</span>
          </Badge>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Chat with Jeffrey
          </h1>

          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Your personal AI visa assistant is here to help with documents, forms, compliance, and everything in between.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-3xl shadow-2xl border-2 border-neutral-200 overflow-hidden h-[calc(100vh-280px)] flex flex-col">
              <JeffreyChat className="flex-1 rounded-3xl" />
            </Card>
          </motion.div>

          {/* Sidebar - Quick Actions & Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* About Jeffrey */}
            <Card className="rounded-3xl p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-neutral-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                  👨‍💼
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Jeffrey AI</h3>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>

              <p className="text-neutral-700 leading-relaxed mb-4">
                Jeffrey is trained on thousands of visa applications and government requirements. He can answer questions about:
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Document requirements & specifications</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Compliance & validation guidance</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Form filling assistance</span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">General visa application queries</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-3xl p-6 border-2 border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className={`
                      w-full text-left p-4 rounded-xl
                      bg-gradient-to-r ${action.gradient}
                      text-white
                      hover:scale-105 hover:shadow-lg
                      transition-all duration-300
                      group
                    `}
                    onClick={() => {
                      // This would trigger sending the question to Jeffrey
                      const input = document.querySelector('input[placeholder="Ask Jeffrey anything..."]') as HTMLInputElement;
                      if (input) {
                        input.value = action.description;
                        input.focus();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{action.title}</div>
                        <div className="text-xs text-white/80">{action.description}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Disclaimer */}
            <Card className="rounded-2xl p-4 bg-amber-50 border-2 border-amber-200">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-900 font-semibold mb-1">Legal Disclaimer</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Jeffrey is an AI assistant for informational purposes only. For legal advice, consult a licensed immigration lawyer.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
