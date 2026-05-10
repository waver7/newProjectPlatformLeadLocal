export const metadata = {
  title: 'Privacy Policy — LeadLocal',
  description: 'How LeadLocal collects, uses, and protects your personal information.'
};

const EFFECTIVE_DATE = 'May 10, 2026';
const EMAIL = 'privacy@leadlocal.io';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Effective date: {EFFECTIVE_DATE}</p>
        <p className="mt-4 text-sm text-slate-600">
          This Privacy Policy explains how LeadLocal, LLC (&ldquo;LeadLocal,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us&rdquo;) collects, uses, and protects information when you use our platform. By using
          LeadLocal you agree to the practices described here.
        </p>
      </div>

      <Section title="1. Information We Collect">
        <p><strong>Account information:</strong> name, email address, password (stored as a bcrypt hash — we never store plaintext passwords), and role (Client or Contractor).</p>
        <p><strong>Profile information:</strong> city, state, phone number, business name, service area, bio, and website URL that you voluntarily provide.</p>
        <p><strong>Request and bid content:</strong> titles, descriptions, and messages you submit on the platform.</p>
        <p><strong>Private contact details:</strong> phone number and email provided by Clients when posting requests. These are stored securely and only revealed to the winning Contractor after bid award.</p>
        <p><strong>Payment information:</strong> subscription plan and billing history. Payment card details are processed and stored by Stripe, Inc. — we never see or store full card numbers.</p>
        <p><strong>Usage data:</strong> log data, IP addresses, browser type, pages visited, and timestamps, collected automatically for security and analytics.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To operate and improve the platform</li>
          <li>To match Clients with Contractors based on location and category</li>
          <li>To process payments and manage subscriptions via Stripe</li>
          <li>To send transactional emails (bid notifications, account alerts, password resets)</li>
          <li>To moderate content and enforce our Terms &amp; Conditions</li>
          <li>To detect and prevent fraud, abuse, and security incidents</li>
          <li>To comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="3. Contact Information Sharing">
        <p>
          <strong>Private contact details</strong> (phone and email provided at request posting) are
          never displayed publicly. They are shared with a Contractor only after the Client explicitly
          awards that Contractor&rsquo;s bid. No Contractor can access your contact details before you
          choose them.
        </p>
        <p>
          <strong>Public request information</strong> (title, description, city, category, urgency) is
          visible to all users of the platform, including guests.
        </p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>We share data with the following third parties only as necessary to operate the platform:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Stripe, Inc.</strong> — payment processing. Stripe&rsquo;s privacy policy applies to data they collect during checkout.</li>
          <li><strong>Email service provider</strong> — transactional emails (password reset, bid notifications). Only your email address and the content of the notification are shared.</li>
          <li><strong>Hosting and infrastructure</strong> — servers that store encrypted data within the United States.</li>
        </ul>
        <p>We do not sell, rent, or trade your personal data to advertisers or data brokers.</p>
      </Section>

      <Section title="5. Data Retention">
        <p>
          We retain your account data for as long as your account is active. If you close your account,
          we delete personal profile data within 30 days, subject to legal hold requirements. Request and
          bid records may be retained in anonymized form for platform analytics.
        </p>
      </Section>

      <Section title="6. Security">
        <p>
          We use industry-standard protections including TLS encryption in transit, bcrypt password
          hashing, server-side session tokens, and login-attempt rate limiting (accounts lock after
          5 consecutive failures for 15 minutes). No system is perfectly secure — report suspicious
          activity to <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a>.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate information via your profile settings</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt out of non-transactional marketing emails</li>
        </ul>
        <p>
          To exercise these rights, email{' '}
          <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a>.
          We will respond within 30 days.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use a single session cookie to keep you logged in. We do not use third-party tracking
          cookies or advertising cookies. You can disable cookies in your browser, but doing so will
          prevent you from logging in.
        </p>
      </Section>

      <Section title="9. Children&apos;s Privacy">
        <p>
          LeadLocal is not directed to children under 18. We do not knowingly collect personal
          information from minors. If you believe we have inadvertently collected such data, contact
          us at <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a> and
          we will delete it promptly.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy to reflect changes in our practices or applicable law.
          We will notify registered users of material changes by email. The effective date at the top of
          this page indicates when the most recent revision was made.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Privacy questions or requests:{' '}
          <a href={`mailto:${EMAIL}`} className="text-brand-600 hover:underline">{EMAIL}</a>
        </p>
      </Section>
    </div>
  );
}
