import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Book,
  Video,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  Sparkles,
  FileQuestion,
  Layers,
  GraduationCap,
  CreditCard,
  Settings,
  Download,
  Zap,
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    icon: Sparkles,
    questions: [
      {
        q: 'How do I create my first lesson?',
        a: 'From your dashboard, click "Create Lesson" or go to the Create page. You can either describe your topic in the chat, upload a PDF/PowerPoint file, or paste existing content. Jeffrey, your AI assistant, will help generate a complete lesson with objectives, vocabulary, activities, and more.',
      },
      {
        q: 'What file types can I upload?',
        a: 'You can upload PDF files and PowerPoint presentations (.ppt, .pptx) up to 10MB. Our AI will analyze the content and extract key information to help generate lessons, quizzes, and flashcards.',
      },
      {
        q: 'How accurate is the AI-generated content?',
        a: 'Our AI is powered by Google\'s Gemini models and produces high-quality educational content. However, we always recommend reviewing generated content before sharing with students. You can edit any generated content directly in our editor.',
      },
    ],
  },
  {
    category: 'Quizzes & Flashcards',
    icon: FileQuestion,
    questions: [
      {
        q: 'How do I generate a quiz from my lesson?',
        a: 'Go to the "Generate Quiz" page from your dashboard. You can paste content, upload a file, or select from your existing lessons. Choose the number of questions (5-30), question types (multiple choice, true/false, fill-in-blank, short answer), and difficulty level.',
      },
      {
        q: 'Can I edit generated quizzes?',
        a: 'Yes! After generating a quiz, you can save it to your content library and edit individual questions, change answers, add explanations, or reorder questions using our content editor.',
      },
      {
        q: 'How many flashcards can I create at once?',
        a: 'You can generate between 10-30 flashcards per deck. Each card includes a front (question/term), back (answer/definition), and optional hint. You can also categorize cards and shuffle the deck for study.',
      },
    ],
  },
  {
    category: 'Credits & Billing',
    icon: CreditCard,
    questions: [
      {
        q: 'What are AI credits?',
        a: 'AI credits (tokens) are used when generating content. Different actions use different amounts: lesson guides (~2-3K), full lessons (~8-12K), quizzes (~1.5-2K), and flashcards (~1-1.5K). Your monthly quota depends on your subscription tier.',
      },
      {
        q: 'What happens if I run out of credits?',
        a: 'When you reach your monthly limit, you can either wait for your quota to reset (monthly) or upgrade to a higher tier. You can also purchase credit packs for one-time additions to your balance.',
      },
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to Settings > Account or the Billing page to view available plans. You can upgrade from Free to Basic ($9.99/mo) or Professional ($24.99/mo) at any time. Upgrades are prorated and take effect immediately.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel anytime from your billing settings. Your access continues until the end of your current billing period, and all content you\'ve created remains accessible.',
      },
    ],
  },
  {
    category: 'Exporting & Sharing',
    icon: Download,
    questions: [
      {
        q: 'How do I export my content?',
        a: 'Open any content item and click the Export button. You can export to PDF (for printing) or PowerPoint (for presentations). Options include paper size, color scheme, and whether to include answers/teacher notes.',
      },
      {
        q: 'Can I connect to Google Drive?',
        a: 'Yes! Go to any content\'s export menu and select "Save to Google Drive". You\'ll be prompted to connect your Google account. Once connected, exports will save directly to an "Orbit Learn" folder in your Drive.',
      },
      {
        q: 'Can I share content with other teachers?',
        a: 'Direct sharing between teachers is coming soon! For now, you can export your content as PDF or PowerPoint and share those files manually.',
      },
    ],
  },
  {
    category: 'Account & Settings',
    icon: Settings,
    questions: [
      {
        q: 'How do I change my password?',
        a: 'Go to Settings > Security tab. Enter your current password and your new password twice to confirm. Passwords must be at least 8 characters.',
      },
      {
        q: 'Can I change my email address?',
        a: 'For security reasons, email changes require contacting our support team. Please email support@orbitlearn.com from your registered email address.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings > Account tab and scroll to the Danger Zone. Click "Delete Account" and type DELETE to confirm. This action is permanent and will delete all your content and data.',
      },
    ],
  },
];

const QUICK_LINKS = [
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides',
    icon: Video,
    href: '#tutorials',
    color: 'teacher-plum',
  },
  {
    title: 'Documentation',
    description: 'Detailed feature guides',
    icon: Book,
    href: '#docs',
    color: 'teacher-chalk',
  },
  {
    title: 'Contact Support',
    description: 'Get help from our team',
    icon: MessageCircle,
    href: '#contact',
    color: 'teacher-sage',
  },
  {
    title: 'Feature Requests',
    description: 'Suggest new features',
    icon: Sparkles,
    href: '#feedback',
    color: 'teacher-gold',
  },
];

