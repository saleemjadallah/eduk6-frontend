import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, HelpCircle, Menu } from 'lucide-react';

const TeacherHeader = ({ title, subtitle, actions, onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-30 bg-teacher-cream/80 backdrop-blur-xl border-b border-teacher-ink/5">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-xl text-teacher-inkLight hover:text-teacher-ink hover:bg-white transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Title Section */}
          <div className="min-w-0 flex-1">
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-teacher-ink truncate"
              >
                {title}
              </motion.h1>
            )}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="hidden sm:block text-sm text-teacher-inkLight mt-0.5 truncate"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Search - hidden on small mobile */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teacher-inkLight" />
              <input
                type="text"
                placeholder="Search content..."
                className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-xl bg-white border border-teacher-ink/10 text-sm placeholder:text-teacher-inkLight/60 focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
              />
            </div>

            {/* Mobile Search Button */}
            <button className="md:hidden p-2 sm:p-2.5 rounded-xl text-teacher-inkLight hover:text-teacher-ink hover:bg-white transition-all">
              <Search className="w-5 h-5" />
            </button>

            {/* Help - hidden on very small screens */}
            <button className="hidden sm:block p-2.5 rounded-xl text-teacher-inkLight hover:text-teacher-ink hover:bg-white transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 sm:p-2.5 rounded-xl text-teacher-inkLight hover:text-teacher-ink hover:bg-white transition-all">
              <Bell className="w-5 h-5" />
              {/* Notification dot */}
              <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 bg-teacher-terracotta rounded-full" />
            </button>

            {/* Custom Actions - hidden on mobile, shown as icon on tablet */}
            {actions && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-teacher-ink/10">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Colorful accent line at bottom */}
      <div className="h-0.5 bg-gradient-to-r from-teacher-terracotta via-teacher-gold via-teacher-sage to-teacher-plum opacity-30" />
    </header>
  );
};

export default TeacherHeader;
