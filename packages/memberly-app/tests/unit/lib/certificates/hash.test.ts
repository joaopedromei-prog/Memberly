import { generateCertificateHash } from '@/lib/certificates/hash';

describe('generateCertificateHash', () => {
  it('should return a 64-character hex string', () => {
    const hash = generateCertificateHash('profile-1', 'product-1');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should return different hashes for different inputs', () => {
    const hash1 = generateCertificateHash('profile-1', 'product-1');
    const hash2 = generateCertificateHash('profile-2', 'product-1');
    expect(hash1).not.toBe(hash2);
  });

  it('should return different hashes on subsequent calls (timestamp varies)', async () => {
    const hash1 = generateCertificateHash('profile-1', 'product-1');
    // Small delay to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 5));
    const hash2 = generateCertificateHash('profile-1', 'product-1');
    expect(hash1).not.toBe(hash2);
  });

  it('should produce a valid SHA-256 hash length', () => {
    const hash = generateCertificateHash('any-profile', 'any-product');
    expect(hash.length).toBe(64);
  });
});
