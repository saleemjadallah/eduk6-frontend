import { useState, useEffect, useCallback } from 'react';
import { supportAPI } from '../services/api/supportAPI';
import './SupportPage.css';

const CATEGORIES = [
  { value: 'general', label: 'General Question' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing & Subscription' },
  { value: 'safety', label: 'Safety Concern' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [faq, setFaq] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Contact form state
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [formError, setFormError] = useState(null);

  // Fetch FAQ
  const fetchFAQ = useCallback(async () => {
    try {
      setFaqLoading(true);
      const response = await supportAPI.getFAQ();
      if (response.success) {
        setFaq(response.data);
        // Expand first category by default
        if (response.data.length > 0) {
          setExpandedCategory(response.data[0].category);
        }
      }
    } catch (err) {
      console.error('Failed to load FAQ:', err);
    } finally {
      setFaqLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQ();
  }, [fetchFAQ]);

  // Filter FAQ by search query
  const filteredFAQ = searchQuery.trim()
    ? faq.map(category => ({
        ...category,
        questions: category.questions.filter(
          q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.questions.length > 0)
    : faq;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitResult(null);

    // Validate
    if (!formData.subject.trim()) {
      setFormError('Please enter a subject');
      return;
    }
    if (!formData.message.trim()) {
      setFormError('Please enter your message');
      return;
    }
    if (formData.message.length < 20) {
      setFormError('Please provide more detail in your message (at least 20 characters)');
      return;
    }

    try {
      setSubmitting(true);
      const response = await supportAPI.submitContact(formData);
      if (response.success) {
        setSubmitResult({
          ticketId: response.data.ticketId,
          message: response.data.message,
        });
        // Reset form
        setFormData({
          subject: '',
          category: 'general',
          message: '',
        });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
    setExpandedQuestion(null);
  };

  const toggleQuestion = (questionIndex) => {
    setExpandedQuestion(expandedQuestion === questionIndex ? null : questionIndex);
  };

  return (
    <div className="support-page">
      <div className="page-header">
        <h1>Help & Support</h1>
        <p>Find answers or get in touch with our team</p>
      </div>

      {/* Tabs */}
      <div className="support-tabs">
        <button
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
        </button>
        <button
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Us
        </button>
        <button
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
      </div>

      <div className="support-content">
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="faq-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>

            {faqLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading FAQ...</p>
              </div>
            ) : filteredFAQ.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📚</span>
                <h3>No results found</h3>
                <p>Try a different search term or browse all categories.</p>
                {searchQuery && (
                  <button
                    className="btn-secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="faq-categories">
                {filteredFAQ.map((category, catIndex) => (
                  <div key={catIndex} className="faq-category">
                    <button
                      className={`category-header ${expandedCategory === category.category ? 'expanded' : ''}`}
                      onClick={() => toggleCategory(category.category)}
                    >
                      <span className="category-title">{category.category}</span>
                      <span className="category-count">{category.questions.length}</span>
                      <span className="expand-icon">
                        {expandedCategory === category.category ? '−' : '+'}
                      </span>
                    </button>

                    {expandedCategory === category.category && (
                      <div className="faq-questions">
                        {category.questions.map((item, qIndex) => {
                          const questionKey = `${catIndex}-${qIndex}`;
                          return (
                            <div key={qIndex} className="faq-item">
                              <button
                                className={`question-header ${expandedQuestion === questionKey ? 'expanded' : ''}`}
                                onClick={() => toggleQuestion(questionKey)}
                              >
                                <span className="question-text">{item.q}</span>
                                <span className="question-icon">
                                  {expandedQuestion === questionKey ? '▲' : '▼'}
                                </span>
                              </button>
                              {expandedQuestion === questionKey && (
                                <div className="answer">
                                  <p>{item.a}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="contact-section">
            {submitResult ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Message Sent!</h3>
                <p>{submitResult.message}</p>
                <p className="ticket-id">Reference: {submitResult.ticketId}</p>
                <button
                  className="btn-primary"
                  onClick={() => setSubmitResult(null)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="contact-info">
                  <h2>Get in Touch</h2>
                  <p>
                    Have a question or need help? Fill out the form below and we'll
                    get back to you within 24-48 hours.
                  </p>
                </div>

                {formError && (
                  <div className="form-error">
                    <span>!</span>
                    {formError}
                  </div>
                )}

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Brief description of your issue"
                      maxLength={200}
                    />
                    <span className="char-count">{formData.subject.length}/200</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Please describe your issue or question in detail..."
                      rows={6}
                      maxLength={5000}
                    />
                    <span className="char-count">{formData.message.length}/5000</span>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="resources-section">
            <div className="resource-cards">
              <div className="resource-card">
                <span className="resource-icon">📖</span>
                <h3>Getting Started Guide</h3>
                <p>Learn how to set up profiles, upload content, and start learning.</p>
                <a href="#" className="resource-link">Read Guide</a>
              </div>

              <div className="resource-card">
                <span className="resource-icon">🛡️</span>
                <h3>Safety Information</h3>
                <p>Learn about our safety features and how we protect your children.</p>
                <a href="#" className="resource-link">View Safety Info</a>
              </div>

              <div className="resource-card">
                <span className="resource-icon">🔒</span>
                <h3>Privacy Policy</h3>
                <p>Understand how we handle and protect your family's data.</p>
                <a href="#" className="resource-link">Read Policy</a>
              </div>

              <div className="resource-card">
                <span className="resource-icon">📜</span>
                <h3>Terms of Service</h3>
                <p>Review our terms and conditions for using Orbit Learn.</p>
                <a href="#" className="resource-link">View Terms</a>
              </div>
            </div>

            <div className="contact-methods">
              <h2>Other Ways to Reach Us</h2>
              <div className="method-cards">
                <div className="method-card">
                  <span className="method-icon">📧</span>
                  <div className="method-info">
                    <h4>Email</h4>
                    <p>support@orbitlearn.com</p>
                  </div>
                </div>
                <div className="method-card">
                  <span className="method-icon">💬</span>
                  <div className="method-info">
                    <h4>Response Time</h4>
                    <p>24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
