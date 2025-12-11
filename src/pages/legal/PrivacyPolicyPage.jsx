import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const lastUpdated = 'December 2025';

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                Welcome to Orbit Learn. We are committed to protecting the privacy of children and their families.
                This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use
                our educational platform designed for K-6 students.
              </p>
              <p className="text-gray-600">
                Orbit Learn is operated by Orbit Learn, Inc. ("we," "us," or "our"). By using our service, you agree
                to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Information from Parents/Guardians</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Account information (email address, password)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Information about Children</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>First name and age/grade level (for personalized learning)</li>
                <li>Learning preferences and interests</li>
                <li>Educational content uploaded by parents</li>
                <li>Learning progress and achievements</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (features used, time spent learning)</li>
                <li>Log data for troubleshooting and improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Information</h2>
              <p className="text-gray-600 mb-4">We use collected information to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide personalized, age-appropriate educational content</li>
                <li>Track and display learning progress to parents</li>
                <li>Improve our AI-powered educational features</li>
                <li>Communicate with parents about account and service updates</li>
                <li>Ensure platform safety and security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. AI and Content Processing</h2>
              <p className="text-gray-600 mb-4">
                Orbit Learn uses artificial intelligence (Google Gemini) to analyze educational content and
                generate personalized learning materials. When you upload content:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Content is processed to create study guides, quizzes, and flashcards</li>
                <li>We do not use children's data to train AI models</li>
                <li>All AI interactions are filtered for age-appropriate content</li>
                <li>Content is stored securely and can be deleted upon request</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">
                We use essential cookies to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences</li>
                <li>Ensure platform security</li>
              </ul>
              <p className="text-gray-600">
                We do not use cookies for advertising or third-party tracking. You can control cookies through
                your browser settings, but some features may not function properly without essential cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell personal information. We may share information only in these circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Service Providers:</strong> With trusted partners who help operate our service (hosting, payment processing)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger or acquisition (with notice)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-600">
                We implement industry-standard security measures including encryption, secure servers,
                and regular security audits. However, no method of transmission over the Internet is 100% secure,
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-600 mb-4">Parents and guardians have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Review personal information collected about their child</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of their child's information</li>
                <li>Refuse further collection or use of their child's information</li>
                <li>Export their data in a portable format</li>
              </ul>
              <p className="text-gray-600 mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@orbitlearn.com" className="text-blue-600 hover:underline">
                  privacy@orbitlearn.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Data Retention</h2>
              <p className="text-gray-600">
                We retain personal information for as long as your account is active or as needed to provide services.
                When you delete your account, we will delete or anonymize your information within 30 days, unless
                retention is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children's Privacy (COPPA)</h2>
              <p className="text-gray-600 mb-4">
                We comply with the Children's Online Privacy Protection Act (COPPA). We:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Require parental consent before collecting information from children under 13</li>
                <li>Limit data collection to what is necessary for educational purposes</li>
                <li>Do not condition participation on disclosure of more information than necessary</li>
                <li>Provide parents control over their child's information</li>
              </ul>
              <p className="text-gray-600 mt-4">
                For more details, see our{' '}
                <Link to="/coppa" className="text-blue-600 hover:underline">
                  COPPA Compliance page
                </Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the "Last updated" date. Material changes will be
                communicated via email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 font-medium">Orbit Learn, Inc.</p>
                <p className="text-gray-600">Email: privacy@orbitlearn.com</p>
                <p className="text-gray-600 mt-2">
                  <Link to="/contact" className="text-blue-600 hover:underline">
                    Contact Form
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Orbit Learn. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <Link to="/coppa" className="hover:text-gray-700">COPPA Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
