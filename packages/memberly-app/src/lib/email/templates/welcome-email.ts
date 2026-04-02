import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '../send-email';

interface WelcomeEmailParams {
  memberName: string;
  memberEmail: string;
  productName: string;
  loginUrl: string;
}

interface WelcomeEmailResult {
  sent: boolean;
  error?: string;
  skipped?: boolean;
}

interface SiteSettings {
  welcome_email_active?: boolean;
  welcome_email_subject?: string;
  welcome_email_body?: string;
}

async function getEmailSettings(): Promise<SiteSettings> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['welcome_email_active', 'welcome_email_subject', 'welcome_email_body']);

  const settings: SiteSettings = {};
  if (data) {
    for (const row of data) {
      const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      (settings as Record<string, unknown>)[row.key] = parsed;
    }
  }
  return settings;
}

function replaceTemplateVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

function textToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
}

export async function sendWelcomeEmail({
  memberName,
  memberEmail,
  productName,
  loginUrl,
}: WelcomeEmailParams): Promise<WelcomeEmailResult> {
  try {
    const settings = await getEmailSettings();

    if (settings.welcome_email_active === false) {
      return { sent: false, skipped: true };
    }

    const platformName = 'Memberly';

    const templateVars: Record<string, string> = {
      member_name: memberName,
      product_name: productName,
      login_url: loginUrl,
      platform_name: platformName,
    };

    const subject = replaceTemplateVars(
      settings.welcome_email_subject || 'Bem-vindo(a) ao {{product_name}}!',
      templateVars
    );

    const bodyText = replaceTemplateVars(
      settings.welcome_email_body ||
        'Ola {{member_name}},\n\nSeu acesso ao {{product_name}} foi liberado!\n\nAcesse agora: {{login_url}}\n\nQualquer duvida, entre em contato.\n\nAbraco,\nEquipe {{platform_name}}',
      templateVars
    );

    const html = textToHtml(bodyText);

    const result = await sendEmail({ to: memberEmail, subject, html });

    if (!result.success) {
      return { sent: false, error: result.error };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown welcome email error';
    console.error('[sendWelcomeEmail] Exception:', message);
    return { sent: false, error: message };
  }
}
