import { motion } from 'framer-motion';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate mb-8"><strong>Last Updated:</strong> January 2025</p>

          <div className="prose prose-slate max-w-none">
            <p>
              This Privacy Policy describes how <strong>Jasmine Entertainment Fze</strong> ("Company," "we," "us," or "our"), the operator of the <strong>mydscvr.ai</strong> service, collects, uses, and discloses your personal information when you use our website and application (the "Service").
            </p>
            <p>
              We are committed to protecting your privacy and handling your data in an open and transparent manner, in compliance with applicable laws, including the Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL) in the UAE.
            </p>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">1. Data Controller and Contact Information</h2>
            <p>The data controller responsible for your personal data is:</p>
            <table className="min-w-full border border-slate-300 my-4">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold bg-slate-50">Company Name</td>
                  <td className="px-4 py-2">Jasmine Entertainment Fze</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold bg-slate-50">Address</td>
                  <td className="px-4 py-2">Publishing City, Sharjah, UAE</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold bg-slate-50">Email</td>
                  <td className="px-4 py-2">support@mydscvr.ai</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold bg-slate-50">Phone</td>
                  <td className="px-4 py-2">+971507493651</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">2. Information We Collect</h2>
            <p>We collect information that identifies, relates to, describes, or is capable of being associated with you ("Personal Data").</p>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">A. Information You Provide Directly</h3>
            <table className="min-w-full border border-slate-300 my-4 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Category</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Examples of Data Collected</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Purpose of Collection</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Account Information</td>
                  <td className="px-4 py-2">Email address, first name, last name, hashed password.</td>
                  <td className="px-4 py-2">To create and manage your user account, authenticate your access, and secure your data.</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Establishment Information</td>
                  <td className="px-4 py-2">Establishment name, logo URL, tagline, branding preferences (colors, fonts).</td>
                  <td className="px-4 py-2">To customize your digital menu and branding within the Service.</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Menu Content</td>
                  <td className="px-4 py-2">Dish names, descriptions, ingredients, allergen information, pricing, category classifications.</td>
                  <td className="px-4 py-2">To generate AI images, create menu descriptions, and display your public menu.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Uploaded Images</td>
                  <td className="px-4 py-2">Original photos you upload for enhancement (e.g., HEIF/JPEG/PNG files).</td>
                  <td className="px-4 py-2">To perform the image enhancement service you requested.</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold text-charcoal mt-6 mb-3">B. Information Collected Automatically</h3>
            <table className="min-w-full border border-slate-300 my-4 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Category</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Examples of Data Collected</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Purpose of Collection</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Usage Data</td>
                  <td className="px-4 py-2">Number of dishes generated, images generated, enhancements used, subscription tier, billing period dates.</td>
                  <td className="px-4 py-2">To enforce subscription limits, calculate usage, and bill you correctly.</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Payment Data</td>
                  <td className="px-4 py-2">Stripe Customer ID, Stripe Subscription ID, subscription status. (We do not store full payment card details).</td>
                  <td className="px-4 py-2">To manage your subscription and process recurring payments via Stripe.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Technical Data</td>
                  <td className="px-4 py-2">Session ID, IP address, browser type, operating system, access times.</td>
                  <td className="px-4 py-2">To maintain your authenticated session, ensure security, and debug service issues.</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">3. How We Use Your Information (Lawful Basis)</h2>
            <p>We use your Personal Data for the following purposes, based on the lawful basis of <strong>Contract Performance</strong> (to provide the Service) and <strong>Legitimate Interests</strong> (to improve and secure the Service):</p>

            <table className="min-w-full border border-slate-300 my-4 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Purpose</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Details</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Lawful Basis</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Service Provision</td>
                  <td className="px-4 py-2">To provide the core AI image generation, enhancement, and menu management features.</td>
                  <td className="px-4 py-2">Contract Performance</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Account Management</td>
                  <td className="px-4 py-2">To verify your identity, manage your account, and maintain session security.</td>
                  <td className="px-4 py-2">Contract Performance</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Billing and Payments</td>
                  <td className="px-4 py-2">To process your subscription payments and manage your billing cycle via Stripe.</td>
                  <td className="px-4 py-2">Contract Performance</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Transactional Emails</td>
                  <td className="px-4 py-2">To send you essential communications, such as OTP codes, welcome messages, and billing notifications via ZeptoMail.</td>
                  <td className="px-4 py-2">Contract Performance</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Service Improvement</td>
                  <td className="px-4 py-2">To analyze usage patterns and technical data to improve the performance and features of the Service.</td>
                  <td className="px-4 py-2">Legitimate Interests</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">4. How We Share Your Information (Third-Party Processors)</h2>
            <p>We share your data with the following third-party service providers solely for the purpose of operating and improving the Service. <strong>We do not sell your Personal Data to any third parties.</strong></p>

            <table className="min-w-full border border-slate-300 my-4 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Third-Party Processor</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Data Shared</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Google Gemini AI</td>
                  <td className="px-4 py-2">Dish descriptions, uploaded images (base64), enhancement styles.</td>
                  <td className="px-4 py-2">AI image generation, image enhancement, and food analysis.</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">OpenAI (GPT-4)</td>
                  <td className="px-4 py-2">Dish name, ingredients list, existing description.</td>
                  <td className="px-4 py-2">AI generation of appetizing menu descriptions.</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Stripe</td>
                  <td className="px-4 py-2">Email address, subscription tier, billing address (if provided).</td>
                  <td className="px-4 py-2">Payment processing, subscription management, and billing portal hosting.</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Cloudflare R2</td>
                  <td className="px-4 py-2">AI-generated images, enhanced images, user-uploaded logos.</td>
                  <td className="px-4 py-2">Secure object storage and content delivery (CDN) for all images.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">ZeptoMail</td>
                  <td className="px-4 py-2">Recipient email address, name, email content (e.g., OTP code).</td>
                  <td className="px-4 py-2">Sending transactional emails (OTP, welcome, billing).</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">5. Publicly Accessible Information</h2>
            <p>You acknowledge that certain data you input into the Service is designed to be public:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Public Menu URLs:</strong> Any menu item you finalize with a generated image is made publicly accessible via a unique, non-guessable URL (e.g., mydscvr.ai/menu/:userId). This includes the dish name, description, pricing, and images.</li>
              <li><strong>Public Images:</strong> All generated and enhanced images are stored on Cloudflare R2 and are accessible via permanent, public URLs.</li>
            </ul>
            <p><strong>You are solely responsible for the content you choose to make public.</strong></p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">6. Data Retention</h2>
            <p>We retain your Personal Data for as long as your account is active or as needed to provide you with the Service.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active Accounts:</strong> Account data, menu content, and generated images are retained indefinitely until you delete them or your account is deleted.</li>
              <li><strong>Account Deletion:</strong> If you request account deletion (via support@mydscvr.ai), we will immediately initiate the deletion of all associated Personal Data, menu items, images from R2 storage, and cancel your subscription.</li>
              <li><strong>Session Data:</strong> Session cookies and related data are retained for 7 days.</li>
              <li><strong>OTP Codes:</strong> One-Time Passwords expire and are deleted after 10 minutes.</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">7. Your Rights (UAE PDPL)</h2>
            <p>As a user of the Service, you have the following rights concerning your Personal Data, in line with the UAE PDPL:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> You can access your account information, menu items, and usage statistics through your account dashboard and authenticated API endpoints.</li>
              <li><strong>Right to Rectification:</strong> You can update your profile information (name) and menu content at any time. Your email address cannot be changed.</li>
              <li><strong>Right to Erasure (Deletion):</strong> You can delete individual menu items. To request the full deletion of your account and all associated data, please contact us at support@mydscvr.ai.</li>
              <li><strong>Right to Data Portability:</strong> We do not currently offer an automated data export feature. You can download your generated images individually via their public URLs.</li>
              <li><strong>Right to Object:</strong> You have the right to object to the processing of your Personal Data for legitimate interests, subject to legal limitations.</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">8. International Data Transfers</h2>
            <p>
              As we operate globally and use third-party processors (Google, Stripe, Cloudflare) that may be located outside the UAE, your Personal Data may be transferred to, and processed in, countries other than the UAE. We ensure that such transfers are protected by appropriate safeguards, such as standard contractual clauses or reliance on the processor's compliance with international data protection frameworks.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              The Service is not intended for use by children under the age of 13. We do not knowingly collect Personal Data from children under 13. If we become aware that we have collected Personal Data from a child under 13, we will take steps to delete such information.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We may also notify you via email prior to the change becoming effective.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">11. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
            <p>
              <strong>Email:</strong> support@mydscvr.ai<br />
              <strong>Phone:</strong> +971507493651<br />
              <strong>Address:</strong> Publishing City, Sharjah, UAE
            </p>

            <hr className="my-8" />

            <h1 className="text-3xl font-bold text-charcoal mt-12 mb-4">Cookies Policy</h1>
            <p className="text-sm text-slate mb-8"><strong>Last Updated:</strong> January 2025</p>

            <p>This Cookies Policy explains what cookies are, how we use them, and how you can manage them when you use the <strong>mydscvr.ai</strong> service.</p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">2. How We Use Cookies</h2>
            <p>We use cookies that are <strong>strictly necessary</strong> for the operation of the Service. We do not currently use any non-essential cookies for analytics, advertising, or marketing purposes.</p>

            <table className="min-w-full border border-slate-300 my-4 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Cookie Name</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Type</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Purpose</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 font-mono">connect.sid</td>
                  <td className="px-4 py-2">Strictly Necessary (First-Party)</td>
                  <td className="px-4 py-2">Used to maintain your authenticated session after you log in. Without this cookie, you would not be able to use the Service.</td>
                  <td className="px-4 py-2">7 Days</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">3. Third-Party Cookies</h2>
            <p>When you use the Service, you may also encounter third-party cookies from our service providers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Stripe, our payment processor, may set cookies during the payment and subscription checkout process. These cookies are governed by Stripe's own privacy policy and are necessary for secure payment processing.</li>
              <li><strong>Cloudflare:</strong> Cloudflare, our CDN and storage provider, may set cookies for security and performance purposes. These are typically functional cookies that do not track personal data.</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">4. Managing Cookies</h2>
            <p>
              You can control and manage cookies in various ways. Please note that if you delete or refuse to accept cookies, you may not be able to use all the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser.</li>
              <li><strong>Strictly Necessary:</strong> The connect.sid cookie is strictly necessary for authentication. Disabling it will prevent you from logging in and using the Service.</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">5. Changes to the Cookies Policy</h2>
            <p>We may update this Cookies Policy from time to time. We encourage you to review this policy periodically to stay informed about our use of cookies.</p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">6. Contact Us</h2>
            <p>If you have any questions about this Cookies Policy, please contact us at <strong>support@mydscvr.ai</strong>.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
