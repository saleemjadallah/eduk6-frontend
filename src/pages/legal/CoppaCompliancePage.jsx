import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Shield, Lock, Eye, Trash2, Download, ChevronDown, ChevronUp,
  Baby, Users, FileText, Bell, CheckCircle, XCircle, MessageCircle,
  School, AlertTriangle, Mail, Phone, MapPin, Clock
} from 'lucide-react';

const CoppaCompliancePage = () => {
  const lastUpdated = 'December 13, 2025';
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ id, icon: Icon, title, children, defaultOpen = true }) => {
    const isExpanded = expandedSections[id] !== undefined ? expandedSections[id] : defaultOpen;
    return (
      <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-green-600" />}
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
            <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-2xl mb-4">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orbit Learn Children's Privacy Policy</h1>
            <p className="text-lg text-green-600 font-medium mb-2">COPPA Compliance</p>
            <p className="text-gray-500">Last updated: {lastUpdated}</p>
          </div>

          {/* COPPA Statement */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-green-900 mb-3">COPPA Compliance Statement</h2>
            <p className="text-green-800">
              Orbit Learn is committed to protecting the privacy and safety of children under 13 years of age.
              This Children's Privacy Policy has been designed to comply with the Children's Online Privacy
              Protection Act (COPPA) and explains our information collection, use, and disclosure practices
              regarding children under 13.
            </p>
          </div>

          {/* Operator Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Operator Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-gray-700">Service Name:</span> <span className="text-gray-600">Orbit Learn</span></div>
              <div><span className="font-medium text-gray-700">Operator:</span> <span className="text-gray-600">Jasmine Entertainment Fze</span></div>
              <div><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-600">Publishing City, Sharjah, UAE</span></div>
              <div><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-600">+971507493651</span></div>
              <div><span className="font-medium text-gray-700">General Contact:</span> <a href="mailto:support@orbitlearn.app" className="text-green-600 hover:underline">support@orbitlearn.app</a></div>
              <div><span className="font-medium text-gray-700">COPPA Inquiries:</span> <a href="mailto:coppa@orbitlearn.app" className="text-green-600 hover:underline">coppa@orbitlearn.app</a></div>
              <div><span className="font-medium text-gray-700">Child Safety:</span> <a href="mailto:safety@orbitlearn.app" className="text-green-600 hover:underline">safety@orbitlearn.app</a></div>
              <div><span className="font-medium text-gray-700">Support Hours:</span> <span className="text-gray-600">24/7 for urgent child safety</span></div>
            </div>
          </div>

          {/* Quick Navigation */}
          <nav className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#what-is-coppa" className="text-blue-600 hover:underline">1. What is COPPA?</a>
              <a href="#how-we-comply" className="text-blue-600 hover:underline">2. How We Comply</a>
              <a href="#info-collect" className="text-blue-600 hover:underline">3. Information We Collect</a>
              <a href="#how-collect" className="text-blue-600 hover:underline">4. How We Collect</a>
              <a href="#how-use" className="text-blue-600 hover:underline">5. How We Use Information</a>
              <a href="#disclosure" className="text-blue-600 hover:underline">6. How We Disclose</a>
              <a href="#parental-consent" className="text-blue-600 hover:underline">7. Parental Consent</a>
              <a href="#parental-rights" className="text-blue-600 hover:underline">8. Parental Rights</a>
              <a href="#parent-dashboard" className="text-blue-600 hover:underline">9. Parent Dashboard</a>
              <a href="#data-security" className="text-blue-600 hover:underline">10. Data Security</a>
              <a href="#data-retention" className="text-blue-600 hover:underline">11. Data Retention</a>
              <a href="#no-advertising" className="text-blue-600 hover:underline">12. No Advertising</a>
              <a href="#no-communication" className="text-blue-600 hover:underline">13. No Child-to-Child Communication</a>
              <a href="#school-use" className="text-blue-600 hover:underline">14. School Use</a>
            </div>
          </nav>

          {/* Main Content Sections */}
          <div className="space-y-4">
            {/* Section 1: What is COPPA */}
            <section id="what-is-coppa">
              <SectionHeader id="what-is-coppa" icon={FileText} title="1. What is COPPA?">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    The Children's Online Privacy Protection Act (COPPA) is a United States federal law enacted in 1998
                    and enforced by the Federal Trade Commission (FTC). COPPA applies to operators of commercial websites
                    and online services that are either:
                  </p>
                  <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                    <li><strong>Directed to children under 13 years of age</strong>, or</li>
                    <li><strong>Have actual knowledge that they are collecting personal information from children under 13</strong></li>
                  </ol>
                  <p className="text-gray-600">
                    Orbit Learn is designed for children ages 4-12 and is therefore a child-directed service subject to COPPA requirements.
                  </p>

                  <div className="bg-green-50 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-green-800 mb-3">COPPA's Main Requirements:</h4>
                    <ul className="space-y-2 text-green-700">
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /> Provide clear notice to parents about information collection practices</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /> Obtain verifiable parental consent before collecting children's personal information</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /> Give parents the right to review collected information</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /> Give parents the opportunity to prevent further collection</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /> Limit collection to what is reasonably necessary</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /> Maintain reasonable security for collected information</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /> Retain children's information only as long as necessary</li>
                    </ul>
                  </div>
                  <p className="text-gray-600 font-medium">
                    Orbit Learn complies with all COPPA requirements and has implemented enhanced protections beyond what is legally required.
                  </p>
                </div>
              </SectionHeader>
            </section>

            {/* Section 2: How We Comply */}
            <section id="how-we-comply">
              <SectionHeader id="how-we-comply" icon={Shield} title="2. How Orbit Learn Complies with COPPA">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Before Collection:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>✓ No personal information collected without verifiable parental consent</li>
                      <li>✓ Clear notice to parents about our data practices</li>
                      <li>✓ Multiple consent verification methods offered</li>
                      <li>✓ Age screening to identify users under 13</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">During Use:</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>✓ Data minimization - collect only what's necessary</li>
                      <li>✓ No conditioning participation on providing excess info</li>
                      <li>✓ Multi-layer content safety filtering</li>
                      <li>✓ No behavioral tracking for advertising</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Parental Control:</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>✓ Parent Dashboard with complete visibility</li>
                      <li>✓ Real-time activity monitoring</li>
                      <li>✓ Ability to review and delete information</li>
                      <li>✓ Direct notice of any material changes</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-3">Security:</h4>
                    <ul className="text-amber-700 text-sm space-y-1">
                      <li>✓ Encryption of data in transit and at rest</li>
                      <li>✓ Access controls and authentication</li>
                      <li>✓ Regular security audits</li>
                      <li>✓ Employee training on children's privacy</li>
                    </ul>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 3: Information We Collect */}
            <section id="info-collect">
              <SectionHeader id="info-collect" icon={Eye} title="3. Information We Collect from Children">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">3.1 Personal Information We Collect (With Parental Consent)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Information</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Purpose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr><td className="px-4 py-2 text-gray-600 font-medium">Basic Profile</td><td className="px-4 py-2 text-gray-600">First name only, age, grade level</td><td className="px-4 py-2 text-gray-600">Personalize learning, age-appropriate content</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600 font-medium">Learning Activity</td><td className="px-4 py-2 text-gray-600">Lessons completed, quiz scores, time spent</td><td className="px-4 py-2 text-gray-600">Track progress, generate reports</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600 font-medium">AI Tutor Interactions</td><td className="px-4 py-2 text-gray-600">Questions to Ollie, conversations</td><td className="px-4 py-2 text-gray-600">Educational assistance, safety review</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600 font-medium">Educational Content</td><td className="px-4 py-2 text-gray-600">Uploaded materials, notes, flashcards</td><td className="px-4 py-2 text-gray-600">AI-powered study assistance</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600 font-medium">Usage Information</td><td className="px-4 py-2 text-gray-600">Features accessed, session duration</td><td className="px-4 py-2 text-gray-600">Service improvement, safety monitoring</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5" /> What We DO NOT Collect from Children:
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-red-700 text-sm">
                      <div>
                        <p className="font-medium mb-1">Personal Identifiers:</p>
                        <ul className="space-y-1">
                          <li>✗ Full names or last names</li>
                          <li>✗ Home addresses</li>
                          <li>✗ Email addresses</li>
                          <li>✗ Phone numbers</li>
                          <li>✗ Social Security Numbers</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Multimedia & Location:</p>
                        <ul className="space-y-1">
                          <li>✗ Photos or videos of child</li>
                          <li>✗ Audio recordings</li>
                          <li>✗ Precise geolocation/GPS</li>
                          <li>✗ Biometric data</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Financial/Sensitive:</p>
                        <ul className="space-y-1">
                          <li>✗ Credit card or payment info</li>
                          <li>✗ Medical/health information</li>
                          <li>✗ School names</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Tracking/Marketing:</p>
                        <ul className="space-y-1">
                          <li>✗ Advertising IDs</li>
                          <li>✗ Behavioral tracking cookies</li>
                          <li>✗ Cross-site tracking</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 4: How We Collect */}
            <section id="how-collect">
              <SectionHeader id="how-collect" icon={Download} title="4. How We Collect Information" defaultOpen={false}>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">4.1 Direct Collection (Through Orbit Learn Platform):</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Child profile creation (by parent)</li>
                      <li>Learning activities and lessons</li>
                      <li>AI tutor (Ollie) conversations</li>
                      <li>Quiz and assessment responses</li>
                      <li>Study material uploads (with parent approval)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">4.2 Automatic Collection (Minimal and Necessary):</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Session data for login functionality</li>
                      <li>Device type for compatibility (not unique device identifiers)</li>
                      <li>Error logs for technical support (anonymized)</li>
                    </ul>
                    <p className="text-green-700 text-sm mt-2 font-medium">
                      Important: We do NOT use tracking cookies, advertising pixels, or behavioral tracking for children.
                    </p>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 5: How We Use Information */}
            <section id="how-use">
              <SectionHeader id="how-use" icon={FileText} title="5. How We Use Children's Information">
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Educational Purposes Only:</h4>
                    <ul className="text-blue-700 space-y-2">
                      <li><strong>Personalized Learning:</strong> Adapt content difficulty, recommend lessons, customize paths</li>
                      <li><strong>AI Tutor (Ollie):</strong> Answer questions, provide explanations, offer encouragement</li>
                      <li><strong>Progress Tracking:</strong> Monitor achievements, generate parent reports, identify support needs</li>
                      <li><strong>Content Generation:</strong> Create personalized study materials, quizzes, flashcards</li>
                      <li><strong>Safety:</strong> Filter inappropriate content, monitor conversations for safety</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">We DO NOT Use Children's Information For:</h4>
                    <ul className="text-red-700 space-y-1">
                      <li>✗ Advertising or marketing to children</li>
                      <li>✗ Creating behavioral advertising profiles</li>
                      <li>✗ Selling or renting to third parties</li>
                      <li>✗ Cross-site or cross-service tracking</li>
                      <li>✗ Any purpose other than educational services</li>
                    </ul>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 6: Disclosure */}
            <section id="disclosure">
              <SectionHeader id="disclosure" icon={Users} title="6. How We Disclose Children's Information" defaultOpen={false}>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Service Providers (Under Strict Contracts):</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Provider</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">What We Share</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Purpose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr><td className="px-4 py-2 text-gray-600">Google Cloud</td><td className="px-4 py-2 text-gray-600">Learning activity, AI interactions</td><td className="px-4 py-2 text-gray-600">Hosting, AI services</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">Stripe</td><td className="px-4 py-2 text-gray-600">Parent email only (not child data)</td><td className="px-4 py-2 text-gray-600">Payment processing</td></tr>
                          <tr><td className="px-4 py-2 text-gray-600">ElevenLabs</td><td className="px-4 py-2 text-gray-600">Text content (no identifiers)</td><td className="px-4 py-2 text-gray-600">Voice narration</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">All providers sign Data Processing Agreements with COPPA compliance requirements.</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">We NEVER Share With:</h4>
                    <ul className="text-red-700 space-y-1">
                      <li>✗ Advertising networks or marketing companies</li>
                      <li>✗ Social media platforms</li>
                      <li>✗ Data brokers or aggregators</li>
                      <li>✗ Other children or users</li>
                    </ul>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 7: Parental Consent */}
            <section id="parental-consent">
              <SectionHeader id="parental-consent" icon={Lock} title="7. Parental Consent">
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 font-medium">
                      Before we collect, use, or disclose any personal information from a child under 13,
                      we obtain verifiable parental consent from the child's parent or legal guardian.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Methods of Obtaining Verifiable Parental Consent:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Method 1: Credit Card Verification</h4>
                        <p className="text-gray-600 text-sm">$0.50 charge immediately refunded. Verifies adult ownership.</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Method 2: Knowledge-Based Auth</h4>
                        <p className="text-gray-600 text-sm">Personal questions based on public records. No cost.</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Method 3: Video Verification</h4>
                        <p className="text-gray-600 text-sm">Brief video call showing government ID. Within 24 hours.</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Method 4: Signed Consent Form</h4>
                        <p className="text-gray-600 text-sm">Download, sign, upload with ID. Within 24 hours.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Revoking Consent:</h3>
                    <p className="text-gray-600">
                      Parents can revoke consent at any time via Parent Dashboard, email to{' '}
                      <a href="mailto:coppa@orbitlearn.app" className="text-green-600 hover:underline">coppa@orbitlearn.app</a>,
                      or by calling +971507493651. When revoked, we stop collecting new information within 24 hours.
                    </p>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 8: Parental Rights */}
            <section id="parental-rights">
              <SectionHeader id="parental-rights" icon={Shield} title="8. Parental Rights and Choices">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Under COPPA, parents have significant rights and control over their child's personal information.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: '1. Right to Review', desc: 'View all personal information collected about your child via Parent Dashboard or email request.' },
                      { title: '2. Right to Delete', desc: 'Request deletion of all or specific information. Deleted within 7 days of request.' },
                      { title: '3. Right to Refuse Collection', desc: 'Stop further collection while keeping existing data, or delete everything.' },
                      { title: '4. Right to Revoke Consent', desc: 'Completely withdraw consent at any time. Child access will be suspended.' },
                      { title: '5. Right to Limit Sharing', desc: 'Control how we share information with service providers.' },
                      { title: '6. Right to Notice', desc: 'Receive 30 days advance notice before material changes.' },
                      { title: '7. Right to File Complaints', desc: 'Contact FTC at CoppaHotline@ftc.gov if not satisfied.' },
                      { title: '8. No Penalty', desc: 'We will not penalize you for exercising any rights.' },
                    ].map((right, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{right.title}</h4>
                        <p className="text-gray-600 text-sm">{right.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">How to Exercise Your Rights:</h4>
                    <ul className="text-green-700 space-y-1">
                      <li><strong>Parent Dashboard:</strong> orbitlearn.app/parent/privacy (fastest)</li>
                      <li><strong>Email:</strong> <a href="mailto:coppa@orbitlearn.app" className="underline">coppa@orbitlearn.app</a></li>
                      <li><strong>Phone:</strong> +971507493651</li>
                      <li><strong>Response Time:</strong> Within 10 business days</li>
                    </ul>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 9: Parent Dashboard */}
            <section id="parent-dashboard">
              <SectionHeader id="parent-dashboard" icon={Eye} title="9. Parent Dashboard and Controls" defaultOpen={false}>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    The Parent Dashboard gives you complete visibility and control over your child's information and activities.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Real-Time Monitoring</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Current activity and time spent</li>
                        <li>• Lessons in progress</li>
                        <li>• Last login time</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Activity History</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• All lessons and quiz results</li>
                        <li>• Complete AI tutor conversations</li>
                        <li>• Study materials generated</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Privacy Controls</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• View and export all data</li>
                        <li>• Delete specific items or all data</li>
                        <li>• Pause or stop collection</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Screen Time Controls</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Daily usage limits</li>
                        <li>• Time windows (e.g., 4-6 PM)</li>
                        <li>• Break reminders</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 10: Data Security */}
            <section id="data-security">
              <SectionHeader id="data-security" icon={Lock} title="10. Data Security for Children" defaultOpen={false}>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Technical Security:</h4>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• TLS/SSL encryption in transit</li>
                        <li>• AES-256 encryption at rest</li>
                        <li>• Bcrypt password hashing</li>
                        <li>• Role-based access controls</li>
                        <li>• Regular penetration testing</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Organizational Security:</h4>
                      <ul className="text-purple-700 text-sm space-y-1">
                        <li>• Employee background checks</li>
                        <li>• Quarterly privacy training</li>
                        <li>• Confidentiality agreements</li>
                        <li>• Need-to-know access only</li>
                        <li>• Incident response procedures</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    <strong>UAE Users:</strong> Data stored in Google Cloud Middle East region (me-central1).
                  </p>
                </div>
              </SectionHeader>
            </section>

            {/* Section 11: Data Retention */}
            <section id="data-retention">
              <SectionHeader id="data-retention" icon={Trash2} title="11. Data Retention and Deletion" defaultOpen={false}>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Data Type</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Retention</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr><td className="px-4 py-2 text-gray-600">Child profile info</td><td className="px-4 py-2 text-gray-600">While account active</td></tr>
                        <tr><td className="px-4 py-2 text-gray-600">Learning progress</td><td className="px-4 py-2 text-gray-600">While account active</td></tr>
                        <tr><td className="px-4 py-2 text-gray-600">AI conversations</td><td className="px-4 py-2 text-gray-600">While account active</td></tr>
                        <tr><td className="px-4 py-2 text-gray-600">Session data</td><td className="px-4 py-2 text-gray-600">24 hours</td></tr>
                        <tr><td className="px-4 py-2 text-gray-600">Usage analytics</td><td className="px-4 py-2 text-gray-600">Aggregated after 90 days</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Deletion Upon Request:</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Active systems: Deleted within <strong>7 days</strong></li>
                      <li>• Backups: Deleted within <strong>90 days</strong></li>
                      <li>• Confirmation email sent when complete</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">When Child Turns 13:</h4>
                    <p className="text-gray-600 text-sm">
                      Parent notified 30 days before. Options: convert to teen account or delete all data.
                      If no response, data automatically deleted 30 days after 13th birthday.
                    </p>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 12: No Advertising */}
            <section id="no-advertising">
              <SectionHeader id="no-advertising" icon={XCircle} title="12. No Advertising to Children">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-800 mb-3">Orbit Learn is Completely Ad-Free for Children</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-green-700">
                      <div>
                        <p className="font-medium mb-2">We DO NOT:</p>
                        <ul className="space-y-1 text-sm">
                          <li>✗ Display advertisements to children</li>
                          <li>✗ Show sponsored content</li>
                          <li>✗ Use tracking cookies for ads</li>
                          <li>✗ Build advertising profiles</li>
                          <li>✗ Share data with ad networks</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Our Revenue Model:</p>
                        <ul className="space-y-1 text-sm">
                          <li>✓ Parent-paid subscriptions only</li>
                          <li>✓ No advertising revenue</li>
                          <li>✓ No data selling</li>
                          <li>✓ Focus on quality education</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 13: No Child-to-Child Communication */}
            <section id="no-communication">
              <SectionHeader id="no-communication" icon={MessageCircle} title="13. No Child-to-Child Communication">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <p className="text-blue-800 mb-4">
                      Orbit Learn is designed to be a safe, private learning environment with <strong>no social networking features</strong>.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-blue-800 mb-2">Children CANNOT:</p>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>✗ Send/receive messages from other children</li>
                          <li>✗ View other children's profiles</li>
                          <li>✗ Share content with other users</li>
                          <li>✗ Participate in forums</li>
                          <li>✗ Add friends or create contact lists</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-800 mb-2">Children CAN ONLY Interact With:</p>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>✓ Ollie (AI tutor) - monitored & filtered</li>
                          <li>✓ Content created by Orbit Learn</li>
                          <li>✓ Materials uploaded by their parent</li>
                          <li>✓ Their own learning activities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionHeader>
            </section>

            {/* Section 14: School Use */}
            <section id="school-use">
              <SectionHeader id="school-use" icon={School} title="14. School Use of Orbit Learn" defaultOpen={false}>
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">COPPA's School Consent Provision</h4>
                    <p className="text-amber-700 text-sm">
                      Under COPPA, schools can provide consent on behalf of parents for educational purposes.
                      When school provides consent, parents are still notified and retain all COPPA rights.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">School Responsibilities:</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Authorize Orbit Learn for educational use</li>
                        <li>• Notify parents of service use</li>
                        <li>• Ensure use for educational purposes only</li>
                        <li>• Execute Data Processing Agreement</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Parent Rights Remain:</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Review child's information</li>
                        <li>• Request deletion</li>
                        <li>• Opt out of school's use</li>
                        <li>• Exercise all COPPA rights</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm">
                    <strong>For Schools:</strong> Contact <a href="mailto:schools@orbitlearn.app" className="text-green-600 hover:underline">schools@orbitlearn.app</a> for
                    Data Processing Agreements and FERPA compliance documentation.
                  </p>
                </div>
              </SectionHeader>
            </section>

            {/* Contact Information */}
            <section className="pt-8 border-t border-gray-200 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Mail className="w-7 h-7 text-green-600" />
                Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="font-semibold text-green-900 mb-4">COPPA & Privacy Contacts</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>COPPA Inquiries:</strong> <a href="mailto:coppa@orbitlearn.app" className="text-green-600 hover:underline">coppa@orbitlearn.app</a></li>
                    <li><strong>Child Safety:</strong> <a href="mailto:safety@orbitlearn.app" className="text-green-600 hover:underline">safety@orbitlearn.app</a> (24/7)</li>
                    <li><strong>Privacy:</strong> <a href="mailto:privacy@orbitlearn.app" className="text-green-600 hover:underline">privacy@orbitlearn.app</a></li>
                    <li><strong>Schools/FERPA:</strong> <a href="mailto:schools@orbitlearn.app" className="text-green-600 hover:underline">schools@orbitlearn.app</a></li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Company Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Jasmine Entertainment Fze</strong></p>
                    <p>Publishing City, Sharjah, UAE</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +971507493651</p>
                    <p className="mt-4"><strong>Hours:</strong> Sun-Thu, 9 AM - 6 PM GST</p>
                    <p><strong>Child Safety:</strong> 24/7</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-amber-800 mb-2">File a Complaint with FTC</h4>
                <p className="text-amber-700 text-sm">
                  If you're not satisfied with our response, you can contact the Federal Trade Commission:
                </p>
                <ul className="text-amber-700 text-sm mt-2 space-y-1">
                  <li><strong>Email:</strong> CoppaHotline@ftc.gov</li>
                  <li><strong>Phone:</strong> 1-877-FTC-HELP (1-877-382-4357)</li>
                  <li><strong>Online:</strong> ftc.gov/complaint</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>This Children's Privacy Policy was last updated on {lastUpdated} and is effective as of {lastUpdated}.</p>
            <p className="mt-2"><strong>Jasmine Entertainment Fze | Orbit Learn | coppa@orbitlearn.app</strong></p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Orbit Learn. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy-policy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <Link to="/contact" className="hover:text-gray-700">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoppaCompliancePage;
