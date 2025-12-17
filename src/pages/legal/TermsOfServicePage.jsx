import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  BookOpen,
  Users,
  Shield,
  Heart,
  CreditCard,
  GraduationCap,
  Scale,
  Brain,
  Lock,
  Globe,
  Server,
  AlertTriangle,
  Gavel,
  HandshakeIcon,
  XCircle,
  MapPin,
  RefreshCw,
  Mail,
  Phone,
  Clock
} from 'lucide-react';

const TermsOfServicePage = () => {
  const lastUpdated = 'December 13, 2025';
  const effectiveDate = 'December 13, 2025';
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const SectionHeader = ({ id, icon: Icon, title, children }) => {
    const isExpanded = expandedSections[id] !== false; // Default to expanded

    return (
      <section className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {isExpanded && (
          <div className="p-6 bg-white">
            {children}
          </div>
        )}
      </section>
    );
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
        <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions of Service</h1>
            <p className="text-gray-500">Last updated: {lastUpdated}</p>
            <p className="text-gray-500">Effective: {effectiveDate}</p>
          </div>

          {/* Introduction */}
          <div className="bg-indigo-50 rounded-xl p-6 mb-8">
            <p className="text-gray-700 mb-4">
              <strong>Orbit Learn</strong> is owned and operated by <strong>Jasmine Entertainment Fze</strong> ("Company," "we," "us," or "our"), a company registered in Sharjah, UAE.
            </p>
            <p className="text-gray-700">
              These Terms and Conditions ("Terms") govern your access to and use of the Orbit Learn website, mobile application, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-gray-600">1. Acceptance of Terms</p>
                <p className="text-gray-600">2. Company Information</p>
                <p className="text-gray-600">3. Description of Service</p>
                <p className="text-gray-600">4. User Accounts and Eligibility</p>
                <p className="text-gray-600">5. Child Privacy and COPPA</p>
                <p className="text-gray-600">6. Parental Rights and Controls</p>
                <p className="text-gray-600">7. Payment and Subscriptions</p>
                <p className="text-gray-600">8. Teacher Portal Terms</p>
                <p className="text-gray-600">9. Educational Use and FERPA</p>
                <p className="text-gray-600">10. Intellectual Property</p>
                <p className="text-gray-600">11. Acceptable Use</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600">12. AI-Generated Content</p>
                <p className="text-gray-600">13. Data Protection and Privacy</p>
                <p className="text-gray-600">14. Third-Party Services</p>
                <p className="text-gray-600">15. Service Availability</p>
                <p className="text-gray-600">16. Disclaimer of Warranties</p>
                <p className="text-gray-600">17. Limitation of Liability</p>
                <p className="text-gray-600">18. Indemnification</p>
                <p className="text-gray-600">19. Termination</p>
                <p className="text-gray-600">20. Governing Law</p>
                <p className="text-gray-600">21. Changes to Terms</p>
                <p className="text-gray-600">22. Contact Information</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {/* Section 1: Acceptance of Terms */}
            <SectionHeader id="acceptance" icon={FileText} title="1. Acceptance of Terms">
              <p className="text-gray-600 mb-4">
                By creating an account, accessing, or using the Service, you represent that you have read, understood, and agree to be bound by these Terms, our{' '}
                <Link to="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, and our{' '}
                <Link to="/coppa" className="text-indigo-600 hover:underline">Children's Privacy Policy</Link>. If you do not agree with these Terms, you must not use the Service.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">
                  For users under 13 years of age, parental or guardian consent is required before using the Service.
                </p>
              </div>
            </SectionHeader>

            {/* Section 2: Company Information */}
            <SectionHeader id="company" icon={Building2} title="2. Company Information">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Service Name</td>
                      <td className="px-4 py-3 text-gray-600">Orbit Learn</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Legal Entity</td>
                      <td className="px-4 py-3 text-gray-600">Jasmine Entertainment Fze</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Address</td>
                      <td className="px-4 py-3 text-gray-600">Publishing City, Sharjah, UAE</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Contact Email</td>
                      <td className="px-4 py-3 text-gray-600">support@orbitlearn.app</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Contact Phone</td>
                      <td className="px-4 py-3 text-gray-600">+971507493651</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Data Protection Officer</td>
                      <td className="px-4 py-3 text-gray-600">privacy@orbitlearn.app</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionHeader>

            {/* Section 3: Description of Service */}
            <SectionHeader id="description" icon={BookOpen} title="3. Description of Service">
              <p className="text-gray-600 mb-4">
                Orbit Learn is an AI-powered educational learning platform designed for children ages 4-12 (Kindergarten through Grade 6) and their families. The Service provides:
              </p>

              <h3 className="text-md font-semibold text-gray-800 mb-3">Family/Student Portal</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li><strong>AI-Powered Content Analysis:</strong> Upload educational materials (PDFs, text content) for AI-driven analysis and learning support</li>
                <li><strong>Personalized Learning:</strong> Content adapted based on child's age (4-12) and learning level</li>
                <li><strong>Study Guides & Summaries:</strong> AI-generated study materials from uploaded content</li>
                <li><strong>Interactive Lessons:</strong> Age-appropriate formatting with visual elements</li>
                <li><strong>Multiple Child Profiles:</strong> Manage learning for multiple children (subscription tier dependent)</li>
                <li><strong>Progress Tracking:</strong> Monitor learning activity and lesson completion</li>
                <li><strong>AI Tutor (Jeffrey):</strong> Interactive AI-powered tutoring character for personalized assistance</li>
                <li><strong>Parent Dashboard:</strong> Comprehensive oversight of all child activities and content</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">Teacher Portal</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li><strong>Lesson Generation:</strong> AI-assisted lesson plan creation</li>
                <li><strong>Quiz Generation:</strong> Automatically generate quizzes from educational content</li>
                <li><strong>Flashcard Generation:</strong> Create study flashcards using AI</li>
                <li><strong>AI-Powered Grading:</strong> Automated assessment with rubrics and feedback</li>
                <li><strong>Batch Processing:</strong> Grade multiple student submissions simultaneously</li>
                <li><strong>Custom Rubrics:</strong> Create and save grading criteria</li>
                <li><strong>Credit-Based System:</strong> Token-based usage for AI operations</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  The Service is designed to supplement, not replace, formal education and works alongside British, American, Indian, and IB curricula.
                </p>
              </div>
            </SectionHeader>

            {/* Section 4: User Accounts and Eligibility */}
            <SectionHeader id="accounts" icon={Users} title="4. User Accounts and Eligibility">
              <h3 className="text-md font-semibold text-gray-800 mb-3">4.1 Account Types</h3>

              <div className="space-y-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 mb-2">Parent/Guardian Accounts</h4>
                  <ul className="list-disc pl-5 text-indigo-800 space-y-1 text-sm">
                    <li>Must be at least 18 years old</li>
                    <li>Required to create and manage child profiles</li>
                    <li>Responsible for all activity under child profiles</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Child Profiles</h4>
                  <ul className="list-disc pl-5 text-green-800 space-y-1 text-sm">
                    <li>Ages 4-12 only</li>
                    <li>Created and managed by parent/guardian accounts</li>
                    <li>Cannot be created directly by children</li>
                    <li>Subject to parental controls and monitoring</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Teacher Accounts</h4>
                  <ul className="list-disc pl-5 text-purple-800 space-y-1 text-sm">
                    <li>Must be at least 18 years old</li>
                    <li>Intended for educational professionals</li>
                    <li>Subject to verification for school-based use</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">4.2 Registration Requirements</h3>
              <p className="text-gray-600 mb-2">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Provide accurate, complete, and current information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">4.3 Parental Consent for Children</h3>
              <p className="text-gray-600 mb-2">Before creating a child profile or allowing a child under 13 to use the Service, parents/guardians must:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Provide verifiable parental consent through our verification process</li>
                <li>Acknowledge and accept our Children's Privacy Policy</li>
                <li>Understand that all child data collection complies with COPPA requirements</li>
                <li>Agree to monitor and control their child's use of the Service</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">4.4 Account Security</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Passwords are securely hashed using bcrypt</li>
                <li>Parents are responsible for safeguarding child profile access</li>
                <li>We use JWT-based authentication with secure token management</li>
                <li>Multi-factor authentication may be required for certain account actions</li>
              </ul>
            </SectionHeader>

            {/* Section 5: Child Privacy and COPPA */}
            <SectionHeader id="coppa" icon={Shield} title="5. Child Privacy and COPPA Compliance">
              <h3 className="text-md font-semibold text-gray-800 mb-3">5.1 Children's Online Privacy Protection Act (COPPA)</h3>
              <p className="text-gray-600 mb-4">
                We comply with the Children's Online Privacy Protection Act (COPPA) and related regulations for users under 13 years of age. This includes:
              </p>

              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">Verifiable Parental Consent</h4>
                <ul className="list-disc pl-5 text-green-800 space-y-1 text-sm">
                  <li>Required before collecting any personal information from children under 13</li>
                  <li>Obtained through our secure verification process</li>
                  <li>Documented and maintained in compliance with COPPA requirements</li>
                </ul>
              </div>

              <h4 className="font-medium text-gray-800 mb-2">Information Collection from Children</h4>
              <p className="text-gray-600 mb-2">We collect only the following information from children under 13:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>First name and age (for personalization)</li>
                <li>Grade level (for age-appropriate content)</li>
                <li>Learning activity data (progress, lesson completion, quiz results)</li>
                <li>AI chat interactions with Jeffrey (for educational purposes only)</li>
                <li>Content uploaded for study assistance</li>
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">Parental Rights Under COPPA</h4>
              <p className="text-gray-600 mb-2">Parents have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Review all personal information collected from their child</li>
                <li>Request deletion of their child's personal information</li>
                <li>Refuse further collection or use of their child's information</li>
                <li>Receive notice of our information practices</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Data Minimization</h4>
                <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm">
                  <li>We collect only information necessary for educational purposes</li>
                  <li>No behavioral tracking for advertising purposes</li>
                  <li>No selling or sharing of children's data with third parties for commercial purposes</li>
                  <li>No third-party analytics tracking children's activities</li>
                </ul>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">5.2 Age-Appropriate Content</h3>
              <p className="text-gray-600 mb-2">All content, including AI-generated materials, is filtered and adapted to be age-appropriate for children ages 4-12. We employ:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Multi-layer content safety filters</li>
                <li>Age-based content adaptation</li>
                <li>Parental monitoring and controls</li>
                <li>Restricted communication features (no child-to-child chat)</li>
              </ul>
            </SectionHeader>

            {/* Section 6: Parental Rights and Controls */}
            <SectionHeader id="parental" icon={Heart} title="6. Parental Rights and Controls">
              <h3 className="text-md font-semibold text-gray-800 mb-3">6.1 Comprehensive Oversight</h3>
              <p className="text-gray-600 mb-2">Parents have complete visibility and control over:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>All child activity and learning history</li>
                <li>AI-generated content shown to their child</li>
                <li>Chat interactions with the AI tutor Jeffrey</li>
                <li>Uploaded educational materials</li>
                <li>Progress and assessment data</li>
                <li>Screen time and usage patterns</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">6.2 Parent Dashboard Features</h3>
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <p className="text-indigo-800 mb-2">The Parent Dashboard provides:</p>
                <ul className="list-disc pl-5 text-indigo-800 space-y-1 text-sm">
                  <li>Real-time activity monitoring</li>
                  <li>Learning analytics and insights</li>
                  <li>Content review and approval tools</li>
                  <li>Screen time management controls</li>
                  <li>Account and subscription management</li>
                  <li>Data export and download capabilities</li>
                  <li>Privacy settings configuration</li>
                </ul>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">6.3 Data Access and Portability</h3>
              <p className="text-gray-600 mb-2">Parents may at any time:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Request a complete export of their child's data</li>
                <li>Review all collected information</li>
                <li>Request corrections to inaccurate data</li>
                <li>Delete their child's account and all associated data</li>
                <li>Transfer data to another service provider (where technically feasible)</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">6.4 Communication Preferences</h3>
              <p className="text-gray-600 mb-2">Parents control:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Email notifications and updates</li>
                <li>Progress reports frequency</li>
                <li>Alert settings for child activity</li>
                <li>Communication language preferences</li>
              </ul>
            </SectionHeader>

            {/* Section 7: Payment, Subscriptions, and Usage Limits */}
            <SectionHeader id="payment" icon={CreditCard} title="7. Payment, Subscriptions, and Usage Limits">
              <p className="text-gray-600 mb-4">
                Pricing is denominated in USD (United States Dollars). We reserve the right to modify features and pricing upon notice.
              </p>

              <h3 className="text-md font-semibold text-gray-800 mb-3">7.1 Family Portal Subscription Tiers</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-indigo-900">Tier</th>
                      <th className="px-4 py-3 text-left font-semibold text-indigo-900">Monthly</th>
                      <th className="px-4 py-3 text-left font-semibold text-indigo-900">Annual</th>
                      <th className="px-4 py-3 text-left font-semibold text-indigo-900">Children</th>
                      <th className="px-4 py-3 text-left font-semibold text-indigo-900">Lessons/Mo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-medium">FREE</td>
                      <td className="px-4 py-3">$0</td>
                      <td className="px-4 py-3">$0</td>
                      <td className="px-4 py-3">1</td>
                      <td className="px-4 py-3">10</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium">FAMILY</td>
                      <td className="px-4 py-3">$7.99</td>
                      <td className="px-4 py-3">$57.99 <span className="text-green-600 text-xs">(40% off)</span></td>
                      <td className="px-4 py-3">2</td>
                      <td className="px-4 py-3">Unlimited</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-medium">FAMILY PLUS</td>
                      <td className="px-4 py-3">$14.99</td>
                      <td className="px-4 py-3">$107.99 <span className="text-green-600 text-xs">(40% off)</span></td>
                      <td className="px-4 py-3">4</td>
                      <td className="px-4 py-3">Unlimited</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">7.2 Teacher Portal Subscription Tiers</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Tier</th>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Monthly</th>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Annual</th>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Credits/Mo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-medium">FREE (Teacher Starter)</td>
                      <td className="px-4 py-3">$0</td>
                      <td className="px-4 py-3">$0</td>
                      <td className="px-4 py-3">100</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium">BASIC (Teacher Plus)</td>
                      <td className="px-4 py-3">$9.99</td>
                      <td className="px-4 py-3">$95.90 <span className="text-green-600 text-xs">(20% off)</span></td>
                      <td className="px-4 py-3">500</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-medium">PRO (Teacher Pro)</td>
                      <td className="px-4 py-3">$24.99</td>
                      <td className="px-4 py-3">$239.90 <span className="text-green-600 text-xs">(20% off)</span></td>
                      <td className="px-4 py-3">2,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">7.3 Teacher Credit Packs (One-Time Purchase)</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-green-900">Pack</th>
                      <th className="px-4 py-3 text-left font-semibold text-green-900">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-green-900">Per Credit</th>
                      <th className="px-4 py-3 text-left font-semibold text-green-900">Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-white">
                      <td className="px-4 py-3">100 Credits</td>
                      <td className="px-4 py-3">$4.99</td>
                      <td className="px-4 py-3">$0.050</td>
                      <td className="px-4 py-3">-</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3">300 Credits</td>
                      <td className="px-4 py-3">$12.99</td>
                      <td className="px-4 py-3">$0.043</td>
                      <td className="px-4 py-3 text-green-600">13%</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3">500 Credits</td>
                      <td className="px-4 py-3">$19.99</td>
                      <td className="px-4 py-3">$0.040</td>
                      <td className="px-4 py-3 text-green-600">20%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">7.4 Billing and Payment</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li><strong>Payment Processing:</strong> Handled securely by Stripe. We do not store full payment card details.</li>
                <li><strong>Billing Cycle:</strong> Subscriptions are billed monthly or annually in advance</li>
                <li><strong>Automatic Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
                <li><strong>Cancellation:</strong> You may cancel at any time; access continues until end of billing period</li>
                <li><strong>Free Trial:</strong> 7-day free trial available for Family and Teacher paid tiers</li>
                <li><strong>No Payment Required for Trial:</strong> Credit card required to start trial but not charged until trial ends</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">7.5 Usage Limits and Restrictions</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 mb-2">Family Portal</h4>
                  <ul className="list-disc pl-5 text-indigo-800 space-y-1 text-sm">
                    <li>Lesson generation limits apply to Free tier only</li>
                    <li>Child profile limits enforced per subscription tier</li>
                    <li>Fair use policy applies to prevent abuse</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Teacher Portal</h4>
                  <ul className="list-disc pl-5 text-purple-800 space-y-1 text-sm">
                    <li>Credit system limits AI operations</li>
                    <li>Unused credits roll over (up to plan maximum)</li>
                    <li>Credits expire after 12 months of inactivity</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">7.6 Refund Policy</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 mb-2"><strong>Paid Subscriptions:</strong></p>
                <ul className="list-disc pl-5 text-amber-800 space-y-1 text-sm">
                  <li>Monthly subscriptions: Pro-rated refunds available within first 14 days</li>
                  <li>Annual subscriptions: Pro-rated refunds available within first 30 days</li>
                  <li>Refund requests must be submitted via support@orbitlearn.app</li>
                  <li>Refunds processed within 10 business days</li>
                </ul>
                <p className="text-amber-800 mt-2"><strong>Credit Packs:</strong> No refunds on purchased credit packs after purchase</p>
              </div>
            </SectionHeader>

            {/* Section 8: Teacher Portal Terms */}
            <SectionHeader id="teacher" icon={GraduationCap} title="8. Teacher Portal Terms">
              <h3 className="text-md font-semibold text-gray-800 mb-3">8.1 Intended Use</h3>
              <p className="text-gray-600 mb-2">The Teacher Portal is designed exclusively for:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Licensed educational professionals</li>
                <li>Tutors and educators</li>
                <li>Homeschool parents acting as primary educators</li>
                <li>Educational content creators</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">8.2 School and District Use</h3>
              <p className="text-gray-600 mb-4">
                Teachers may use the Service for classroom purposes with appropriate school authorization. Schools acting on behalf of teachers must ensure compliance with all applicable education privacy laws, including FERPA.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">COPPA Compliance for Schools</h4>
                <p className="text-blue-800 mb-2">When schools provide consent on behalf of parents under COPPA:</p>
                <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm">
                  <li>Use must be solely for educational purposes</li>
                  <li>No commercial use of student data</li>
                  <li>Schools must notify parents of the Service's data practices</li>
                  <li>Schools must provide our privacy notices to parents</li>
                </ul>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">8.3 Student Data Protection</h3>
              <p className="text-gray-600 mb-2">Teachers using the Service agree to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Obtain necessary permissions from schools and parents</li>
                <li>Use student data only for educational purposes</li>
                <li>Not share student data with unauthorized third parties</li>
                <li>Comply with FERPA and all applicable student privacy laws</li>
                <li>Delete student data when no longer needed for educational purposes</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">8.4 AI Grading Limitations</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 mb-2">AI-powered grading is provided as an assistance tool:</p>
                <ul className="list-disc pl-5 text-amber-800 space-y-1 text-sm">
                  <li>Teachers remain solely responsible for final grades</li>
                  <li>AI confidence scores indicate reliability of automated grading</li>
                  <li>Human review required for all high-stakes assessments</li>
                  <li>AI grading should not replace teacher judgment</li>
                  <li>Results may require verification and adjustment</li>
                </ul>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">8.5 Credit System Terms</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Credits are non-transferable between accounts</li>
                <li>Credits expire after 12 months of account inactivity</li>
                <li>Credit rollover subject to plan maximum limits</li>
                <li>No refunds for unused credits</li>
                <li>Credit usage tracked and reported in account dashboard</li>
              </ul>
            </SectionHeader>

            {/* Section 9: Educational Use and FERPA */}
            <SectionHeader id="ferpa" icon={Scale} title="9. Educational Use and FERPA Compliance">
              <h3 className="text-md font-semibold text-gray-800 mb-3">9.1 Family Educational Rights and Privacy Act (FERPA)</h3>
              <p className="text-gray-600 mb-4">For schools and teachers using Orbit Learn:</p>

              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">We Act as a School Official</h4>
                <p className="text-green-800 mb-2">When processing student education records on behalf of schools, we act under the "school official" exception to FERPA, meaning:</p>
                <ul className="list-disc pl-5 text-green-800 space-y-1 text-sm">
                  <li>We use student data only for authorized educational purposes</li>
                  <li>We maintain direct control standards required by FERPA</li>
                  <li>We do not redisclose student education records without school authorization</li>
                  <li>We implement appropriate security measures to protect student data</li>
                </ul>
              </div>

              <h4 className="font-medium text-gray-800 mb-2">School Responsibilities</h4>
              <p className="text-gray-600 mb-2">Schools using the Service must:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Have a legitimate educational interest in using the Service</li>
                <li>Provide appropriate notice to parents about the Service</li>
                <li>Maintain a written agreement with us (available upon request)</li>
                <li>Ensure use complies with their FERPA obligations</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">9.2 Education Records Protection</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 mb-2">What We Consider Education Records</h4>
                  <ul className="list-disc pl-5 text-indigo-800 space-y-1 text-sm">
                    <li>Student work uploaded for grading</li>
                    <li>Assessment results and grades</li>
                    <li>Learning progress data</li>
                    <li>Student-teacher communications within the platform</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Protection Measures</h4>
                  <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm">
                    <li>Encrypted data transmission and storage</li>
                    <li>Access controls and authentication</li>
                    <li>Regular security audits</li>
                    <li>Audit logging of all access to education records</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">9.3 Parent and Eligible Student Rights</h3>
              <p className="text-gray-600 mb-2">Under FERPA, parents and eligible students (18+ or in postsecondary education) have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Inspect and review education records</li>
                <li>Request amendment of inaccurate records</li>
                <li>Consent to disclosure of education records</li>
                <li>File complaints with the U.S. Department of Education</li>
              </ul>
            </SectionHeader>

            {/* Section 10: Intellectual Property */}
            <SectionHeader id="ip" icon={FileText} title="10. Intellectual Property and Content Ownership">
              <h3 className="text-md font-semibold text-gray-800 mb-3">10.1 User Content Ownership</h3>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">You Retain Ownership</h4>
                <ul className="list-disc pl-5 text-green-800 space-y-1 text-sm">
                  <li>Educational materials you upload (PDFs, documents, text)</li>
                  <li>Study materials created by children</li>
                  <li>Original work submitted for grading</li>
                  <li>Parent-created content and notes</li>
                </ul>
              </div>

              <h4 className="font-medium text-gray-800 mb-2">License You Grant Us</h4>
              <p className="text-gray-600 mb-2">By submitting content to Orbit Learn, you grant us a worldwide, royalty-free, non-exclusive license to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Process content through our AI services</li>
                <li>Store content on our servers</li>
                <li>Display content back to you and authorized users</li>
                <li>Use content to improve our AI models and services (aggregated and de-identified only)</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">10.2 AI-Generated Content</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>You receive a non-exclusive, worldwide, royalty-free license to use AI-generated educational content</li>
                <li>Content generated for you may be used for your educational purposes</li>
                <li>We cannot guarantee exclusive rights (similar content may be generated for other users)</li>
                <li>Commercial redistribution of AI-generated content requires written permission</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">10.3 Orbit Learn Intellectual Property</h3>
              <p className="text-gray-600 mb-2">All rights, title, and interest in and to the Service, including:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Platform design and functionality</li>
                <li>AI tutor character (Jeffrey) and personality</li>
                <li>Proprietary algorithms and models</li>
                <li>Trademarks, logos, and branding</li>
                <li>Interface design and user experience</li>
              </ul>
              <p className="text-gray-600">These remain the exclusive property of Jasmine Entertainment Fze.</p>
            </SectionHeader>

            {/* Section 11: Acceptable Use */}
            <SectionHeader id="acceptable" icon={AlertTriangle} title="11. Acceptable Use and Prohibited Conduct">
              <h3 className="text-md font-semibold text-gray-800 mb-3">11.1 Prohibited Content</h3>
              <p className="text-gray-600 mb-2">You agree not to upload, generate, or transmit any content that:</p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Is Illegal or Harmful</h4>
                  <ul className="list-disc pl-5 text-red-800 space-y-1 text-sm">
                    <li>Violates any law or regulation</li>
                    <li>Infringes intellectual property rights</li>
                    <li>Contains malware, viruses, or harmful code</li>
                    <li>Constitutes fraud or misrepresentation</li>
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">Is Inappropriate for Children</h4>
                  <ul className="list-disc pl-5 text-orange-800 space-y-1 text-sm">
                    <li>Sexually explicit or pornographic material</li>
                    <li>Violent or graphic content</li>
                    <li>Promotes self-harm or dangerous activities</li>
                    <li>Contains hate speech or discrimination</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">11.2 Prohibited Activities</h3>
              <p className="text-gray-600 mb-2">You may not:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Attempt to bypass usage limits or restrictions</li>
                <li>Share accounts or credentials (except parent-child)</li>
                <li>Use automated tools to access the Service (bots, scrapers)</li>
                <li>Overwhelm or interfere with Service infrastructure</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Generate content for prohibited purposes</li>
                <li>Use AI to create misleading or false educational materials</li>
                <li>Use the Service to circumvent academic integrity policies</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">11.3 Child Safety Requirements</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-amber-900 mb-2">Children Are Prohibited From:</h4>
                <ul className="list-disc pl-5 text-amber-800 space-y-1 text-sm">
                  <li>Sharing personal information (full name, address, phone, school name)</li>
                  <li>Attempting to communicate with other children</li>
                  <li>Accessing teacher or administrative features</li>
                  <li>Creating accounts without parental permission</li>
                </ul>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">11.4 Enforcement and Consequences</h3>
              <p className="text-gray-600 mb-2">Violations may result in:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Content removal</li>
                <li>Feature restrictions</li>
                <li>Account suspension or termination</li>
                <li>Legal action for serious violations</li>
                <li>Reporting to authorities for illegal content</li>
              </ul>
            </SectionHeader>

            {/* Section 12: AI-Generated Content */}
            <SectionHeader id="ai" icon={Brain} title="12. AI-Generated Content and Safety">
              <h3 className="text-md font-semibold text-gray-800 mb-3">12.1 AI Service Providers</h3>
              <p className="text-gray-600 mb-2">Our AI features are powered by:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li><strong>Google Gemini AI:</strong> Content generation, chat tutor, analysis</li>
                <li><strong>Google Vertex AI:</strong> Image generation (Imagen), video generation (Veo)</li>
                <li><strong>Google Cloud Text-to-Speech:</strong> Voice narration</li>
                <li><strong>ElevenLabs:</strong> Advanced voice synthesis</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">12.2 Multi-Layer Safety System</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Input Filtering</h4>
                  <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm">
                    <li>Content scanned for inappropriate material</li>
                    <li>Blocked: violence, explicit material, hate speech</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Generation Guardrails</h4>
                  <ul className="list-disc pl-5 text-green-800 space-y-1 text-sm">
                    <li>Age-appropriate content filters</li>
                    <li>Educational purpose verification</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">12.3 Age-Appropriate Adaptations</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 mb-2">Young Learners (4-7)</h4>
                  <ul className="list-disc pl-5 text-indigo-800 space-y-1 text-sm">
                    <li>Larger fonts and increased spacing</li>
                    <li>Vibrant colors and more visual elements</li>
                    <li>Simpler vocabulary and sentence structure</li>
                    <li>More interactive and playful elements</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Older Students (8-12)</h4>
                  <ul className="list-disc pl-5 text-purple-800 space-y-1 text-sm">
                    <li>Standard formatting with detailed content</li>
                    <li>Grade-level appropriate complexity</li>
                    <li>More advanced vocabulary</li>
                    <li>Enhanced study features</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">12.4 Limitations and Disclaimers</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 mb-2"><strong>AI-Generated Content May:</strong></p>
                <ul className="list-disc pl-5 text-amber-800 space-y-1 text-sm mb-3">
                  <li>Contain factual errors or inaccuracies</li>
                  <li>Lack complete contextual understanding</li>
                  <li>Produce unexpected or inappropriate outputs despite filtering</li>
                  <li>Reflect biases present in training data</li>
                </ul>
                <p className="text-amber-800"><strong>Your Responsibilities:</strong> Review AI-generated content for accuracy, verify information for educational purposes, report inaccurate or inappropriate content, and supervise children's interactions with AI features.</p>
              </div>
            </SectionHeader>

            {/* Section 13: Data Protection and Privacy */}
            <SectionHeader id="privacy" icon={Lock} title="13. Data Protection and Privacy">
              <h3 className="text-md font-semibold text-gray-800 mb-3">13.1 Applicable Privacy Laws</h3>
              <p className="text-gray-600 mb-2">We comply with multiple data protection regulations:</p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">United States</h4>
                  <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm">
                    <li>COPPA</li>
                    <li>FERPA</li>
                    <li>State privacy laws</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 mb-2">European Union</h4>
                  <ul className="list-disc pl-5 text-indigo-800 space-y-1 text-sm">
                    <li>GDPR</li>
                    <li>Enhanced protections for children under 16</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">UAE</h4>
                  <ul className="list-disc pl-5 text-green-800 space-y-1 text-sm">
                    <li>PDPL (Federal Decree-Law No. 45)</li>
                    <li>Data residency requirements</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">13.2 Data Security</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Technical Measures</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                    <li>Encryption in transit (TLS/SSL) and at rest (AES-256)</li>
                    <li>Secure authentication (bcrypt, JWT tokens)</li>
                    <li>Regular security audits</li>
                    <li>DDoS protection</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Organizational Measures</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                    <li>Employee training on data protection</li>
                    <li>Access controls and least-privilege</li>
                    <li>Background checks for employees</li>
                    <li>Incident response procedures</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium">UAE Data Residency</p>
                <p className="text-green-700 text-sm">For UAE-based users, data is stored in Middle East region (me-central1) to comply with PDPL requirements.</p>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">13.3 Your Privacy Rights</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request data deletion</li>
                <li>Export your data (portability)</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to certain processing</li>
              </ul>
              <p className="text-gray-600 mt-4">
                For complete details on our data practices, please review our{' '}
                <Link to="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</Link> and{' '}
                <Link to="/coppa" className="text-indigo-600 hover:underline">Children's Privacy Policy</Link>.
              </p>
            </SectionHeader>

            {/* Section 14: Third-Party Services */}
            <SectionHeader id="thirdparty" icon={Globe} title="14. Third-Party Services">
              <p className="text-gray-600 mb-4">The Service integrates with and relies upon various third-party providers:</p>

              <h3 className="text-md font-semibold text-gray-800 mb-3">14.1 AI and Technology Providers</h3>
              <div className="space-y-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Google Cloud Platform</h4>
                  <p className="text-blue-800 text-sm">Hosting and infrastructure, Vertex AI (Gemini, Imagen, Veo), Cloud Text-to-Speech, Data storage. Location: Middle East region (me-central1) for UAE users.</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">ElevenLabs</h4>
                  <p className="text-purple-800 text-sm">Advanced voice synthesis, multilingual text-to-speech, child-friendly voice options.</p>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">14.2 Payment Processing</h3>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900">Stripe</h4>
                <p className="text-green-800 text-sm">Payment processing for subscriptions, credit card handling and PCI compliance, subscription management. We do not store full payment card details.</p>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">14.3 No Third-Party Advertising</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">We do not:</p>
                <ul className="list-disc pl-5 text-red-700 space-y-1 text-sm">
                  <li>Display third-party advertising to children</li>
                  <li>Use behavioral tracking for advertising purposes</li>
                  <li>Share child data with advertising networks</li>
                  <li>Allow third-party analytics tracking of children</li>
                </ul>
              </div>
            </SectionHeader>

            {/* Section 15: Service Availability */}
            <SectionHeader id="availability" icon={Server} title="15. Service Availability and Modifications">
              <h3 className="text-md font-semibold text-gray-800 mb-3">15.1 Service Availability</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>We strive for 99.5% uptime for paid subscriptions</li>
                <li>Scheduled maintenance announced in advance</li>
                <li>Emergency maintenance may occur without notice</li>
                <li>Service provided "as available" - no guarantee of uninterrupted access</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">15.2 Service Modifications</h3>
              <p className="text-gray-600 mb-2">We reserve the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Modify, update, or discontinue features</li>
                <li>Change AI models or capabilities</li>
                <li>Update content generation algorithms</li>
                <li>Adjust usage limits or pricing</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Notice Requirements</h4>
                <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm">
                  <li><strong>Material changes:</strong> 30 days advance notice</li>
                  <li><strong>Security updates:</strong> May be implemented immediately</li>
                  <li><strong>Feature improvements:</strong> May be implemented without notice</li>
                </ul>
              </div>
            </SectionHeader>

            {/* Section 16: Disclaimer of Warranties */}
            <SectionHeader id="warranties" icon={AlertTriangle} title="16. Disclaimer of Warranties">
              <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
                <p className="text-gray-800 uppercase font-bold mb-2">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </p>
              </div>

              <p className="text-gray-600 mb-2">To the fullest extent permitted by law, we disclaim all warranties, including but not limited to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy or reliability</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Educational Outcomes</h4>
                <ul className="list-disc pl-5 text-amber-800 space-y-1 text-sm">
                  <li>We do not warrant or guarantee any learning outcomes</li>
                  <li>Results will vary based on individual circumstances</li>
                  <li>Service is supplemental to, not replacement for, formal education</li>
                </ul>
              </div>
            </SectionHeader>

            {/* Section 17: Limitation of Liability */}
            <SectionHeader id="liability" icon={Gavel} title="17. Limitation of Liability">
              <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
                <p className="text-gray-800 uppercase">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">17.1 Exclusion of Damages</h3>
              <p className="text-gray-600 mb-2">We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Loss of profits or revenue</li>
                <li>Loss of data or content</li>
                <li>Loss of business opportunity</li>
                <li>Educational setbacks or impacts</li>
                <li>Emotional distress</li>
                <li>Reputational harm</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">17.2 Cap on Liability</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800">Our total liability to you for any claims arising from or related to the Service shall not exceed the greater of:</p>
                <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm mt-2">
                  <li>The amount you paid to us in the 12 months preceding the claim, OR</li>
                  <li>$100 USD</li>
                </ul>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">17.3 Exceptions</h3>
              <p className="text-gray-600 mb-2">This limitation does not apply to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Gross negligence or willful misconduct</li>
                <li>Death or personal injury caused by our negligence</li>
                <li>Fraud or fraudulent misrepresentation</li>
                <li>Violations of applicable law that cannot be limited</li>
              </ul>
            </SectionHeader>

            {/* Section 18: Indemnification */}
            <SectionHeader id="indemnification" icon={HandshakeIcon} title="18. Indemnification">
              <p className="text-gray-600 mb-4">
                You agree to indemnify, defend, and hold harmless Jasmine Entertainment Fze, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Your Use of the Service</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any law or regulation</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Content you upload or generate</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Content You Provide</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                    <li>Copyright infringement</li>
                    <li>Violation of privacy rights</li>
                    <li>Defamation or libel</li>
                    <li>Any illegal or harmful content</li>
                  </ul>
                </div>
              </div>
            </SectionHeader>

            {/* Section 19: Termination */}
            <SectionHeader id="termination" icon={XCircle} title="19. Termination">
              <h3 className="text-md font-semibold text-gray-800 mb-3">19.1 Termination by You</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>You may delete your account at any time via account settings</li>
                <li>Email support@orbitlearn.app to request account deletion</li>
                <li>All data will be deleted within 90 days</li>
                <li>Cancel subscriptions at any time; access continues until end of current billing period</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">19.2 Termination by Us</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">With Notice</h4>
                  <ul className="list-disc pl-5 text-amber-800 space-y-1 text-sm">
                    <li>Non-payment of subscription fees (7-day notice)</li>
                    <li>Violation of Terms (warning first, if appropriate)</li>
                    <li>Inactivity (12 months notice)</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Immediate Termination</h4>
                  <ul className="list-disc pl-5 text-red-800 space-y-1 text-sm">
                    <li>Serious Terms violations</li>
                    <li>Illegal activity</li>
                    <li>Harm to other users or children</li>
                    <li>Fraud or abuse</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">19.3 Effect of Termination</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Immediate loss of access to Service</li>
                <li>Data export available for 30 days (if requested before termination)</li>
                <li>Data deleted according to our retention policies</li>
                <li>Outstanding fees remain due</li>
                <li>Credit balances forfeited (teachers)</li>
              </ul>
            </SectionHeader>

            {/* Section 20: Governing Law */}
            <SectionHeader id="law" icon={MapPin} title="20. Governing Law and Jurisdiction">
              <h3 className="text-md font-semibold text-gray-800 mb-3">20.1 Governing Law</h3>
              <p className="text-gray-600 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the Emirate of Sharjah and the Federal Laws of the United Arab Emirates, without regard to conflict of law principles.
              </p>

              <h3 className="text-md font-semibold text-gray-800 mb-3">20.2 Dispute Resolution</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Informal Resolution</h4>
                <p className="text-blue-800 text-sm">Before filing any claim, you agree to contact us at legal@orbitlearn.app to attempt to resolve the dispute informally for at least 30 days.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">For UAE Users</h4>
                  <ul className="list-disc pl-5 text-green-800 space-y-1 text-sm">
                    <li>The competent courts of Sharjah, UAE</li>
                    <li>Subject to mandatory arbitration provisions if applicable</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 mb-2">For Non-UAE Users</h4>
                  <ul className="list-disc pl-5 text-indigo-800 space-y-1 text-sm">
                    <li>Arbitration as described in full Terms</li>
                    <li>The courts where you reside (for consumer protection matters)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Class Action Waiver</h4>
                <p className="text-amber-800 text-sm">All disputes must be brought individually; class actions, class arbitrations, and representative actions are not permitted.</p>
              </div>
            </SectionHeader>

            {/* Section 21: Changes to Terms */}
            <SectionHeader id="changes" icon={RefreshCw} title="21. Changes to Terms">
              <h3 className="text-md font-semibold text-gray-800 mb-3">21.1 Modification Rights</h3>
              <p className="text-gray-600 mb-4">We reserve the right to modify these Terms at any time.</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Notice of Changes</h4>
                <ul className="list-disc pl-5 text-blue-800 space-y-1 text-sm">
                  <li><strong>Material changes:</strong> 30 days advance notice via email and in-app notification</li>
                  <li><strong>Non-material changes:</strong> Notice via website posting</li>
                  <li><strong>Emergency changes (security, legal):</strong> Immediate implementation</li>
                </ul>
              </div>

              <h4 className="font-medium text-gray-800 mb-2">Acceptance of Changes</h4>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
                <li>Continued use after effective date constitutes acceptance</li>
                <li>Right to terminate account if you disagree with changes</li>
                <li>Pro-rated refunds for annual subscriptions (material changes only)</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mb-3">21.2 Version History</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Current version: December 13, 2025</li>
                <li>Previous versions available upon request</li>
                <li>Archive maintained for legal and compliance purposes</li>
              </ul>
            </SectionHeader>

            {/* Section 22: Contact Information */}
            <SectionHeader id="contact" icon={Mail} title="22. Contact Information">
              <h3 className="text-md font-semibold text-gray-800 mb-3">22.1 General Support</h3>
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span className="text-indigo-800">support@orbitlearn.app</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-indigo-600" />
                      <span className="text-indigo-800">+971507493651</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span className="text-indigo-800">Publishing City, Sharjah, UAE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span className="text-indigo-800">Sun-Thu, 9 AM - 6 PM GST</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mb-3">22.2 Specialized Contacts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Privacy & Data Protection</td>
                      <td className="px-4 py-3 text-gray-600">privacy@orbitlearn.app</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Data Protection Officer</td>
                      <td className="px-4 py-3 text-gray-600">dpo@orbitlearn.app</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Child Safety (24/7)</td>
                      <td className="px-4 py-3 text-gray-600">safety@orbitlearn.app</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">COPPA and FERPA</td>
                      <td className="px-4 py-3 text-gray-600">compliance@orbitlearn.app</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Teacher Portal Support</td>
                      <td className="px-4 py-3 text-gray-600">teachers@orbitlearn.app</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Billing & Subscriptions</td>
                      <td className="px-4 py-3 text-gray-600">billing@orbitlearn.app</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Legal Matters</td>
                      <td className="px-4 py-3 text-gray-600">legal@orbitlearn.app</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionHeader>
          </div>

          {/* Acknowledgment */}
          <div className="bg-indigo-100 rounded-xl p-6 mt-8">
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">Acknowledgment</h2>
            <p className="text-indigo-800 mb-4">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
            </p>
            <p className="text-indigo-800 mb-4">
              If you are a parent or guardian creating an account for your child, you represent that you have the authority to agree to these Terms on behalf of your child.
            </p>
            <p className="text-indigo-800">
              If you are a teacher or school official, you represent that you have the authority to agree to these Terms on behalf of your institution and that your use complies with all applicable educational privacy laws.
            </p>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm mb-2">
              <strong>Last Updated:</strong> {lastUpdated} | <strong>Effective Date:</strong> {effectiveDate} | <strong>Version:</strong> 1.0
            </p>
            <p className="text-gray-600 font-medium">
              Jasmine Entertainment Fze
            </p>
            <p className="text-gray-500 text-sm">
              Publishing City, Sharjah, UAE | support@orbitlearn.app
            </p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Orbit Learn. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy-policy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link to="/coppa" className="hover:text-gray-700">COPPA Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfServicePage;
