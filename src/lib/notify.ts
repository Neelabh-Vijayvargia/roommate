import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) return null;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

interface NotificationPayload {
    to: string;       // recipient email (MVP) or phone number (v2)
    subject: string;
    message: string;
}

export async function sendNotification({
    to,
    subject,
    message,
}: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    if (!process.env.RESEND_API_KEY) {
        console.log(
            `📧 Email (not sent — no RESEND_API_KEY):\n  To: ${to}\n  Subject: ${subject}\n  Body: ${message}`
        );
        return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    try {
        const from = process.env.NOTIFY_FROM || 'Ion 1308 <onboarding@resend.dev>';
        await getResend()!.emails.send({
            from,
            to,
            subject,
            text: message,
        });
        console.log(`📧 Email sent to ${to} — "${subject}"`);
        return { success: true };
    } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Email failed: ${error}`);
        return { success: false, error };
    }
}
