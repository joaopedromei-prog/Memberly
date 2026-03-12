import Anthropic from '@anthropic-ai/sdk';
import { generatedStructureSchema, type GeneratedStructure, type WizardInputs } from '@/types/ai';
import { buildStructurePrompt } from '@/lib/ai/prompts/generate-structure';

const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000;

function getClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateStructure(inputs: WizardInputs): Promise<GeneratedStructure> {
  const anthropic = getClient();
  const prompt = buildStructurePrompt(inputs);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const message = await anthropic.messages.create(
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const textBlock = message.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude API');
      }

      return parseAndValidateStructure(textBlock.text);
    } catch (error: unknown) {
      if (attempt === MAX_RETRIES) throw error;

      const apiError = error as { status?: number };
      if (apiError.status === 429) {
        await sleep(Math.pow(2, attempt) * 1000);
      } else if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('A geração excedeu o tempo limite. Tente novamente.');
      } else {
        throw error;
      }
    }
  }

  throw new Error('Falha após todas as tentativas');
}

function parseAndValidateStructure(text: string): GeneratedStructure {
  let json: unknown;
  try {
    const cleaned = text.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    json = JSON.parse(cleaned);
  } catch {
    throw new Error('A IA retornou uma resposta inválida. Tente novamente.');
  }

  const result = generatedStructureSchema.safeParse(json);
  if (!result.success) {
    throw new Error('A estrutura gerada não corresponde ao formato esperado. Tente novamente.');
  }

  return result.data;
}
