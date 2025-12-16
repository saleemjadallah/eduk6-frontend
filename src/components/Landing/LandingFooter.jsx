import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Heart, Mail, Download, Sparkles, CheckCircle, BookOpen, FileText, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Footer Email Capture Component
const FooterEmailCapture = ({ isTeacher }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/leads/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'footer',
          leadMagnet: isTeacher ? 'teacher_toolkit' : 'curriculum_guide',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDownloadUrl(data.data.downloadUrl);
        setIsSuccess(true);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Unable to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const content = isTeacher
    ? {
        icon: FileText,
        title: 'Free AI Teaching Toolkit',
        description: 'Templates, prompts & strategies to save hours on lesson prep.',
        buttonText: 'Get Free Toolkit',
        successText: 'Your toolkit is ready!',
        gradient: 'from-teacher-chalk to-teacher-chalkLight',
        accentColor: 'teacher-gold',
      }
    : {
        icon: BookOpen,
        title: 'Free Curriculum Guide',
        description: 'Grade-by-grade milestones & expert tips for K-8 parents.',
        buttonText: 'Get Free Guide',
        successText: 'Your guide is ready!',
        gradient: 'from-nanobanana-blue to-purple-600',
        accentColor: 'nanobanana-yellow',
      };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative bg-gradient-to-r ${content.gradient} rounded-2xl p-6 md:p-8 mb-12 overflow-hidden`}
    >
      {/* Animated background pattern */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-20 -top-20 w-64 h-64 opacity-10"
      >
        <div className="w-full h-full border-[3px] border-white rounded-full" />
        <div className="absolute inset-4 border-[3px] border-white rounded-full" />
        <div className="absolute inset-8 border-[3px] border-white rounded-full" />
      </motion.div>

      {/* Floating sparkles */}
      <motion.div
        animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-4 right-8 text-white/30"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
        {/* Left - Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`inline-flex items-center gap-2 bg-${content.accentColor} text-black px-3 py-1 rounded-full text-xs font-bold mb-3`}
          >
            <content.icon className="w-3 h-3" />
            FREE DOWNLOAD
          </motion.div>
          <h3 className="text-xl md:text-2xl font-black text-white mb-2">
            {content.title}
          </h3>
          <p className="text-white/80 text-sm md:text-base max-w-md">
            {content.description}
          </p>
        </div>

        {/* Right - Form or Success */}
        <div className="w-full lg:w-auto">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-${content.accentColor} text-black font-bold px-6 py-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all disabled:opacity-70 flex items-center justify-center gap-2 whitespace-nowrap`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {content.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-6 h-6 text-green-300" />
                <span className="font-bold">{content.successText}</span>
              </div>
              <motion.a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-${content.accentColor} text-black font-bold px-6 py-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] flex items-center gap-2`}
              >
                <Download className="w-4 h-4" />
                Download
              </motion.a>
            </motion.div>
          )}
          {error && (
            <p className="text-red-300 text-sm mt-2 text-center lg:text-left">{error}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const LandingFooter = () => {
  const location = useLocation();
  const isTeacherPage = location.pathname.startsWith('/teacher');
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'For Parents', href: '#for-parents' },
      { name: 'How It Works', href: '#how-it-works' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'COPPA Compliance', href: '/coppa' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/orbitlearn', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com/orbitlearn', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/orbitlearn', label: 'Instagram' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Email Capture Section */}
        <FooterEmailCapture isTeacher={isTeacherPage} />

        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img
                src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png"
                alt="OrbitLearn"
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Making learning fun and accessible for every K-8 student with the power of AI.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} Jasmine Entertainment FZE. All rights reserved.
            </p>
            <p className="flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for young learners everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
