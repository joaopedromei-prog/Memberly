import { createHash } from 'crypto';

/**
 * Generate a unique SHA-256 hash for a certificate.
 * The hash is derived from profileId, productId, and the current timestamp.
 */
export function generateCertificateHash(profileId: string, productId: string): string {
  const timestamp = Date.now().toString();
  return createHash('sha256')
    .update(`${profileId}:${productId}:${timestamp}`)
    .digest('hex');
}
