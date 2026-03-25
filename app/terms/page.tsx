import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service' }

const LAST_UPDATED = 'March 25, 2025'

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{n}. {title}</h2>
      {children}
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="text-zinc-600 text-sm mt-2">
            Please read these terms carefully. By using Modlr you agree to all of them.
          </p>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">

          <Section n={1} title="Acceptance of Terms">
            <p>
              By accessing, registering on, or using Modlr ("the Platform", "we", "us", "our"),
              you ("the User") agree to be legally bound by these Terms of Service in their entirety.
              If you do not agree with any part of these terms, you must immediately stop using the Platform.
            </p>
            <p className="mt-2">
              We reserve the right to modify these terms at any time without prior notice. The updated terms
              will be posted on this page with a revised date. Your continued use of the Platform after any
              modification constitutes your acceptance of the new terms. It is your sole responsibility to
              review these terms periodically.
            </p>
          </Section>

          <Section n={2} title="Description of Service">
            <p>
              Modlr is a technology platform that allows independent sellers to list and sell digital 3D model
              files, and allows buyers to browse and purchase those files. Modlr acts solely as an intermediary
              marketplace. We are <strong className="text-white">not</strong> a seller, manufacturer, or distributor
              of any product listed on the Platform.
            </p>
            <p className="mt-2">
              We do not verify, inspect, endorse, or take any responsibility for the content, quality, accuracy,
              legality, or safety of any product listed by sellers. Each transaction is a direct agreement
              between the buyer and the seller. Modlr is not a party to that agreement.
            </p>
            <p className="mt-2">
              We reserve the right to modify, suspend, or permanently discontinue the Platform or any feature
              of it at any time, with or without notice, and without any liability to you.
            </p>
          </Section>

          <Section n={3} title="Account Registration & Security">
            <p>
              You must be at least 13 years old to create an account. By registering, you confirm that all
              information you provide is accurate, complete, and up to date, and you agree to keep it that way.
            </p>
            <p className="mt-2">You are solely and entirely responsible for:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Maintaining the strict confidentiality of your login credentials.</li>
              <li>All activity that occurs under your account, whether authorized by you or not.</li>
              <li>Any content posted, uploaded, or sold under your account.</li>
              <li>Any harm caused to third parties through your account.</li>
            </ul>
            <p className="mt-2">
              You must notify us immediately at{' '}
              <a href="mailto:support@modlr.app" className="text-indigo-400 hover:text-indigo-300">support@modlr.app</a>{' '}
              if you suspect any unauthorized use of your account. Modlr is not liable for any loss or damage
              arising from your failure to keep your credentials secure, from unauthorized use of your account,
              or from your failure to notify us promptly.
            </p>
            <p className="mt-2">
              We may suspend or permanently terminate your account at any time, at our sole discretion, without
              notice or liability.
            </p>
          </Section>

          <Section n={4} title="Minors">
            <p>
              The Platform is not directed at children under the age of 13. Users between 13 and 18 must have
              the permission of a parent or legal guardian who accepts these terms on their behalf. The parent
              or guardian is fully responsible for all activity, purchases, and conduct of the minor while
              using the Platform. Modlr is not liable for any harm to or caused by a minor using the Platform.
            </p>
            <p className="mt-2">
              If we discover that a user is under 13, we will immediately terminate their account and delete
              their data.
            </p>
          </Section>

          <Section n={5} title="Seller Responsibilities & Obligations">
            <p>By listing a product on Modlr, you represent, warrant, and agree that:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>You are the original creator of the file, or hold all necessary rights, licenses, and permissions to sell it commercially.</li>
              <li>Your product does not infringe any copyright, trademark, patent, trade secret, or other intellectual property right of any third party.</li>
              <li>Your product descriptions, previews, and specifications are accurate, complete, and not misleading in any way.</li>
              <li>Your product does not contain malware, viruses, ransomware, exploits, or any harmful code.</li>
              <li>You are solely responsible for determining, reporting, and paying all applicable taxes on your sales income.</li>
              <li>You will complete Stripe Connect onboarding truthfully and in full compliance with Stripe's terms and applicable law.</li>
              <li>You will not attempt to conduct transactions outside the Platform to avoid fees.</li>
              <li>You will not list the same product under multiple accounts.</li>
            </ul>
            <p className="mt-2">
              If any third party files a claim against Modlr alleging that your content infringes their rights
              or causes harm, you agree to fully indemnify Modlr for all resulting costs, damages, and legal
              fees. Modlr reserves the right to remove any listing at any time without notice or compensation.
            </p>
          </Section>

          <Section n={6} title="No Refunds — All Sales Final">
            <p className="font-semibold text-white">
              All purchases on Modlr are final and strictly non-refundable.
            </p>
            <p className="mt-2">
              All products are digital files delivered instantly upon purchase. Once access to a file has been
              granted, no refund, exchange, store credit, or partial credit will be issued under any
              circumstances, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>The file did not meet your expectations or requirements.</li>
              <li>The file is not compatible with your software or workflow.</li>
              <li>You purchased the wrong product by mistake.</li>
              <li>You no longer want or need the product.</li>
              <li>You were unable to open, extract, or use the file.</li>
              <li>The product description was unclear or ambiguous to you.</li>
              <li>You found a similar product elsewhere at a lower price.</li>
              <li>Technical issues on your end prevented use of the file.</li>
              <li>The file did not produce the result you expected when used in your project.</li>
              <li>The file contained errors you did not notice before purchasing.</li>
            </ul>
            <p className="mt-2">
              It is entirely your responsibility to read the product description, review all previews, check
              the file format, and verify the specifications meet your needs{' '}
              <strong className="text-white">before completing a purchase</strong>. By clicking "Buy" or
              completing checkout, you confirm you have done so and accept that the sale is final.
            </p>
            <p className="mt-2">
              If you initiate a payment dispute or chargeback with your bank or card issuer, we reserve the
              right to permanently suspend your account, ban you from the Platform, and pursue recovery of
              the disputed amount and any associated fees through all available legal means.
            </p>
          </Section>

          <Section n={7} title="Buyer Responsibilities & Assumption of Risk">
            <p>As a buyer, you accept full, sole responsibility for:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Evaluating whether a product is suitable for your intended use before purchasing.</li>
              <li>Ensuring your software is capable of opening and using the purchased file format.</li>
              <li>Any results produced from rendering, modifying, or otherwise using a purchased file.</li>
              <li>Complying with any licensing terms specified by the seller for the product.</li>
              <li>Any financial loss or damages arising from the use of a purchased file in your projects.</li>
            </ul>
            <p className="mt-2">
              You may not resell, redistribute, sublicense, or share purchased files with third parties without
              explicit written permission from the seller. Violation may result in immediate account termination
              and legal action.
            </p>
            <p className="mt-2">
              You purchase and use all files entirely at your own risk. Modlr makes no guarantee that any file
              will be error-free, render-ready, or fit for any specific purpose.
            </p>
          </Section>

          <Section n={8} title="Digital Files — As-Is">
            <p>
              All 3D model files on Modlr are digital products sold as-is for creative, personal, and
              commercial use in digital environments such as games, animation, VR/AR, rendering, and design.
              Modlr makes <strong className="text-white">no representations or warranties</strong> regarding
              the technical quality, polygon count accuracy, UV mapping, rigging, texture compatibility,
              or suitability of any file for any particular software pipeline or project.
            </p>
            <p className="mt-2">You are solely responsible for:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Verifying file format compatibility with your software before purchasing.</li>
              <li>Any rework, retopology, or modification required to make a file suitable for your use.</li>
              <li>Ensuring you have the appropriate software licenses to open and use the files.</li>
              <li>Any outcome or result produced using the purchased file in your own projects.</li>
            </ul>
          </Section>

          <Section n={9} title="No Professional Advice">
            <p>
              Nothing on the Platform constitutes legal, financial, technical, or professional advice of any
              kind. Any descriptions, specifications, or instructions provided by sellers are for informational
              purposes only. Modlr is not responsible for any decisions you make based on content found on
              the Platform.
            </p>
          </Section>

          <Section n={10} title="Platform Fees">
            <p>
              Modlr charges a platform fee of 10% on each paid transaction. The remaining 90% is transferred
              to the seller's connected Stripe account. Free products are not subject to fees. We reserve the
              right to change the fee structure at any time with reasonable notice posted on the Platform.
              Continued use after a fee change constitutes acceptance of the new fees.
            </p>
          </Section>

          <Section n={11} title="Payments & Taxes">
            <p>
              Payments are processed by Stripe, Inc. By transacting on Modlr, you agree to{' '}
              <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                Stripe's Terms of Service
              </a>. Modlr does not store, process, or have access to your payment card information.
            </p>
            <p className="mt-2">
              Modlr is not liable for any payment failures, errors, delays, or disputes involving Stripe.
              Any billing issues must be resolved directly with Stripe or your card issuer.
            </p>
            <p className="mt-2">
              Each user — buyer and seller alike — is solely responsible for determining and fulfilling
              their own tax obligations in their jurisdiction. Modlr does not collect, withhold, or remit
              sales tax, VAT, GST, or income tax on behalf of any user, and is not liable for any tax
              obligations you fail to meet.
            </p>
          </Section>

          <Section n={12} title="Intellectual Property & DMCA">
            <p>
              Sellers retain full ownership of their uploaded content. By listing on Modlr, sellers grant us
              a non-exclusive, royalty-free, worldwide license to display, promote, and deliver their content
              to buyers for as long as the listing is active. This license ends when the listing is removed.
            </p>
            <p className="mt-2">
              The Modlr name, logo, platform design, interface, and underlying code are the intellectual
              property of Modlr and may not be used, copied, reproduced, or distributed without our express
              written consent.
            </p>
            <p className="mt-2">
              If you believe content on Modlr infringes your intellectual property rights, send a DMCA
              takedown notice to{' '}
              <a href="mailto:dmca@modlr.app" className="text-indigo-400 hover:text-indigo-300">dmca@modlr.app</a>{' '}
              with: (1) identification of the copyrighted work, (2) identification and location of the
              infringing material, (3) your contact information, (4) a statement of good faith belief, and
              (5) a statement of accuracy under penalty of perjury. We will review valid notices and may
              remove content at our sole discretion.
            </p>
            <p className="mt-2">
              Filing a false DMCA notice may expose you to liability. Modlr is not responsible for resolving
              IP ownership disputes between third parties.
            </p>
          </Section>

          <Section n={13} title="Prohibited Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Upload, sell, or distribute content that infringes any intellectual property right.</li>
              <li>Upload files containing malware, viruses, ransomware, or any malicious code.</li>
              <li>Upload content that is illegal, defamatory, threatening, hateful, or obscene.</li>
              <li>Attempt to circumvent, reverse-engineer, decompile, or exploit any part of the Platform.</li>
              <li>Engage in fraud, impersonation, phishing, or any deceptive practice.</li>
              <li>Create multiple accounts to circumvent suspensions, bans, or free download limits.</li>
              <li>Conduct transactions outside of Modlr to avoid platform fees.</li>
              <li>Scrape, harvest, or systematically collect data from the Platform without written permission.</li>
              <li>Use automated bots, scripts, or tools to interact with the Platform.</li>
              <li>Use the Platform to spam, solicit, or send unsolicited communications to other users.</li>
              <li>Attempt to gain unauthorized access to other users' accounts or data.</li>
              <li>Use the Platform in any way that could damage, overload, or impair its performance.</li>
              <li>Misrepresent your identity, your files, or your rights to sell any content.</li>
              <li>Encourage, assist, or facilitate any other user in doing any of the above.</li>
            </ul>
            <p className="mt-2">
              Violation may result in immediate account termination without refund, withholding of any
              pending payouts, and potential civil or criminal liability.
            </p>
          </Section>

          <Section n={14} title="Modlr is a Marketplace — Not a Seller">
            <p>
              Modlr does not create, manufacture, inspect, endorse, or guarantee any product on the Platform.
              All products are created and sold solely by independent third-party sellers.
            </p>
            <p className="mt-2">Modlr is <strong className="text-white">not responsible</strong> for:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>The accuracy, completeness, or quality of any listing, description, or file.</li>
              <li>Whether a product meets your specific requirements, use case, or expectations.</li>
              <li>Compatibility of any file with your particular software or workflow.</li>
              <li>The visual quality, polygon accuracy, UV mapping, or rendering performance of any file.</li>
              <li>Financial loss or project delays arising from using a purchased file.</li>
              <li>Any dispute between a buyer and a seller.</li>
              <li>Whether a seller has the legal rights to sell their listed content.</li>
              <li>The seller's continued presence, reliability, or conduct on the Platform.</li>
              <li>The availability of a product after purchase if the seller removes it.</li>
            </ul>
            <p className="mt-2">
              Any dispute arising from a transaction is solely between the buyer and the seller. Modlr may at
              its absolute discretion assist in resolving disputes but has no obligation to do so, and any
              involvement does not imply liability on Modlr's part.
            </p>
          </Section>

          <Section n={15} title="Disclaimers & Limitation of Liability">
            <p>
              The Platform is provided <strong className="text-white">"as is"</strong> and{' '}
              <strong className="text-white">"as available"</strong> without warranty of any kind, express
              or implied. To the fullest extent permitted by law, Modlr expressly disclaims all warranties,
              including merchantability, fitness for a particular purpose, title, and non-infringement.
            </p>
            <p className="mt-2">Modlr does not warrant that:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>The Platform will be uninterrupted, error-free, secure, or available at any time.</li>
              <li>Any file is safe, accurate, complete, or fit for any purpose.</li>
              <li>Defects will be corrected or the Platform is free of viruses or harmful components.</li>
              <li>Any particular result or outcome from using the Platform or any purchased file.</li>
            </ul>
            <p className="mt-2">
              To the maximum extent permitted by law, Modlr and its operators, employees, and affiliates
              shall not be liable for any indirect, incidental, special, consequential, punitive, or
              exemplary damages — including loss of profits, loss of data, loss of goodwill, service
              interruption, project delays, lost revenue, or cost of substitute goods — arising from your
              use of the Platform or any product purchased through it, even if
              advised of the possibility of such damages.
            </p>
            <p className="mt-2">
              Modlr's maximum total liability for any claim is strictly limited to the platform fee amount
              collected on the single transaction giving rise to the claim — not the full sale price.
            </p>
          </Section>

          <Section n={16} title="Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless Modlr and its operators, employees,
              contractors, and affiliates from and against any and all claims, damages, losses, liabilities,
              costs, and expenses (including reasonable legal fees) arising from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Your use of the Platform.</li>
              <li>Any content you upload, list, or sell on the Platform.</li>
              <li>Your violation of these Terms of Service.</li>
              <li>Your violation of any third-party right, including intellectual property or privacy rights.</li>
              <li>Any claim by a buyer or third party arising from a product you have sold.</li>
              <li>Any harm or financial loss caused to a buyer or third party arising from a file you sold.</li>
              <li>Any fraudulent, deceptive, or illegal activity by you.</li>
            </ul>
            <p className="mt-2">
              This indemnification obligation survives termination of your account and your use of the Platform.
            </p>
          </Section>

          <Section n={17} title="Third-Party Links & Services">
            <p>
              The Platform may contain links to third-party websites, services, or resources (such as Stripe).
              These links are provided for convenience only. Modlr has no control over, and assumes no
              responsibility for, the content, privacy policies, or practices of any third-party site or
              service. Your use of third-party services is governed entirely by their own terms, and Modlr
              is not a party to those agreements.
            </p>
          </Section>

          <Section n={18} title="Communications & Notifications">
            <p>
              By creating an account, you consent to receive transactional emails from Modlr, including
              but not limited to: purchase confirmations, password reset emails, account security alerts,
              and policy update notices. These emails are necessary for the operation of the Platform and
              cannot be opted out of while your account is active.
            </p>
            <p className="mt-2">
              Modlr is not responsible for communications that go to spam, are blocked by your email
              provider, or are not received due to circumstances outside our control.
            </p>
          </Section>

          <Section n={19} title="Feedback & Suggestions">
            <p>
              If you submit feedback, ideas, suggestions, or feature requests to Modlr, you grant us a
              perpetual, irrevocable, royalty-free, worldwide license to use, reproduce, modify, and
              incorporate that feedback into the Platform without any obligation, compensation, or
              attribution to you. You waive any moral rights in such submissions to the extent permitted
              by law.
            </p>
          </Section>

          <Section n={20} title="Account Inactivity">
            <p>
              Accounts with no activity for a period of 24 consecutive months may be considered inactive.
              We reserve the right to suspend or permanently delete inactive accounts and their associated
              data after reasonable notice (if possible). Modlr is not liable for any loss of data or
              content resulting from the deletion of an inactive account.
            </p>
          </Section>

          <Section n={21} title="Force Majeure">
            <p>
              Modlr shall not be liable for any failure or delay in the performance of its obligations
              under these terms if such failure or delay is caused by circumstances beyond our reasonable
              control, including but not limited to: natural disasters, acts of God, war, terrorism,
              civil unrest, government action, internet or infrastructure outages, cyberattacks,
              epidemics, power failures, or acts or omissions of third-party service providers (including
              Stripe or cloud hosting providers).
            </p>
          </Section>

          <Section n={22} title="Availability & Uptime">
            <p>
              We do not guarantee that the Platform will be available at any given time or on a continuous,
              uninterrupted basis. The Platform may be taken offline for maintenance, updates, or due to
              events outside our control. Modlr is not liable for any loss, inconvenience, or damage caused
              by Platform unavailability, including the temporary or permanent inaccessibility of files
              you have purchased or listed.
            </p>
          </Section>

          <Section n={23} title="Export Compliance">
            <p>
              You are solely responsible for ensuring your use of the Platform and any files you purchase or
              distribute comply with all applicable export control laws and regulations in your jurisdiction
              and in the jurisdiction of the recipient. Modlr makes no representation that the Platform or
              any content on it is appropriate for use in all countries, and expressly disclaims all liability
              arising from your export compliance failures.
            </p>
          </Section>

          <Section n={24} title="Termination">
            <p>
              We may suspend or permanently terminate your account, remove your listings, and deny you access
              to the Platform at any time, for any reason, without notice and without liability. Grounds
              include, but are not limited to: violation of these terms, fraudulent activity, chargebacks,
              inactivity, or conduct we deem harmful to the Platform or its users.
            </p>
            <p className="mt-2">
              Upon termination: your listings will be removed, your access will be revoked, and any pending
              payouts may be withheld pending investigation. Modlr has no obligation to store, forward, or
              return any of your uploaded files after account termination. Purchases already completed by
              buyers before termination are unaffected.
            </p>
            <p className="mt-2">
              You may request account deletion at any time by contacting us. Deletion does not entitle you
              to any refund of fees paid.
            </p>
          </Section>

          <Section n={25} title="No Waiver">
            <p>
              Our failure to enforce any provision of these terms on one occasion does not constitute a
              waiver of our right to enforce that provision on any future occasion. No waiver shall be
              effective unless made in writing and signed by an authorised representative of Modlr.
            </p>
          </Section>

          <Section n={26} title="Assignment">
            <p>
              You may not assign, transfer, or sublicense any of your rights or obligations under these
              terms to any third party without our prior written consent. Modlr may freely assign, transfer,
              or delegate these terms or any rights hereunder to any successor entity, affiliate, or in
              connection with a merger, acquisition, or sale of assets, without restriction or notice to you.
            </p>
          </Section>

          <Section n={27} title="Governing Law & Disputes">
            <p>
              These terms are governed by and construed in accordance with applicable law. Any dispute
              arising from or in connection with these terms or your use of the Platform shall first be
              attempted to be resolved informally by contacting us at{' '}
              <a href="mailto:support@modlr.app" className="text-indigo-400 hover:text-indigo-300">support@modlr.app</a>.
              If informal resolution fails within 30 days, disputes shall be resolved through binding
              individual arbitration. You expressly waive any right to bring or participate in a class
              action, collective action, or representative proceeding against Modlr.
            </p>
          </Section>

          <Section n={28} title="Severability & Entire Agreement">
            <p>
              If any provision of these terms is found invalid, illegal, or unenforceable, it shall be
              modified to the minimum extent necessary to make it enforceable, and the remaining provisions
              shall continue in full force and effect.
            </p>
            <p className="mt-2">
              These Terms of Service, together with our{' '}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>,
              constitute the entire agreement between you and Modlr regarding your use of the Platform and
              supersede all prior agreements, representations, or understandings, whether written or oral.
            </p>
          </Section>

          <Section n={29} title="Contact">
            <p>Questions about these terms?</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>General support: <a href="mailto:support@modlr.app" className="text-indigo-400 hover:text-indigo-300">support@modlr.app</a></li>
              <li>IP / DMCA notices: <a href="mailto:dmca@modlr.app" className="text-indigo-400 hover:text-indigo-300">dmca@modlr.app</a></li>
              <li>Privacy enquiries: <a href="mailto:privacy@modlr.app" className="text-indigo-400 hover:text-indigo-300">privacy@modlr.app</a></li>
            </ul>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex gap-6 text-sm text-zinc-500">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-zinc-300 transition-colors">Back to Marketplace</Link>
        </div>
      </main>
    </div>
  )
}
