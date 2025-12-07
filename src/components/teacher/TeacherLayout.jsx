import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';

const TeacherLayout = ({ children, title, subtitle, headerActions }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="teacher-portal min-h-screen flex">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block flex-shrink-0">
        <TeacherSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <TeacherSidebar
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
                isMobile={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <TeacherHeader
          title={title}
          subtitle={subtitle}
          actions={headerActions}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {/* Background decorations */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Gradient mesh background */}
            <div className="absolute inset-0 bg-teacher-mesh opacity-60" />

            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(30,42,58,0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(30,42,58,0.02) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Decorative shapes - hidden on mobile for performance */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:block absolute top-20 right-20 w-64 h-64 rounded-full bg-teacher-gold/5 blur-3xl"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:block absolute bottom-40 left-20 w-80 h-80 rounded-full bg-teacher-chalk/5 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:block absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-teacher-terracotta/3 blur-3xl"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
