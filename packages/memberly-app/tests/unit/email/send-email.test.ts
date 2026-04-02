import { sendEmail } from '@/lib/email/send-email';

const mockSend = vi.fn();

vi.mock('@/lib/email/resend-client', () => ({
  getResendClient: () => ({
    emails: { send: mockSend },
  }),
}));

describe('sendEmail', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('should send email successfully', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg_123');
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Hello</p>',
      })
    );
  });

  it('should handle Resend API error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } });

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });

  it('should handle exception during send', async () => {
    mockSend.mockRejectedValue(new Error('Network error'));

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });
});
