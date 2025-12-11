import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle, MessageSquare, Clock } from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'press', label: 'Press & Media' },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    if (!formData.message.trim() || formData.message.length < 20) {
      setError('Please enter a message (at least 20 characters)');
      return;
    }

    try {
      setSubmitting(true);

      // Call the backend API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitResult({
          ticketId: data.ticketId,
          message: data.message || 'Thank you! We\'ll get back to you within 24-48 hours.',
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          category: 'general',
          subject: '',
          message: '',
        });
      } else {
        throw new Error(data.message || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="md:col-span-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-600 mb-8">
              Have a question or need help? We're here for you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <a
                    href="mailto:support@orbitlearn.app"
                    className="text-blue-600 hover:underline"
                  >
                    support@orbitlearn.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Response Time</h3>
                  <p className="text-gray-600">24-48 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Existing Users</h3>
                  <p className="text-gray-600 text-sm">
                    If you're a registered user, please use the Support page in your dashboard for faster help.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              {submitResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                  <p className="text-gray-600 mb-4">{submitResult.message}</p>
                  {submitResult.ticketId && (
                    <p className="text-sm text-gray-500 mb-6">
                      Reference: <span className="font-mono">{submitResult.ticketId}</span>
                    </p>
                  )}
                  <button
                    onClick={() => setSubmitResult(null)}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="How can we help?"
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Tell us more about your inquiry..."
                        maxLength={5000}
                      />
                      <p className="text-sm text-gray-500 mt-1 text-right">
                        {formData.message.length}/5000
                      </p>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Orbit Learn. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy-policy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <Link to="/coppa" className="hover:text-gray-700">COPPA Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
