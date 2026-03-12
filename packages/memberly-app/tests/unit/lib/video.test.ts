import { describe, it, expect } from 'vitest';
import {
  extractYouTubeId,
  extractPandaVideoId,
  getEmbedUrl,
  extractVideoId,
} from '@/lib/utils/video';

describe('extractYouTubeId', () => {
  it('extracts ID from watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from short URL', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from embed URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('accepts raw 11-char ID', () => {
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid input', () => {
    expect(extractYouTubeId('not-a-valid-url')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractYouTubeId('')).toBeNull();
  });

  it('trims whitespace', () => {
    expect(extractYouTubeId('  dQw4w9WgXcQ  ')).toBe('dQw4w9WgXcQ');
  });
});

describe('extractPandaVideoId', () => {
  it('accepts raw UUID', () => {
    expect(extractPandaVideoId('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    );
  });

  it('extracts ID from embed URL', () => {
    expect(
      extractPandaVideoId(
        'https://player-vz-a1b2c3d4.tv.pandavideo.com.br/embed/?v=a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      )
    ).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('returns null for invalid input', () => {
    expect(extractPandaVideoId('not-valid')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractPandaVideoId('')).toBeNull();
  });
});

describe('getEmbedUrl', () => {
  it('returns YouTube embed URL', () => {
    const url = getEmbedUrl('youtube', 'dQw4w9WgXcQ');
    expect(url).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1');
  });

  it('returns Panda Video embed URL', () => {
    const url = getEmbedUrl('pandavideo', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(url).toBe(
      'https://player-vz-a1b2c3d4.tv.pandavideo.com.br/embed/?v=a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    );
  });

  it('sanitizes script injection in videoId', () => {
    const url = getEmbedUrl('youtube', '<script>alert("xss")</script>');
    expect(url).not.toContain('<script>');
  });
});

describe('extractVideoId', () => {
  it('delegates to extractYouTubeId for youtube provider', () => {
    expect(extractVideoId('youtube', 'dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('delegates to extractPandaVideoId for pandavideo provider', () => {
    expect(
      extractVideoId('pandavideo', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    ).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });
});
