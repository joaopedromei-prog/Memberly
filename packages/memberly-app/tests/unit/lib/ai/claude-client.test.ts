import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Anthropic SDK
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

// Mock prompt builder
vi.mock('@/lib/ai/prompts/generate-structure', () => ({
  buildStructurePrompt: vi.fn().mockReturnValue('mocked prompt'),
}));

import { buildStructurePrompt } from '@/lib/ai/prompts/generate-structure';

const validInputs = {
  productName: 'Curso de Marketing',
  topic: 'Marketing Digital',
  targetAudience: 'Empreendedores iniciantes',
  moduleCount: 3,
  tone: 'informal' as const,
};

const validStructure = {
  product: {
    title: 'Curso de Marketing',
    description: 'Um curso completo sobre marketing digital.',
    bannerSuggestion: 'Imagem de laptop com gráficos',
  },
  modules: [
    {
      title: 'Módulo 1',
      description: 'Introdução ao marketing',
      bannerSuggestion: 'Ícones de marketing',
      lessons: [
        { title: 'Aula 1', description: 'Conceitos básicos', durationMinutes: 15 },
        { title: 'Aula 2', description: 'Ferramentas', durationMinutes: 20 },
        { title: 'Aula 3', description: 'Estratégias', durationMinutes: 25 },
      ],
    },
  ],
};

describe('claude-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  it('calls Claude API with structured prompt and returns parsed structure', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(validStructure) }],
    });

    const { generateStructure } = await import('@/lib/ai/claude-client');
    const result = await generateStructure(validInputs);

    expect(buildStructurePrompt).toHaveBeenCalledWith(validInputs);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
      }),
      expect.anything()
    );
    expect(result).toEqual(validStructure);
  });

  it('handles JSON wrapped in markdown code blocks', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + JSON.stringify(validStructure) + '\n```' }],
    });

    const { generateStructure } = await import('@/lib/ai/claude-client');
    const result = await generateStructure(validInputs);

    expect(result).toEqual(validStructure);
  });

  it('throws on invalid JSON response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not json' }],
    });

    const { generateStructure } = await import('@/lib/ai/claude-client');
    await expect(generateStructure(validInputs)).rejects.toThrow('resposta inválida');
  });

  it('throws on schema validation failure', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ invalid: true }) }],
    });

    const { generateStructure } = await import('@/lib/ai/claude-client');
    await expect(generateStructure(validInputs)).rejects.toThrow('formato esperado');
  });

  it('throws when no text block in response', async () => {
    mockCreate.mockResolvedValue({
      content: [],
    });

    const { generateStructure } = await import('@/lib/ai/claude-client');
    await expect(generateStructure(validInputs)).rejects.toThrow('No text response');
  });

  it('retries on 429 rate limit with backoff', async () => {
    const rateLimitError = new Error('Rate limited') as Error & { status: number };
    rateLimitError.status = 429;

    mockCreate
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validStructure) }],
      });

    const { generateStructure } = await import('@/lib/ai/claude-client');
    const result = await generateStructure(validInputs);

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(result).toEqual(validStructure);
  });

  it('throws non-retryable errors immediately', async () => {
    const serverError = new Error('Internal server error') as Error & { status: number };
    serverError.status = 500;

    mockCreate.mockRejectedValue(serverError);

    const { generateStructure } = await import('@/lib/ai/claude-client');
    await expect(generateStructure(validInputs)).rejects.toThrow('Internal server error');

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});
