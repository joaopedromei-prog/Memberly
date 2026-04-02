import { sendWelcomeEmail } from '@/lib/email/templates/welcome-email';

const mockSend = vi.fn();

let mockSettingsData: Array<{ key: string; value: string }> = [];

vi.mock('@/lib/email/resend-client', () => ({
  getResendClient: () => ({
    emails: { send: mockSend },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        in: () => ({
          data: mockSettingsData,
        }),
      }),
    }),
  }),
}));

const defaultSettings = [
  { key: 'welcome_email_active', value: 'true' },
  { key: 'welcome_email_subject', value: '"Bem-vindo ao {{product_name}}!"' },
  {
    key: 'welcome_email_body',
    value:
      '"Ola {{member_name}},\\n\\nSeu acesso ao {{product_name}} foi liberado!\\n\\nAcesse: {{login_url}}\\n\\nEquipe {{platform_name}}"',
  },
];

const defaultParams = {
  memberName: 'Joao',
  memberEmail: 'joao@test.com',
  productName: 'Curso React',
  loginUrl: 'https://app.memberly.com/login',
};

describe('sendWelcomeEmail', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSettingsData = [...defaultSettings];
  });

  it('should send welcome email with template variables replaced', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_456' }, error: null });

    const result = await sendWelcomeEmail(defaultParams);

    expect(result.sent).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'joao@test.com',
        subject: 'Bem-vindo ao Curso React!',
      })
    );

    const sentHtml = mockSend.mock.calls[0][0].html;
    expect(sentHtml).toContain('Joao');
    expect(sentHtml).toContain('Curso React');
    expect(sentHtml).toContain('https://app.memberly.com/login');
    expect(sentHtml).toContain('Memberly');
  });

  it('should skip sending when welcome_email_active is false', async () => {
    mockSettingsData = [{ key: 'welcome_email_active', value: 'false' }];

    const result = await sendWelcomeEmail(defaultParams);

    expect(result.sent).toBe(false);
    expect(result.skipped).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should handle email send failure gracefully', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Quota exceeded' } });

    const result = await sendWelcomeEmail(defaultParams);

    expect(result.sent).toBe(false);
    expect(result.error).toBe('Quota exceeded');
  });

  it('should handle missing RESEND_API_KEY gracefully', async () => {
    mockSend.mockRejectedValue(new Error('RESEND_API_KEY environment variable is not set'));

    const result = await sendWelcomeEmail(defaultParams);

    expect(result.sent).toBe(false);
    expect(result.error).toContain('RESEND_API_KEY');
  });
});
