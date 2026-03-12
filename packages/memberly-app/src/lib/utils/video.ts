import type { VideoProvider } from '@/types/database';

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const PANDA_VIDEO_URL_REGEX =
  /pandavideo\.com(?:\.br)?\/(?:embed\/?\?v=|watch\/)([a-f0-9-]{36})/;

const PANDA_VIDEO_ID_REGEX = /^[a-f0-9-]{36}$/;

export function extractYouTubeId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

export function extractPandaVideoId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  if (PANDA_VIDEO_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(PANDA_VIDEO_URL_REGEX);
  return match ? match[1] : null;
}

export function getEmbedUrl(
  provider: VideoProvider,
  videoId: string
): string {
  const sanitizedId = videoId.trim().replace(/[<>"']/g, '');

  if (provider === 'youtube') {
    return `https://www.youtube.com/embed/${sanitizedId}?rel=0&modestbranding=1`;
  }

  return `https://player-vz-${sanitizedId.substring(0, 8)}.tv.pandavideo.com.br/embed/?v=${sanitizedId}`;
}

export function extractVideoId(
  provider: VideoProvider,
  urlOrId: string
): string | null {
  return provider === 'youtube'
    ? extractYouTubeId(urlOrId)
    : extractPandaVideoId(urlOrId);
}