const TeacherHelpPage = () => {
  const { teacher } = useTeacherAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleItem = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter FAQ items based on search
  const filteredFAQ = searchQuery
    ? FAQ_ITEMS.map(category => ({
        ...category,
        questions: category.questions.filter(
          q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.questions.length > 0)
    : FAQ_ITEMS;

  const headerActions = (
    <Link
      to="/teacher/dashboard"
      className="teacher-btn-secondary flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back to Dashboard</span>
    </Link>
  );

  return (
    <TeacherLayout
      title="Help & Support"
      subtitle="Get answers and assistance"
      headerActions={headerActions}
    >
      <div className="max-w-4xl mx-auto">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teacher-inkLight" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 border border-teacher-ink/10 rounded-2xl text-lg focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {QUICK_LINKS.map(({ title, description, icon: Icon, href, color }) => (
            <a
              key={title}
              href={href}
              className="teacher-card p-4 hover:shadow-teacher transition-shadow group"
            >
              <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 text-${color}`} />
              </div>
              <h3 className="font-semibold text-teacher-ink text-sm mb-1">{title}</h3>
              <p className="text-xs text-teacher-inkLight">{description}</p>
            </a>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-teacher-ink">Frequently Asked Questions</h2>

          {filteredFAQ.length === 0 ? (
            <div className="teacher-card p-8 text-center">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-teacher-inkLight/50" />
              <p className="text-teacher-inkLight">No results found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-sm text-teacher-chalk hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredFAQ.map((category, categoryIdx) => {
              const Icon = category.icon;
              return (
                <div key={category.category} className="teacher-card overflow-hidden">
                  <button
                    onClick={() => setActiveCategory(activeCategory === categoryIdx ? null : categoryIdx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-teacher-paper/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teacher-chalk/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-teacher-chalk" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-teacher-ink">{category.category}</h3>
                        <p className="text-xs text-teacher-inkLight">{category.questions.length} questions</p>
                      </div>
                    </div>
                    {activeCategory === categoryIdx ? (
                      <ChevronUp className="w-5 h-5 text-teacher-inkLight" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-teacher-inkLight" />
                    )}
                  </button>

                  <AnimatePresence>
                    {activeCategory === categoryIdx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-teacher-ink/5">
                          {category.questions.map((item, questionIdx) => {
                            const isExpanded = expandedItems[`${categoryIdx}-${questionIdx}`];
                            return (
                              <div
                                key={questionIdx}
                                className="border-b border-teacher-ink/5 last:border-b-0"
                              >
                                <button
                                  onClick={() => toggleItem(categoryIdx, questionIdx)}
                                  className="w-full flex items-center justify-between p-4 text-left hover:bg-teacher-paper/30 transition-colors"
                                >
                                  <span className="font-medium text-teacher-ink pr-4">{item.q}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-teacher-inkLight flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-teacher-inkLight flex-shrink-0" />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4 text-sm text-teacher-inkLight leading-relaxed">
                                        {item.a}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Contact Support */}
        <div id="contact" className="mt-8 teacher-card p-6 bg-gradient-to-br from-teacher-chalk/5 to-teacher-gold/5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teacher-chalk flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-teacher-ink mb-1">Still need help?</h3>
              <p className="text-sm text-teacher-inkLight mb-4">
                Our support team is here to help. We typically respond within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@orbitlearn.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teacher-chalk text-white font-medium rounded-xl hover:bg-teacher-chalkLight transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-teacher-ink/10 text-teacher-ink font-medium rounded-xl hover:bg-teacher-paper transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Help Center
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-8 teacher-card p-6">
          <h3 className="text-lg font-semibold text-teacher-ink mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-teacher-gold" />
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { keys: ['Ctrl', 'N'], action: 'Create new content' },
              { keys: ['Ctrl', 'S'], action: 'Save current content' },
              { keys: ['Ctrl', 'E'], action: 'Export to PDF' },
              { keys: ['Ctrl', '/'], action: 'Open command palette' },
              { keys: ['Esc'], action: 'Close modal/dialog' },
              { keys: ['?'], action: 'Show keyboard shortcuts' },
            ].map(({ keys, action }) => (
              <div key={action} className="flex items-center justify-between p-3 bg-teacher-paper rounded-lg">
                <span className="text-sm text-teacher-inkLight">{action}</span>
                <div className="flex items-center gap-1">
                  {keys.map((key, idx) => (
                    <React.Fragment key={key}>
                      <kbd className="px-2 py-1 bg-white border border-teacher-ink/10 rounded text-xs font-mono text-teacher-ink shadow-sm">
                        {key}
                      </kbd>
                      {idx < keys.length - 1 && <span className="text-teacher-inkLight">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherHelpPage;
