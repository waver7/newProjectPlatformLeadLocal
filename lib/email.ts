import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.MAIL_FROM || 'LeadLocal <onboarding@resend.dev>';

type MailInput = { to: string; subject: string; text: string; html?: string };

async function sendMail(input: MailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[mail:mock] RESEND_API_KEY not set — would have sent to:', input.to);
    console.log('[mail:mock] Subject:', input.subject);
    console.log('[mail:mock] Body:', input.text);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  if (error) {
    console.error('[mail] Resend error:', error);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[mail:dev-fallback] To:', input.to);
      console.log('[mail:dev-fallback] Subject:', input.subject);
      console.log('[mail:dev-fallback] Body:', input.text);
      return;
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendEmailVerificationCode(email: string, code: string) {
  await sendMail({
    to: email,
    subject: 'Your LeadLocal verification code',
    text: `Your verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you did not register at LeadLocal, you can safely ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">Verify your email</h2>
        <p style="color:#475569">Enter the code below on the verification page to activate your LeadLocal account.</p>
        <div style="margin:24px 0;text-align:center">
          <span style="display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px 32px;font-size:32px;font-weight:700;letter-spacing:8px;color:#1e293b">${code}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px">This code expires in 15 minutes. If you did not create an account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await sendMail({
    to: email,
    subject: 'Reset your LeadLocal password',
    text: `Reset your password here: ${resetUrl}\n\nThis link expires in 60 minutes.\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">Reset your password</h2>
        <p style="color:#475569">Click the button below to set a new password. This link expires in 60 minutes.</p>
        <div style="margin:24px 0;text-align:center">
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a>
        </div>
        <p style="color:#94a3b8;font-size:13px">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendClientNewBidEmail(params: {
  to: string;
  requestTitle: string;
  amount: number;
  timeline: string;
  message: string;
}) {
  await sendMail({
    to: params.to,
    subject: `New bid on: ${params.requestTitle}`,
    text: `You received a new bid.\n\nAmount: $${params.amount}\nTimeline: ${params.timeline}\nMessage: ${params.message}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">New bid received</h2>
        <p style="color:#475569">Someone placed a bid on your request: <strong>${params.requestTitle}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#64748b;width:100px">Amount</td><td style="padding:8px;font-weight:600">$${params.amount}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Timeline</td><td style="padding:8px">${params.timeline}</td></tr>
          <tr><td style="padding:8px;color:#64748b;vertical-align:top">Message</td><td style="padding:8px">${params.message}</td></tr>
        </table>
      </div>
    `,
  });
}

export async function sendContractorAwardEmail(params: {
  to: string;
  requestTitle: string;
  clientEmail: string;
  clientPhone?: string;
}) {
  await sendMail({
    to: params.to,
    subject: `Your bid was accepted: ${params.requestTitle}`,
    text: `Congratulations! Your bid was accepted.\n\nContact the client at:\nEmail: ${params.clientEmail}${params.clientPhone ? `\nPhone: ${params.clientPhone}` : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">Your bid was accepted!</h2>
        <p style="color:#475569">Great news — the client accepted your bid on <strong>${params.requestTitle}</strong>.</p>
        <p style="color:#475569">Reach out to them directly:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#64748b;width:80px">Email</td><td style="padding:8px"><a href="mailto:${params.clientEmail}">${params.clientEmail}</a></td></tr>
          ${params.clientPhone ? `<tr><td style="padding:8px;color:#64748b">Phone</td><td style="padding:8px">${params.clientPhone}</td></tr>` : ''}
        </table>
      </div>
    `,
  });
}
