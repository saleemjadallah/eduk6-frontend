import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfServicePage = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing or using Orbit Learn ("Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you disagree with any part of the terms, you may not access the Service.
              </p>
              <p className="text-gray-600">
                These Terms apply to all users of the Service, including parents, guardians, teachers,
                and children who use the Service under parental supervision.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                Orbit Learn is an AI-powered educational platform designed for K-6 students. Our Service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Personalized learning content based on uploaded educational materials</li>
                <li>AI-generated study guides, quizzes, and flashcards</li>
                <li>Progress tracking and achievement systems</li>
                <li>Parent dashboard for monitoring learning activities</li>
                <li>Teacher tools for content creation (where applicable)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-3">3.1 Account Registration</h3>
              <p className="text-gray-600 mb-4">
                To use certain features, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">3.2 Account for Children</h3>
              <p className="text-gray-600">
                Children under 13 may only use the Service through a parent or guardian account.
                Parents and guardians are responsible for their children's use of the Service and
                for ensuring compliance with these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-600 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Upload content that infringes intellectual property rights</li>
                <li>Upload content that is harmful, offensive, or inappropriate for children</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service to collect information about other users</li>
                <li>Share account credentials with unauthorized individuals</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Content</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-3">5.1 Your Content</h3>
              <p className="text-gray-600 mb-4">
                You retain ownership of content you upload to the Service. By uploading content, you grant us
                a license to use, process, and display that content to provide the Service to you.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">5.2 AI-Generated Content</h3>
              <p className="text-gray-600 mb-4">
                Our Service uses AI to generate educational content. While we strive for accuracy, AI-generated
                content may contain errors. Parents and educators should review content for appropriateness.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">5.3 Content Guidelines</h3>
              <p className="text-gray-600">
                Uploaded content must be educational materials you have the right to use. Do not upload
                content containing personal information about other children, copyrighted materials without
                permission, or any inappropriate content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Subscriptions and Payments</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-3">6.1 Billing</h3>
              <p className="text-gray-600 mb-4">
                Some features require a paid subscription. By subscribing, you agree to pay the applicable fees.
                Subscriptions automatically renew unless cancelled before the renewal date.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">6.2 Refunds</h3>
              <p className="text-gray-600 mb-4">
                Refunds are handled on a case-by-case basis. Please contact support within 14 days of purchase
                if you believe you are entitled to a refund.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">6.3 Free Trial</h3>
              <p className="text-gray-600">
                Free trials may be offered. Unless you cancel before the trial ends, your payment method
                will be charged for the subscription.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                The Service and its original content (excluding content provided by users) are owned by
                Orbit Learn, Inc. and are protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-600">
                You may not copy, modify, distribute, or create derivative works from any part of the Service
                without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
              <p className="text-gray-600">
                Your use of the Service is also governed by our{' '}
                <Link to="/privacy-policy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your information. We also comply with
                COPPA for children's privacy. See our{' '}
                <Link to="/coppa" className="text-blue-600 hover:underline">
                  COPPA Compliance page
                </Link>{' '}
                for more information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
              <p className="text-gray-600 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>The Service will be uninterrupted or error-free</li>
                <li>AI-generated content will be completely accurate</li>
                <li>The Service will meet your specific educational requirements</li>
                <li>Any errors in the Service will be corrected</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Orbit Learn is a supplementary educational tool and should not replace formal education
                or professional educational guidance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ORBIT LEARN, INC. SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS
                OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
                OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we
                believe violates these Terms or is harmful to other users, us, or third parties, or for any
                other reason.
              </p>
              <p className="text-gray-600">
                You may terminate your account at any time by contacting support or using account settings.
                Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these Terms at any time. We will notify you of material changes
                by posting the new Terms on this page and updating the "Last updated" date. Your continued
                use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-600">
                These Terms shall be governed by and construed in accordance with the laws of the State of
                Delaware, United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 font-medium">Orbit Learn, Inc.</p>
                <p className="text-gray-600">Email: support@orbitlearn.app</p>
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
            <Link to="/privacy-policy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link to="/coppa" className="hover:text-gray-700">COPPA Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfServicePage;
