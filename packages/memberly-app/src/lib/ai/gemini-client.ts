import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildBannerPrompt } from '@/lib/ai/prompts/generate-banner';

const MAX_RETRIES = 2;
const TIMEOUT_MS = 60000;

function getClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GeneratedBanner {
  base64Data: string;
  mimeType: string;
}

export async function generateBanner(description: string): Promise<GeneratedBanner> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
  const prompt = buildBannerPrompt(description);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await Promise.race([
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['image', 'text'],
          } as never,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na geração de banner')), TIMEOUT_MS)
        ),
      ]);

      const response = result.response;
      const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (part: { inlineData?: { mimeType?: string } }) =>
          part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imagePart?.inlineData?.data) {
        throw new Error('Gemini API não retornou imagem');
      }

      return {
        base64Data: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType ?? 'image/png',
      };
    } catch (error: unknown) {
      if (attempt === MAX_RETRIES) throw error;

      const apiError = error as { status?: number };
      if (apiError.status === 429) {
        await sleep(Math.pow(2, attempt) * 1000);
      } else if (error instanceof Error && error.message === 'Timeout na geração de banner') {
        throw error;
      } else {
        throw error;
      }
    }
  }

  throw new Error('Falha após todas as tentativas de gerar banner');
}
