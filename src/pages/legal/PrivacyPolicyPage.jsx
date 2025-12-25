import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Shield, Baby, GraduationCap, School, Cookie, Mail, Phone, MapPin } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const lastUpdated = 'December 13, 2025';
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ id, icon: Icon, title, children }) => {
    const isExpanded = expandedSections[id] !== false; // Default to expanded
    return (
      <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>
        {isExpanded && <div className="p-6 bg-white">{children}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
          <div className="text-center mb-10 pb-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orbit Learn Privacy Policy</h1>
            <p className="text-gray-500 mb-4">Last updated: {lastUpdated}</p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This Privacy Policy describes how <strong>Jasmine Entertainment Fze</strong> ("Company," "we," "us," or "our"),
              the operator of <strong>Orbit Learn</strong>, collects, uses, and protects your personal information.
            </p>
          </div>

          {/* Compliance Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-blue-600 font-semibold">COPPA</div>
              <div className="text-sm text-gray-600">US Children's Privacy</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-purple-600 font-semibold">GDPR</div>
              <div className="text-sm text-gray-600">EU Data Protection</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-green-600 font-semibold">PDPL</div>
              <div className="text-sm text-gray-600">UAE Data Protection</div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <p className="text-amber-800">
              <strong>IMPORTANT:</strong> Orbit Learn serves children ages 4-12. We take children's privacy extremely seriously.
              Please review our dedicated <strong>Children's Privacy Policy</strong> and <strong>Parental Rights</strong> sections below.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#data-controller" className="text-indigo-600 hover:underline">1. Data Controller & Contact</a>
              <a href="#info-collect" className="text-indigo-600 hover:underline">2. Information We Collect</a>
              <a href="#info-use" className="text-indigo-600 hover:underline">3. How We Use Information</a>
              <a href="#info-share" className="text-indigo-600 hover:underline">4. How We Share Information</a>
              <a href="#data-security" className="text-indigo-600 hover:underline">5. Data Security</a>
              <a href="#data-retention" className="text-indigo-600 hover:underline">6. Data Retention & Deletion</a>
              <a href="#intl-transfers" className="text-indigo-600 hover:underline">7. International Data Transfers</a>
              <a href="#your-rights" className="text-indigo-600 hover:underline">8. Your Privacy Rights</a>
              <a href="#children-privacy" className="text-indigo-600 hover:underline">Children's Privacy Policy</a>
              <a href="#parental-rights" className="text-indigo-600 hover:underline">Parental Rights (COPPA)</a>
              <a href="#teacher-privacy" className="text-indigo-600 hover:underline">Teacher Privacy Policy</a>
              <a href="#cookie-policy" className="text-indigo-600 hover:underline">Cookie Policy</a>
            </div>
          </nav>

          {/* Main Content Sections */}
          <div className="space-y-4">
            {/* Section 1: Data Controller */}
            <section id="data-controller">
              <SectionHeader id="data-controller" icon={Shield} title="1. Data Controller and Contact Information">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">Company Name</td><td className="py-2 text-gray-600">Jasmine Entertainment Fze</td></tr>
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">Service Name</td><td className="py-2 text-gray-600">Orbit Learn</td></tr>
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">Address</td><td className="py-2 text-gray-600">Publishing City, Sharjah, UAE</td></tr>
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">General Support</td><td className="py-2 text-gray-600"><a href="mailto:support@orbitlearn.app" className="text-indigo-600 hover:underline">support@orbitlearn.app</a></td></tr>
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">Privacy Inquiries</td><td className="py-2 text-gray-600"><a href="mailto:privacy@orbitlearn.app" className="text-indigo-600 hover:underline">privacy@orbitlearn.app</a></td></tr>
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">Data Protection Officer</td><td className="py-2 text-gray-600"><a href="mailto:dpo@orbitlearn.app" className="text-indigo-600 hover:underline">dpo@orbitlearn.app</a></td></tr>
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">Child Safety</td><td className="py-2 text-gray-600"><a href="mailto:safety@orbitlearn.app" className="text-indigo-600 hover:underline">safety@orbitlearn.app</a></td></tr>
                      <tr><td className="py-2 font-medium text-gray-700 pr-4">Phone</td><td className="py-2 text-gray-600">+971507493651</td></tr>
                    </tbody>
                  </table>
                </div>
              </SectionHeader>
            </section>

            {/* Section 2: Information We Collect */}
            <section id="info-collect">
              <SectionHeader id="info-collect" icon={Shield} title="2. Information We Collect">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">2.1 Information from Parents/Guardians</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Data Collected</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Purpose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr><td className="px-4 py-2 text-gray-600">Account</td><td className="px-4 py-2 text-gray-600">Email, name, password (hashed)</td><td className="px-4 py-2 text-gray-600">Authentication, communication</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">Payment</td><td className="px-4 py-2 text-gray-600">Via Stripe only</td><td className="px-4 py-2 text-gray-600">Subscription billing</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">Parental Consent</td><td className="px-4 py-2 text-gray-600">Timestamp, method, IP</td><td className="px-4 py-2 text-gray-600">COPPA compliance</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">Child Profiles</td><td className="px-4 py-2 text-gray-600">Child's first name, age, grade</td><td className="px-4 py-2 text-gray-600">Personalized education</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">2.2 Information from Children (Under 13) - With Parental Consent</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Data Collected</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Purpose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr><td className="px-4 py-2 text-gray-600">Profile</td><td className="px-4 py-2 text-gray-600">First name, age, grade</td><td className="px-4 py-2 text-gray-600">Age-appropriate content</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">Learning Activity</td><td className="px-4 py-2 text-gray-600">Progress, scores, time</td><td className="px-4 py-2 text-gray-600">Progress tracking</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">AI Tutor</td><td className="px-4 py-2 text-gray-600">Conversations with Ollie</td><td className="px-4 py-2 text-gray-600">Educational assistance</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">Content</td><td className="px-4 py-2 text-gray-600">Uploads, generated materials</td><td className="px-4 py-2 text-gray-600">Study support</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">What We DO NOT Collect from Children:</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>Full names, addresses, phone numbers</li>
                      <li>Photos/videos of child</li>
                      <li>Precise geolocation</li>
                      <li>Social security numbers</li>
                      <li>Payment information</li>
                      <li>Data for advertising</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">2.3 Information from Teachers</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Professional information</li>
                      <li>Content created (lessons, quizzes)</li>
                      <li>Student data (with authorization)</li>
                      <li>Credit usage</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">2.4 Automatically Collected</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Device type, OS, browser</li>
                      <li>Session data, IP address</li>
                      <li>Error logs</li>
                    </ul>
                    <p className="mt-3 text-sm text-green-700 font-medium">NO tracking cookies for advertising or cross-site tracking</p>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 3: How We Use Information */}
            <section id="info-use">
              <SectionHeader id="info-use" icon={Shield} title="3. How We Use Your Information">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Educational Purposes:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Generate personalized content</li>
                      <li>Power AI tutor (Ollie)</li>
                      <li>Track learning progress</li>
                      <li>Adapt to learning level</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Operations:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Account management</li>
                      <li>Billing and support</li>
                      <li>Security and safety</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">We NEVER:</h4>
                    <ul className="text-green-700 space-y-1">
                      <li>Sell personal data</li>
                      <li>Use children's data for advertising</li>
                      <li>Share data for commercial purposes</li>
                    </ul>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 4: How We Share Information */}
            <section id="info-share">
              <SectionHeader id="info-share" icon={Shield} title="4. How We Share Your Information">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Providers (Under Strict Contracts):</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li><strong>Google Cloud</strong> - Hosting, AI (UAE region for UAE users)</li>
                      <li><strong>Stripe</strong> - Payment processing</li>
                      <li><strong>ElevenLabs</strong> - Voice synthesis</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">All providers: COPPA/FERPA compliant, Data Processing Agreements, limited access</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Parents:</h3>
                    <p className="text-gray-600">Full access to all child data via Parent Dashboard</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Schools (If Applicable):</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Only with authorization</li>
                      <li>FERPA compliant</li>
                      <li>Educational purposes only</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">We NEVER Share With:</h4>
                    <ul className="text-red-700 space-y-1">
                      <li>Advertisers</li>
                      <li>Data brokers</li>
                      <li>Social media</li>
                      <li>Other children</li>
                    </ul>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 5: Data Security */}
            <section id="data-security">
              <SectionHeader id="data-security" icon={Shield} title="5. Data Security">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Technical:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>TLS/SSL encryption in transit</li>
                      <li>AES-256 encryption at rest</li>
                      <li>bcrypt password hashing</li>
                      <li>JWT authentication</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Organizational:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Employee background checks</li>
                      <li>Access controls</li>
                      <li>Security training</li>
                      <li>Incident response</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-sm text-indigo-600 font-medium">UAE: Data stored in Middle East region (me-central1)</p>
              </SectionHeader>
            </section>

            {/* Section 6: Data Retention */}
            <section id="data-retention">
              <SectionHeader id="data-retention" icon={Shield} title="6. Data Retention and Deletion">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Children's Data:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Deleted within 7 days of parent request</li>
                      <li>Auto-deleted when child turns 13 (with parent option)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Account Deletion:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Personal data deleted within 30 days</li>
                      <li>Backups deleted within 90 days</li>
                    </ul>
                  </div>
                  <p className="text-gray-600">
                    <strong>To Delete:</strong> Parent Dashboard or email{' '}
                    <a href="mailto:privacy@orbitlearn.app" className="text-indigo-600 hover:underline">privacy@orbitlearn.app</a>
                  </p>
                </div>
              </SectionHeader>
            </section>

            {/* Section 7: International Data Transfers */}
            <section id="intl-transfers">
              <SectionHeader id="intl-transfers" icon={Shield} title="7. International Data Transfers">
                <ul className="space-y-2 text-gray-600">
                  <li><strong>UAE Users:</strong> Data in Middle East region</li>
                  <li><strong>EU Users:</strong> Standard Contractual Clauses</li>
                  <li><strong>US Users:</strong> COPPA-compliant agreements</li>
                </ul>
              </SectionHeader>
            </section>

            {/* Section 8: Your Privacy Rights */}
            <section id="your-rights">
              <SectionHeader id="your-rights" icon={Shield} title="8. Your Privacy Rights">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">All Users:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Access your data</li>
                      <li>Correct inaccuracies</li>
                      <li>Delete your data</li>
                      <li>Export data (portability)</li>
                    </ul>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Parents (COPPA):</h4>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>Review child's information</li>
                        <li>Request deletion</li>
                        <li>Revoke consent</li>
                        <li>Refuse further collection</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">EU/UK (GDPR):</h4>
                      <ul className="text-purple-700 text-sm space-y-1">
                        <li>Lodge complaint with DPA</li>
                        <li>Object to processing</li>
                        <li>Data portability</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    <strong>To Exercise:</strong>{' '}
                    <a href="mailto:privacy@orbitlearn.app" className="text-indigo-600 hover:underline">privacy@orbitlearn.app</a>{' '}
                    or Parent Dashboard
                  </p>
                </div>
              </SectionHeader>
            </section>

            {/* Children's Privacy Policy */}
            <section id="children-privacy" className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Baby className="w-7 h-7 text-pink-500" />
                Children's Privacy Policy
              </h2>
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 mb-6">
                <p className="text-pink-800 font-semibold">COPPA Compliance Statement</p>
                <p className="text-pink-700 mt-2">
                  Orbit Learn complies with COPPA. We obtain verifiable parental consent before collecting children's
                  information and provide parents full control.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">What We Collect from Children (With Parental Consent):</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>First name, age, grade</li>
                    <li>Learning progress and scores</li>
                    <li>AI tutor conversations</li>
                    <li>Study materials uploaded/generated</li>
                    <li>Usage data (anonymized)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">How We Use Children's Information (Strictly Educational):</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Personalized learning</li>
                    <li>AI tutor assistance</li>
                    <li>Progress tracking</li>
                    <li>Safety filtering</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">We DO NOT:</h4>
                  <ul className="text-green-700 space-y-1">
                    <li>Advertise to children</li>
                    <li>Create behavioral profiles</li>
                    <li>Sell data</li>
                    <li>Share for commercial purposes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Verifiable Parental Consent Methods:</h3>
                  <ol className="list-decimal pl-6 text-gray-600 space-y-1">
                    <li>Credit card verification ($0.50 charge/refund)</li>
                    <li>Knowledge-based authentication</li>
                    <li>Video verification with ID</li>
                    <li>Signed consent form</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Parent Dashboard - Full Access:</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Real-time activity monitoring</li>
                    <li>Complete conversation history</li>
                    <li>All generated content</li>
                    <li>Privacy controls</li>
                    <li>Data export</li>
                    <li>Deletion controls</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">No Advertising to Children</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>Zero ads shown to children</li>
                      <li>No tracking cookies</li>
                      <li>No behavioral targeting</li>
                      <li>Subscription-based revenue only</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">No Child-to-Child Contact</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>No chat between children</li>
                      <li>No social features</li>
                      <li>No public profiles</li>
                      <li>Only Ollie AI tutor interaction</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Parental Rights */}
            <section id="parental-rights" className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="w-7 h-7 text-green-500" />
                Parental Rights (COPPA)
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: '1. Right to Notice', items: ['Clear notice before data collection', 'What we collect, how we use it', 'Who we share with'] },
                  { title: '2. Right to Consent', items: ['No collection without consent', 'Choose verification method', 'Can refuse without penalty'] },
                  { title: '3. Right to Review', items: ['Access all child\'s data', 'View AI conversations', 'See learning progress', 'Download data export'] },
                  { title: '4. Right to Delete', items: ['Delete specific content', 'Delete entire profile', 'Removed within 7 days'] },
                  { title: '5. Right to Refuse Collection', items: ['Stop new data collection', 'Keep existing data', 'Disable features'] },
                  { title: '6. Right to Revoke Consent', items: ['Withdraw consent anytime', 'Choose to keep or delete data', 'Pro-rated refund if applicable'] },
                  { title: '7. Right to Control', items: ['Content filters', 'Screen time limits', 'Feature access controls'] },
                  { title: '8. Right to No Conditioning', items: ['Can\'t require unnecessary data', 'Can\'t deny basic features', 'Can\'t charge for privacy'] },
                ].map((right, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{right.title}</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {right.items.map((item, i) => <li key={i}>• {item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-2">How to Exercise Rights:</h4>
                <p className="text-indigo-700">
                  <strong>Parent Dashboard:</strong> orbitlearn.app/parent/privacy<br />
                  <strong>Email:</strong> <a href="mailto:privacy@orbitlearn.app" className="underline">privacy@orbitlearn.app</a><br />
                  <strong>Phone:</strong> +971507493651<br />
                  <strong>Response Time:</strong> 24-48 hours
                </p>
              </div>
            </section>

            {/* Teacher Privacy Policy */}
            <section id="teacher-privacy" className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-indigo-500" />
                Teacher Privacy Policy
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Information We Collect from Teachers:</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Professional info (name, email, school)</li>
                    <li>Account and billing data</li>
                    <li>Content you create</li>
                    <li>Student data (with authorization)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">How We Use Teacher Data:</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>AI lesson generation</li>
                    <li>Automated grading</li>
                    <li>Credit management</li>
                    <li>Service improvement</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">FERPA Compliance - Orbit Learn Acts as "School Official":</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>Use data for authorized educational purposes</li>
                    <li>Maintain direct control standards</li>
                    <li>No redisclosure without authorization</li>
                    <li>Appropriate security measures</li>
                  </ul>
                </div>

                <p className="text-gray-600">
                  <strong>Contact:</strong>{' '}
                  <a href="mailto:teachers@orbitlearn.app" className="text-indigo-600 hover:underline">teachers@orbitlearn.app</a>
                </p>
              </div>
            </section>

            {/* School and FERPA */}
            <section id="school-ferpa" className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <School className="w-7 h-7 text-amber-500" />
                School and FERPA Compliance
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">School Responsibilities:</h4>
                    <ol className="text-amber-700 text-sm space-y-1 list-decimal pl-4">
                      <li>Authorize Orbit Learn for educational use</li>
                      <li>Notify parents about service</li>
                      <li>Provide our privacy policy</li>
                      <li>Maintain data governance</li>
                      <li>Execute written agreement</li>
                    </ol>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Orbit Learn's Obligations:</h4>
                    <ol className="text-green-700 text-sm space-y-1 list-decimal pl-4">
                      <li>Limited use (educational only)</li>
                      <li>Follow school's instructions</li>
                      <li>Implement security safeguards</li>
                      <li>Allow audits</li>
                      <li>Delete upon request</li>
                    </ol>
                  </div>
                </div>

                <p className="text-gray-600">
                  <strong>Data Processing Agreement available for schools:</strong>{' '}
                  <a href="mailto:schools@orbitlearn.app" className="text-indigo-600 hover:underline">schools@orbitlearn.app</a>
                </p>
              </div>
            </section>

            {/* Cookie Policy */}
            <section id="cookie-policy" className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Cookie className="w-7 h-7 text-orange-500" />
                Cookie Policy
              </h2>

              <div className="space-y-6">
                <p className="text-gray-600">
                  Cookies are small text files stored on your device to help websites function and remember your preferences.
                </p>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Strictly Necessary Cookies:</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Cookie</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Purpose</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr><td className="px-4 py-2 text-gray-600 font-mono text-xs">orbitlearn_session</td><td className="px-4 py-2 text-gray-600">Login session</td><td className="px-4 py-2 text-gray-600">7 days</td></tr>
                        <tr><td className="px-4 py-2 text-gray-600 font-mono text-xs">orbitlearn_parent_auth</td><td className="px-4 py-2 text-gray-600">Parent authentication</td><td className="px-4 py-2 text-gray-600">30 days</td></tr>
                        <tr><td className="px-4 py-2 text-gray-600 font-mono text-xs">orbitlearn_consent</td><td className="px-4 py-2 text-gray-600">Cookie consent</td><td className="px-4 py-2 text-gray-600">365 days</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">We DO NOT Use:</h4>
                  <ul className="text-green-700 space-y-1">
                    <li>Advertising cookies</li>
                    <li>Tracking cookies</li>
                    <li>Analytics cookies (for children)</li>
                    <li>Cross-site tracking</li>
                    <li>Behavioral profiling</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">For Child Profiles:</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Session cookies only (strictly necessary)</li>
                    <li>No tracking</li>
                    <li>No advertising</li>
                    <li>No cross-site identifiers</li>
                  </ul>
                </div>

                <p className="text-gray-600">
                  We respect Do Not Track signals. We don't track anyway - no behavioral tracking or advertising.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    Email Contacts
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>General Privacy:</strong> <a href="mailto:privacy@orbitlearn.app" className="text-indigo-600 hover:underline">privacy@orbitlearn.app</a></li>
                    <li><strong>Children's Privacy:</strong> <a href="mailto:coppa@orbitlearn.app" className="text-indigo-600 hover:underline">coppa@orbitlearn.app</a></li>
                    <li><strong>Child Safety:</strong> <a href="mailto:safety@orbitlearn.app" className="text-indigo-600 hover:underline">safety@orbitlearn.app</a> (24/7)</li>
                    <li><strong>Teacher Privacy:</strong> <a href="mailto:teachers@orbitlearn.app" className="text-indigo-600 hover:underline">teachers@orbitlearn.app</a></li>
                    <li><strong>School/FERPA:</strong> <a href="mailto:ferpa@orbitlearn.app" className="text-indigo-600 hover:underline">ferpa@orbitlearn.app</a></li>
                    <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@orbitlearn.app" className="text-indigo-600 hover:underline">dpo@orbitlearn.app</a></li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Company Details
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Jasmine Entertainment Fze</strong></p>
                    <p>Publishing City, Sharjah, UAE</p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> +971507493651
                    </p>
                    <p className="mt-4"><strong>Office Hours:</strong> Sunday-Thursday, 9 AM - 6 PM GST</p>
                    <p><strong>Emergency:</strong> 24/7 for child safety</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>This Privacy Policy was last updated on {lastUpdated} and is effective as of {lastUpdated}.</p>
            <p className="mt-2"><strong>Jasmine Entertainment Fze | Orbit Learn | support@orbitlearn.app</strong></p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Orbit Learn. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <Link to="/coppa" className="hover:text-gray-700">COPPA Compliance</Link>
            <Link to="/contact" className="hover:text-gray-700">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
