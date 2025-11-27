import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Twitter, Facebook, Instagram, Youtube, Heart } from 'lucide-react';

const LandingFooter = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'For Parents', href: '#for-parents' },
      { name: 'How It Works', href: '#how-it-works' },
    ],
    Resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Blog', href: '/blog' },
      { name: 'Curriculum Guide', href: '/curriculum' },
      { name: 'Parent Tips', href: '/tips' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Press Kit', href: '/press' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'COPPA Compliance', href: '/coppa' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/orbitlearn', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com/orbitlearn', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/orbitlearn', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/orbitlearn', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img
                src="/assets/orbit-learn-logo-light.png"
                alt="OrbitLearn"
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Making learning fun and accessible for every K-6 student with the power of AI.
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

        {/* Newsletter signup */}
        <div className="bg-gray-800 rounded-3xl p-6 md:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold font-comic mb-2">
                Stay in the Loop!
              </h3>
              <p className="text-gray-400">
                Get tips, updates, and special offers delivered to your inbox.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-gray-700 border-2 border-gray-600 focus:border-nanobanana-blue focus:outline-none text-white placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-nanobanana-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} Orbit Learn. All rights reserved.
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
