import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

const LAST_UPDATED = 'March 25, 2025'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-white">Account data</strong> — username, email address, and hashed password.</li>
              <li><strong className="text-white">Shop data</strong> — shop name, description, logo, and banner images.</li>
              <li><strong className="text-white">Product data</strong> — product names, descriptions, prices, and uploaded files.</li>
              <li><strong className="text-white">Purchase records</strong> — which products you have bought and payment amounts.</li>
            </ul>
            <p className="mt-3">We do not store payment card numbers. All payment data is handled by Stripe.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To operate and provide the Modlr platform.</li>
              <li>To process purchases and facilitate file delivery.</li>
              <li>To send transactional emails (e.g., password resets).</li>
              <li>To detect and prevent fraud or abuse.</li>
              <li>To improve the platform based on usage patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Information Sharing</h2>
            <p>We do not sell your personal data. We share information only:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-white">Stripe</strong> — for payment processing. Stripe receives your payment
                details and, for sellers, identity information for Stripe Connect onboarding.
              </li>
              <li>
                <strong className="text-white">Cloud infrastructure</strong> — we use hosting providers to store data
                and serve the application. These providers process data on our behalf under confidentiality agreements.
              </li>
              <li>
                <strong className="text-white">Legal requirements</strong> — we may disclose information if required by
                law or to protect the rights, property, or safety of Modlr, our users, or others.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Cookies &amp; Session Data</h2>
            <p>
              We use a single encrypted session cookie to keep you logged in. We do not use third-party
              tracking cookies or advertising cookies. No cookie consent banner is required as we only
              use strictly necessary session cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your account and purchase records as long as your account exists. Uploaded files
              are retained until you delete them. Password reset tokens expire after 1 hour and are
              purged periodically. You may request deletion of your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Security</h2>
            <p>
              Passwords are hashed with bcrypt and never stored in plaintext. Sessions are encrypted
              using iron-session. All traffic is served over HTTPS. We take reasonable measures to
              protect your data but cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have rights including:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Access to the personal data we hold about you.</li>
              <li>Correction of inaccurate data.</li>
              <li>Deletion of your account and associated data.</li>
              <li>Objection to certain processing activities.</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@modlr.app" className="text-indigo-400 hover:text-indigo-300">
                privacy@modlr.app
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Children's Privacy</h2>
            <p>
              Modlr is not directed at children under 13. We do not knowingly collect personal information
              from children. If you believe a child has provided us with personal information, please
              contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify registered users of material
              changes via email. The "last updated" date at the top reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:privacy@modlr.app" className="text-indigo-400 hover:text-indigo-300">
                privacy@modlr.app
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex gap-6 text-sm text-zinc-500">
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-zinc-300 transition-colors">Back to Marketplace</Link>
        </div>
      </main>
    </div>
  )
}
