export const metadata = {
  title: 'Terms & Conditions — LeadLocal',
  description: 'Terms and conditions for using the LeadLocal platform.'
};

const EFFECTIVE_DATE = 'May 10, 2026';
const COMPANY = 'LeadLocal, LLC';
const STATE = 'Ohio';
const EMAIL = 'legal@leadlocal.io';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Effective date: {EFFECTIVE_DATE}</p>
        <p className="mt-4 text-sm text-slate-600">
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the LeadLocal
          platform operated by {COMPANY} (&ldquo;LeadLocal,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;). By registering for an account or using our services, you agree to be bound by
          these Terms. If you do not agree, do not use the platform.
        </p>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>
          By clicking &ldquo;Create account&rdquo; or otherwise accessing LeadLocal, you confirm that you
          have read, understood, and agree to these Terms and our{' '}
          <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>. You must be at
          least 18 years old and legally able to form a binding contract to use this platform.
        </p>
        <p>
          We may update these Terms from time to time. We will notify registered users of material changes by
          email or via an in-app notice. Continued use of the platform after changes take effect constitutes
          acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="2. Description of Services">
        <p>
          LeadLocal is an online marketplace connecting homeowners and property managers (&ldquo;Clients&rdquo;)
          with licensed service contractors (&ldquo;Contractors&rdquo;) for residential and commercial
          service work, primarily within the state of {STATE}.
        </p>
        <p>
          LeadLocal acts solely as an intermediary platform. We do not perform any services, employ
          Contractors, or guarantee the quality, safety, legality, or timeliness of any work performed.
          All agreements for services are made directly between Clients and Contractors.
        </p>
      </Section>

      <Section title="3. User Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all
          activity that occurs under your account. You agree to notify us immediately at{' '}
          <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a>{' '}
          if you suspect any unauthorized access to your account.
        </p>
        <p>
          You may not share your account, create multiple accounts for the same person, or create an
          account on behalf of another person without their explicit consent. We reserve the right to
          suspend or terminate accounts that violate these Terms.
        </p>
        <p>
          Account lockout: To protect against unauthorized access, accounts are temporarily locked after
          5 consecutive failed login attempts. Lockouts last 15 minutes.
        </p>
      </Section>

      <Section title="4. Client Terms">
        <p>
          <strong>Posting requests.</strong> Clients may post service requests describing work they need
          performed. All requests are subject to content moderation. Requests that contain prohibited
          content (see Section 8) will be reviewed or rejected.
        </p>
        <p>
          <strong>Contact information.</strong> Do not include personal contact details (phone numbers,
          email addresses, social handles) in your request title or description. Your contact information
          is securely stored and shared only with the Contractor you choose to award the job to.
        </p>
        <p>
          <strong>Awarding bids.</strong> You are under no obligation to award any bid. Once awarded,
          all further communication and the service agreement are between you and the selected Contractor.
          LeadLocal is not a party to that agreement.
        </p>
        <p>
          <strong>Free trial.</strong> New Client accounts receive a 1-day free trial permitting one
          service request. Continued posting requires an active paid subscription.
        </p>
      </Section>

      <Section title="5. Contractor Terms">
        <p>
          <strong>Subscription required.</strong> An active Contractor Pro subscription ($10/month) is
          required to place bids on service requests.
        </p>
        <p>
          <strong>Accuracy of information.</strong> By registering as a Contractor, you represent that
          your business name, service area, and qualifications are accurate. You are solely responsible for
          obtaining any required licenses, permits, and insurance for work in {STATE}.
        </p>
        <p>
          <strong>Bids are binding offers.</strong> By submitting a bid, you commit to performing the
          described work at the quoted price if your bid is accepted by the Client. Contractors who
          repeatedly withdraw awarded bids may have their accounts suspended.
        </p>
        <p>
          <strong>No solicitation off-platform.</strong> Contractors may not include contact details
          (phone, email, social) in their bid messages. All communication must remain within the platform
          until a bid is awarded.
        </p>
      </Section>

      <Section title="6. Payment and Subscriptions">
        <p>
          Subscription fees are billed monthly in advance. All payments are processed by Stripe, Inc.
          LeadLocal does not store credit card information. By subscribing, you authorize us to charge
          your payment method on a recurring monthly basis until you cancel.
        </p>
        <p>
          <strong>Cancellation.</strong> You may cancel your subscription at any time via the Billing
          page. Cancellation takes effect at the end of the current billing period. No partial-month
          refunds are provided unless required by applicable law.
        </p>
        <p>
          <strong>Free trial.</strong> The 1-day Client trial requires no payment method. After the trial
          expires, you must subscribe to post additional requests. We reserve the right to modify or
          discontinue the free trial offer at any time.
        </p>
        <p>
          Prices are in US Dollars. We reserve the right to change pricing with 30 days&rsquo; notice to
          current subscribers.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          All content, trademarks, and software comprising the LeadLocal platform are owned by or
          licensed to {COMPANY}. You may not copy, reproduce, or create derivative works of platform
          content without our written permission.
        </p>
        <p>
          By posting content on LeadLocal (request descriptions, bid messages, profile information), you
          grant {COMPANY} a non-exclusive, royalty-free license to display, process, and distribute that
          content as necessary to operate the platform.
        </p>
      </Section>

      <Section title="8. Prohibited Content and Conduct">
        <p>You may not use LeadLocal to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Post requests or bids involving illegal services or prohibited goods</li>
          <li>Harass, threaten, or discriminate against other users</li>
          <li>Impersonate another person, business, or entity</li>
          <li>Circumvent the platform by exchanging contact information before a bid is awarded</li>
          <li>Post false, misleading, or fraudulent requests or bids</li>
          <li>Engage in any activity that disrupts or interferes with platform operations</li>
          <li>Scrape, crawl, or otherwise extract data without our written permission</li>
        </ul>
        <p>
          Violations may result in immediate account suspension or termination, at our sole discretion.
        </p>
      </Section>

      <Section title="9. Moderation and Content Review">
        <p>
          We use automated systems to detect contact information and prohibited keywords in user-generated
          content. Content flagged as containing contact details will be rejected with an error message so
          the user can correct it. Content containing prohibited keywords will be held for manual admin
          review before publication.
        </p>
        <p>
          We reserve the right (but not the obligation) to review, remove, or modify any content at our
          discretion. Moderation decisions are final but may be appealed by emailing{' '}
          <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a>.
        </p>
      </Section>

      <Section title="10. Disclaimer of Warranties">
        <p>
          THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED. LEADLOCAL DOES NOT WARRANT THAT THE PLATFORM WILL BE
          UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES. WE DO NOT WARRANT THE QUALITY, SAFETY, OR
          LEGALITY OF SERVICES OFFERED BY CONTRACTORS, NOR THE ACCURACY OF ANY USER-SUBMITTED CONTENT.
        </p>
      </Section>

      <Section title="11. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LEADLOCAL AND ITS OFFICERS, DIRECTORS,
          EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR
          CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO LOSS
          OF PROFITS, DATA, OR GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE PLATFORM
          SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE
          CLAIM OR (B) $50 USD.
        </p>
      </Section>

      <Section title="12. Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless {COMPANY} from and against any claims,
          liabilities, damages, and expenses (including reasonable attorneys&rsquo; fees) arising from
          your use of the platform, your violation of these Terms, or any service work performed or
          received through the platform.
        </p>
      </Section>

      <Section title="13. Governing Law and Dispute Resolution">
        <p>
          These Terms are governed by and construed in accordance with the laws of the State of {STATE},
          without regard to its conflict-of-law provisions. Any disputes arising from these Terms or use
          of the platform shall be resolved exclusively in the state or federal courts located in
          Columbus, {STATE}, and you consent to personal jurisdiction in those courts.
        </p>
      </Section>

      <Section title="14. Termination">
        <p>
          We may suspend or terminate your account at any time for violation of these Terms, without
          prior notice. You may close your account at any time by contacting{' '}
          <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a>.
          Termination does not entitle you to a refund of any prepaid subscription fees.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Questions about these Terms? Email us at{' '}
          <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a>.
        </p>
      </Section>
    </div>
  );
}
