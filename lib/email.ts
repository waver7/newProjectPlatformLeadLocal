type MailInput = { to: string; subject: string; text: string; html?: string };

type MailTransporter = {
  sendMail: (input: Record<string, unknown>) => Promise<unknown>;
};

async function getTransporter(): Promise<MailTransporter | null> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  try {
    const nodemailerModule = await import(/* webpackIgnore: true */ 'nodemailer');
    const nodemailer = (nodemailerModule as { default?: { createTransport: Function } }).default ?? (nodemailerModule as { createTransport: Function });

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    }) as MailTransporter;
  } catch {
    console.warn('[mail] nodemailer is not installed; falling back to mock logger.');
    return null;
  }
}

export async function sendMail(input: MailInput) {
  const from = process.env.MAIL_FROM || 'LeadLocal <no-reply@leadlocal.dev>';
  const transporter = await getTransporter();

  if (!transporter) {
    console.log('[mail:mock]', { from, ...input });
    return;
  }

  await transporter.sendMail({ from, ...input });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await sendMail({
    to: email,
    subject: 'Reset your LeadLocal password',
    text: `Reset your password using this link: ${resetUrl}. This link expires in 60 minutes.`
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
    subject: `New bid for: ${params.requestTitle}`,
    text: `You received a new bid. Amount: $${params.amount}. Timeline: ${params.timeline}. Message: ${params.message}`
  });
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
    `
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
    text: `Congrats! Your bid was accepted. Next steps: contact the client at ${params.clientEmail}${params.clientPhone ? ` / ${params.clientPhone}` : ''}.`
  });
}
