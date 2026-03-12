import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}));

describe('banner-upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads base64 data and returns public URL', async () => {
    mockUpload.mockResolvedValue({
      data: { path: 'banners/test/product.png' },
      error: null,
    });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.example.com/banners/test/product.png' },
    });

    const { uploadBannerFromBase64 } = await import('@/lib/storage/banner-upload');
    const url = await uploadBannerFromBase64('base64data', 'test/product.png', 'image/png');

    expect(url).toBe('https://storage.example.com/banners/test/product.png');
    expect(mockUpload).toHaveBeenCalledWith(
      'test/product.png',
      expect.any(Buffer),
      { contentType: 'image/png', upsert: true }
    );
  });

  it('throws on upload error', async () => {
    mockUpload.mockResolvedValue({
      data: null,
      error: { message: 'Storage quota exceeded' },
    });

    const { uploadBannerFromBase64 } = await import('@/lib/storage/banner-upload');
    await expect(
      uploadBannerFromBase64('base64data', 'test/product.png')
    ).rejects.toThrow('Falha no upload do banner');
  });

  it('uses default mime type image/png', async () => {
    mockUpload.mockResolvedValue({
      data: { path: 'banners/test.png' },
      error: null,
    });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/test.png' },
    });

    const { uploadBannerFromBase64 } = await import('@/lib/storage/banner-upload');
    await uploadBannerFromBase64('data', 'test.png');

    expect(mockUpload).toHaveBeenCalledWith(
      'test.png',
      expect.any(Buffer),
      { contentType: 'image/png', upsert: true }
    );
  });
});
