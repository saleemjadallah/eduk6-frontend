import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Download } from 'lucide-react';

const CoppaCompliancePage = () => {
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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">COPPA Compliance</h1>
              <p className="text-gray-500">Children's Online Privacy Protection Act</p>
            </div>
          </div>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          {/* Quick Summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Our Commitment to Children's Privacy</h2>
            <p className="text-blue-800">
              Orbit Learn is designed for K-6 students and takes children's privacy seriously. We comply with
              the Children's Online Privacy Protection Act (COPPA) and implement strict safeguards to protect
              children's personal information online.
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What is COPPA?</h2>
              <p className="text-gray-600 mb-4">
                The Children's Online Privacy Protection Act (COPPA) is a U.S. federal law that protects the
                privacy of children under 13 years of age. It requires websites and online services to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Obtain verifiable parental consent before collecting personal information from children</li>
                <li>Provide parents with notice about data collection practices</li>
                <li>Give parents the ability to review and delete their child's information</li>
                <li>Limit data collection to what is necessary for the activity</li>
                <li>Maintain reasonable security for children's information</li>
              </ul>
            </section>

            {/* Key Principles */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Comply</h2>

              <div className="grid gap-4">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Parental Consent Required</h3>
                    <p className="text-gray-600 text-sm">
                      Children cannot create accounts directly. All accounts are created by parents or guardians
                      who provide consent for their child's participation. Child profiles are managed entirely
                      through the parent account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Limited Data Collection</h3>
                    <p className="text-gray-600 text-sm">
                      We only collect information necessary to provide educational services: first name, age/grade,
                      learning preferences, and educational progress. We do not collect contact information directly
                      from children.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Parental Access & Control</h3>
                    <p className="text-gray-600 text-sm">
                      Parents can review all information collected about their child, download their data,
                      modify information, or request complete deletion at any time through the parent dashboard
                      or by contacting us.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Right to Delete</h3>
                    <p className="text-gray-600 text-sm">
                      Parents can delete their child's profile and all associated data at any time. We will
                      complete deletion within 30 days of request and confirm when deletion is complete.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect from Children</h2>
              <p className="text-gray-600 mb-4">
                With parental consent, we collect the following information about children:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 border border-gray-200 font-medium text-gray-700">Information</th>
                      <th className="text-left p-3 border border-gray-200 font-medium text-gray-700">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-gray-200 text-gray-600">First name</td>
                      <td className="p-3 border border-gray-200 text-gray-600">Personalize the learning experience</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-gray-200 text-gray-600">Age/Grade level</td>
                      <td className="p-3 border border-gray-200 text-gray-600">Provide age-appropriate content</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-gray-200 text-gray-600">Learning preferences</td>
                      <td className="p-3 border border-gray-200 text-gray-600">Customize learning materials and pace</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-gray-200 text-gray-600">Learning progress</td>
                      <td className="p-3 border border-gray-200 text-gray-600">Track achievements and provide feedback to parents</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-gray-200 text-gray-600">Avatar selection</td>
                      <td className="p-3 border border-gray-200 text-gray-600">Allow child to personalize their profile</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Do NOT Collect from Children</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Email addresses</li>
                <li>Phone numbers</li>
                <li>Physical addresses</li>
                <li>Photos or videos of children</li>
                <li>Social security numbers</li>
                <li>Geolocation data</li>
                <li>Information from social media accounts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Protect Children's Data</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Only authorized personnel can access children's data</li>
                <li><strong>No Third-Party Sharing:</strong> We do not sell or share children's data with third parties for marketing</li>
                <li><strong>Safe AI:</strong> Our AI is designed to filter inappropriate content and interactions</li>
                <li><strong>No Advertising:</strong> Children are not shown any advertisements</li>
                <li><strong>No Social Features:</strong> Children cannot communicate with other users</li>
                <li><strong>Regular Audits:</strong> We conduct regular security and privacy audits</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Parental Rights</h2>
              <p className="text-gray-600 mb-4">As a parent or guardian, you have the right to:</p>

              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900">1. Review Information</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    View all personal information collected about your child through the parent dashboard
                    or by requesting a copy from us.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900">2. Modify Information</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Update or correct your child's information at any time through the parent dashboard.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900">3. Delete Information</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Request deletion of your child's account and all associated data. Deletion is permanent
                    and cannot be undone.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900">4. Refuse Further Collection</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Withdraw consent for future data collection. Note that this may limit access to
                    certain features of the Service.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900">5. Export Data</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Download a copy of all data associated with your child's account in a portable format.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Exercise Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You can exercise your parental rights in the following ways:
              </p>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Through the Parent Dashboard</h3>
                  <p className="text-gray-600 text-sm">
                    Log in to your account and navigate to Settings &gt; Children &gt; [Child's Name] &gt; Privacy
                    to review, modify, or delete your child's information.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">By Email</h3>
                  <p className="text-gray-600 text-sm">
                    Send a request to{' '}
                    <a href="mailto:privacy@orbitlearn.com" className="text-blue-600 hover:underline">
                      privacy@orbitlearn.com
                    </a>
                    . Please include your account email and the child's name. We will verify your identity
                    before processing the request.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Response Time</h3>
                  <p className="text-gray-600 text-sm">
                    We will respond to verified requests within 30 days.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Teachers and Schools</h2>
              <p className="text-gray-600 mb-4">
                When Orbit Learn is used in a school setting, the school may act as the agent of the parent
                for purposes of COPPA consent. Schools using Orbit Learn must:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Obtain necessary parental consent for student use</li>
                <li>Only use the Service for educational purposes</li>
                <li>Not disclose student data to unauthorized parties</li>
                <li>Contact us to establish a school account with appropriate data handling agreements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-600">
                We may update this COPPA Compliance page from time to time. Material changes that affect
                how we collect or use children's information will be communicated to parents via email.
                Continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions or Concerns</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our COPPA compliance or children's privacy practices,
                please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 font-medium">Orbit Learn, Inc.</p>
                <p className="text-gray-600">Privacy Officer</p>
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
            <Link to="/privacy-policy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoppaCompliancePage;
