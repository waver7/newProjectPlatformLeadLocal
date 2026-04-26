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
