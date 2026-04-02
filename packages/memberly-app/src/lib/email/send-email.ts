import { getResendClient } from './resend-client';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@memberly.app';

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[sendEmail] Resend API error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    console.error('[sendEmail] Exception:', message);
    return { success: false, error: message };
  }
}
