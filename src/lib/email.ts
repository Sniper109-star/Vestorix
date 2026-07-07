import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY;
const FROM =
  process.env.RESEND_FROM ?? "Invest Platform <noreply@invest.local>";

function client(): Resend | null {
  if (!API_KEY) return null;
  return new Resend(API_KEY);
}

interface MailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(input: MailInput): Promise<void> {
  const resend = client();
  if (!resend) {
    console.info(`[email:disabled] -> ${input.to}: ${input.subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, ...input });
  } catch (err) {
    console.error("Resend send failed", err);
  }
}

function money(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function notifyDepositSubmitted(to: string, amount: number, asset: string) {
  return sendEmail({
    to,
    subject: "Deposit received — pending review",
    html: `<p>Your deposit of <strong>${money(amount)} ${asset}</strong> has been submitted and is pending review.</p>`,
  });
}

export function notifyDepositApproved(to: string, amount: number, asset: string) {
  return sendEmail({
    to,
    subject: "Deposit approved",
    html: `<p>Good news! Your deposit of <strong>${money(amount)} ${asset}</strong> has been approved and credited to your balance.</p>`,
  });
}

export function notifyWithdrawalRequested(to: string, amount: number, asset: string) {
  return sendEmail({
    to,
    subject: "Withdrawal requested — pending review",
    html: `<p>We received your withdrawal request of <strong>${money(amount)} ${asset}</strong>. Our team will review it shortly.</p>`,
  });
}

export function notifyWithdrawalApproved(to: string, amount: number, asset: string, address: string) {
  return sendEmail({
    to,
    subject: "Withdrawal approved",
    html: `<p>Your withdrawal of <strong>${money(amount)} ${asset}</strong> to <code>${address}</code> has been approved.</p>`,
  });
}
