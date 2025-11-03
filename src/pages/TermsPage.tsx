import { motion } from 'framer-motion';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Terms and Conditions of Service</h1>
          <p className="text-sm text-slate mb-8"><strong>Last Updated:</strong> January 2025</p>

          <div className="prose prose-slate max-w-none">
            <p>
              <strong>mydscvr.ai</strong> is owned and operated by <strong>Jasmine Entertainment Fze</strong> ("Company," "we," "us," or "our"), a company registered in Sharjah, UAE.
            </p>
            <p>
              These Terms and Conditions ("Terms") govern your access to and use of the mydscvr.ai website, application, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing, or using the Service, you represent that you have read, understood, and agree to be bound by these Terms. If you do not agree with these Terms, you must not use the Service.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">2. Company Information</h2>
            <table className="min-w-full border border-slate-300 my-4">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold bg-slate-50">Service Name</td>
                  <td className="px-4 py-2">mydscvr.ai</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold bg-slate-50">Legal Entity</td>
                  <td className="px-4 py-2">Jasmine Entertainment Fze</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold bg-slate-50">Address</td>
                  <td className="px-4 py-2">Publishing City, Sharjah, UAE</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold bg-slate-50">Contact Email</td>
                  <td className="px-4 py-2">support@mydscvr.ai</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold bg-slate-50">Contact Phone</td>
                  <td className="px-4 py-2">+971507493651</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">3. Description of Service</h2>
            <p>mydscvr.ai is a Software-as-a-Service (SaaS) platform that provides users with tools for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>AI Food Photography Generation:</strong> Generating professional food images from text descriptions using third-party AI models (Google Gemini AI).</li>
              <li><strong>Image Enhancement:</strong> Enhancing user-uploaded food photos using AI.</li>
              <li><strong>Digital Menu Management:</strong> Creating, organizing, and sharing digital menus via unique public URLs.</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">4. User Accounts and Registration</h2>
            <p><strong>4.1. Eligibility:</strong> You must be at least 18 years old to use the Service.</p>
            <p><strong>4.2. Account Information:</strong> You agree to provide accurate and complete information during registration, including your email address, first name, and last name. Your email address is your unique identifier and cannot be changed.</p>
            <p><strong>4.3. Security:</strong> You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. We use bcrypt hashing for password security.</p>
            <p><strong>4.4. Account Deletion:</strong> There is currently no self-service account deletion feature. To request the deletion of your account, you must contact us at support@mydscvr.ai.</p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">5. Payment, Subscriptions, and Usage Limits</h2>
            <p><strong>5.1. Subscription Model and Tiers:</strong> The Service is offered on a subscription basis with pricing denominated in AED (United Arab Emirates Dirham). The available tiers and their core features are detailed below. We reserve the right to modify the features and pricing of these tiers upon notice.</p>

            <table className="min-w-full border border-slate-300 my-4 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Tier</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Monthly Price (AED)</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Dishes/Month</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">AI Enhancements/Month</th>
                  <th className="px-4 py-2 border-b border-slate-300 text-left">Key Features</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Starter</td>
                  <td className="px-4 py-2">99</td>
                  <td className="px-4 py-2">30</td>
                  <td className="px-4 py-2">50</td>
                  <td className="px-4 py-2">All 4 photography styles, High-resolution downloads, Commercial usage rights, Email support.</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-4 py-2 font-semibold">Pro</td>
                  <td className="px-4 py-2">299</td>
                  <td className="px-4 py-2">150</td>
                  <td className="px-4 py-2">200</td>
                  <td className="px-4 py-2">All Starter features PLUS Priority support, Custom brand watermarks, Bulk export.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Enterprise</td>
                  <td className="px-4 py-2">Custom</td>
                  <td className="px-4 py-2">Unlimited</td>
                  <td className="px-4 py-2">Unlimited</td>
                  <td className="px-4 py-2">All Pro features PLUS Custom photography styles, API access, Dedicated account manager, 24/7 priority support.</td>
                </tr>
              </tbody>
            </table>

            <p><strong>5.2. Billing:</strong> Subscriptions are billed monthly or annually in advance. Payment processing is handled by a third-party provider, <strong>Stripe</strong>. We do not store your full payment card details.</p>
            <p><strong>5.3. Usage Limits:</strong> Each subscription tier includes specific monthly limits on the number of dishes you can generate and the number of images you can enhance.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dish Generation:</strong> Limits apply to the number of unique dishes you can create per billing period.</li>
              <li><strong>Image Enhancement:</strong> Limits apply to the number of images you can enhance per billing period.</li>
              <li><strong>Regeneration Limit:</strong> You are limited to a maximum of <strong>two (2) regenerations</strong> per dish.</li>
              <li><strong>Exceeding Limits:</strong> If you exceed your plan's limits, you will be unable to generate new dishes or enhance additional images until the next billing period.</li>
            </ul>
            <p><strong>5.4. No Refunds:</strong> <strong>All subscription fees are non-refundable.</strong> We do not provide refunds or credits for any partial months of service, plan downgrades, or periods of non-use. If you cancel your subscription, you will retain access until the end of your current billing period.</p>
            <p><strong>5.5. Trial:</strong> New users are automatically granted a free trial with limited usage (e.g., 3 dishes, 5 enhancements) without requiring payment information.</p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">6. Intellectual Property and Content Ownership</h2>
            <p><strong>6.1. User Content Ownership:</strong> You retain all ownership rights to the images you upload for enhancement and the text content (dish names, descriptions, ingredients) you input into the Service ("User Content").</p>
            <p><strong>6.2. License to User Content:</strong> By submitting User Content, you grant Jasmine Entertainment Fze a worldwide, royalty-free, non-exclusive license to use, reproduce, process, and store the User Content solely for the purpose of providing and improving the Service.</p>
            <p><strong>6.3. AI-Generated Content:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>License:</strong> We grant you a worldwide, royalty-free, perpetual, non-exclusive license to use the AI-generated images for your commercial purposes, including menus, social media, and marketing.</li>
              <li><strong>Disclaimer:</strong> Due to the nature of AI, we <strong>cannot guarantee exclusive rights</strong> to any generated image. The same or similar images may be generated for other users.</li>
              <li><strong>Third-Party Terms:</strong> The generation of images is subject to the terms of service of our AI providers (Google Gemini, OpenAI).</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">7. Acceptable Use and Prohibited Conduct</h2>
            <p><strong>7.1. Prohibited Content:</strong> You agree not to use the Service to generate, upload, or process any content that is illegal, defamatory, obscene, pornographic, abusive, or that infringes upon the intellectual property rights of any third party.</p>
            <p><strong>7.2. Abuse of Service:</strong> You agree not to abuse the AI generation features, including attempting to bypass usage limits or using the Service for any purpose other than generating food-related images and menus.</p>
            <p><strong>7.3. Compliance:</strong> You must comply with all applicable laws and regulations, including those of the UAE, regarding your use of the Service.</p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">8. Public Menu Disclosure</h2>
            <p><strong>8.1. Public Accessibility:</strong> By using the Service, you acknowledge that any menu items you finalize with generated images will be publicly accessible via a unique, non-guessable URL (e.g., mydscvr.ai/menu/:userId).</p>
            <p><strong>8.2. Data Disclosure:</strong> Anyone with this URL can view your menu items, images, prices, and descriptions. These public menus <strong>cannot be password-protected or made private</strong>. You are solely responsible for the content you choose to make public.</p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">9. Third-Party Services and Disclaimer</h2>
            <p>The Service relies on various third-party providers, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Gemini AI and OpenAI:</strong> For AI generation and enhancement.</li>
              <li><strong>Stripe:</strong> For payment processing.</li>
              <li><strong>Cloudflare R2:</strong> For image storage and delivery.</li>
              <li><strong>ZeptoMail:</strong> For transactional email delivery.</li>
            </ul>
            <p>We are not responsible for the terms, policies, or practices of these third-party services. You acknowledge that the Service's availability and functionality are dependent on these third parties.</p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">10. Disclaimer of Warranties</h2>
            <p className="uppercase">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, JASMINE ENTERTAINMENT FZE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">11. Limitation of Liability</h2>
            <p className="uppercase">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL JASMINE ENTERTAINMENT FZE BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">12. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>Emirate of Sharjah and the Federal Laws of the United Arab Emirates</strong>, without regard to its conflict of law principles. Any dispute arising out of or in connection with these Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by the competent courts in <strong>Sharjah, UAE</strong>.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Service or by sending an email to the address associated with your account. Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">14. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>
              <strong>Email:</strong> support@mydscvr.ai<br />
              <strong>Phone:</strong> +971507493651<br />
              <strong>Address:</strong> Publishing City, Sharjah, UAE
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
