import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Crown,
  PenTool,
  Layers,
  Coffee,
  HelpCircle,
  X,
} from 'lucide-react';

const TeacherSidebar = ({ collapsed, onToggle, isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { teacher, quota, signOut } = useTeacherAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/teacher/login');
  };

  // Calculate quota percentage
  const quotaPercent = quota
    ? Math.min(100, (Number(quota.tokensUsed || 0) / Number(quota.monthlyQuota || 100000)) * 100)
    : 0;

  const navItems = [
    {
      section: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
        { icon: BookOpen, label: 'My Content', path: '/teacher/content' },
        { icon: PenTool, label: 'Create', path: '/teacher/content/create' },
      ],
    },
    {
      section: 'Tools',
      items: [
        { icon: FileText, label: 'Lessons', path: '/teacher/content?type=LESSON' },
        { icon: ClipboardCheck, label: 'Quizzes', path: '/teacher/content?type=QUIZ' },
        { icon: Layers, label: 'Flashcards', path: '/teacher/content?type=FLASHCARD_DECK' },
        {
          icon: GraduationCap,
          label: 'Grading',
          path: '/teacher/grading',
          badge: 'Soon',
          disabled: true,
        },
      ],
    },
    {
      section: 'Account',
      items: [
        { icon: BarChart3, label: 'Usage & Billing', path: '/teacher/usage' },
        { icon: Settings, label: 'Settings', path: '/teacher/settings' },
      ],
    },
  ];

  const getTierIcon = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PROFESSIONAL':
        return <Crown className="w-4 h-4 text-teacher-gold" />;
      case 'BASIC':
        return <Zap className="w-4 h-4 text-teacher-sage" />;
      default:
        return <Coffee className="w-4 h-4 text-teacher-inkLight" />;
    }
  };

  const getTierBadgeClass = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PROFESSIONAL':
        return 'teacher-badge professional';
      case 'BASIC':
        return 'teacher-badge basic';
      default:
        return 'teacher-badge free';
    }
  };

  // Determine if sidebar should show expanded content
  const showExpanded = isMobile || !collapsed;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isMobile ? 280 : (collapsed ? 80 : 280) }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="teacher-sidebar h-screen sticky top-0 flex flex-col z-40"
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-teacher-ink/5">
        <div className="flex items-center justify-between">
          <Link to="/teacher/dashboard" onClick={isMobile ? onToggle : undefined} className="flex items-center gap-3">
            <img
              src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png"
              alt="Orbit Learn"
              className="w-10 h-10 flex-shrink-0"
            />
            <AnimatePresence>
              {showExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display font-semibold text-lg text-teacher-ink leading-tight">
                    Orbit Learn
                  </h1>
                  <span className="text-xs font-medium text-teacher-chalk">
                    Teacher Portal
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-xl text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((section, sectionIdx) => (
          <div key={section.section} className={sectionIdx > 0 ? 'mt-6' : ''}>
            <AnimatePresence>
              {showExpanded && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 mb-2 text-xs font-semibold text-teacher-inkLight/60 uppercase tracking-wider"
                >
                  {section.section}
                </motion.h3>
              )}
            </AnimatePresence>

            <ul className="space-y-1">
              {section.items.map((item) => {
                // Handle paths with query params for active state detection
                const [itemPath, itemQuery] = item.path.split('?');
                const currentParams = new URLSearchParams(location.search);
                const itemParams = new URLSearchParams(itemQuery || '');
                const currentType = currentParams.get('type');
                const itemType = itemParams.get('type');

                // Determine active state
                let isActive = false;
                if (location.pathname === itemPath) {
                  if (itemQuery) {
                    // Item has query params (e.g., Lessons, Quizzes, Flashcards)
                    // Active only if the type matches
                    isActive = itemType === currentType;
                  } else {
                    // Item has no query params (e.g., My Content)
                    // Active only if there's no type filter applied
                    isActive = !currentType;
                  }
                } else if (!itemQuery) {
                  // For items without query params, exact pathname match
                  isActive = location.pathname === item.path;
                }
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.disabled ? '#' : item.path}
                      onClick={(e) => {
                        if (item.disabled) {
                          e.preventDefault();
                        } else if (isMobile) {
                          onToggle(); // Close mobile menu on navigation
                        }
                      }}
                      className={`
                        teacher-nav-item group relative
                        ${isActive ? 'active' : ''}
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${!showExpanded ? 'justify-center px-0' : ''}
                      `}
                      title={!showExpanded ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'text-teacher-inkLight'}`} />

                      <AnimatePresence>
                        {showExpanded && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {item.badge && showExpanded && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-teacher-gold/20 text-teacher-gold">
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip for collapsed state - not needed on mobile */}
                      {!showExpanded && !isMobile && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-teacher-ink text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-teacher-lg">
                          {item.label}
                          {item.badge && (
                            <span className="ml-2 text-teacher-gold text-xs">
                              ({item.badge})
                            </span>
                          )}
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-teacher-ink rotate-45" />
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Credits/Quota Section */}
      <AnimatePresence>
        {showExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-4 border-t border-teacher-ink/5"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-teacher-chalk/5 to-teacher-gold/5 border border-teacher-ink/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-teacher-ink">
                  AI Credits
                </span>
                <span className={getTierBadgeClass(teacher?.subscriptionTier)}>
                  {getTierIcon(teacher?.subscriptionTier)}
                  {teacher?.subscriptionTier || 'FREE'}
                </span>
              </div>

              <div className="teacher-progress mb-2">
                <div
                  className={`teacher-progress-bar ${
                    quotaPercent > 90 ? 'danger' : quotaPercent > 70 ? 'warning' : ''
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-teacher-inkLight">
                  {Math.round(quotaPercent)}% used
                </span>
                <Link
                  to="/teacher/usage"
                  className="teacher-link text-xs"
                  onClick={isMobile ? onToggle : undefined}
                >
                  View details
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Section */}
      <div className="p-4 border-t border-teacher-ink/5">
        <div className="relative">
          <button
            onClick={() => showExpanded && setShowUserMenu(!showUserMenu)}
            className={`
              w-full flex items-center gap-3 p-2 rounded-xl
              hover:bg-teacher-paper transition-colors
              ${!showExpanded ? 'justify-center' : ''}
            `}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teacher-terracotta to-teacher-terracottaLight flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-teacher-ink/10">
              {teacher?.firstName?.[0]}{teacher?.lastName?.[0]}
            </div>

            <AnimatePresence>
              {showExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 text-left overflow-hidden"
                >
                  <p className="font-medium text-teacher-ink text-sm truncate">
                    {teacher?.firstName} {teacher?.lastName}
                  </p>
                  <p className="text-xs text-teacher-inkLight truncate">
                    {teacher?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* User dropdown menu */}
          <AnimatePresence>
            {showUserMenu && showExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-teacher-lg border border-teacher-ink/5 overflow-hidden"
              >
                <Link
                  to="/teacher/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-teacher-ink hover:bg-teacher-paper transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (isMobile) onToggle();
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </Link>
                <Link
                  to="/teacher/help"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-teacher-ink hover:bg-teacher-paper transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (isMobile) onToggle();
                  }}
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </Link>
                <hr className="border-teacher-ink/5" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-teacher-coral hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle - only show on desktop */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-white rounded-full border border-teacher-ink/10 shadow-teacher-sm flex items-center justify-center text-teacher-inkLight hover:text-teacher-ink hover:shadow-teacher transition-all z-50"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}
    </motion.aside>
  );
};

export default TeacherSidebar;
