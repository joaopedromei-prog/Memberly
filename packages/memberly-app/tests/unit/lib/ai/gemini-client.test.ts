import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Gemini SDK
const mockGenerateContent = vi.fn();
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class MockGoogleGenerativeAI {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent };
    }
  },
}));

vi.mock('@/lib/ai/prompts/generate-banner', () => ({
  buildBannerPrompt: vi.fn().mockReturnValue('mocked banner prompt'),
}));

describe('gemini-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('returns base64 data and mimeType on success', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'base64imagedata',
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const { generateBanner } = await import('@/lib/ai/gemini-client');
    const result = await generateBanner('A professional banner');

    expect(result).toEqual({
      base64Data: 'base64imagedata',
      mimeType: 'image/png',
    });
  });

  it('throws when no image in response', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [{ text: 'No image generated' }],
            },
          },
        ],
      },
    });

    const { generateBanner } = await import('@/lib/ai/gemini-client');
    await expect(generateBanner('A banner')).rejects.toThrow('não retornou imagem');
  });

  it('throws on empty candidates', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { candidates: [] },
    });

    const { generateBanner } = await import('@/lib/ai/gemini-client');
    await expect(generateBanner('A banner')).rejects.toThrow('não retornou imagem');
  });

  it('retries on 429 rate limit', async () => {
    const rateLimitError = new Error('Rate limited') as Error & { status: number };
    rateLimitError.status = 429;

    mockGenerateContent
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [{ inlineData: { mimeType: 'image/png', data: 'ok' } }],
              },
            },
          ],
        },
      });

    const { generateBanner } = await import('@/lib/ai/gemini-client');
    const result = await generateBanner('A banner');

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.base64Data).toBe('ok');
  });
});
