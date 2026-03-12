import { z } from 'zod';

// === Wizard Inputs ===

export const wizardInputsSchema = z.object({
  productName: z.string().min(1, 'Nome do produto é obrigatório'),
  topic: z.string().min(1, 'Tema/nicho é obrigatório'),
  targetAudience: z.string().min(1, 'Público-alvo é obrigatório'),
  moduleCount: z.number().int().min(1).max(20),
  tone: z.enum(['formal', 'informal']),
  generateBanners: z.boolean().optional(),
});

export type WizardInputs = z.infer<typeof wizardInputsSchema>;

// === Generated Structure ===

export const generatedLessonSchema = z.object({
  title: z.string(),
  description: z.string(),
  durationMinutes: z.number().min(5).max(60),
});

export const generatedModuleSchema = z.object({
  title: z.string(),
  description: z.string(),
  bannerSuggestion: z.string(),
  lessons: z.array(generatedLessonSchema).min(1),
});

export const generatedStructureSchema = z.object({
  product: z.object({
    title: z.string(),
    description: z.string(),
    bannerSuggestion: z.string(),
  }),
  modules: z.array(generatedModuleSchema).min(1),
});

export type GeneratedLesson = z.infer<typeof generatedLessonSchema>;
export type GeneratedModule = z.infer<typeof generatedModuleSchema>;
export type GeneratedStructure = z.infer<typeof generatedStructureSchema>;

// === Banner State (client-side tracking) ===

export type BannerStatus = 'pending' | 'generating' | 'generated' | 'rejected' | 'failed';

export interface BannerState {
  status: BannerStatus;
  url: string | null;
}

export interface WizardBanners {
  product: BannerState;
  modules: BannerState[];
}
