/**
 * Centralized gradient constants used across admin and member components.
 * Only DATA arrays live here — selection logic stays in consuming components.
 */

/** Tailwind gradient classes for user avatars (admin area). */
export const AVATAR_GRADIENTS = [
  'from-[#2563EB] to-[#7C3AED]',
  'from-[#059669] to-[#0EA5E9]',
  'from-[#DC2626] to-[#F97316]',
  'from-[#7C3AED] to-[#EC4899]',
  'from-[#0EA5E9] to-[#06B6D4]',
  'from-[#F97316] to-[#EAB308]',
  'from-[#059669] to-[#7C3AED]',
  'from-[#EC4899] to-[#8B5CF6]',
] as const;

/** CSS linear-gradient strings for product cards in MemberDetail (admin). */
export const PRODUCT_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e, #0f3460)',
  'linear-gradient(135deg, #1a2e1a, #0f6034)',
  'linear-gradient(135deg, #2e1a2e, #600f4a)',
  'linear-gradient(135deg, #2e2e1a, #604a0f)',
  'linear-gradient(135deg, #1a2e2e, #0f4a60)',
] as const;

/** CSS linear-gradient strings for product card fallback banners (member area). */
export const BANNER_FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
  'linear-gradient(135deg, #1a2e1a 0%, #0f6034 100%)',
  'linear-gradient(135deg, #2e1a2e 0%, #600f4a 100%)',
  'linear-gradient(135deg, #2e2e1a 0%, #604a0f 100%)',
  'linear-gradient(135deg, #1a2e2e 0%, #0f4a60 100%)',
  'linear-gradient(135deg, #2e1a1a 0%, #600f0f 100%)',
] as const;

/** CSS linear-gradient strings for continue-watching / bookmark card fallbacks (member area). */
export const CONTINUE_WATCHING_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
  'linear-gradient(135deg, #1a2e1a 0%, #0f6034 100%)',
  'linear-gradient(135deg, #2e1a2e 0%, #600f4a 100%)',
  'linear-gradient(135deg, #2e2e1a 0%, #604a0f 100%)',
  'linear-gradient(135deg, #1a2e2e 0%, #0f4a60 100%)',
] as const;

/** CSS linear-gradient strings for hero banner fallbacks (member area). */
export const HERO_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #1a2e1a 0%, #163e21 50%, #0f6034 100%)',
  'linear-gradient(135deg, #2e1a2e 0%, #3e163e 50%, #600f4a 100%)',
] as const;

/** Tailwind gradient classes for module cards (member area). */
export const MODULE_CARD_GRADIENTS = [
  'from-[#2d1b69] to-[#1a0a3e]',
  'from-[#1b4332] to-[#0a2e1a]',
  'from-[#1a1a2e] to-[#0f3460]',
  'from-[#2e1a1a] to-[#600f1a]',
  'from-[#1a2e2e] to-[#0f4a60]',
  'from-[#2e2e1a] to-[#604a0f]',
] as const;

/** CSS linear-gradient strings for module list items (admin area). */
export const MODULE_LIST_GRADIENTS = [
  'linear-gradient(to right, #2d1b69, #1a0a3e)',
  'linear-gradient(to right, #1b4332, #0a2e1a)',
  'linear-gradient(to right, #1a1a2e, #0f3460)',
  'linear-gradient(to right, #2e1a1a, #600f1a)',
  'linear-gradient(to right, #1a2e2e, #0f4a60)',
  'linear-gradient(to right, #2e2e1a, #604a0f)',
] as const;

/** CSS linear-gradient strings for product list cards (admin area). */
export const PRODUCT_LIST_GRADIENTS = [
  'linear-gradient(to bottom right, #1a1a2e, #0f3460)',
  'linear-gradient(to bottom right, #1a2e1a, #0f6034)',
  'linear-gradient(to bottom right, #2e2e1a, #604a0f)',
  'linear-gradient(to bottom right, #2e1a2e, #600f4a)',
  'linear-gradient(to bottom right, #1a2e2e, #0f4a60)',
  'linear-gradient(to bottom right, #2e1a1a, #600f0f)',
] as const;
