export function buildBannerPrompt(description: string): string {
  return `Generate a professional banner image for an online course platform.

Requirements:
- Aspect ratio: 16:9 (1920x1080 or similar)
- Style: Modern, clean, professional
- No text overlay (text will be added by the platform)
- Color palette: Rich, vibrant colors appropriate to the topic
- Feel: Premium, educational, inviting

Banner description: ${description}

Generate a high-quality banner image that matches this description.`;
}
